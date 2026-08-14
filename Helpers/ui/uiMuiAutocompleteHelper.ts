// MOVED TO ui/ — DISABLED FOR OMN
// This file was relocated under a ui/ subfolder; executable code is commented out.
//
// import { expect, type Locator, type Page } from "@playwright/test";
// 
// async function dismissVisibleOverlay(page: Page, overlay: Locator): Promise<void> {
//   if (!(await overlay.first().isVisible().catch(() => false))) {
//     return;
//   }
//   await page.keyboard.press("Escape");
//   await expect(overlay.first()).toBeHidden({ timeout: 5_000 });
// }
// 
// /**
//  * Close open MUI autocomplete / select overlays after clear, fill, or before Save.
//  * Prevents `role="option"` poppers from intercepting footer Save clicks
//  * (empty / null / whitespace conditional cases).
//  */
// export async function dismissOpenDropdownIfOpen(page: Page): Promise<void> {
//   await dismissVisibleOverlay(page, page.locator(".MuiAutocomplete-popper"));
//   await dismissVisibleOverlay(page, page.locator('[role="listbox"]'));
// }
// 
// /**
//  * Click a MUI autocomplete option inside the visible listbox.
//  * Falls back to force-click, then ArrowDown+Enter when the popper intercepts pointer events.
//  */
// async function clickMuiAutocompleteOption(
//   page: Page,
//   optionName: string | RegExp,
//   optionTimeoutMs = 15_000
// ): Promise<void> {
//   const listbox = page.locator('[role="listbox"]').last();
//   await expect(listbox).toBeVisible({ timeout: optionTimeoutMs });
// 
//   const optionInListbox = listbox.getByRole("option", { name: optionName }).first();
//   const option =
//     (await optionInListbox.count()) > 0
//       ? optionInListbox
//       : page.getByRole("option", { name: optionName }).first();
// 
//   await expect(option).toBeVisible({ timeout: optionTimeoutMs });
// 
//   try {
//     await option.click({ timeout: 5_000 });
//     return;
//   } catch {
//     /* popper may block pointer events despite passing visibility checks */
//   }
// 
//   try {
//     await option.click({ force: true, timeout: 5_000 });
//     return;
//   } catch {
//     /* keyboard fallback */
//   }
// 
//   await page.keyboard.press("ArrowDown");
//   await page.keyboard.press("Enter");
// }
// 
// /** Open input, optional filter, then select an option from the MUI listbox. */
// export async function selectMuiAutocompleteOption(
//   page: Page,
//   input: Locator,
//   optionName: string | RegExp,
//   options?: { filterText?: string; optionTimeoutMs?: number }
// ): Promise<void> {
//   const optionTimeoutMs = options?.optionTimeoutMs ?? 15_000;
//   await input.scrollIntoViewIfNeeded();
//   await input.click();
//   if (options?.filterText) {
//     await input.fill(options.filterText);
//   }
//   await clickMuiAutocompleteOption(page, optionName, optionTimeoutMs);
//   await dismissOpenDropdownIfOpen(page);
// }
