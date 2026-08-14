# Oman Conditional Validations inventory

**Source of truth (GSP-54396, 10-08 pack):**  
[`testcase/conditional_validation/EINV_OMAN_ConditionalValidation_FullMatrix.xlsx`](../../../testcase/conditional_validation/EINV_OMAN_ConditionalValidation_FullMatrix.xlsx)  
— sheet `All Testcases` (**599** TCs / **120** ruleIds).

Cross-check: https://test-docs.peppol.eu/pint/pint-om/2026-Q2-v1.0.1/pint-om/

## Triage legend

| Tag | Meaning |
|-----|---------|
| COND | Excel if-then upload case (this suite) |
| FORMULA | Totals / Σ rules → formula validation suite |
| CL | Code list → field/dropdown validation unless if-then |
| BACKEND | Not exposed on Excel error file yet → skip |
| FW | Live Playwright scenarios exist in `ConditionalValidation.ts` |
| PENDING | COND rule in Excel; not yet wired in Playwright |

## Rules

| RuleId | Category | Condition (trimmed) | Suggested |
|--------|----------|---------------------|-----------|

| `ALIGNED-IBRP-028-OM` |  | [ALIGNED-IBRP-028-OM] - Preceding invoice reference (IBG-03) MUST be provided when invoice type code (IBT-003) is 'Credit note' ('381') or 'Debit note' ('383') or 'Self billed credit note' ('261'). | COND |
| `ALIGNED-IBRP-E-01-OM` | Item Level / Invoice Level | [ALIGNED-IBRP-E-01-OM] - An Invoice that contains an Invoice line (IBG-25), a Document level allowance (IBG-20) or a Document level charge (IBG-21) where the VAT category code (IBT-151, IBT-95 or IBT- | COND |
| `ALIGNED-IBRP-E-05-OM` | Item Level | [ALIGNED-IBRP-E-05-OM] - In an Invoice line (IBG-25) where the Invoiced item VAT category code (IBT-151) is "E" MUST not contain an Invoice item VAT rate (IBT-152). | COND |
| `ALIGNED-IBRP-E-08-OM` | Invoice level | [ALIGNED-IBRP-E-08-OM] - In a VAT breakdown (IBG-23) where the VAT category code (IBT-118) is "E" the VAT category taxable amount (IBT-116) MUST be the VAT category taxable amount (IBT-116) must equal | FORMULA |
| `ALIGNED-IBRP-E-09-OM` | Invoice level | [ALIGNED-IBRP-E-09-OM] - The VAT category tax amount (ibt-117) In a VAT breakdown (ibg-23) where the VAT category code (ibt-118) equals "E" MUST equal 0 (zero) unless invoice transaction type is a sim | FORMULA |
| `ALIGNED-IBRP-O-01-OM` | Invoice level | [ALIGNED-IBRP-O-01-OM] - An Invoice that contains an Invoice line (IBG-25), a Document level allowance (IBG-20) or a Document level charge (IBG-21) where the VAT category code (IBT-151, IBT-95 or IBT- | COND |
| `ALIGNED-IBRP-O-05-OM` | Item Level | [ALIGNED-IBRP-O-05-OM] - An Invoice line (IBG-25) where the VAT category code (IBT-151) is "O" MUST not contain an Invoiced item VAT rate (IBT-152). | COND |
| `ALIGNED-IBRP-O-08-OM` | Invoice level | [ALIGNED-IBRP-O-08-OM] - In a VAT breakdown (IBG-23) where the VAT category code (IBT-118) is " O" the VAT category taxable amount (IBT-116) MUST be equal the sum of Invoice line net amounts (IBT-131) | FORMULA |
| `ALIGNED-IBRP-O-09-OM` | Invoice level | [ALIGNED-IBRP-O-09-OM] - The VAT category tax amount (IBT-117) in a VAT breakdown (IBG-23) where the VAT category code (IBT-118) is "O" MUST be 0 (zero) unless invoice transaction type is a simplified | FORMULA |
| `ALIGNED-IBRP-S-01-OM` | Item Level / Invoice Level | [ALIGNED-IBRP-S-01-OM] - An Invoice that contains an Invoice line (IBG-25), a Document level allowance (IBG-20) or a Document level charge (IBG-21) where the VAT category code (IBT-151, IBT-95 or IBT- | COND |
| `ALIGNED-IBRP-S-05-OM` | Item Level | [ALIGNED-IBRP-S-05-OM] - In an Invoice line (IBG-25) where the Invoiced item VAT category code (IBT-151) is "S" the Invoiced item VAT rate (IBT-152) MUST be 5. | COND |
| `ALIGNED-IBRP-S-08-OM` | Item Level / Invoice Level | [ALIGNED-IBRP-S-08-OM] - For each different value of VAT category rate (IBT-119) where the VAT category code (IBT-118) is "S", the VAT category taxable amount (IBT-116) in a VAT breakdown (IBG-23) MUS | FORMULA |
| `ALIGNED-IBRP-S-09-OM` | Invoice level | [ALIGNED-IBRP-S-09-OM] - The VAT category tax amount (IBT-117) in a VAT breakdown (IBG-23) where VAT category code (IBT-118) is "S" MUST equal the Σ Invoice-line VAT amounts (BTOM-016) plus charges' V | FORMULA |
| `ALIGNED-IBRP-S-09-OM-WARN` |  | [ALIGNED-IBRP-S-09-OM-WARN] - ACCEPTED WITH WARNING: The VAT category tax amount (IBT-117) for category "S" does not exactly equal the sum of invoice-line VAT amounts (BTOM-016) plus charges' VAT minu | FORMULA |
| `ALIGNED-IBRP-S-10-OM` | Invoice Level | [ALIGNED-IBRP-S-10-OM] - A VAT breakdown (IBG-23) with VAT Category code (IBT-118) "S" MUST not have a VAT exemption reason code (IBT-121) or VAT exemption reason text (IBT-120). | COND |
| `ALIGNED-IBRP-Z-01-OM` | Item Level / Invoice Level | [ALIGNED-IBRP-Z-01-OM] - An Invoice that contains an Invoice line (IBG-25), a Document level allowance (IBG-20) or a Document level charge (IBG-21) where the VAT category code (IBT-151, IBT-95 or IBT- | COND |
| `ALIGNED-IBRP-Z-05-OM` | Item Level | [ALIGNED-IBRP-Z-05-OM] - In an Invoice line (IBG-25) where the Invoiced item VAT category code (IBT-151) is "Zero rated" the Invoiced item VAT rate (IBT-152) MUST be 0 (zero). | COND |
| `ALIGNED-IBRP-Z-08-OM` | Item Level / Invoice Level | [ALIGNED-IBRP-Z-08-OM] - In a VAT breakdown (IBG-23) where VAT category code (IBT-118) is "Z" the VAT category taxable amount (IBT-116) MUST equal the sum of Invoice line net amount (IBT-131) minus th | FORMULA |
| `ALIGNED-IBRP-Z-09-OM` | Item Level / Invoice Level | [ALIGNED-IBRP-Z-09-OM] - The VAT category tax amount (IBT-117) in a VAT breakdown (IBG-23) where VAT category code (IBT-118) is "Z" MUST equal 0 (zero) unless invoice transaction type is a simplified | FORMULA |
| `(none)` | Invoice Level | [IBR-CL-05-OM, IBR-CL-10-OM] - If Document level allowance TAX category code (IBT-095) is 'Z/E', Document level allowance TAX exemption reason code (IBT-196) MUST be coded using Zero rating/Exemption | COND |
| `CL-06-OM` | Supplier / Buyer | [CL-06-OM] - If provided, the value in the Buyer identifier (IBT-046) Scheme identifier (IBT-046-1) and Seller identifier (IBT-029) Scheme identifier (IBT-029-1) must be coded with Buyer/Seller Identi | CL |
| `CL-10-OM` | Item Level / Invoice Level | [CL-10-OM] - When VAT category code (IBT-118 / IBT-151 / IBT-095 / IBT-102 / IBT-192) is 'Z' (Zero rated), the VAT exemption reason code (IBT-121 / IBT-186 / IBT-196 / IBT-198) MUST be coded using the | CL |
| `CL-11-OM` | Document Level / Item Level | [CL-11-OM] - If invoice transaction type (BTOM-001) is 'Profit Margin Self-Invoice' or Profit margin invoice, Profit margin item reason code (BTOM-025) MUST be present and coded using Profit Margin It | CL |
| `IBR-004-OM` | Document Level | [IBR-004-OM] - Currency exchange rate (BTOM-003) MUST be provided when the Invoice currency code (IBT-005) is not equal to 'OMR'. | COND |
| `IBR-005-OM` | Document Level | [IBR-005-OM] - Currency exchange rate (BTOM-003) should contain the values till maximum of 7 decimal places when the VAT accounting currency (IBT-006) is set to OMR and the invoice currency code (IBT- | COND |
| `IBR-006-OM` | Supplier | [IBR-006-OM] - Seller tax identifier (IBT-031) MUST be mandatory in all cases except when Invoice transaction type (BTOM-001) is an invoice for import of goods (XXXXXXXXXXXX1XXXXXXX), import of servic | COND |
| `IBR-007-OM` | Supplier | [IBR-007-OM] - Seller identifier (IBT-029) Scheme identifier (IBT-029-1) must be provided when Invoice transaction type (BTOM-001) is an invoice for import of goods (XXXXXXXXXXXX1XXXXXXX) or import of | COND |
| `IBR-010-OM` |  | [IBR-010-OM] - In Seller postal address (IBG-05), Seller address line 1 (IBT-035), Seller address line 2 (IBT-036), Seller address line 3 (IBT-162) Seller city (IBT-037) and Seller postal code (IBT-03 | COND |
| `IBR-012-OM` | Document / Delivery / Invoice Level | [IBR-012-OM] - Deliver to country code (IBT-080) must not be 'OM' if invoice transaction type (BTOM-001) is export invoice (XXXXXX1XXXXXXXXXXXXX) and atleast one VAT exemption reason code (IBT-121) is | COND |
| `IBR-013-OM` | Invoice Level | [IBR-013-OM] - Supporting document reference (IBT-122) and Supporting document UUID (BTOM-023) must be provided if invoice transaction type (BTOM-001) is export invoice (XXXXXX1XXXXXXXXXXXXX) and atle | COND |
| `IBR-014-OM` | "Document / Delivery | [IBR-014-OM] - Deliver to country code (ibt-080) must be provided if invoice transaction type (BTOM-001) is export invoice (XXXXXX1XXXXXXXXXXXXX). | COND |
| `IBR-015-OM` | Document Level / Third Party Level | [IBR-015-OM] - Third Party Name (BTOM-005), Third Party VATIN (BTOM-006), VAT Scheme Code (BTOM-06-1), Third Party Address Line 1 (BTOM-007), Third Party Address Line 2 (BTOM-008), Third Party Address | COND |
| `IBR-016-OM` | Buyer / Document level | [IBR-016-OM] - Either Buyer identifier (IBT-046) or Buyer VATIN (IBT-048) MUST be present when the Invoice transaction type is (BTOM-001) a Full tax invoice (1XXXXXXXXXXXXXXXXXXX) and a Third-party In | COND |
| `IBR-017-OM` | Buyer / Document level | [IBR-017-OM] - Buyer VATIN (IBT-048) MUST be present when the Invoice transaction type (BTOM-001) is a Self-billed Invoice/credit note (XX1XXXXXXXXXXXXXXXXX) or Invoice for import of services for RCM | COND |
| `IBR-019-OM` | Buyer / Document level | [IBR-019-OM] - Buyer address line 1 (IBT-050), Buyer address line 2 (IBT-051), Buyer address line 3 (IBT-163), Buyer city (IBT-052) and Buyer post code (IBT-053) MUST be present when the Invoice trans | COND |
| `IBR-020-OM` | Buyer / Document level | [IBR-020-OM] - Buyer country code (IBT-055) MUST be 'OM' when the Invoice transaction type (BTOM-001) is a Self-billed Invoice/credit note (XX1XXXXXXXXXXXXXXXXX) or Invoice for import of services for | COND |
| `IBR-023-OM` | Document level / Invoice Level | [IBR-023-OM] - Where the Invoice type code [IBT-003] is '381' or '383' or '261', Credit Note or Debit Note reason code (BTOM-032) MUST be provided. | COND |
| `IBR-032-OM` | Document level | [IBR-032-OM] - If Invoice type code (IBT-003) is '381' or '383' or '261', Preceding Invoice reference (IBT-025), and Preceding Invoice issue date (IBT-026), and Preceding invoice UUID (BTOM-031) MUST | COND |
| `IBR-033-OM` |  | [IBR-033-OM] - Allowance amount (IBT-092, IBT-136) must equal base amount (IBT-093, IBT-137) * percentage (IBT-094, IBT-138) /100 if base amount and percentage exists. | FORMULA |
| `IBR-034-OM` | Document level | [IBR-034-OM] - VAT accounting currency (IBT-006) must be provided if invoice currency code (IBT-005) is not equal to 'OMR'. | COND |
| `IBR-035-OM` |  | [IBR-035-OM] - Invoice line allowance/charge base amount (IBT-137, IBT-142) must be provided when Invoice line allowance/charge percentage (IBT-138, IBT-143) is provided. | FORMULA |
| `IBR-036-OM` | Document level | [IBR-036-OM] - Invoicing period Start date (IBT-073) and Invoicing period end date (IBT-074) provided must belong to the same calendar month where Invoice transaction type code (BTOM-001) is a summary | COND |
| `IBR-037-OM` | Document level | [IBR-037-OM] - Invoicing period start date (IBT-073) and the Invoicing period end date (IBT-074) must be provided where Invoice transaction type code (BTOM-001) is a summary invoice (XXXX1XXXXXXXXXXXX | COND |
| `IBR-038-OM` | Item level / Document level | [IBR-038-OM] - Each Invoice/CreditNote line must contain Item VAT Amount (BTOM-016) except where invoice is a simplified tax invoice (BTOM-001). | COND |
| `IBR-039-OM` | Item level | [IBR-039-OM] - In Line VAT information (IBG-30) where Invoiced item VAT category code (IBT-151) is 'Exempt', Line Item VAT Amount (BTOM-016) shall be zero. | COND |
| `IBR-040-OM` | Document level / Delivery Address | [IBR-040-OM] - Deliver to address line 1 - Postal code (IBT-075), Deliver to address line 2 - Postal code area (ibt-076), Deliver to address line 3 - Area (IBT-165), Deliver to city (IBT-077), Deliver | COND |
| `IBR-041-OM` |  | [IBR-041-OM] - Document level allowance/charge base amount (IBT-093, IBT-100) must be provided when Invoice line allowance/charge percentage (IBT-094, IBT-101) is provided. | FORMULA |
| `IBR-042-OM` | Invoice level | [IBR-042-OM] - If Document level charge (IBG-21) is present, document level charge reason code MUST be present. | COND |
| `IBR-045-OM` | Invoice level | [IBR-045-OM] - If Document level charge TAX category code (IBT-102) is 'S', Document level charge TAX rate (IBT-103) MUST be 5. | COND |
| `IBR-046-OM` |  | [IBR-046-OM] - The VAT rates (IBT-096, IBT-103, IBT-119, IBT-152, IBT-193) if exists MUST only be numeric (without percentage symbol) ranging from 0.00 to 100.00, with maximum of two decimals. | FORMULA |
| `IBR-047-OM` | Invoice level | [IBR-047-OM] - If Document level allowance TAX category code (IBT-095) is 'S', Document level allowance TAX rate (IBT-096) MUST be 5. | COND |
| `IBR-053-OM` | Invoice level | [IBR-053-OM] - In a VAT breakdown (IBG-23) where the VAT category code (IBT-118) is 'S' (Standard rated), the VAT category rate (IBT-119) MUST be 5. | COND |
| `IBR-054-OM` | Item level | [IBR-054-OM] - In Line VAT information (IBG-30) where Invoiced item VAT category code (IBT-151) is 'Not Subject to VAT', Line Item VAT Amount (BTOM-016) shall be zero. | COND |
| `IBR-056-OM` |  | [IBR-056-OM] - The scheme identifier (ibt-158-1) MUST be 'HS' when Item classification identifier (ibt-158) is provided | COND |
| `IBR-057-OM` |  | [IBR-057-OM] - Invoice line period start date (ibt-134) and Invoice line period end date (ibt-135) when provided must belong to the same calendar month. | COND |
| `IBR-058-OM` | Document level / Invoice level | [IBR-058-OM] - Prepayment invoice number (BTOM-027) and Prepayment invoice UUID (BTOM-014) must be provided if Paid amount (IBT-180) is present. | COND |
| `IBR-059-OM` |  | [IBR-059-OM] - The source currency must be designated as the invoice currency code (IBT-005), and the target currency must be specified as the tax accounting currency (IBT-006), provided that the curr | COND |
| `IBR-061-OM` | Invoice level | [IBR-061-OM] - In a VAT breakdown (IBG-23) where VAT category code (IBT-118) is 'Not Subject to VAT', VAT category tax Rate (IBT-119) shall not be provided. | COND |
| `IBR-062-OM` | Invoice level | [IBR-062-OM] - Document level allowances (IBG-20) with Document level allowance VAT category code (IBT-095) as 'E' or 'Z' MUST have a Document level allowance VAT exemption reason code (IBT-196) | COND |
| `IBR-064-OM` | Invoice level | [IBR-064-OM] - Document level charge (IBG-21) with Document level charge VAT category code (IBT-102) as 'E' or 'Z' MUST have a Document level charge VAT exemption reason code (IBT-198). | COND |
| `IBR-065-OM` | Document Level / Invoice level | [IBR-065-OM] - When Invoice currency code (IBT-005) is not equal to 'OMR' and Tax accounting currency [IBT-006] is 'OMR', then the value in Invoice total VAT amount in tax accounting currency [IBT-111 | FORMULA |
| `IBR-066-OM` | Backend | [IBR-066-OM] - TAX category tax amount in accounting currency (IBT-190), TAX category code for tax category tax amount in accounting currency (IBT-192) and TAX category rate for tax category tax amoun | BACKEND |
| `IBR-067-OM` | Invoice level | [IBR-067-OM] - In a VAT breakdown (IBG-23) where VAT category code (IBT-118) is 'E', VAT category VAT Rate (IBT-119) shall not be provided. | COND |
| `IBR-069-OM` | Invoice level | [IBR-069-OM] - A VAT breakdown (IBG-23) with VAT category code (IBT-118) 'E' (Exempt) or 'Z' (Zero rated) MUST have a VAT exemption reason code (IBT-121). | COND |
| `IBR-070-OM` | Invoice level | [IBR-070-OM] - A VAT breakdown (IBG-23) with VAT category code (IBT-118) 'O' (Not subject to VAT) MUST NOT have a VAT exemption reason code (IBT-121). | COND |
| `IBR-072-OM` |  | [IBR-072-OM] - Invoice line period start date (IBT-134) and Invoice line period end date (IBT-135) must be provided if where Invoice transaction type (BTOM-001) is a Full Tax Invoice AND summary invoi | COND |
| `IBR-073-OM` |  | [IBR-073-OM] - Either both or neither Allowance base amount (IBT-137) and percentage (IBT-138) MUST be provided. | COND |
| `IBR-074-OM` |  | [IBR-074-OM] - Either both or neither Charge base amount (IBT-142) and percentage (IBT-143) MUST be provided | COND |
| `IBR-077-OM` | Item Level | [IBR-077-OM] - In Line VAT information (IBG-30) where Invoiced item VAT category code (IBT-151) is 'Zero Rated', Line Item VAT Amount (BTOM-016) shall be zero. | COND |
| `IBR-078-OM` | Document Level / Item Level | [IBR-078-OM] - Item Type (BTOM-019) must be provided for each item (IBT-153) except when Invoice transaction type (BTOM-001) is 'Simplified Tax Invoice' (X1XXXXXXXXXXXXXXXXXX). | COND |
| `IBR-079-OM` | Document Level / Item Level | [IBR-079-OM] - When Item type (BTOM-019) is 'Goods' then Item classification identifier (ibt-158) must be provided except when Invoice transaction type (BTOM-001) is 'Simplified Tax Invoice' (X1XXXXXX | COND |
| `IBR-080-OM` |  | [IBR-080-OM] - When Item classification identifier (IBT-158) is provided with @listID='HS', it must be exactly 12 digits (Oman HS code). 6-digit ISIC codes are validated separately under CL-08-OM-ISIC | COND |
| `IBR-081-OM` | Document Level / Item Level | [IBR-081-OM] - Industrial Classification Code must be provided for each ITEM INFORMATION (IBG-31) except when Invoice transaction type (BTOM-001) is a simplified tax invoice (X1XXXXXXXXXXXXXXXXXX) and | COND |
| `IBR-082-OM` |  | [IBR-082-OM] - When Invoice transaction type (BTOM-001) is Profit margin invoice (XXXXXXXXX1XXXXXXXXXX) , then Total Amount Due (BTOM-020), should be provided and is mandatory and must be the sum of T | FORMULA |
| `IBR-084-OM` | Document Level / Item Level | [IBR-084-OM] - If invoice transaction type (BTOM-001) is 'Import of Goods' (XXXXXXXXXXXX1XXXXXXX) then Item country of origin (IBT-159) is mandatory. | COND |
| `IBR-085-OM` | Document level / Import | [IBR-085-OM] - If invoice transaction type (BTOM-001) is 'Import of Goods' (XXXXXXXXXXXX1XXXXXXX), import details (IBG-33-OM) MUST be present and must contain, Import date (BTOM-020), Custom Declarati | COND |
| `IBR-086-OM` | Document Level / Item Level | [IBR-086-OM] - If Invoice transaction type (BTOM-001) is 'Profit Margin Self-Invoice ' (XXXXXXXXXX1XXXXXXXXX), Invoiced item VAT category code (IBT-151) MUST be 'O' (Not subject to VAT). | COND |
| `IBR-087-OM` | Document Level / Seller | [IBR-087-OM] - In case Invoice transaction type (BTOM-001) is 'Profit Margin Self-Invoice' (XXXXXXXXXX1XXXXXXXXX), Seller Country Code (IBT-040) MUST be 'OM'. | COND |
| `IBR-091-OM` | Document Level / Item Level | [IBR-091-OM] - When Invoice transaction type (BTOM-001) is Profit margin invoice (XXXXXXXXX1XXXXXXXXXX), Item classification identifier (IBT-158) MUST NOT start with '7101' or '7102' or '7103' or '710 | COND |
| `IBR-092-OM` | Document level | [IBR-092-OM] - If Document level allowance TAX category code (IBT-095) is 'E', Document level allowance TAX rate (IBT-096) MUST not be present. | COND |
| `IBR-093-OM` | Document level | [IBR-093-OM] - If Document level allowance TAX category code (IBT-095) is 'O', Document level allowance TAX rate (IBT-096) MUST not be present. | COND |
| `IBR-094-OM` | Document level | [IBR-094-OM] - If Document level allowance TAX category code (IBT-095) is 'Z', Document level allowance TAX rate (IBT-096) MUST be 0. | COND |
| `IBR-095-OM` | Backend | [IBR-095-OM] - If TAX category code for tax category tax amount in accounting currency (IBT-192) is 'E', TAX category rate for tax category tax amount in accounting currency (IBT-193) MUST not be pres | BACKEND |
| `IBR-096-OM` |  | [IBR-096-OM] - If the TAX category code for tax category tax amount in accounting currency (IBT-192) is 'O', then the TAX category rate (IBT-193) MUST NOT be present. | BACKEND |
| `IBR-097-OM` |  | [IBR-097-OM] - If TAX category code for tax category tax amount in accounting currency (IBT-192) is 'Z', TAX category rate for tax category tax amount in accounting currency (IBT-193) MUST be 0. | BACKEND |
| `IBR-098-OM` | Document level | [IBR-098-OM] - If Document level charge TAX category code (IBT-102) is 'E', Document level charge TAX rate (IBT-103) MUST not be present. | COND |
| `IBR-099-OM` | Document level | [IBR-099-OM] - If Document level charge TAX category code (IBT-102) is 'O', Document level charge TAX rate (IBT-103) MUST not be present. | COND |
| `IBR-100-OM` | Document level | [IBR-100-OM] - If Document level charge TAX category code (IBT-102) is 'Z', Document level charge TAX rate (IBT-103) MUST be 0. | COND |
| `IBR-104-OM` | Document level | [IBR-104-OM] - In a VAT breakdown (IBG-23) for VAT accounting currency, where the VAT category code (IBT-118) is 'S', the VAT category rate (IBT-119) MUST be 5. | COND |
| `IBR-137-OM` | Document level | [IBR-137-OM] - All invoice amounts and quantities shall be zero or positive, except for rounding amount (IBT-114). | COND |
| `IBR-138-OM` |  | [IBR-138-OM] - Invoice transaction type (BTOM-001) cannot be Self-billed Invoice/credit note (XX1XXXXXXXXXXXXXXXXX) if Invoice transaction type (BTOM-001) is Third-party Invoice (XXX1XXXXXXXXXXXXXXXX) | COND |
| `IBR-139-OM` |  | [IBR-139-OM] - Invoice transaction type (BTOM-001) cannot be Third-party Invoice (XXX1XXXXXXXXXXXXXXXX) if Invoice transaction type (BTOM-001) is Self-billed Invoice/credit note (XX1XXXXXXXXXXXXXXXXX) | COND |
| `IBR-140-OM` |  | [IBR-140-OM] - Invoice transaction type (BTOM-001) cannot be Summary invoice (XXXX1XXXXXXXXXXXXXXX) if Invoice transaction type (BTOM-001) is Continuous supply (XXXXX1XXXXXXXXXXXXXX) or Export Invoice | COND |
| `IBR-141-OM` |  | [IBR-141-OM] - Invoice transaction type (BTOM-001) cannot be Continuous supply (XXXXX1XXXXXXXXXXXXXX) if Invoice transaction type (BTOM-001) is Summary invoice (XXXX1XXXXXXXXXXXXXXX) or Deemed Supply | COND |
| `IBR-142-OM` |  | [IBR-142-OM] - Invoice transaction type (BTOM-001) cannot be Export Invoice (XXXXXX1XXXXXXXXXXXXX) if Invoice transaction type (BTOM-001) is Self-billed Invoice/credit note (XX1XXXXXXXXXXXXXXXXX) or S | COND |
| `IBR-143-OM` |  | [IBR-143-OM] - Invoice transaction type (BTOM-001) cannot be Deemed Supply Invoice (XXXXXXX1XXXXXXXXXXXX) if Invoice transaction type (BTOM-001) is Continuous supply (XXXXX1XXXXXXXXXXXXXX) or Export I | COND |
| `IBR-144-OM` |  | [IBR-144-OM] - Invoice transaction type (BTOM-001) cannot be Import of services for RCM (XXXXXXXX1XXXXXXXXXXX) if Invoice transaction type (BTOM-001) is Export Invoice (XXXXXX1XXXXXXXXXXXXX) or Profit | COND |
| `IBR-145-OM` |  | [IBR-145-OM] - Invoice transaction type (BTOM-001) cannot be Profit margin invoice (XXXXXXXXX1XXXXXXXXXX) if Invoice transaction type (BTOM-001) is Summary invoice (XXXX1XXXXXXXXXXXXXXX) or Continuous | COND |
| `IBR-146-OM` |  | [IBR-146-OM] - Invoice transaction type (BTOM-001) cannot be Profit Margin Self-Invoice (XXXXXXXXXX1XXXXXXXXX) if Invoice transaction type (BTOM-001) Summary invoice (XXXX1XXXXXXXXXXXXXXX) or Continuo | COND |
| `IBR-147-OM` |  | [IBR-147-OM] - Invoice transaction type (BTOM-001) cannot be Import of Goods (XXXXXXXXXXXX1XXXXXXX) if Invoice transaction type (BTOM-001) is Summary invoice (XXXX1XXXXXXXXXXXXXXX) or Continuous suppl | COND |
| `IBR-148-OM` |  | [IBR-148-OM] - Invoice transaction type (BTOM-001) cannot be E-commerce supplies (XXXXXXXXXXX1XXXXXXXX) if Invoice transaction type (BTOM-001) is Profit Margin Self-Invoice (XXXXXXXXXX1XXXXXXXXX). | COND |
| `IBR-149-OM` |  | [IBR-149-OM] - Invoice transaction type (BTOM-001) cannot be Simplified Tax Invoice (X1XXXXXXXXXXXXXXXXXX) if Invoice transaction type (BTOM-001) is Self-billed Invoice/credit note (XX1XXXXXXXXXXXXXXX | COND |
| `IBR-150-OM` | Document Level / Buyer / Seller | [IBR-150-OM] - If Invoice transaction type (BTOM-001) is Special Zone Supplies (XXXXXXXXXXXXX1XXXXXX) , buyer country subdivision code (BTOM-026) and Seller country subdivision code (BTOM-024) MUST be | COND |
| `IBR-151-OM` | Document Level / Seller | [IBR-151-OM] - Seller identifier (IBT-029) is mandatory with Scheme identifier (IBT-029-1) 'Special Zone License Number' if Invoice transaction type (BTOM-001) is Special zone supplies (XXXXXXXXXXXXX1 | COND |
| `IBR-152-OM` | Document Level / Buyer | [IBR-152-OM] - Buyer identifier (IBT-046) is mandatory with Scheme identifier (IBT-046-1) 'Special Zone License Number' if Invoice transaction type (BTOM-001) is Special zone supplies (XXXXXXXXXXXXX1X | COND |
| `IBR-153-OM` | Document Level / Buyer | [IBR-153-OM] - Buyer identifier (IBT-046) is mandatory with Scheme identifier (IBT-046-1) 'Importer Customs ID' if Invoice transaction type (BTOM-001) is Import of Goods (XXXXXXXXXXXX1XXXXXXX). | COND |
| `IBR-155-OM` | Document Level / Item level | [IBR-155-OM] - If invoice transaction type (BTOM-001) is export invoice (XXXXXX1XXXXXXXXXXXXX) and atleast one VAT exemption reason code (IBT-121) is 'Export of service' then Service Type (BTOM-015) m | COND |
| `IBR-158-OM` |  | [IBR-158-OM] - Total amount including VAT (BTOM-017) must be the sum of Invoice line net amount (IBT-131) and Line Item VAT amount (BTOM-016) unless if Invoice transaction type (BTOM-001) is Profit ma | FORMULA |
| `IBR-160-OM` | Document Level / Seller level | [IBR-160-OM] - Seller country code (IBT-040) MUST not be'OM' if Invoice transaction type (BTOM-001) is Import of services for RCM (XXXXXXXX1XXXXXXXXXXX). | COND |
| `IBR-172-OM` | Document level | [IBR-172-OM] - If Invoice currency code (IBT-005) is "OMR" then Exchange Rate (BTOM-003) MUST NOT be present. | COND |
| `IBR-173-OM` | Document level | [IBR-173-OM] - If Buyer electronic address (IBT-049) is '997770000099', Seller UUID (BTOM-004) MUST be present. | COND |
| `IBR-174-OM` | Item level | [IBR-174-OM] - Item classification identifier (HS Code) (IBT-158) should be provided from the Harmonized System (HS) Code list published by the Royal Oman Police (Directorate General of Customs) when | COND |
| `IBR-175-OM` | Document level | [IBR-175-OM] - If Invoice transaction type (BTOM-001) is Profit margin invoice '00000000010000000000', Preceding Invoice reference (IBT-025), and Preceding invoice UUID (BTOM-031) MUST be present. | COND |
| `IBR-176-OM` |  | [IBR-176-OM] - Invoice transaction type (BTOM-001) cannot be Prepayment Invoice (XXXXXXXXXXXXXXX1XXXX) if Invoice transaction type (BTOM-001) is Summary invoice (XXXX1XXXXXXXXXXXXXXX) or Deemed Supply | COND |
| `IBR-177-OM` | Document level | [IBR-177-OM] - If Invoice Type code (IBT-003) is Self billed credit note '261' or Self billed invoice '389' then Invoice transaction type (BTOM-001) MUST be either Self-billed Invoice/credit note (XX1 | COND |
| `(none)` | Document level | [ibr-029]-If both Invoicing period start date (ibt-073) and Invoicing period end date (ibt-074) are given then the Invoicing period end date (ibt-074) MUST be later or equal to the Invoicing period st | COND |
| `(none)` |  | [ibr-030]-If both Invoice line period start date (ibt-134) and Invoice line period end date (ibt-135) are given then the Invoice line period end date (ibt-135) MUST be later or equal to the Invoice li | COND |
| `(none)` | Document level / Invoice level | [ibr-053]-If the Tax accounting currency code (ibt-006) is present, then the Invoice total Tax amount in accounting currency (ibt-111) MUST be provided. | COND |
| `(none)` |  | [ibr-077]-Tax accounting currency code (ibt-006) MUST be different from invoice currency code (ibt-005) when provided. | COND |
| `(none)` |  | [ibr-093]-If there is a paid amount (ibt-180) then total paid amount (ibt-113) MUST exist. | COND |
| `(none)` | Document level | [ibr-co-19]-If Invoicing period (ibg-14) is used, the Invoicing period start date (ibt-073) or the Invoicing period end date (ibt-074) MUST be filled, or both. | COND |
| `(none)` |  | [ibr-co-20]-If Invoice line period (ibg-26) is used, the Invoice line period start date (ibt-134) or the Invoice line period end date (ibt-135) MUST be filled, or both. | COND |
| `ALIGNED-IBRP-048` | Invoice level | [ALIGNED-IBRP-048] - Each VAT breakdown (IBG-23) MUST have a VAT category rate (IBT-119), except if the Invoice is not subject to VAT. | COND |
| `IBR-002-OM` | Document level | [IBR-002-OM] - UUID (Unique Identifier Number) must be a valid UUID version 5 when provided. | FIELD |
| `IBR-DEC-03-OM` | Document / Item | [IBR-DEC-03-OM] - Amounts ≤3 decimals; FX per IBR-005 (covers IBR-088 / IBR-109…135). | COND |
| `IBR-063-OM` |  | [IBR-063-OM] - Charge amount must equal base × % / 100 if base and % exist. | GAP — Covoro Excel has no charge base/% columns |
| `IBR-071-OM` | Item level | [IBR-071-OM] - Line net = qty × (net/base qty) + charges − allowances. | FORMULA |
| `IBR-075-OM` | Item level | [IBR-075-OM] - Item net price = gross − discount when gross provided. | FORMULA |
| `IBR-168-OM` |  | [IBR-168-OM] - The Line Item VAT amount (BTOM-016) must be Invoiced item VAT rate (IBT-152) multiplied by Invoice Line Net Amount (IBT-131). A residual difference is permitted only within the per-line | FORMULA |
| `IBR-168-OM-WARN` |  | [IBR-168-OM-WARN] - ACCEPTED WITH WARNING: The Line Item VAT amount (BTOM-016) does not exactly equal the calculation (Invoice Line Net Amount (IBT-131) x VAT rate (IBT-152) / 100), but the difference | COND |

## GSP-54396 coverage (Playwright + pack)

Matrix path: `testcase/conditional_validation/EINV_OMAN_ConditionalValidation_FullMatrix.xlsx` (copied from Downloads GSP-54396 pack).

### Already in Playwright (`ConditionalValidation_CovoroTemplate_Test.spec.ts`) — FW

`ALIGNED-IBRP-028-OM`, `ALIGNED-IBRP-048`, `ALIGNED-IBRP-E-05-OM`, `ALIGNED-IBRP-O-05-OM`, `ALIGNED-IBRP-S-05-OM`, `ALIGNED-IBRP-Z-05-OM`, `ALIGNED-IBRP-S-10-OM`, `IBR-002-OM`, `IBR-003-OM`, `IBR-004-OM`, `IBR-005-OM`, `IBR-012-OM`, `IBR-013-OM`, `IBR-014-OM`, `IBR-017-OM`, `IBR-020-OM`, `IBR-023-OM`, `IBR-032-OM`, `IBR-034-OM`, `IBR-037-OM`, `IBR-047-OM`, `IBR-062-OM`, `IBR-064-OM`, `IBR-069-OM`, `IBR-070-OM`, `IBR-078-OM`, `IBR-079-OM`, `IBR-084-OM`, `IBR-085-OM`, `IBR-086-OM`, `IBR-087-OM`, `IBR-094-OM`, `IBR-151-OM`, `IBR-155-OM`, `IBR-172-OM`, `IBR-176-OM`, `IBR-177-OM`, `IBR-DEC-03-OM`, plus GSP additions: `ALIGNED-IBRP-E-01-OM`, `ALIGNED-IBRP-O-01-OM`, `ALIGNED-IBRP-S-01-OM`, `ALIGNED-IBRP-Z-01-OM` and remaining COND groups listed under FW in code.

### FORMULA backlog (not this suite)

`ALIGNED-IBRP-E-08-OM`, `ALIGNED-IBRP-E-09-OM`, `ALIGNED-IBRP-O-08-OM`, `ALIGNED-IBRP-O-09-OM`, `ALIGNED-IBRP-S-08-OM`, `ALIGNED-IBRP-S-09-OM`, `ALIGNED-IBRP-S-09-OM-WARN`, `ALIGNED-IBRP-Z-08-OM`, `ALIGNED-IBRP-Z-09-OM`, `IBR-033-OM`, `IBR-035-OM`, `IBR-041-OM`, `IBR-046-OM`, `IBR-065-OM`, `IBR-082-OM`, `IBR-158-OM`, `IBR-168-OM`, `IBR-168-OM-WARN` → `add-formula-validation-case`.

### CL backlog

`CL-06-OM`, `CL-10-OM`, `CL-11-OM` → `add-field-validation-case` (unless if-then expansion is required).

### BACKEND skip

`IBR-066-OM`, `IBR-096-OM`, `IBR-097-OM` — accounting-currency tax category rate family; no Covoro Excel error-file column.

### PENDING COND (Excel present; next agent turns)

Still to wire live Playwright (pack expand may already exist for some):  
`IBR-007-OM`, `IBR-010-OM`, `IBR-015-OM`, `IBR-030`, `IBR-036-OM`, `IBR-040-OM`, `IBR-042-OM`, `IBR-045-OM`, `IBR-056-OM`, `IBR-059-OM`, `IBR-072-OM`, `IBR-073-OM`, `IBR-074-OM`, `IBR-091-OM`, `IBR-092-OM`, `IBR-093-OM`, `IBR-098-OM`, `IBR-099-OM`, `IBR-100-OM`, `IBR-104-OM`, `IBR-137-OM`, `IBR-139-OM`–`IBR-148-OM` (beyond 138/149 samples), `IBR-150-OM`, `IBR-173-OM`, `IBR-174-OM`, `IBR-CO-20`.

Whitespace/omit Excel negatives for already-wired rules collapse to empty cells unless a distinct Covoro column exists.
