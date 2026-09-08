/**
 * Temp attachment blobs for Edit Invoice UI size-limit and missing-format tests.
 * Avoids committing multi-MB binaries; also builds tiny JPG/PNG/XLSX/ODS at runtime.
 */
import fs from "fs";
import os from "os";
import path from "path";
import zlib from "zlib";

const MB = 1024 * 1024;
const namedBlobCache = new Map<string, string>();

function writeNamedBlob(fileName: string, data: Buffer): string {
  const cached = namedBlobCache.get(fileName);
  if (cached && fs.existsSync(cached)) return cached;
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "omn-attach-"));
  const filePath = path.join(dir, fileName);
  fs.writeFileSync(filePath, data);
  namedBlobCache.set(fileName, filePath);
  return filePath;
}

function writeTempBlob(fileName: string, sizeBytes: number): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "omn-attach-"));
  const filePath = path.join(dir, fileName);
  const fd = fs.openSync(filePath, "w");
  try {
    if (sizeBytes > 0) {
      fs.writeSync(fd, Buffer.alloc(1), 0, 1, sizeBytes - 1);
    }
  } finally {
    fs.closeSync(fd);
  }
  return filePath;
}

function crc32(data: Buffer): number {
  return zlib.crc32(data) >>> 0;
}

/** Uncompressed ZIP (store method) for tiny XLSX/ODS fixtures. */
function zipStore(entries: Array<{ name: string; data: Buffer }>): Buffer {
  const locals: Buffer[] = [];
  const centrals: Buffer[] = [];
  let offset = 0;
  for (const entry of entries) {
    const nameBuf = Buffer.from(entry.name, "utf8");
    const crc = crc32(entry.data);
    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4);
    local.writeUInt16LE(0, 8);
    local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(entry.data.length, 18);
    local.writeUInt32LE(entry.data.length, 22);
    local.writeUInt16LE(nameBuf.length, 26);
    const localFull = Buffer.concat([local, nameBuf, entry.data]);
    locals.push(localFull);

    const central = Buffer.alloc(46);
    central.writeUInt32LE(0x02014b50, 0);
    central.writeUInt16LE(20, 4);
    central.writeUInt16LE(20, 6);
    central.writeUInt32LE(crc, 16);
    central.writeUInt32LE(entry.data.length, 20);
    central.writeUInt32LE(entry.data.length, 24);
    central.writeUInt16LE(nameBuf.length, 28);
    central.writeUInt32LE(offset, 42);
    centrals.push(Buffer.concat([central, nameBuf]));
    offset += localFull.length;
  }
  const centralBuf = Buffer.concat(centrals);
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0);
  eocd.writeUInt16LE(entries.length, 8);
  eocd.writeUInt16LE(entries.length, 10);
  eocd.writeUInt32LE(centralBuf.length, 12);
  eocd.writeUInt32LE(offset, 16);
  return Buffer.concat([...locals, centralBuf, eocd]);
}

const PNG_1X1 = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64"
);

const JPEG_1X1 = Buffer.from(
  "/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAn/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIQAxAAAAGf/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPwB//9k=",
  "base64"
);

function tinyXlsxBuffer(): Buffer {
  const contentTypes = Buffer.from(
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
<Default Extension="xml" ContentType="application/xml"/>
<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
</Types>`
  );
  const rels = Buffer.from(
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`
  );
  const workbookRels = Buffer.from(
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
</Relationships>`
  );
  const workbook = Buffer.from(
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
<sheets><sheet name="Sheet1" sheetId="1" r:id="rId1"/></sheets>
</workbook>`
  );
  const sheet = Buffer.from(
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
<sheetData><row r="1"><c r="A1" t="inlineStr"><is><t>sample</t></is></c></row></sheetData>
</worksheet>`
  );
  return zipStore([
    { name: "[Content_Types].xml", data: contentTypes },
    { name: "_rels/.rels", data: rels },
    { name: "xl/workbook.xml", data: workbook },
    { name: "xl/_rels/workbook.xml.rels", data: workbookRels },
    { name: "xl/worksheets/sheet1.xml", data: sheet },
  ]);
}

function tinyOdsBuffer(): Buffer {
  const mimetype = Buffer.from("application/vnd.oasis.opendocument.spreadsheet");
  const manifest = Buffer.from(
    `<?xml version="1.0" encoding="UTF-8"?>
<manifest:manifest xmlns:manifest="urn:oasis:names:tc:opendocument:xmlns:manifest:1.0" manifest:version="1.2">
 <manifest:file-entry manifest:full-path="/" manifest:version="1.2" manifest:media-type="application/vnd.oasis.opendocument.spreadsheet"/>
 <manifest:file-entry manifest:full-path="content.xml" manifest:media-type="text/xml"/>
</manifest:manifest>`
  );
  const content = Buffer.from(
    `<?xml version="1.0"?>
<office:document-content xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0" xmlns:text="urn:oasis:names:tc:opendocument:xmlns:text:1.0" office:version="1.2">
<office:body><office:text><text:p>sample</text:p></office:text></office:body>
</office:document-content>`
  );
  return zipStore([
    { name: "mimetype", data: mimetype },
    { name: "META-INF/manifest.xml", data: manifest },
    { name: "content.xml", data: content },
  ]);
}

export function tinyPngAttachmentPath(fileName = "sample.png"): string {
  return writeNamedBlob(fileName, PNG_1X1);
}

export function tinyJpegAttachmentPath(fileName: string): string {
  return writeNamedBlob(fileName, JPEG_1X1);
}

export function tinyXlsxAttachmentPath(fileName = "sample.xlsx"): string {
  return writeNamedBlob(fileName, tinyXlsxBuffer());
}

export function tinyOdsAttachmentPath(fileName = "sample.ods"): string {
  return writeNamedBlob(fileName, tinyOdsBuffer());
}

/** Single file just under 10 MB (accept). */
export function buildNearLimitSingleAttachmentPath(): {
  path: string;
  name: string;
} {
  const name = "near-limit-9p5mb.pdf";
  return { path: writeTempBlob(name, Math.floor(9.5 * MB)), name };
}

/** Single file exactly 10 MB (accept — UI max total size). */
export function buildAtLimitSingleAttachmentPath(): {
  path: string;
  name: string;
} {
  const name = "at-limit-10mb.pdf";
  return { path: writeTempBlob(name, 10 * MB), name };
}

/** Two files whose combined size is under 10 MB (4 + 5 = 9 MB). */
export function buildNearLimitMultiAttachmentPaths(): Array<{
  path: string;
  name: string;
}> {
  return [
    { path: writeTempBlob("part-4mb.pdf", 4 * MB), name: "part-4mb.pdf" },
    { path: writeTempBlob("part-5mb.pdf", 5 * MB), name: "part-5mb.pdf" },
  ];
}

/** Single file just over the 10 MB combined limit (reject). */
export function buildOversizeAttachmentPath(): string {
  return writeTempBlob("oversize-11mb.pdf", 11 * MB);
}

/** Two files whose sizes sum over 10 MB (6 + 5 = 11 MB — reject). */
export function buildCombinedOversizeAttachmentPaths(): [string, string] {
  return [
    writeTempBlob("part-6mb.pdf", 6 * MB),
    writeTempBlob("part-5mb-over.pdf", 5 * MB),
  ];
}
