import { expect, type Locator, type Page } from "@playwright/test";
import { DashboardPage } from "./OMN_DashboardPage";
import { parallelWorkerDashboardOpenOpts } from "../Helpers/worker/parallelWorkerSubmitIdentity";
import {
  excelFormulaToUiValue,
  isUiEmptyValue,
  isUiWhitespaceValue,
  OMN_UI_SECTION_DATA_ID,
  type OmnUiEntry,
  type OmnUiSection,
} from "../testData/ui/omnUiInvoiceValidation";

const ITEM_MODAL = '[data-testid="modalBody"]';

export class OMN_UIInvoiceManualPage {
  readonly dashboard: DashboardPage;

  constructor(private readonly page: Page) {
    this.dashboard = new DashboardPage(page);
  }

  section(section: OmnUiSection): Locator {
    return this.page.locator(
      `section.invoice-content-section[data-id="${OMN_UI_SECTION_DATA_ID[section]}"]`
    );
  }

  documentSection(): Locator {
    return this.section("document");
  }

  itemModal(): Locator {
    return this.page.locator(ITEM_MODAL);
  }

  private scope(section: OmnUiSection): Locator {
    return section === "item" ? this.itemModal() : this.section(section);
  }

  /** Node has no `CSS.escape`; attribute selector is safe for ids with `[].` */
  private byDomIdSelector(id: string): string {
    return `[id=${JSON.stringify(id)}]`;
  }

  private inputIn(section: OmnUiSection, inputId: string): Locator {
    return this.scope(section).locator(this.byDomIdSelector(inputId));
  }

  async resolveInput(
    section: OmnUiSection,
    inputId: string,
    altInputIds: readonly string[] = []
  ): Promise<Locator> {
    const existing = await this.findInput(section, inputId, altInputIds);
    return existing ?? this.inputIn(section, inputId).first();
  }

  private async findInput(
    section: OmnUiSection,
    inputId: string,
    altInputIds: readonly string[] = []
  ): Promise<Locator | null> {
    for (const id of [inputId, ...altInputIds]) {
      const loc = this.inputIn(section, id);
      if ((await loc.count()) > 0) {
        return loc.first();
      }
    }
    return null;
  }

  private fieldRoot(section: OmnUiSection, input: Locator): Locator {
    return this.scope(section)
      .locator(".MuiFormControl-root")
      .filter({ has: input })
      .first();
  }

  private autocompleteRoot(section: OmnUiSection, input: Locator): Locator {
    return this.scope(section)
      .locator(".MuiAutocomplete-root")
      .filter({ has: input })
      .first();
  }

  private sectionFooter(section: OmnUiSection): Locator {
    return this.section(section).locator(".form-action-footer, .form-footer");
  }

  async openCreate(): Promise<void> {
    await this.dashboard.openDashboard(parallelWorkerDashboardOpenOpts());
    await this.dashboard.clickCreateInvoice();
    await this.expectEditorVisible();
  }

  async expectEditorVisible(): Promise<void> {
    await this.dashboard.expectCreateInvoiceEditModeLoaded();
  }

  async expectDocumentEditorVisible(): Promise<void> {
    await this.expectEditorVisible();
  }

  private sectionEditButton(section: OmnUiSection): Locator {
    const root = this.section(section);
    return root
      .locator(".divider-btn")
      .getByRole("button", { name: "Edit", exact: true })
      .or(root.getByRole("button", { name: "Edit", exact: true }))
      .first();
  }

  async isSectionInEditMode(section: OmnUiSection, entry: OmnUiEntry): Promise<boolean> {
    const name = entry === "create" ? "Save" : "Update";
    return this.sectionFooter(section)
      .getByRole("button", { name, exact: true })
      .first()
      .isVisible()
      .catch(() => false);
  }

  /** UAE pattern: scroll to the section, click **Edit** when present, then wait for Save/Update. */
  async openSectionForEdit(section: OmnUiSection, entry: OmnUiEntry): Promise<void> {
    if (section === "item") {
      await this.openItemEditor(entry !== "create");
      return;
    }
    const root = this.section(section);
    await expect(root).toBeVisible({ timeout: 15_000 });
    await root.scrollIntoViewIfNeeded();
    const editBtn = this.sectionEditButton(section);
    if (await editBtn.isVisible().catch(() => false)) {
      try {
        await editBtn.click({ timeout: 8_000 });
      } catch {
        await editBtn.click({ timeout: 8_000, force: true });
      }
    }
    const persistName = entry === "create" ? "Save" : "Update";
    await expect(
      this.sectionFooter(section).getByRole("button", { name: persistName, exact: true }).first()
    ).toBeVisible({ timeout: 15_000 });
  }

  async clickSectionCommit(section: OmnUiSection, entry: OmnUiEntry = "create"): Promise<void> {
    await this.dismissOpenDropdown();
    const footer = this.sectionFooter(section);
    const name = entry === "create" ? "Save" : "Update";
    const commit = footer.getByRole("button", { name, exact: true });
    await expect(commit.first()).toBeVisible({ timeout: 15_000 });
    await commit.first().click();
  }

  async clickDocumentSave(): Promise<void> {
    await this.clickSectionCommit("document", "create");
  }

  async clickDocumentUpdate(): Promise<void> {
    await this.clickSectionCommit("document", "edit");
  }

  async replaceInput(
    section: OmnUiSection,
    inputId: string,
    value: string,
    altInputIds: readonly string[] = []
  ): Promise<void> {
    const literal = excelFormulaToUiValue(value) ?? "";
    if (isUiEmptyValue(literal)) {
      await this.clearInput(section, inputId, altInputIds);
      return;
    }
    const input = await this.resolveInput(section, inputId, altInputIds);
    await expect(input).toBeVisible({ timeout: 15_000 });
    if (isUiWhitespaceValue(literal)) {
      await this.clearInput(section, inputId, altInputIds);
      await input.click();
      await input.pressSequentially(literal, { delay: 15 });
      return;
    }
    await input.click({ clickCount: 3 }).catch(() => input.click());
    await input.fill(literal);
  }

  /** Set a value even when MUI leaves the input `disabled` (self-billed buyer Peppol). */
  async replaceInputForced(
    section: OmnUiSection,
    inputId: string,
    value: string,
    altInputIds: readonly string[] = []
  ): Promise<void> {
    const literal = excelFormulaToUiValue(value) ?? "";
    const input = await this.resolveInput(section, inputId, altInputIds);
    await expect(input).toBeVisible({ timeout: 15_000 });
    if (!(await input.isDisabled().catch(() => false))) {
      await this.replaceInput(section, inputId, literal, altInputIds);
      return;
    }
    await input.evaluate((el, next) => {
      const node = el as HTMLInputElement;
      const descriptor = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        "value"
      );
      descriptor?.set?.call(node, next);
      node.dispatchEvent(new Event("input", { bubbles: true }));
      node.dispatchEvent(new Event("change", { bubbles: true }));
    }, literal);
  }

  async replaceInputById(inputId: string, value: string): Promise<void> {
    await this.replaceInput("document", inputId, value);
  }

  async clearInput(
    section: OmnUiSection,
    inputId: string,
    altInputIds: readonly string[] = []
  ): Promise<void> {
    const input = await this.resolveInput(section, inputId, altInputIds);
    await expect(input).toBeVisible({ timeout: 15_000 });
    const autoClear = this.autocompleteRoot(section, input)
      .locator(".MuiAutocomplete-clearIndicator")
      .first();
    if ((await autoClear.count()) > 0 && (await autoClear.isEnabled().catch(() => false))) {
      await autoClear.click({ force: true }).catch(() => {});
    }
    const current = await input.inputValue().catch(() => "");
    if (!current) {
      await input.fill("");
      return;
    }
    await input.click({ clickCount: 3 }).catch(() => input.click());
    await input.press("Control+A").catch(() => {});
    await input.press("Backspace").catch(() => {});
    await input.fill("");
  }

  async clearInputById(inputId: string): Promise<void> {
    await this.clearInput("document", inputId);
  }

  async readInputValue(
    section: OmnUiSection,
    inputId: string,
    altInputIds: readonly string[] = []
  ): Promise<string> {
    const input = await this.findInput(section, inputId, altInputIds);
    if (!input) return "";
    return (await input.inputValue().catch(() => "")).trim();
  }

  async isInputDisabled(
    section: OmnUiSection,
    inputId: string,
    altInputIds: readonly string[] = []
  ): Promise<boolean> {
    const input = await this.findInput(section, inputId, altInputIds);
    if (!input) return true;
    return input.isDisabled().catch(() => false);
  }

  async expectInputDisabled(
    section: OmnUiSection,
    inputId: string,
    disabled: boolean,
    altInputIds: readonly string[] = []
  ): Promise<void> {
    const input = await this.resolveInput(section, inputId, altInputIds);
    await expect(input).toBeVisible({ timeout: 15_000 });
    if (disabled) {
      await expect(input).toBeDisabled();
    } else {
      await expect(input).toBeEnabled();
    }
  }

  async fillDate(
    section: OmnUiSection,
    inputId: string,
    isoDate: string,
    altInputIds: readonly string[] = []
  ): Promise<void> {
    const hidden = await this.resolveInput(section, inputId, altInputIds);
    await hidden.evaluate((el, value) => {
      const input = el as HTMLInputElement;
      const descriptor = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        "value"
      );
      descriptor?.set?.call(input, value);
      input.dispatchEvent(new Event("input", { bubbles: true }));
      input.dispatchEvent(new Event("change", { bubbles: true }));
    }, isoDate);
  }

  async fillDateById(inputId: string, isoDate: string): Promise<void> {
    await this.fillDate("document", inputId, isoDate);
  }

  async clearDate(
    section: OmnUiSection,
    inputId: string,
    altInputIds: readonly string[] = []
  ): Promise<void> {
    const input = await this.resolveInput(section, inputId, altInputIds);
    const root = this.fieldRoot(section, input);
    const clear = root.getByRole("button", { name: /clear/i }).or(root.locator('button[title="Clear"]'));
    if ((await clear.count()) > 0 && (await clear.first().isVisible().catch(() => false))) {
      await clear.first().click();
      return;
    }
    await this.fillDate(section, inputId, "", altInputIds);
  }

  async clearDateById(inputId: string): Promise<void> {
    await this.clearDate("document", inputId);
  }

  async selectAutocomplete(
    section: OmnUiSection,
    inputId: string,
    option: string | RegExp,
    altInputIds: readonly string[] = []
  ): Promise<void> {
    const input = await this.resolveInput(section, inputId, altInputIds);
    await expect(input).toBeVisible({ timeout: 15_000 });
    const disabled = await input.isDisabled().catch(() => false);
    if (disabled) {
      const openBtn = this.autocompleteRoot(section, input).locator("button").last();
      await openBtn.click({ force: true });
    } else {
      await input.click();
      if (typeof option === "string") {
        await input.fill("");
        await input.fill(option);
      }
    }
    const listbox = this.page.locator('[role="listbox"]').last();
    await expect(listbox).toBeVisible({ timeout: 15_000 });
    if (disabled && typeof option === "string") {
      await this.page.keyboard.type(option, { delay: 20 });
    }
    const choice = listbox.getByRole("option", { name: option }).first();
    await expect(choice).toBeVisible({ timeout: 15_000 });
    try {
      await choice.click({ timeout: 5_000 });
    } catch {
      await choice.click({ force: true, timeout: 5_000 });
    }
    await this.dismissOpenDropdown();
  }

  async selectAutocompleteById(inputId: string, option: string | RegExp): Promise<void> {
    await this.selectAutocomplete("document", inputId, option);
  }

  async selectFirstAutocomplete(
    section: OmnUiSection,
    inputId: string,
    altInputIds: readonly string[] = []
  ): Promise<void> {
    const input = await this.resolveInput(section, inputId, altInputIds);
    await expect(input).toBeVisible({ timeout: 15_000 });
    await input.click();
    const listbox = this.page.locator('[role="listbox"]').last();
    await expect(listbox).toBeVisible({ timeout: 15_000 });
    const choice = listbox.getByRole("option").first();
    await expect(choice).toBeVisible({ timeout: 15_000 });
    await choice.click();
    await this.dismissOpenDropdown();
  }

  async clearAutocomplete(
    section: OmnUiSection,
    inputId: string,
    altInputIds: readonly string[] = []
  ): Promise<void> {
    await this.clearInput(section, inputId, altInputIds);
    await this.dismissOpenDropdown();
  }

  async typeWhitespace(
    section: OmnUiSection,
    inputId: string,
    spaces: string,
    altInputIds: readonly string[] = []
  ): Promise<void> {
    const literal = excelFormulaToUiValue(spaces) ?? spaces;
    await this.clearInput(section, inputId, altInputIds);
    const input = await this.resolveInput(section, inputId, altInputIds);
    await input.click();
    await input.pressSequentially(literal, { delay: 15 });
    await this.dismissOpenDropdown();
  }

  async clearAutocompleteById(inputId: string): Promise<void> {
    await this.clearAutocomplete("document", inputId);
  }

  async selectFirstNonOmrCurrency(): Promise<void> {
    const input = await this.resolveInput("document", "invCurrCode");
    await expect(input).toBeVisible({ timeout: 15_000 });
    await input.click();
    const listbox = this.page.locator('[role="listbox"]').last();
    await expect(listbox).toBeVisible({ timeout: 15_000 });
    const foreign = listbox
      .getByRole("option")
      .filter({ hasNotText: /rial omani/i })
      .first();
    await expect(foreign).toBeVisible({ timeout: 15_000 });
    await foreign.click();
    await this.dismissOpenDropdown();
  }

  async dismissOpenDropdown(): Promise<void> {
    const popper = this.page.locator(".MuiAutocomplete-popper, [role='listbox']").first();
    if (await popper.isVisible().catch(() => false)) {
      await this.page.keyboard.press("Escape");
      await expect(popper).toBeHidden({ timeout: 5_000 }).catch(() => {});
    }
  }

  async openItemEditor(preferExistingRow: boolean): Promise<void> {
    const section = this.section("item");
    await expect(section).toBeVisible({ timeout: 15_000 });
    if (preferExistingRow) {
      const editBtn = section.locator("table tbody tr").first().getByRole("button", { name: /edit/i });
      if ((await editBtn.count()) > 0 && (await editBtn.first().isVisible().catch(() => false))) {
        await editBtn.first().click();
        await expect(this.itemModal()).toBeVisible({ timeout: 15_000 });
        return;
      }
      const row = section.locator("table tbody tr").first();
      if ((await row.count()) > 0 && (await row.isVisible().catch(() => false))) {
        await row.click();
        if (await this.itemModal().isVisible().catch(() => false)) {
          return;
        }
      }
    }
    const add = section.getByRole("button", { name: /add item details/i });
    await expect(add).toBeVisible({ timeout: 15_000 });
    await add.click();
    await expect(this.itemModal()).toBeVisible({ timeout: 15_000 });
  }

  async clickItemCommit(entry: OmnUiEntry = "create"): Promise<void> {
    await this.dismissOpenDropdown();
    const footer = this.itemModal().locator(".modal-footer, .form-action-footer, .form-footer");
    const name = entry === "create" ? /^Add$/ : /^Update$/;
    const commit = footer.getByRole("button", { name });
    await expect(commit.first()).toBeVisible({ timeout: 15_000 });
    await commit.first().click();
  }

  async readFieldError(
    section: OmnUiSection,
    inputId: string,
    altInputIds: readonly string[] = []
  ): Promise<string> {
    const ids = [inputId, ...altInputIds];
    for (const id of ids) {
      const scoped = this.scope(section).locator(this.byDomIdSelector(`${id}-helper-text`));
      if ((await scoped.count()) > 0 && (await scoped.first().isVisible().catch(() => false))) {
        return (await scoped.first().innerText()).trim();
      }
    }
    return this.dashboard.readVisibleEditValidationMessageWithFallback();
  }

  private sectionReadOnly(section: OmnUiSection): Locator {
    return this.section(section)
      .locator(".input-box-container.read-only, .display-inline.read-only-field")
      .first();
  }

  /** After a valid Save/Update the section switches to read-only display. */
  async expectSectionSavedReadOnly(section: OmnUiSection): Promise<void> {
    if (section === "item") {
      await expect(this.itemModal()).toBeHidden({ timeout: 15_000 });
      return;
    }
    await expect(this.sectionReadOnly(section)).toBeVisible({ timeout: 15_000 });
  }

  /** Invalid Save/Update keeps the section in edit mode with the field error. */
  async expectSectionNotSaved(section: OmnUiSection, entry: OmnUiEntry): Promise<void> {
    if (section === "item") {
      await expect(this.itemModal()).toBeVisible();
      return;
    }
    await expect(this.sectionReadOnly(section)).toHaveCount(0);
    const name = entry === "create" ? "Save" : "Update";
    await expect(
      this.sectionFooter(section).getByRole("button", { name, exact: true })
    ).toBeVisible();
  }
}
