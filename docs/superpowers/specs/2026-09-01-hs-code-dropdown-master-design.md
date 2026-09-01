# Design: HS Code dropdown master (positive + negative)

**Date:** 2026-09-01  
**Status:** Approved (approach 1 + negative dropdown; positive split Part 1 / Part 2)

## Goal

Upload **every** Oman HS code through the Covoro field-validation **dropdown** path. Positive runs as **two** sweeps matching the Peppol master (**Part 1** and **Part 2**). Negative is **one** field-level invalid dropdown — not split by part.

## ISIC (no change)

`Industrial Classification Code` is already wired:

- Master: `testData/Master/Master.isic.ts` → `industrialClassificationIsicValidTestData`
- Config: `dropdownFieldMasterConfig` in `TestDataConfig.ts`
- Spec: `OMN_FieldValidation_CovoroTemplate_Test.spec.ts` — **Dropdown — valid values** and **Dropdown — invalid values**

Do not add, split, or rewire ISIC.

## Source of truth (HS)

Peppol PINT-OM pages are **not** the source. The Covoro template Masters sheet has:

- **HS Code List - Part 1** — Code column (template col 53) — **7,301** codes
- **HS Code List - Part 2** — Code column (template col 56) — **6,867** codes

Keep the two lists **separate**. Codes only (no Description column). Every value is a 12-digit string. Do not include Peppol-only rows such as `000000000000` or `260111000901` — those are not on the template list and the upload rejects them.

## Approach

Reuse `generateOmanDropdownMasterExcel`. Do not invent a second upload helper.

Excel header for both positive parts and the single negative is the same: **`Item classification identifier`**.

1. Generate `testData/Master/Master.hs.ts` with two arrays (auto-generated; do not hand-edit):
   - `omanHsCodePart1ValidTestData`
   - `omanHsCodePart2ValidTestData`
2. Re-export both from `testData/Master/Master.ts`.
3. **Do not** add HS to `dropdownFieldMasterConfig`. That list is keyed by field name (`mergeDropdownFieldConfigs` keeps the first row only), so two parts cannot live there, and putting one part there would also auto-clone invalid **twice** if we later added a second row.
4. Positive: a dedicated HS config used only by the valid-dropdown describe:

   ```ts
   { field: "Item classification identifier", master: omanHsCodePart1ValidTestData, part: "Part 1" }
   { field: "Item classification identifier", master: omanHsCodePart2ValidTestData, part: "Part 2" }
   ```

   Two tests: `Item classification identifier (Part 1) … should be accepted` and `(Part 2) …`.
5. Negative: **one** extra invalid config (not Part 1 / Part 2):

   `{ field: "Item classification identifier", master: InvalidTestData }`

   Merge that single row into `dropdownInvalidOnCovoro` so the existing **Dropdown — invalid values** loop covers it once.

Seed row already uses Goods + a valid HS (`buildValidOmanFullTaxInvoiceRow`). Dropdown generation only patches `Item classification identifier`.

## Upload batch size (HS only)

Default dropdown chunk size stays **1,250** (`BATCH_SIZE` in `utils/excel/invoiceExcel.ts`) for ISIC, UoM, and every other field.

HS Part 1 / Part 2 positive generation uses **one workbook per part**. Batch size is `max(Part 1 length, Part 2 length)` (currently **7,301**). Negative is one/two single-value files, so batch size does not apply.

`generateFullRowDropdownFieldExcel` already declares `options.batchSize` but does not pass it through. Wire that option into `generateDropdownMasterExcel` (optional; default 1,250). HS calls pass that computed batch size. Do not change the global constant.

| Part | Codes | Workbooks |
|---|---|---|
| Part 1 | 7,301 | 1 |
| Part 2 | 6,867 | 1 |

## Casing and timeout

HS codes are digits. Skip **lowercase** and **uppercase** casings for both positive parts. Run **exact master values** only.

ISIC text labels keep all three casings.

Timeout per positive part: **40 minutes** (one workbook per part). UoM stays at 10 minutes. Invalid stays on the default dropdown timeout (one workbook per invalid label).

## Negative cases (in scope)

One field, no Part 1 / Part 2 titles or masters.

| Case | Value | Path |
|---|---|---|
| Invalid dropdown label | `A123456` | **Dropdown — invalid values** (once) |
| Invalid dropdown label | `@#$%^&*` | **Dropdown — invalid values** (once) |

These are the shared `InvalidTestData` labels used by every other dropdown. They are not on the Peppol HS list. Expected: error file on `Item classification identifier`.

Do **not** generate invalid workbooks from Part 1 or Part 2 code lists.

## Out of scope

- IBR-174-OM / IBR-080-OM / IBR-079-OM in `ConditionalValidation.ts` (keep one valid, not-on-list `999999999999`, empty, 6-digit, free-text).
- Item Master UI (disabled for OMN).
- Descriptions in the master.
- Merging Part 1 + Part 2 into one positive test.
- Changing ISIC.
- Extra 12-digit not-on-list negatives in field validation (already IBR-174-OM).
- Raising the global dropdown `BATCH_SIZE` from 1,250 (ISIC / UoM / other fields stay at 1,250).

## Layers

| Layer | Path | Change |
|---|---|---|
| Master | `testData/Master/Master.hs.ts` | New generated Part 1 + Part 2 code lists |
| Master | `testData/Master/Master.ts` | Re-export both arrays |
| Config | `testData/FieldValidations/TestDataConfig.ts` | HS part configs (positive only) + one HS invalid row (not derived from parts) |
| Spec support | `Helpers/excel/fieldValidationSpecSupport.ts` | Export HS part configs; skip extra casings; HS timeout; merge single HS invalid into `dropdownInvalidOnCovoro` |
| Spec support | `Helpers/excel/omanFieldValidationExcelHelper.ts` | Pass one-file-per-part `batchSize` on HS positive `generateFullRowDropdownFieldExcel` |
| Excel | `utils/excel/invoiceExcel.ts` | Honour optional `batchSize` (default 1,250). Do not change the global constant. |
| Spec | `tests/OMN_FieldValidation_CovoroTemplate_Test.spec.ts` | Two positive HS tests (Part 1 / Part 2); invalid uses existing loop |

No new helper.

## Risk

- Runtime: two positive tests — one upload of 7,301 rows (Part 1) and one upload of 6,867 rows (Part 2); two invalid single-value uploads (same as other dropdowns).
- Static dropdown packs (`scripts/generate_dropdown_field_packs.ts`) stay unchanged unless we add HS to `dropdownFieldMasterConfig` (we will not).
- GitNexus impact is low (data + config). Do not change `mergeDropdownFieldConfigs` first-wins behaviour.

## Success

- Field-validation spec uploads template Masters HS Part 1 and accepts; separately uploads Part 2 and accepts.
- Positive HS workbooks are **one file per part** (7,301 and 6,867 rows). Other dropdowns stay at 1,250.
- Field-validation spec has **one** invalid HS dropdown (not Part 1 / Part 2) and rejects `A123456` and `@#$%^&*` on `Item classification identifier`.
- ISIC dropdown behaviour unchanged.
- Conditional HS rules (IBR-174 / 080 / 079) unchanged.
