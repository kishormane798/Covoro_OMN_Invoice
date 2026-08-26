"""Doc allowance/charge VAT must follow Vat category - allowances/charges, not only the line rate."""
from __future__ import annotations

import sys
from pathlib import Path

_UTILS = Path(__file__).resolve().parent
if str(_UTILS) not in sys.path:
    sys.path.insert(0, str(_UTILS))

from invoice_excel_writer import (  # noqa: E402
    EXEMPT_FROM_TAX_TAX_CATEGORY,
    STANDARD_TAX_CATEGORY,
    ZERO_RATED_TAX_CATEGORY,
    doc_level_effective_tax_rate,
)


def test_exempt_allowance_uses_zero_when_line_is_standard() -> None:
    assert (
        doc_level_effective_tax_rate(
            EXEMPT_FROM_TAX_TAX_CATEGORY,
            line_effective_rate=5.0,
            raw_sheet_rate=5.0,
        )
        == 0.0
    )


def test_zero_rated_charge_uses_zero_when_line_is_standard() -> None:
    assert (
        doc_level_effective_tax_rate(
            ZERO_RATED_TAX_CATEGORY,
            line_effective_rate=5.0,
            raw_sheet_rate=5.0,
        )
        == 0.0
    )


def test_standard_allowance_keeps_rate_when_line_is_standard() -> None:
    assert (
        doc_level_effective_tax_rate(
            STANDARD_TAX_CATEGORY,
            line_effective_rate=5.0,
            raw_sheet_rate=5.0,
        )
        == 5.0
    )


def test_empty_doc_category_falls_back_to_line_rate() -> None:
    assert (
        doc_level_effective_tax_rate(
            "",
            line_effective_rate=5.0,
            raw_sheet_rate=5.0,
        )
        == 5.0
    )


if __name__ == "__main__":
    test_exempt_allowance_uses_zero_when_line_is_standard()
    test_zero_rated_charge_uses_zero_when_line_is_standard()
    test_standard_allowance_keeps_rate_when_line_is_standard()
    test_empty_doc_category_falls_back_to_line_rate()
    print("ok")
