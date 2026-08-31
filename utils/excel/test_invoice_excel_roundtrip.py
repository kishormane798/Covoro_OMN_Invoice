import sys
import unittest
from datetime import datetime
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from invoice_excel_roundtrip import (
    cell_to_text,
    compare_filled_columns,
    values_match,
)


class ValuesMatchTests(unittest.TestCase):
    def test_same_calendar_day_different_format_matches(self):
        self.assertTrue(
            values_match("2026-08-21", "21/08/2026", "Invoice Issue Date")
        )

    def test_excel_datetime_matches_iso_date(self):
        self.assertTrue(
            values_match(
                cell_to_text(datetime(2026, 8, 21), "Invoice Issue Date"),
                "2026-08-21",
                "Invoice Issue Date",
            )
        )

    def test_numbers_match_ignoring_trailing_zeros(self):
        self.assertTrue(values_match("100", "100.00", "Item Gross Price"))

    def test_large_float_keeps_full_decimal_not_scientific(self):
        self.assertEqual(
            cell_to_text(55555555605.55, "Line Item VAT Amount"),
            "55555555605.55",
        )
        self.assertEqual(
            cell_to_text(1166666667716.55, "Invoice Total Amount With Tax"),
            "1166666667716.55",
        )

    def test_large_uploaded_float_matches_downloaded_decimal_string(self):
        self.assertTrue(
            values_match(
                cell_to_text(55555555605.55, "Line Item VAT Amount"),
                "55555555605.55",
                "Line Item VAT Amount",
            )
        )
        self.assertTrue(
            values_match(
                cell_to_text(1166666667716.55, "Amount Due For Payment"),
                "1166666667716.55",
                "Amount Due For Payment",
            )
        )

    def test_scientific_notation_matches_full_decimal(self):
        self.assertTrue(
            values_match("1.5e+2", "150.00", "Item Gross Price")
        )

    def test_text_is_case_sensitive(self):
        self.assertFalse(values_match("ACME", "acme", "Buyer Name"))

    def test_empty_uploaded_columns_are_skipped(self):
        mismatches = compare_filled_columns(
            {"Buyer Name": "ACME", "Tax Rate": ""},
            {"Buyer Name": "ACME"},
        )
        self.assertEqual(mismatches, [])

    def test_missing_header_is_mismatch(self):
        mismatches = compare_filled_columns(
            {"Buyer Name": "ACME", "Tax Rate": "5"},
            {"Buyer Name": "ACME"},
        )
        self.assertTrue(any("Tax Rate" in m and "column not found" in m for m in mismatches))

    def test_empty_download_is_mismatch(self):
        mismatches = compare_filled_columns(
            {"Buyer Name": "ACME"},
            {"Buyer Name": ""},
        )
        self.assertTrue(any("downloaded empty" in m for m in mismatches))

    def test_reports_all_mismatches(self):
        mismatches = compare_filled_columns(
            {"Buyer Name": "ACME", "Tax Rate": "5"},
            {},
        )
        self.assertEqual(len(mismatches), 2)

    def test_source_currency_code_is_ignored(self):
        mismatches = compare_filled_columns(
            {"Buyer Name": "ACME", "Source Currency Code": "OMR"},
            {"Buyer Name": "ACME", "Source Currency Code": "USD"},
        )
        self.assertEqual(mismatches, [])

    def test_source_currency_code_missing_in_download_is_ignored(self):
        mismatches = compare_filled_columns(
            {"Buyer Name": "ACME", "Source Currency Code": "OMR"},
            {"Buyer Name": "ACME"},
        )
        self.assertEqual(mismatches, [])


if __name__ == "__main__":
    unittest.main()
