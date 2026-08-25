# Excel generation reference

Source of truth: `utils/excel/invoiceExcel.ts` header comment + Python writer `utils/excel/invoice_excel_writer.py`.

## APIs

| Function | Clears row 6? | Input | Notes |
|----------|---------------|-------|-------|
| `generateInvoiceExcel(data)` | No (`clearRow: false`) | camelCase | Maps via `INVOICE_EXCEL_FIELD_TO_HEADER`; null → `""` so blanks stick |
| `updateExcelField(field, length)` | Via Python `update_field` | Excel header | Then `applyInvoiceCalculationsToFile` |
| `updateExcelFieldWithInvoice(field, length)` | Same family | Excel header | Returns `{ filePath, invoiceNumber }` |
| `generateInvoiceFromSubmitData(row)` | Yes | Header keys | Full template columns; forced calcs |
| `generateInvoiceFromSubmitRows(rows)` | Yes (multi-row write) | Header-key rows | Aggregates line totals |
| `generateBulkSingleItemSubmitInvoices(row, count)` | Yes | Header keys | `{base}-1`…`{base}-N` |
| `generateDropdownMasterExcel` / `generateInvoiceCurrencyExchangeBatchExcel` | Batch writers | Suite-specific | Long dropdown / FX sweeps |

## Mapping

- Logical → header: `testData/FieldValidations/submitInvoiceExcelHeaderMap.ts`
- Header helpers: `hasHeaderLabel`, `getCachedInvoiceTemplateHeaders`, `normalizeInvoiceHeader`
- Filter configs to present columns: `filterConfigsByHeaderLabels`, `filterSubmitInvoiceRowsByTemplateHeaders`

## Error workbooks (post-upload)

Not generators — readers after download:

- `validateErrorFileColumn(errorFilePath, expectedField)`
- `getErrorFieldExcelDetails(...)`

## Worker isolation

- `getGeneratedInvoiceExcelDir()` → `testData/generated/excel/pw-<index>/`
- Cleanup: `deleteGeneratedExcelFiles()` / `generatedFiles` from `Src/baseTest.ts`
- Do not point output at `testData/uploads/` or reserved basenames (`template.xlsx`)

## Call-site map

| Caller area | Generator |
|-------------|-----------|
| `Helpers/excel/formulaValidationHelper.ts` | `generateInvoiceExcel` |
| Field validation helpers / specs | `updateExcelField*` |
| `Helpers/excel/submitInvoiceCaseHelper.ts` | `generateInvoiceFromSubmitData` / `FromSubmitRows` |
| `Helpers/excel/conditionalValidationSpecHelpers.ts` | `generateInvoiceFromSubmitData` after prepare |
| `scripts/generate_valid_oman_invoice.ts` | `generateInvoiceFromSubmitData` |
