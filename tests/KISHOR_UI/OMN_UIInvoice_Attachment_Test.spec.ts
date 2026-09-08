import { test } from "../../Src/baseTest";
import {
  runOmnUiEditAttachmentAtLimitSingleCase,
  runOmnUiEditAttachmentAtLimitSubmitCase,
  runOmnUiEditAttachmentCombinedOversizeCase,
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
 * (formats / multi / 10 MB / remove / Update+View / submit+delivery).
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
});
