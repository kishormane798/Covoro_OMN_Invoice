import { test } from "../../Src/baseTest";
import {
  runOmnUiEditAttachmentAtLimitSingleCase,
  runOmnUiEditAttachmentAtLimitSubmitCase,
  runOmnUiEditAttachmentCombinedOversizeCase,
  runOmnUiEditAttachmentRemoveOneThenAddCase,
  runOmnUiEditAttachmentSameFileTwiceCase,
  runOmnUiEditAttachmentSecondInvalidFormatCase,
  runOmnUiEditAttachmentSecondUploadCase,
  runOmnUiEditAttachmentSequentialAtLimitCase,
  runOmnUiEditAttachmentSequentialOverLimitCase,
  runOmnUiEditAttachmentSequentialPersistCase,
  runOmnUiEditAttachmentSequentialUnderLimitCase,
  runOmnUiEditAttachmentThirdUploadCase,
  runOmnUiEditAttachmentUploadStaysAfterOneFileCase,
  runOmnUiEditAttachmentMultiSubmitCase,
  runOmnUiEditAttachmentNearLimitMultiCase,
  runOmnUiEditAttachmentNearLimitMultiPersistCase,
  runOmnUiEditAttachmentNearLimitSingleCase,
  runOmnUiEditAttachmentNearLimitSinglePersistCase,
  runOmnUiEditAttachmentOversizeCase,
  runOmnUiEditAttachmentPersistAndViewCase,
  runOmnUiEditAttachmentRemoveCase,
  runOmnUiEditAttachmentScenario,
  runOmnUiEditAttachmentSectionVisibleCase,
  runOmnUiEditAttachmentSubmitCase,
  omnUiAttachmentListTitle,
  omnUiAttachmentPersistTitle,
  omnUiAttachmentRemoveTitle,
  omnUiAttachmentSectionVisibleTitle,
  omnUiAttachmentSubmitTitle,
  OMN_UI_ATTACHMENT_PERSIST_TIMEOUT_MS,
  OMN_UI_ATTACHMENT_SIZE_TIMEOUT_MS,
  OMN_UI_ATTACHMENT_SUBMIT_TIMEOUT_MS,
  OMN_UI_ATTACHMENT_LARGE_SUBMIT_TIMEOUT_MS,
  OMN_UI_ATTACHMENT_TEST_TIMEOUT_MS,
} from "../../Helpers/ui/omnUiAttachmentHelper";
import {
  OMN_UI_ATTACHMENT_INVALID_FORMAT,
  OMN_UI_ATTACHMENT_MULTI_UNDER_LIMIT,
  OMN_UI_ATTACHMENT_POSITIVE_FORMAT_SCENARIOS,
  OMN_UI_ATTACHMENT_REMOVE_NO_SCENARIOS,
  OMN_UI_ATTACHMENT_REMOVE_YES_SCENARIOS,
  type OmnUiAttachmentAcceptScenario,
} from "../../testData/ui/omnUiInvoiceAttachmentScenarios";

/**
 * Excel upload → Options → Edit → Attachment Details
 * (formats / multi / 10 MB / remove / Update+View / submit+delivery /
 * Add Files stays so another file can be added).
 */
test.describe("Edit Invoice — Attachment Details", () => {
  test.describe.configure({ mode: "parallel" });

  test(omnUiAttachmentSectionVisibleTitle(), async ({ page }) => {
    test.setTimeout(OMN_UI_ATTACHMENT_TEST_TIMEOUT_MS);
    await runOmnUiEditAttachmentSectionVisibleCase(page);
  });

  for (const scenario of OMN_UI_ATTACHMENT_POSITIVE_FORMAT_SCENARIOS) {
    test(omnUiAttachmentListTitle(scenario), async ({ page }) => {
      test.setTimeout(OMN_UI_ATTACHMENT_TEST_TIMEOUT_MS);
      await runOmnUiEditAttachmentScenario(page, scenario);
    });
  }

  test(omnUiAttachmentListTitle(OMN_UI_ATTACHMENT_MULTI_UNDER_LIMIT), async ({ page }) => {
    test.setTimeout(OMN_UI_ATTACHMENT_TEST_TIMEOUT_MS);
    await runOmnUiEditAttachmentScenario(page, OMN_UI_ATTACHMENT_MULTI_UNDER_LIMIT);
  });

  for (const scenario of OMN_UI_ATTACHMENT_REMOVE_YES_SCENARIOS) {
    test(omnUiAttachmentRemoveTitle(scenario, "Yes"), async ({ page }) => {
      test.setTimeout(OMN_UI_ATTACHMENT_TEST_TIMEOUT_MS);
      await runOmnUiEditAttachmentRemoveCase(page, scenario, "Yes");
    });
  }

  for (const scenario of OMN_UI_ATTACHMENT_REMOVE_NO_SCENARIOS) {
    test(omnUiAttachmentRemoveTitle(scenario, "No"), async ({ page }) => {
      test.setTimeout(OMN_UI_ATTACHMENT_TEST_TIMEOUT_MS);
      await runOmnUiEditAttachmentRemoveCase(page, scenario, "No");
    });
  }

  for (const scenario of OMN_UI_ATTACHMENT_POSITIVE_FORMAT_SCENARIOS) {
    if (scenario.expect !== "accept") continue;
    const accept = scenario as OmnUiAttachmentAcceptScenario;
    test(omnUiAttachmentPersistTitle(accept), async ({ page }) => {
      test.setTimeout(OMN_UI_ATTACHMENT_PERSIST_TIMEOUT_MS);
      await runOmnUiEditAttachmentPersistAndViewCase(page, accept);
    });
  }

  test(
    omnUiAttachmentPersistTitle(OMN_UI_ATTACHMENT_MULTI_UNDER_LIMIT as OmnUiAttachmentAcceptScenario),
    async ({ page }) => {
      test.setTimeout(OMN_UI_ATTACHMENT_PERSIST_TIMEOUT_MS);
      await runOmnUiEditAttachmentPersistAndViewCase(
        page,
        OMN_UI_ATTACHMENT_MULTI_UNDER_LIMIT as OmnUiAttachmentAcceptScenario
      );
    }
  );

  test(omnUiAttachmentListTitle(OMN_UI_ATTACHMENT_INVALID_FORMAT), async ({ page }) => {
    test.setTimeout(OMN_UI_ATTACHMENT_TEST_TIMEOUT_MS);
    await runOmnUiEditAttachmentScenario(page, OMN_UI_ATTACHMENT_INVALID_FORMAT);
  });

  test.describe("10 MB size limit", () => {
    test(
      "Verify Edit Invoice attachment with a single ~9.5 MB file under 10 MB is accepted and the attachment should be listed.",
      async ({ page }) => {
        test.setTimeout(OMN_UI_ATTACHMENT_SIZE_TIMEOUT_MS);
        await runOmnUiEditAttachmentNearLimitSingleCase(page);
      }
    );

    test(
      "Verify Edit Invoice attachment with a single exactly 10 MB file is accepted and the attachment should be listed.",
      async ({ page }) => {
        test.setTimeout(OMN_UI_ATTACHMENT_SIZE_TIMEOUT_MS);
        await runOmnUiEditAttachmentAtLimitSingleCase(page);
      }
    );

    test(
      "Verify Edit Invoice attachment with multiple files combined ~9 MB under 10 MB is accepted and the attachments should be listed.",
      async ({ page }) => {
        test.setTimeout(OMN_UI_ATTACHMENT_SIZE_TIMEOUT_MS);
        await runOmnUiEditAttachmentNearLimitMultiCase(page);
      }
    );

    test(
      "Verify Edit Invoice attachment with a single file over 10 MB is rejected and an error should be shown.",
      async ({ page }) => {
        test.setTimeout(OMN_UI_ATTACHMENT_SIZE_TIMEOUT_MS);
        await runOmnUiEditAttachmentOversizeCase(page);
      }
    );

    test(
      "Verify Edit Invoice attachment with multiple files combined over 10 MB is rejected and an error should be shown.",
      async ({ page }) => {
        test.setTimeout(OMN_UI_ATTACHMENT_SIZE_TIMEOUT_MS);
        await runOmnUiEditAttachmentCombinedOversizeCase(page);
      }
    );

    test(omnUiAttachmentPersistTitle("a single ~9.5 MB file"), async ({ page }) => {
      test.setTimeout(OMN_UI_ATTACHMENT_PERSIST_TIMEOUT_MS);
      await runOmnUiEditAttachmentNearLimitSinglePersistCase(page);
    });

    test(omnUiAttachmentPersistTitle("multiple files combined ~9 MB"), async ({ page }) => {
      test.setTimeout(OMN_UI_ATTACHMENT_PERSIST_TIMEOUT_MS);
      await runOmnUiEditAttachmentNearLimitMultiPersistCase(page);
    });
  });

  test.describe("submit + delivery", () => {
    for (const scenario of OMN_UI_ATTACHMENT_POSITIVE_FORMAT_SCENARIOS) {
      if (scenario.expect !== "accept") continue;
      const accept = scenario as OmnUiAttachmentAcceptScenario;
      test(omnUiAttachmentSubmitTitle(accept), async ({ page }) => {
        test.setTimeout(OMN_UI_ATTACHMENT_SUBMIT_TIMEOUT_MS);
        await runOmnUiEditAttachmentSubmitCase(page, accept);
      });
    }

    test(
      omnUiAttachmentSubmitTitle(OMN_UI_ATTACHMENT_MULTI_UNDER_LIMIT as OmnUiAttachmentAcceptScenario),
      async ({ page }) => {
        test.setTimeout(OMN_UI_ATTACHMENT_SUBMIT_TIMEOUT_MS);
        await runOmnUiEditAttachmentMultiSubmitCase(page);
      }
    );

    test(omnUiAttachmentSubmitTitle("a single exactly 10 MB file"), async ({ page }) => {
      test.setTimeout(OMN_UI_ATTACHMENT_LARGE_SUBMIT_TIMEOUT_MS);
      await runOmnUiEditAttachmentAtLimitSubmitCase(page);
    });
  });

  test.describe("Add Files stays after a file is attached", () => {
    test(
      "A single PDF should stay listed and Add Files should remain available. (Attachment Details)",
      async ({ page }) => {
        test.setTimeout(OMN_UI_ATTACHMENT_TEST_TIMEOUT_MS);
        await runOmnUiEditAttachmentUploadStaysAfterOneFileCase(page);
      }
    );

    test(
      "The same PDF added twice should both be listed and Add Files should remain available. (Attachment Details)",
      async ({ page }) => {
        test.setTimeout(OMN_UI_ATTACHMENT_TEST_TIMEOUT_MS);
        await runOmnUiEditAttachmentSameFileTwiceCase(page);
      }
    );

    test(
      "A PDF and then a PNG added separately should both be listed and Add Files should remain available. (Attachment Details)",
      async ({ page }) => {
        test.setTimeout(OMN_UI_ATTACHMENT_TEST_TIMEOUT_MS);
        await runOmnUiEditAttachmentSecondUploadCase(page);
      }
    );

    test(
      "A PDF, a PNG, and an XML added separately should all be listed and Add Files should remain available. (Attachment Details)",
      async ({ page }) => {
        test.setTimeout(OMN_UI_ATTACHMENT_TEST_TIMEOUT_MS);
        await runOmnUiEditAttachmentThirdUploadCase(page);
      }
    );

    test(
      "A 4 MB file and then a 5 MB file added separately should both be listed and Add Files should remain available. (Attachment Details)",
      async ({ page }) => {
        test.setTimeout(OMN_UI_ATTACHMENT_SIZE_TIMEOUT_MS);
        await runOmnUiEditAttachmentSequentialUnderLimitCase(page);
      }
    );

    test(
      "A 6 MB file and then a 4 MB file added separately should both be listed and Add Files should remain available. (Attachment Details)",
      async ({ page }) => {
        test.setTimeout(OMN_UI_ATTACHMENT_SIZE_TIMEOUT_MS);
        await runOmnUiEditAttachmentSequentialAtLimitCase(page);
      }
    );

    test(
      "A 6 MB file followed by a 5 MB file should be rejected with an error and only the 6 MB file should remain. (Attachment Details)",
      async ({ page }) => {
        test.setTimeout(OMN_UI_ATTACHMENT_SIZE_TIMEOUT_MS);
        await runOmnUiEditAttachmentSequentialOverLimitCase(page);
      }
    );

    test(
      "A PDF followed by an unsupported text file should be rejected with an error and the PDF should remain. (Attachment Details)",
      async ({ page }) => {
        test.setTimeout(OMN_UI_ATTACHMENT_TEST_TIMEOUT_MS);
        await runOmnUiEditAttachmentSecondInvalidFormatCase(page);
      }
    );

    test(
      "After a PDF and a PNG are attached, removing the PNG and adding an XML should leave the PDF and the XML listed. (Attachment Details)",
      async ({ page }) => {
        test.setTimeout(OMN_UI_ATTACHMENT_TEST_TIMEOUT_MS);
        await runOmnUiEditAttachmentRemoveOneThenAddCase(page);
      }
    );

    test(
      "A PDF and then a PNG added separately should both be shown after Update and View. (Attachment Details)",
      async ({ page }) => {
        test.setTimeout(OMN_UI_ATTACHMENT_PERSIST_TIMEOUT_MS);
        await runOmnUiEditAttachmentSequentialPersistCase(page);
      }
    );
  });
});
