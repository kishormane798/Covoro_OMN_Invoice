/**
 * Move TestData/<SECTION>/other → dropdown_positive|dropdown_negative
 * and ensure positive/negative folders stay. Also patch Source Currency Code = OMR.
 */
import "dotenv/config";
import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import {
  loadFieldValidationMatrix,
  sectionFolderName,
  outcomeBucketFromTitle,
  PACK_ROOT,
  MATRIX_DEFAULT_PATH,
} from "../Helpers/fieldValidationExcelPackHelper";

function main(): void {
  const cases = loadFieldValidationMatrix(MATRIX_DEFAULT_PATH);
  let moved = 0;
  let missing = 0;

  for (const tc of cases) {
    const sectionDir = path.join(PACK_ROOT, sectionFolderName(tc.section));
    const bucket = outcomeBucketFromTitle(tc.title);
    const destDir = path.join(sectionDir, bucket);
    const dest = path.join(destDir, `${tc.id}.xlsx`);
    const candidates = [
      path.join(sectionDir, "other", `${tc.id}.xlsx`),
      path.join(sectionDir, "dropdown_positive", `${tc.id}.xlsx`),
      path.join(sectionDir, "dropdown_negative", `${tc.id}.xlsx`),
      path.join(sectionDir, "positive", `${tc.id}.xlsx`),
      path.join(sectionDir, "negative", `${tc.id}.xlsx`),
      path.join(sectionDir, `${tc.id}.xlsx`),
    ];
    const src = candidates.find((p) => fs.existsSync(p));
    if (!src) {
      missing += 1;
      continue;
    }
    if (path.normalize(src) === path.normalize(dest)) continue;
    fs.mkdirSync(destDir, { recursive: true });
    try {
      fs.renameSync(src, dest);
    } catch {
      fs.copyFileSync(src, dest);
      try {
        fs.unlinkSync(src);
      } catch {
        /* locked source left in place */
      }
    }
    moved += 1;
  }

  // Remove empty "other" dirs
  for (const section of fs.readdirSync(PACK_ROOT, { withFileTypes: true })) {
    if (!section.isDirectory()) continue;
    const other = path.join(PACK_ROOT, section.name, "other");
    if (fs.existsSync(other) && fs.readdirSync(other).length === 0) {
      fs.rmdirSync(other);
    }
  }

  // Patch Source Currency Code = OMR on all pack files (fast identity-style script)
  const allFiles: string[] = [];
  const walk = (dir: string) => {
    for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, ent.name);
      if (ent.isDirectory()) {
        if (ent.name === "_tmp") continue;
        walk(p);
      } else if (ent.name.endsWith(".xlsx") && ent.name.startsWith("TC-")) {
        allFiles.push(p);
      }
    }
  };
  walk(PACK_ROOT);

  const jobs = allFiles.map((destPath) => ({
    destPath,
    field: "Source Currency Code",
    value: "OMR",
  }));
  const tmp = path.join(PACK_ROOT, "_tmp");
  fs.mkdirSync(tmp, { recursive: true });
  const jobsFile = path.join(tmp, "source-currency-patches.json");
  fs.writeFileSync(jobsFile, JSON.stringify({ jobs }), "utf8");

  console.log(JSON.stringify({ moved, missing, sourcePatchFiles: jobs.length }, null, 2));

  if (jobs.length) {
    const script = path.join(process.cwd(), "utils", "batch_patch_identity_inplace.py");
    const out = execSync(`python "${script}" "${jobsFile}"`, {
      encoding: "utf8",
      timeout: 1_800_000,
      windowsHide: true,
      stdio: ["ignore", "pipe", "pipe"],
    });
    console.log(out.trim());
  }
}

main();
