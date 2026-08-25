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


if __name__ == "__main__":
    unittest.main()
