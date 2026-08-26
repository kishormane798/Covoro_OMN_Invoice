"""Unit tests: Exempt Tax Rate preserve for ALIGNED-IBRP-E-05-OM negatives."""
import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from invoice_excel_writer import _payload_preserves_exempt_tax_rate


class PayloadPreservesExemptTaxRateTests(unittest.TestCase):
    def test_rate_5_is_preserved(self):
        self.assertTrue(
            _payload_preserves_exempt_tax_rate({"Tax Rate": "5", "Tax Category": "Exempt from tax"})
        )

    def test_whitespace_only_rate_is_preserved(self):
        """Spaces must survive Excel write so E-05 can assert error (not treated as omit)."""
        self.assertTrue(_payload_preserves_exempt_tax_rate({"Tax Rate": "        "}))

    def test_empty_string_is_not_preserved(self):
        self.assertFalse(_payload_preserves_exempt_tax_rate({"Tax Rate": ""}))

    def test_null_is_not_preserved(self):
        self.assertFalse(_payload_preserves_exempt_tax_rate({"Tax Rate": None}))

    def test_missing_tax_rate_is_not_preserved(self):
        self.assertFalse(
            _payload_preserves_exempt_tax_rate({"Tax Category": "Exempt from tax"})
        )


if __name__ == "__main__":
    unittest.main()
