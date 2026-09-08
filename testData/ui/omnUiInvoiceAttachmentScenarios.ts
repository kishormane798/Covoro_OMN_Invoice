import path from "path";
import {
  tinyJpegAttachmentPath,
  tinyOdsAttachmentPath,
  tinyPngAttachmentPath,
  tinyXlsxAttachmentPath,
} from "../../utils/ui/omnUiAttachmentFiles";

/** Fixture root for Attachment Details section tests. */
export const OMN_UI_ATTACHMENT_FIXTURE_DIR = path.resolve(
  process.cwd(),
  "testData/uploads/attachments"
);

export function omnUiAttachmentFixture(...segments: string[]): string {
  return path.join(OMN_UI_ATTACHMENT_FIXTURE_DIR, ...segments);
}

/** Accepted formats (UI note on Attachment Details). */
export const OMN_UI_ATTACHMENT_ACCEPTED_FORMATS = [
  "pdf",
  "jpg",
  "jpeg",
  "png",
  "xml",
  "csv",
  "ods",
  "xlsx",
] as const;

export type OmnUiAttachmentAcceptedFormat =
  (typeof OMN_UI_ATTACHMENT_ACCEPTED_FORMATS)[number];

export type OmnUiAttachmentScenario =
  | {
      id: string;
      title: string;
      expect: "accept";
      files: string[];
      expectedNames: string[];
    }
  | {
      id: string;
      title: string;
      expect: "reject";
      files: string[];
      errorPattern: RegExp;
    };

const F = omnUiAttachmentFixture;

/** One small file per accepted extension. */
export const OMN_UI_ATTACHMENT_POSITIVE_FORMAT_SCENARIOS: OmnUiAttachmentScenario[] =
  [
    {
      id: "pdf",
      title: "single PDF → listed",
      expect: "accept",
      files: [F("ui-attachment-sample.pdf")],
      expectedNames: ["ui-attachment-sample.pdf"],
    },
    {
      id: "jpg",
      title: "single JPG → listed",
      expect: "accept",
      files: [tinyJpegAttachmentPath("sample.jpg")],
      expectedNames: ["sample.jpg"],
    },
    {
      id: "jpeg",
      title: "single JPEG → listed",
      expect: "accept",
      files: [tinyJpegAttachmentPath("sample.jpeg")],
      expectedNames: ["sample.jpeg"],
    },
    {
      id: "png",
      title: "single PNG → listed",
      expect: "accept",
      files: [tinyPngAttachmentPath("sample.png")],
      expectedNames: ["sample.png"],
    },
    {
      id: "xml",
      title: "single XML → listed",
      expect: "accept",
      files: [F("sample.xml")],
      expectedNames: ["sample.xml"],
    },
    {
      id: "csv",
      title: "single CSV → listed",
      expect: "accept",
      files: [F("sample.csv")],
      expectedNames: ["sample.csv"],
    },
    {
      id: "xlsx",
      title: "single XLSX → listed",
      expect: "accept",
      files: [tinyXlsxAttachmentPath("sample.xlsx")],
      expectedNames: ["sample.xlsx"],
    },
    {
      id: "ods",
      title: "single ODS → listed",
      expect: "accept",
      files: [tinyOdsAttachmentPath("sample.ods")],
      expectedNames: ["sample.ods"],
    },
  ];

/** Multiple files in one pick; combined size well under 10 MB. */
export const OMN_UI_ATTACHMENT_MULTI_UNDER_LIMIT: OmnUiAttachmentScenario = {
  id: "multi-under-10mb",
  title: "multiple files (PDF + PNG) under 10 MB → listed",
  expect: "accept",
  files: [F("ui-attachment-sample.pdf"), tinyPngAttachmentPath("sample.png"), F("sample-b.pdf")],
  expectedNames: ["ui-attachment-sample.pdf", "sample.png", "sample-b.pdf"],
};

export const OMN_UI_ATTACHMENT_SIZE_ERROR = /10\s*MB|maximum|size|too large|exceed/i;
export const OMN_UI_ATTACHMENT_FORMAT_ERROR =
  /format|accepted|supported|invalid|not allowed|type|extension/i;

export const OMN_UI_ATTACHMENT_INVALID_FORMAT: OmnUiAttachmentScenario = {
  id: "invalid-txt",
  title: "unsupported .txt → error",
  expect: "reject",
  files: [F("invalid.txt")],
  errorPattern: OMN_UI_ATTACHMENT_FORMAT_ERROR,
};

export type OmnUiAttachmentAcceptScenario = Extract<
  OmnUiAttachmentScenario,
  { expect: "accept" }
>;

export const OMN_UI_ATTACHMENT_REMOVE_YES_SCENARIOS: OmnUiAttachmentAcceptScenario[] =
  OMN_UI_ATTACHMENT_POSITIVE_FORMAT_SCENARIOS.filter(
    (s): s is OmnUiAttachmentAcceptScenario => s.expect === "accept"
  ).map((s) => ({
    ...s,
    id: `remove-yes-${s.id}`,
    title: `single ${s.id.toUpperCase()} → remove Yes → gone`,
  }));

export const OMN_UI_ATTACHMENT_REMOVE_NO_SCENARIOS: OmnUiAttachmentAcceptScenario[] =
  OMN_UI_ATTACHMENT_POSITIVE_FORMAT_SCENARIOS.filter(
    (s): s is OmnUiAttachmentAcceptScenario => s.expect === "accept"
  ).map((s) => ({
    ...s,
    id: `remove-no-${s.id}`,
    title: `single ${s.id.toUpperCase()} → remove No → still listed`,
  }));
