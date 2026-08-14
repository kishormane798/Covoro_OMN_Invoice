# Playwright Locator Expert — UAE E-Invoice examples

Patterns already used in this repo. Prefer these over inventing new strategies.

## getByTestId (highest priority when present)

```ts
// UIMasterBuyerAndItemPage.ts
await this.page.getByTestId("back-arrow").click();
await expect(this.page.getByTestId("product-header")).toHaveText("Add New");
```

## getByRole — buttons, headings, combobox

```ts
// UIMasterBuyerAndItemPage.ts
this.page.getByRole("button", { name: "Save" });
this.page.getByRole("heading", { name: "Peppol Details", level: 6 });
this.page.getByRole("combobox", { name: /Tax Accounting Currency/i });

// UIInvoiceCreationManualPage.ts — exact match avoids ambiguous MUI labels
section.getByRole("button", { name: "Edit", exact: true });
root.getByRole("textbox", { name: meta.label });
```

## Scope to container (upload dialog)

```ts
// UploadInvoicePage.ts — never click a global .refresh-icon
this.page.locator(SELECTORS.uploadContent).locator(SELECTORS.refreshIcon).first();

// Title filter narrows duplicate .upload-title nodes
this.page.locator(SELECTORS.uploadTitle).filter({ hasText: /Upload Excel File/i }).first();
```

## Section-scoped actions

```ts
// UIInvoiceCreationManualPage.ts
this.sectionLocator("item").getByRole("button", { name: "Add Item", exact: true });
```

## Table row → child

```ts
// Preferred pattern for invoice list actions (apply when table uses accessible rows)
this.page
  .getByRole("row", { name: /INV-2024-001/ })
  .getByRole("button", { name: "Edit" });
```

## Stable CSS when role/label unavailable

```ts
// LoginPage.ts — stable name attributes on auth form
this.page.locator('input[name="email"]');
this.page.locator('#sign-in'); // stable app id, not generated
```

## Fallback locators (UI variants only)

```ts
// UIInvoiceCreationManualPage.ts — .or() for layout variants, not as first choice
section
  .getByRole("button", { name: label, exact: true })
  .or(section.getByRole("button", { name: label, exact: true }));
```

## When to recommend data-testid

Upload and legacy screens still use CSS class hooks (`SELECTORS` in `UploadInvoicePage.ts`). When adding new UI:

1. Ask devs for `data-testid` on primary actions (Submit, Save, Upload, row actions).
2. Use `page.getByTestId(...)` once added.
3. Document the recommendation in the PR if the app team must add the attribute.

## Anti-patterns in this codebase (avoid for new locators)

```ts
// ❌ Page-wide generic button
this.page.locator("button").click();

// ❌ Unscoped MUI class without container
this.page.locator(".MuiAutocomplete-root").first();

// ❌ Absolute or indexed XPath
this.page.locator("/html/body/div[2]/button[3]");
```
