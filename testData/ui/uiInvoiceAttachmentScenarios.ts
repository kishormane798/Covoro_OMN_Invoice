// MOVED TO ui/ — DISABLED FOR OMN
// This file was relocated under testData/ui/; executable code is commented out.
//
// import path from "path";
//
// /** Fixture root for Attachment Details section tests. */
// export const UI_ATTACHMENT_FIXTURE_DIR = path.resolve(
//   process.cwd(),
//   "testData/uploads/attachments"
// );
//
// export function uiAttachmentFixture(...segments: string[]): string {
//   return path.join(UI_ATTACHMENT_FIXTURE_DIR, ...segments);
// }
//
// /** Accepted formats (UI note on section 7. Attachment Details). */
// export const UI_ATTACHMENT_ACCEPTED_FORMATS = [
//   "pdf",
//   "jpg",
//   "jpeg",
//   "png",
//   "xml",
//   "csv",
//   "ods",
//   "xlsx",
// ] as const;
//
// export type UiAttachmentAcceptedFormat = (typeof UI_ATTACHMENT_ACCEPTED_FORMATS)[number];
//
// export type UiAttachmentScenario =
//   | {
//       id: string;
//       title: string;
//       expect: "accept";
//       /** Absolute paths attached in one Add Files / setInputFiles call. */
//       files: string[];
//       /** File names expected in the attachment list after upload. */
//       expectedNames: string[];
//     }
//   | {
//       id: string;
//       title: string;
//       expect: "reject";
//       files: string[];
//       /** Soft match for toast / inline / modal error text. */
//       errorPattern: RegExp;
//     };
//
// const F = uiAttachmentFixture;
//
// /** One small file per accepted extension. */
// export const UI_ATTACHMENT_POSITIVE_FORMAT_SCENARIOS: UiAttachmentScenario[] = [
//   {
//     id: "pdf",
//     title: "single PDF → listed",
//     expect: "accept",
//     files: [F("ui-attachment-sample.pdf")],
//     expectedNames: ["ui-attachment-sample.pdf"],
//   },
//   {
//     id: "jpg",
//     title: "single JPG → listed",
//     expect: "accept",
//     files: [F("sample.jpg")],
//     expectedNames: ["sample.jpg"],
//   },
//   {
//     id: "jpeg",
//     title: "single JPEG → listed",
//     expect: "accept",
//     files: [F("sample.jpeg")],
//     expectedNames: ["sample.jpeg"],
//   },
//   {
//     id: "png",
//     title: "single PNG → listed",
//     expect: "accept",
//     files: [F("sample.png")],
//     expectedNames: ["sample.png"],
//   },
//   {
//     id: "xml",
//     title: "single XML → listed",
//     expect: "accept",
//     files: [F("sample.xml")],
//     expectedNames: ["sample.xml"],
//   },
//   {
//     id: "csv",
//     title: "single CSV → listed",
//     expect: "accept",
//     files: [F("sample.csv")],
//     expectedNames: ["sample.csv"],
//   },
//   {
//     id: "xlsx",
//     title: "single XLSX → listed",
//     expect: "accept",
//     files: [F("sample.xlsx")],
//     expectedNames: ["sample.xlsx"],
//   },
//   {
//     id: "ods",
//     title: "single ODS → listed",
//     expect: "accept",
//     files: [F("sample.ods")],
//     expectedNames: ["sample.ods"],
//   },
// ];
//
// /** Multiple files in one pick; combined size well under 10 MB. */
// export const UI_ATTACHMENT_MULTI_UNDER_LIMIT: UiAttachmentScenario = {
//   id: "multi-under-10mb",
//   title: "multiple files (PDF + PNG) under 10 MB → listed",
//   expect: "accept",
//   files: [F("ui-attachment-sample.pdf"), F("sample.png"), F("sample-b.pdf")],
//   expectedNames: ["ui-attachment-sample.pdf", "sample.png", "sample-b.pdf"],
// };
//
// /** Soft patterns — UI copy may vary slightly. */
// export const UI_ATTACHMENT_SIZE_ERROR = /10\s*MB|maximum|size|too large|exceed/i;
// export const UI_ATTACHMENT_FORMAT_ERROR =
//   /format|accepted|supported|invalid|not allowed|type|extension/i;
//
// export const UI_ATTACHMENT_INVALID_FORMAT: UiAttachmentScenario = {
//   id: "invalid-txt",
//   title: "unsupported .txt → error",
//   expect: "reject",
//   files: [F("invalid.txt")],
//   errorPattern: UI_ATTACHMENT_FORMAT_ERROR,
// };
//
// /** Accept scenarios only (used to drive remove Yes/No per format). */
// export type UiAttachmentAcceptScenario = Extract<UiAttachmentScenario, { expect: "accept" }>;
//
// /**
//  * Remove (confirm **Yes**) for every accepted file type — same fixtures as add-positive.
//  * Title: `single {EXT} → remove Yes → gone`.
//  */
// export const UI_ATTACHMENT_REMOVE_YES_SCENARIOS: UiAttachmentAcceptScenario[] =
//   UI_ATTACHMENT_POSITIVE_FORMAT_SCENARIOS.filter(
//     (s): s is UiAttachmentAcceptScenario => s.expect === "accept"
//   ).map((s) => ({
//     ...s,
//     id: `remove-yes-${s.id}`,
//     title: `single ${s.id.toUpperCase()} → remove Yes → gone`,
//   }));
//
// /**
//  * Cancel remove (**No**) for every accepted file type — file stays listed.
//  */
// export const UI_ATTACHMENT_REMOVE_NO_SCENARIOS: UiAttachmentAcceptScenario[] =
//   UI_ATTACHMENT_POSITIVE_FORMAT_SCENARIOS.filter(
//     (s): s is UiAttachmentAcceptScenario => s.expect === "accept"
//   ).map((s) => ({
//     ...s,
//     id: `remove-no-${s.id}`,
//     title: `single ${s.id.toUpperCase()} → remove No → still listed`,
//   }));
//
// /** Built at runtime in helper (avoids committing multi‑MB binaries). */
// export type UiAttachmentRuntimeRejectKind = "single-over-10mb" | "combined-over-10mb";
//
