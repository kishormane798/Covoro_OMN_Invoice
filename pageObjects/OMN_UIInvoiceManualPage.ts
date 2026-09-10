import { expect, type Locator, type Page } from "@playwright/test";
import { DashboardPage } from "./OMN_DashboardPage";
import { waitForEInvoiceListValidatingGone } from "../Helpers/waitForWithPageRefresh";
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

  /** Walk up from the input so ids with `[]` (e.g. proceedingDtls[0].invoiceIssueDate) still resolve. */
  private fieldRoot(_section: OmnUiSection, input: Locator): Locator {
    return input.locator('xpath=ancestor::*[contains(@class,"MuiFormControl-root")][1]');
  }

  private autocompleteRoot(section: OmnUiSection, input: Locator): Locator {
    return this.scope(section)
      .locator(".MuiAutocomplete-root")
      .filter({ has: input })
      .first();
  }

  /** Live widget: text vs dropdown vs date. Catalog mismatches fail the test. */
  private controlKindLabel(kind: "text" | "date" | "autocomplete"): string {
    switch (kind) {
      case "autocomplete":
        return "dropdown";
      case "date":
        return "date field";
      default:
        return "text field";
    }
  }

  async readLiveControlKind(
    section: OmnUiSection,
    inputId: string,
    altInputIds: readonly string[] = []
  ): Promise<"text" | "date" | "autocomplete"> {
    const input = await this.resolveInput(section, inputId, altInputIds);
    if ((await this.autocompleteRoot(section, input).count()) > 0) {
      return "autocomplete";
    }
    const type = ((await input.getAttribute("type")) ?? "").toLowerCase();
    if (type === "date" || type === "datetime-local" || type === "month") {
      return "date";
    }
    const className = (await input.getAttribute("class")) ?? "";
    // MUI DatePicker hidden input: class MuiPickersInputBase-input, not type="date".
    if (className.includes("MuiPickersInputBase-input")) {
      return "date";
    }
    const root = this.fieldRoot(section, input);
    const calendar = root.getByRole("button", {
      name: /choose date|calendar|open calendar|pick date/i,
    });
    if ((await calendar.count()) > 0) {
      return "date";
    }
    const hasPopup = ((await input.getAttribute("aria-haspopup")) ?? "").toLowerCase();
    if (hasPopup === "dialog") {
      return "date";
    }
    const role = ((await input.getAttribute("role")) ?? "").toLowerCase();
    const ariaAuto = ((await input.getAttribute("aria-autocomplete")) ?? "").toLowerCase();
    if (role === "combobox" || (ariaAuto !== "" && ariaAuto !== "none")) {
      return "autocomplete";
    }
    return "text";
  }

  async expectLiveControlKind(
    section: OmnUiSection,
    inputId: string,
    expected: "text" | "date" | "autocomplete",
    altInputIds: readonly string[] = []
  ): Promise<void> {
    const actual = await this.readLiveControlKind(section, inputId, altInputIds);
    expect(
      actual,
      `${section} #${inputId} is a ${this.controlKindLabel(actual)}, expected a ${this.controlKindLabel(expected)}`
    ).toBe(expected);
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
    await this.expectLiveControlKind(section, inputId, "text", altInputIds);
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
    await this.expectLiveControlKind(section, inputId, "text", altInputIds);
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
    await this.expectLiveControlKind(section, inputId, "date", altInputIds);
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
    await this.expectLiveControlKind(section, inputId, "date", altInputIds);
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

  private foldAutocompleteLabel(value: string): string {
    return value.trim().toLowerCase().replace(/[- ]+/g, " ");
  }

  private autocompleteValueMatches(current: string, option: string | RegExp): boolean {
    if (typeof option !== "string") return option.test(current);
    return (
      current === option || this.foldAutocompleteLabel(current) === this.foldAutocompleteLabel(option)
    );
  }

  private async autocompleteOption(
    listbox: Locator,
    option: string | RegExp
  ): Promise<Locator> {
    if (typeof option !== "string") {
      return listbox.getByRole("option", { name: option });
    }
    // exact: "Credit note" must not match "Factored credit note". Hyphen fold
    // covers "Self billed credit note" vs "Self-billed credit note". Substring
    // is last for ICD-prefixed Peppol labels ("0248: Oman … (VATIN)").
    const exact = listbox.getByRole("option", { name: option, exact: true });
    if ((await exact.count()) > 0) return exact;
    const folded = option
      .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
      .replace(/[- ]+/g, "[- ]");
    const hyphenFold = listbox.getByRole("option", { name: new RegExp(`^${folded}$`, "i") });
    if ((await hyphenFold.count()) > 0) return hyphenFold;
    return listbox.getByRole("option", { name: option });
  }

  async selectAutocomplete(
    section: OmnUiSection,
    inputId: string,
    option: string | RegExp,
    altInputIds: readonly string[] = []
  ): Promise<void> {
    await this.expectLiveControlKind(section, inputId, "autocomplete", altInputIds);
    const input = await this.resolveInput(section, inputId, altInputIds);
    await expect(input).toBeVisible({ timeout: 15_000 });
    const current = (await input.inputValue().catch(() => "")).trim();
    if (this.autocompleteValueMatches(current, option)) {
      return;
    }
    // Buyer Peppol stays disabled until country schemes load. The disabled popup
    // icon has pointer-events:none and is overlay-intercepted — clicking it hangs
    // until the test timeout.
    await expect(
      input,
      `${section} #${inputId} should be enabled before selecting`
    ).toBeEnabled({ timeout: 15_000 });
    // MUI keeps the previous option until the clear (X) is used. fill() over a
    // prefilled Invoice Type / Transaction Type does not commit a new value.
    if (current) {
      await this.clearInput(section, inputId, altInputIds);
      await this.dismissOpenDropdown();
    }
    await input.click();
    if (typeof option === "string") {
      await input.fill(option);
    }
    const listbox = this.page.locator('[role="listbox"]').last();
    if (!(await listbox.isVisible().catch(() => false))) {
      await input.press("ArrowDown");
    }
    await expect(listbox).toBeVisible({ timeout: 15_000 });
    const choice = await this.autocompleteOption(listbox, option);
    await expect(choice.first()).toBeVisible({ timeout: 15_000 });
    try {
      await choice.first().click({ timeout: 5_000 });
    } catch {
      await choice.first().click({ force: true, timeout: 5_000 });
    }
    await this.dismissOpenDropdown();
    const selected = (await input.inputValue().catch(() => "")).trim();
    if (typeof option === "string") {
      expect(
        this.autocompleteValueMatches(selected, option) || selected.includes(option),
        `${section} #${inputId} should contain ${option}`
      ).toBe(true);
    } else {
      expect(selected, `${section} #${inputId} should match ${option}`).toMatch(option);
    }
  }

  /**
   * Invoice Type is a single-select. Do not fill() — that only types into the
   * combobox, so the header stays on the previous type and txn options stay gated.
   */
  async selectInvoiceType(option: string): Promise<void> {
    await this.expectLiveControlKind("document", "invType", "autocomplete");
    const input = await this.resolveInput("document", "invType");
    await expect(input).toBeVisible({ timeout: 15_000 });
    await expect(
      input,
      "document #invType should be enabled before selecting"
    ).toBeEnabled({ timeout: 15_000 });
    const current = (await input.inputValue().catch(() => "")).trim();
    if (current) {
      await this.clearInput("document", "invType");
      await this.dismissOpenDropdown();
    }
    await input.click();
    await input.pressSequentially(option, { delay: 20 });
    // Same MUI listbox id pattern as live `#invTxnType-listbox`.
    const listbox = this.page.locator("#invType-listbox");
    if (!(await listbox.isVisible().catch(() => false))) {
      await input.press("ArrowDown");
    }
    await expect(listbox).toBeVisible({ timeout: 15_000 });
    const choice = (await this.autocompleteOption(listbox, option)).first();
    await expect(choice, `invType option ${option} should be visible`).toBeVisible({
      timeout: 15_000,
    });
    await choice.hover();
    await this.page.keyboard.press("Enter");
    // Single-select commits when the listbox closes. Escape undoes it:
    // combobox text can show the new type while the header stays Commercial.
    await expect(listbox).toBeHidden({ timeout: 10_000 });
    const selected = (await input.inputValue().catch(() => "")).trim();
    expect(
      this.autocompleteValueMatches(selected, option) || selected.includes(option),
      `document #invType should contain ${option}`
    ).toBe(true);
  }

  /**
   * Invoice Transaction Type is a checkbox multi-select (`#invTxnType-listbox`).
   * Do not fill() the combobox — that leaves the value empty and Save fails.
   */
  async selectTransactionTypes(labels: readonly string[]): Promise<void> {
    const wanted = [...new Set(labels.map((label) => label.trim()).filter(Boolean))];
    if (wanted.length === 0) return;
    await this.expectLiveControlKind("document", "invTxnType", "autocomplete");
    const input = await this.resolveInput("document", "invTxnType");
    await expect(input).toBeVisible({ timeout: 15_000 });
    await expect(
      input,
      "document #invTxnType should be enabled before selecting"
    ).toBeEnabled({ timeout: 15_000 });
    const listbox = this.page.locator("#invTxnType-listbox");
    const openList = async () => {
      if (await listbox.isVisible().catch(() => false)) return;
      await input.click();
      if (!(await listbox.isVisible().catch(() => false))) {
        await input.press("ArrowDown");
      }
      await expect(listbox).toBeVisible({ timeout: 15_000 });
    };
    await openList();
    for (const label of wanted) {
      await openList();
      const optionOf = async () => (await this.autocompleteOption(listbox, label)).first();
      let choice = await optionOf();
      await expect(choice, `invTxnType option ${label} should be visible`).toBeVisible({
        timeout: 15_000,
      });
      if ((await choice.getAttribute("aria-disabled")) === "true") {
        await this.dismissOpenDropdown();
        await expect
          .poll(
            async () => {
              await openList();
              const row = await optionOf();
              return (await row.getAttribute("aria-disabled")) !== "true";
            },
            {
              timeout: 15_000,
              message: `invTxnType option "${label}" should enable after Invoice Type commit`,
            }
          )
          .toBe(true)
          .catch(async () => {
            await openList();
            const enabled = await listbox.getByRole("option").evaluateAll((nodes) =>
              nodes
                .filter((node) => node.getAttribute("aria-disabled") !== "true")
                .map((node) => (node.textContent ?? "").replace(/\s+/g, " ").trim())
                .filter(Boolean)
            );
            await this.dismissOpenDropdown();
            throw new Error(
              `invTxnType option "${label}" is disabled. Enabled: ${enabled.join(", ") || "(none)"}`
            );
          });
        choice = await optionOf();
      }
      if ((await choice.getAttribute("aria-selected")) === "true") continue;
      await choice.scrollIntoViewIfNeeded();
      await choice.hover();
      // MUI multi-select listens on the <li>. Clicks on the inner checkbox /
      // span.checkmarks succeed in Playwright but do not toggle aria-selected.
      const optionText = choice.getByText(label, { exact: true });
      if ((await optionText.count()) > 0) {
        await optionText.click({ timeout: 5_000 });
      } else {
        await choice.click({ timeout: 5_000 });
      }
      if ((await (await optionOf()).getAttribute("aria-selected")) !== "true") {
        await (await optionOf()).hover();
        await this.page.keyboard.press("Space");
      }
      await expect
        .poll(
          async () => {
            await openList();
            const row = await optionOf();
            return row.getAttribute("aria-selected");
          },
          {
            timeout: 10_000,
            message: `invTxnType "${label}" should be selected`,
          }
        )
        .toBe("true");
    }
    await this.dismissOpenDropdown();
  }

  /**
   * After an applicable transaction type is checked, a forbidden partner
   * stays `aria-disabled` (IBR-138-OM … IBR-149-OM). Do not Save for that.
   */
  async expectTransactionTypesDisabled(labels: readonly string[]): Promise<void> {
    const wanted = [...new Set(labels.map((label) => label.trim()).filter(Boolean))];
    if (wanted.length === 0) return;
    await this.expectLiveControlKind("document", "invTxnType", "autocomplete");
    const input = await this.resolveInput("document", "invTxnType");
    await expect(input).toBeVisible({ timeout: 15_000 });
    const listbox = this.page.locator("#invTxnType-listbox");
    if (!(await listbox.isVisible().catch(() => false))) {
      await input.click();
      if (!(await listbox.isVisible().catch(() => false))) {
        await input.press("ArrowDown");
      }
    }
    await expect(listbox).toBeVisible({ timeout: 15_000 });
    for (const label of wanted) {
      const choice = (await this.autocompleteOption(listbox, label)).first();
      await expect(choice, `invTxnType option ${label} should be visible`).toBeVisible({
        timeout: 15_000,
      });
      await expect(
        choice,
        `invTxnType option "${label}" should be disabled for this combination`
      ).toHaveAttribute("aria-disabled", "true");
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
    await this.expectLiveControlKind(section, inputId, "autocomplete", altInputIds);
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
    await this.expectLiveControlKind(section, inputId, "autocomplete", altInputIds);
    await this.clearInput(section, inputId, altInputIds);
    await this.dismissOpenDropdown();
  }

  async typeWhitespace(
    section: OmnUiSection,
    inputId: string,
    spaces: string,
    altInputIds: readonly string[] = []
  ): Promise<void> {
    await this.expectLiveControlKind(section, inputId, "autocomplete", altInputIds);
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
    await this.expectLiveControlKind("document", "invCurrCode", "autocomplete");
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
    if (await this.itemModal().isVisible().catch(() => false)) {
      return;
    }
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
    const add = section.getByRole("button", { name: "Add Item", exact: true });
    await expect(add).toBeVisible({ timeout: 15_000 });
    await add.scrollIntoViewIfNeeded();
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

  /** Snapshot labels: VAT Line Amount in OMR / Invoice Line Amount in OMR. */
  async replaceLabeledItemText(label: string, value: string): Promise<void> {
    const input = this.itemModal().getByRole("textbox", { name: label, exact: true });
    if ((await input.count()) === 0) return;
    await expect(input.first()).toBeVisible({ timeout: 15_000 });
    await input.first().fill(value);
  }

  async readLabeledSectionValue(section: OmnUiSection, label: string): Promise<string> {
    const root = this.scope(section);
    const box = root.getByRole("textbox", { name: label, exact: true });
    if ((await box.count()) > 0) {
      return (await box.first().inputValue().catch(() => "")).trim();
    }
    const named = root.getByLabel(label, { exact: true });
    if ((await named.count()) > 0) {
      const typed = (await named.first().inputValue().catch(() => "")).trim();
      if (typed) return typed;
      return (await named.first().innerText().catch(() => "")).trim();
    }
    return "";
  }

  async selectLabeledCombobox(
    section: OmnUiSection,
    label: string,
    option: string
  ): Promise<void> {
    const input = this.scope(section).getByRole("combobox", { name: label, exact: true }).first();
    if ((await input.count()) === 0) return;
    const current = (await input.inputValue().catch(() => "")).trim();
    if (this.autocompleteValueMatches(current, option) || current.includes(option)) {
      return;
    }
    if (!(await input.isEnabled().catch(() => false))) return;
    await input.click();
    await input.fill(option);
    const listbox = this.page.locator('[role="listbox"]').last();
    if (!(await listbox.isVisible().catch(() => false))) {
      await input.press("ArrowDown");
    }
    await expect(listbox).toBeVisible({ timeout: 15_000 });
    const choice = await this.autocompleteOption(listbox, option);
    await expect(choice.first()).toBeVisible({ timeout: 15_000 });
    try {
      await choice.first().click({ timeout: 5_000 });
    } catch {
      await choice.first().click({ force: true, timeout: 5_000 });
    }
    await this.dismissOpenDropdown();
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

  /**
   * Section **7. Attachment Details** (`section[data-id="7"]`).
   * Locators match UAE Edit Invoice Attachment Details (verified there).
   */
  attachmentSection(): Locator {
    return this.page.locator('section.invoice-content-section[data-id="7"]');
  }

  attachmentFileInput(): Locator {
    return this.attachmentSection().locator("#file-input");
  }

  attachmentUploadZone(): Locator {
    return this.attachmentSection().locator(".upload-section:not(.uploaded-files)");
  }

  attachmentUploadedFiles(): Locator {
    return this.attachmentSection().locator(".uploaded-files.upload-section");
  }

  attachmentFileRows(): Locator {
    return this.attachmentUploadedFiles().locator(".file-details");
  }

  attachmentAddFilesLabel(): Locator {
    return this.attachmentSection().locator('label.file-button[for="file-input"]');
  }

  private documentMainScope(): Locator {
    return this.page.locator("main.invoice-content-container");
  }

  private async waitForCreateInvoiceIdle(timeoutMs = 20_000): Promise<void> {
    await waitForEInvoiceListValidatingGone(this.page, timeoutMs, {
      loaderStuckBeforeRefreshMs: 12_000,
      maxLoaderRefreshes: 1,
    });
  }

  async openFromUploadedInvoice(invoiceNumber: string): Promise<void> {
    await this.dashboard.refreshDashboardForInvoiceTable(invoiceNumber);
    await this.dashboard.openInvoiceEdit(invoiceNumber);
    await this.expectEditorVisible();
    await this.waitForCreateInvoiceIdle();
  }

  async scrollToAttachmentSection(): Promise<void> {
    const main = this.documentMainScope();
    await expect(main).toBeVisible({ timeout: 30_000 });

    await main
      .evaluate((el) => {
        el.scrollTop = el.scrollHeight;
      })
      .catch(() => undefined);
    await this.page
      .evaluate(() => window.scrollTo(0, document.body.scrollHeight))
      .catch(() => undefined);

    const section = this.attachmentSection();
    await expect(
      section,
      "Expected Create Invoice section 7. Attachment Details after prior sections were saved"
    ).toBeVisible({ timeout: 45_000 });

    await section.scrollIntoViewIfNeeded({ timeout: 15_000 });

    await expect(
      section
        .locator('hr[data-content="7. Attachment Details"]')
        .or(section.locator("hr[data-content*='Attachment Details']")),
      "Expected Attachment Details heading inside section 7"
    ).toBeVisible({ timeout: 30_000 });
  }

  async expectAttachmentUploadZoneVisible(): Promise<void> {
    await expect(this.attachmentUploadZone()).toBeVisible({ timeout: 15_000 });
    await expect(this.attachmentAddFilesLabel()).toBeVisible();
  }

  async expectAttachmentUploadZoneHidden(): Promise<void> {
    await expect(this.attachmentUploadZone()).toBeHidden({ timeout: 15_000 });
    await expect(this.attachmentAddFilesLabel()).toBeHidden({ timeout: 15_000 });
    await expect(this.attachmentUploadedFiles()).toBeVisible({ timeout: 15_000 });
  }

  attachedFileRow(fileName: string): Locator {
    return this.attachmentFileRows().filter({ hasText: fileName });
  }

  attachedFileName(fileName: string): Locator {
    return this.attachedFileRow(fileName).locator(".ellipsis-text");
  }

  async expectAttachedFilesListed(fileNames: string[]): Promise<void> {
    await expect(this.attachmentUploadedFiles()).toBeVisible({ timeout: 20_000 });
    await expect(
      this.attachmentFileRows(),
      `Expected ${fileNames.length} attached file row(s) under Attachment Details`
    ).toHaveCount(fileNames.length, { timeout: 20_000 });
    for (const name of fileNames) {
      await expect(
        this.attachedFileName(name).first(),
        `Expected attached file "${name}" in .ellipsis-text`
      ).toBeVisible({ timeout: 20_000 });
    }
  }

  async expectAttachmentsDisplayedInView(fileNames: string[]): Promise<void> {
    await this.scrollToAttachmentSection();
    await this.expectAttachedFilesListed(fileNames);
    for (const name of fileNames) {
      await expect(
        this.attachedFileRow(name).locator(".icon-hover-effect"),
        `View mode should not show remove cross for "${name}"`
      ).toHaveCount(0);
    }
  }

  attachmentRemoveConfirmModal(): Locator {
    return this.page.locator('[data-testid="modalBody"]').filter({
      hasText: /Are you sure you want remove the selected file/i,
    });
  }

  async expectAttachmentRemoveConfirmVisible(): Promise<void> {
    const modal = this.attachmentRemoveConfirmModal();
    await expect(modal).toBeVisible({ timeout: 15_000 });
    await expect(modal.getByRole("button", { name: "No", exact: true })).toBeVisible();
    await expect(modal.getByRole("button", { name: "Yes", exact: true })).toBeVisible();
  }

  async confirmAttachmentRemove(decision: "Yes" | "No" = "Yes"): Promise<void> {
    const modal = this.attachmentRemoveConfirmModal();
    await this.expectAttachmentRemoveConfirmVisible();
    await modal
      .locator(".btn-container")
      .getByRole("button", { name: decision, exact: true })
      .click();
    await expect(modal).toBeHidden({ timeout: 15_000 });
  }

  async removeAttachedFile(
    fileName: string,
    options?: { confirm?: "Yes" | "No" }
  ): Promise<void> {
    const confirm = options?.confirm ?? "Yes";
    const row = this.attachedFileRow(fileName).first();
    await expect(row).toBeVisible({ timeout: 15_000 });
    await row.locator(".icon-hover-effect").click();
    await this.confirmAttachmentRemove(confirm);
    if (confirm === "Yes") {
      await expect(
        this.attachedFileRow(fileName),
        `Attachment "${fileName}" should be removed after Yes`
      ).toHaveCount(0, { timeout: 15_000 });
    } else {
      await expect(this.attachedFileName(fileName).first()).toBeVisible({ timeout: 10_000 });
    }
  }

  async expectAttachmentRejectionMessage(errorPattern: RegExp): Promise<void> {
    const section = this.attachmentSection();
    const candidates = this.page
      .getByRole("alert")
      .or(this.page.locator(".MuiAlert-root, .Toastify__toast, [role='status']"))
      .or(this.page.getByRole("dialog"))
      .or(section.locator(".error, .error-message, .guidelines-container"))
      .or(this.page.getByText(errorPattern));
    await expect(
      candidates.filter({ hasText: errorPattern }).first(),
      `Expected attachment rejection matching ${errorPattern}`
    ).toBeVisible({ timeout: 20_000 });
  }

  async selectAttachmentFiles(...filePaths: string[]): Promise<void> {
    if (!filePaths.length) {
      throw new Error("selectAttachmentFiles: at least one file path is required");
    }
    await this.scrollToAttachmentSection();
    await this.expectAttachmentUploadZoneVisible();
    const input = this.attachmentFileInput();
    await expect(input).toBeAttached({ timeout: 15_000 });
    await input.setInputFiles(filePaths);
  }

  createInvoicePageUpdateButton(): Locator {
    return this.page
      .locator(".btn-container .button-wrapper button.base-btn")
      .filter({ has: this.page.locator(".btn-children", { hasText: /^Update$/ }) })
      .or(
        this.page.locator(".btn-container button", {
          has: this.page.locator(".btn-children", { hasText: /^Update$/ }),
        })
      )
      .or(this.page.getByRole("button", { name: "Update", exact: true }))
      .first();
  }

  createInvoicePageSubmitButton(): Locator {
    return this.page
      .locator(".btn-container .button-wrapper button.base-btn")
      .filter({ has: this.page.locator(".btn-children", { hasText: /^Submit$/ }) })
      .or(
        this.page.locator(".btn-container button", {
          has: this.page.locator(".btn-children", { hasText: /^Submit$/ }),
        })
      )
      .first();
  }

  async clickCreateInvoicePageUpdate(): Promise<void> {
    await this.waitForCreateInvoiceIdle();
    const update = this.createInvoicePageUpdateButton();
    await expect(update).toBeVisible({ timeout: 30_000 });
    await expect(update).toBeEnabled({ timeout: 30_000 });
    await update.scrollIntoViewIfNeeded();
    await this.dismissOpenDropdown();
    try {
      await update.click({ timeout: 12_000 });
    } catch {
      await update.click({ timeout: 12_000, force: true });
    }
  }

  async clickCreateInvoicePageSubmit(): Promise<void> {
    await this.waitForCreateInvoiceIdle();
    const submit = this.createInvoicePageSubmitButton();
    await expect(submit).toBeVisible({ timeout: 30_000 });
    await expect(submit).toBeEnabled({ timeout: 30_000 });
    await submit.scrollIntoViewIfNeeded();
    await this.dismissOpenDropdown();
    try {
      await submit.click({ timeout: 12_000 });
    } catch {
      await submit.click({ timeout: 12_000, force: true });
    }
  }

  async waitAfterAttachmentPersist(
    timeoutMs = 90_000
  ): Promise<"dashboard" | "edit"> {
    const deadline = Date.now() + timeoutMs;
    const started = Date.now();
    const upload = this.page.locator("#upload-invoice-btn").first();
    const update = this.createInvoicePageUpdateButton();
    const submit = this.createInvoicePageSubmitButton();

    while (Date.now() < deadline) {
      if (await upload.isVisible().catch(() => false)) {
        return "dashboard";
      }
      const url = this.page.url();
      if (!/einvoice\/edit/i.test(url) && /\/einvoice/i.test(url)) {
        if (await upload.isVisible().catch(() => false)) {
          return "dashboard";
        }
      }
      if (Date.now() - started >= 12_000 && /einvoice\/edit/i.test(url)) {
        const onEditShell =
          (await update.isVisible().catch(() => false)) ||
          (await submit.isVisible().catch(() => false));
        if (onEditShell) {
          return "edit";
        }
      }
      await this.page.waitForTimeout(1_000);
    }

    if (await upload.isVisible().catch(() => false)) {
      return "dashboard";
    }
    if (/einvoice\/edit/i.test(this.page.url())) {
      return "edit";
    }
    throw new Error(
      `After attachment Update/Submit: neither e-invoice dashboard nor edit shell within ${timeoutMs}ms (url=${this.page.url()})`
    );
  }
}
