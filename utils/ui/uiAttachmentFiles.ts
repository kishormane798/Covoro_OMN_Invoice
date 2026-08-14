// MOVED TO ui/ — DISABLED FOR OMN
// This file was relocated under a ui/ subfolder; executable code is commented out.
//
// /**
//  * Temp attachment blobs for Edit Invoice UI size-limit tests.
//  * Avoids committing multi-MB binaries under testData/uploads.
//  */
// import fs from "fs";
// import os from "os";
// import path from "path";
// 
// const MB = 1024 * 1024;
// 
// function writeTempBlob(fileName: string, sizeBytes: number): string {
//   const dir = fs.mkdtempSync(path.join(os.tmpdir(), "uae-attach-"));
//   const filePath = path.join(dir, fileName);
//   const fd = fs.openSync(filePath, "w");
//   try {
//     if (sizeBytes > 0) {
//       fs.writeSync(fd, Buffer.alloc(1), 0, 1, sizeBytes - 1);
//     }
//   } finally {
//     fs.closeSync(fd);
//   }
//   return filePath;
// }
// 
// /** Single file just under 10 MB (accept). */
// export function buildNearLimitSingleAttachmentPath(): {
//   path: string;
//   name: string;
// } {
//   const name = "near-limit-9p5mb.pdf";
//   return { path: writeTempBlob(name, Math.floor(9.5 * MB)), name };
// }
// 
// /** Single file exactly 10 MB (accept â€” UI max total size). */
// export function buildAtLimitSingleAttachmentPath(): {
//   path: string;
//   name: string;
// } {
//   const name = "at-limit-10mb.pdf";
//   return { path: writeTempBlob(name, 10 * MB), name };
// }
// 
// /** Two files whose combined size is under 10 MB (e.g. 4 + 5 = 9 MB). */
// export function buildNearLimitMultiAttachmentPaths(): Array<{
//   path: string;
//   name: string;
// }> {
//   return [
//     { path: writeTempBlob("part-4mb.pdf", 4 * MB), name: "part-4mb.pdf" },
//     { path: writeTempBlob("part-5mb.pdf", 5 * MB), name: "part-5mb.pdf" },
//   ];
// }
// 
// /** Single file just over the 10 MB combined limit (reject). */
// export function buildOversizeAttachmentPath(): string {
//   return writeTempBlob("oversize-11mb.pdf", 11 * MB);
// }
// 
// /** Two files whose sizes sum over 10 MB (6 + 5 = 11 MB â€” reject). */
// export function buildCombinedOversizeAttachmentPaths(): [string, string] {
//   return [
//     writeTempBlob("part-6mb.pdf", 6 * MB),
//     writeTempBlob("part-5mb-over.pdf", 5 * MB),
//   ];
// }
