#!/usr/bin/env python3
"""
Fast-patch Source Currency Code = OMR inside xlsx zips without openpyxl load/save.

Finds the sharedStrings / inline cell for the Source Currency column on data row 6
by locating the header cell in row 4, then sets the data cell text to OMR.

Strategy: use openpyxl read_only ONLY to discover column index once from one file,
then for each file use zipfile + lxml/etree on sheet XML. If that is fragile,
fall back to a minimal openpyxl write for Source Currency only on thin copies —
but prefer zip shared string / cell replace for speed.

Practical fast path used here:
- For each xlsx: open as ZipFile
- Parse xl/worksheets/sheet1.xml (or sheet matching workbook)
- Find header row cells; locate Source Currency Code column letter
- Set/create cell at that column on row 6 to inlineStr OMR
- Rewrite zip entries

This avoids full workbook style/DV round-trip (~2MB save).
"""
from __future__ import annotations

import json
import re
import sys
import zipfile
from io import BytesIO
from pathlib import Path
from xml.etree import ElementTree as ET

NS = {"m": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}
ET.register_namespace("", NS["m"])
ET.register_namespace(
    "r", "http://schemas.openxmlformats.org/officeDocument/2006/relationships"
)

HEADER_NAMES = {
    "source currency code",
    "source currency",
}


def col_letters(n: int) -> str:
    s = ""
    while n:
        n, r = divmod(n - 1, 26)
        s = chr(65 + r) + s
    return s


def col_index(letters: str) -> int:
    n = 0
    for ch in letters:
        n = n * 26 + (ord(ch.upper()) - 64)
    return n


def cell_ref(col: int, row: int) -> str:
    return f"{col_letters(col)}{row}"


def local(tag: str) -> str:
    if "}" in tag:
        return tag.rsplit("}", 1)[-1]
    return tag


def sheet_paths(zf: zipfile.ZipFile) -> list[str]:
    return sorted(
        n for n in zf.namelist() if n.startswith("xl/worksheets/sheet") and n.endswith(".xml")
    )


def shared_strings(zf: zipfile.ZipFile) -> list[str]:
    name = "xl/sharedStrings.xml"
    if name not in zf.namelist():
        return []
    root = ET.fromstring(zf.read(name))
    out: list[str] = []
    for si in root:
        if local(si.tag) != "si":
            continue
        texts = []
        for node in si.iter():
            if local(node.tag) == "t" and node.text:
                texts.append(node.text)
        out.append("".join(texts))
    return out


def find_source_col(sheet_xml: bytes, sst: list[str], header_row: int = 4) -> int | None:
    root = ET.fromstring(sheet_xml)
    for c in root.iter():
        if local(c.tag) != "c":
            continue
        ref = c.attrib.get("r", "")
        m = re.match(r"^([A-Z]+)(\d+)$", ref)
        if not m or int(m.group(2)) != header_row:
            continue
        text = cell_text(c, sst)
        norm = (text or "").strip().lower()
        if norm in HEADER_NAMES or "source currency" in norm:
            return col_index(m.group(1))
    return None


def cell_text(c: ET.Element, sst: list[str]) -> str:
    t = c.attrib.get("t")
    if t == "s":
        v = c.find("m:v", NS)
        if v is not None and v.text is not None:
            try:
                return sst[int(v.text)]
            except Exception:
                return ""
    if t == "inlineStr":
        parts = []
        for node in c.iter():
            if local(node.tag) == "t" and node.text:
                parts.append(node.text)
        return "".join(parts)
    v = c.find("m:v", NS)
    return v.text if v is not None and v.text is not None else ""


def set_inline_omr(sheet_xml: bytes, col: int, data_row: int = 6) -> bytes:
    root = ET.fromstring(sheet_xml)
    ref = cell_ref(col, data_row)
    # Find sheetData
    sheet_data = None
    for node in root.iter():
        if local(node.tag) == "sheetData":
            sheet_data = node
            break
    if sheet_data is None:
        raise RuntimeError("sheetData missing")

    # Find or create row
    row_el = None
    for row in list(sheet_data):
        if local(row.tag) == "row" and row.attrib.get("r") == str(data_row):
            row_el = row
            break
    if row_el is None:
        row_el = ET.SubElement(sheet_data, f"{{{NS['m']}}}row", {"r": str(data_row)})

    # Find or create cell
    cell = None
    for c in list(row_el):
        if local(c.tag) == "c" and c.attrib.get("r") == ref:
            cell = c
            break
    if cell is None:
        cell = ET.SubElement(row_el, f"{{{NS['m']}}}c", {"r": ref, "t": "inlineStr"})
    else:
        # clear children
        for child in list(cell):
            cell.remove(child)
        cell.attrib["t"] = "inlineStr"
        cell.attrib.pop("s", None)

    is_el = ET.SubElement(cell, f"{{{NS['m']}}}is")
    t_el = ET.SubElement(is_el, f"{{{NS['m']}}}t")
    t_el.text = "OMR"

    return ET.tostring(root, encoding="utf-8", xml_declaration=True)


def patch_file(path: Path) -> dict:
    try:
        with zipfile.ZipFile(path, "r") as zf:
            sst = shared_strings(zf)
            sheets = sheet_paths(zf)
            if not sheets:
                return {"ok": False, "path": str(path), "error": "no sheets"}
            # Prefer first sheet (E Invoice is usually sheet1)
            target = sheets[0]
            xml = zf.read(target)
            col = find_source_col(xml, sst)
            if col is None and len(sheets) > 1:
                for sp in sheets[1:]:
                    xml = zf.read(sp)
                    col = find_source_col(xml, sst)
                    if col is not None:
                        target = sp
                        break
            if col is None:
                return {"ok": False, "path": str(path), "error": "Source Currency column not found"}
            new_xml = set_inline_omr(xml, col)
            buf = BytesIO()
            with zipfile.ZipFile(buf, "w", compression=zipfile.ZIP_DEFLATED) as out:
                for item in zf.infolist():
                    data = new_xml if item.filename == target else zf.read(item.filename)
                    out.writestr(item, data)
        path.write_bytes(buf.getvalue())
        return {"ok": True, "path": str(path)}
    except Exception as exc:  # noqa: BLE001
        return {"ok": False, "path": str(path), "error": str(exc)}


def main() -> int:
    root = Path(sys.argv[1] if len(sys.argv) > 1 else "testcase/field_validation/TestData")
    files = sorted(root.rglob("TC-*.xlsx"))
    ok = 0
    errors = []
    for i, f in enumerate(files, 1):
        result = patch_file(f)
        if result.get("ok"):
            ok += 1
        else:
            errors.append(result)
        if i == 1 or i % 100 == 0 or i == len(files):
            print(f"[source-currency] {i}/{len(files)}", flush=True)
    print(json.dumps({"ok": len(errors) == 0, "patched": ok, "errors": errors[:15], "total": len(files)}))
    return 0 if not errors else 1


if __name__ == "__main__":
    raise SystemExit(main())
