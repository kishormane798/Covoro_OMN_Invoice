from pathlib import Path
import openpyxl
import re

def norm_text(text):
    return ' '.join(str(text).split()).lower() if text is not None else ''

path = Path(r'C:/Users/Kishor Mane/Downloads/22- GSP-54396 - E Invoice __ OMAN __ As a system, it should validate the fields of E Invoices considering additional Dependent validations whenever the user uploads the excel.xlsx')
wb = openpyxl.load_workbook(path, data_only=True)
ws = wb.active

positive_markers = [
    'upload succeeds', 'must pass', 'accepted', 'pass', 'is accepted', 'is successful', 'no validation error', 'error list is empty', 'success', 'accepted with warning'
]
negative_markers = [
    'upload fails', 'must fail', 'validation error', 'error file', 'rejected', 'must be rejected', 'validation errors', 'invalid', 'fail', 'error list', 'is rejected'
]

rows = []
mismatches = []
for row in ws.iter_rows(min_row=2, values_only=True):
    if not row or not row[0]:
        continue
    tc_id = str(row[0]).strip()
    polarity = norm_text(row[2])
    title = norm_text(row[5])
    desc = norm_text(row[6])
    steps = norm_text(row[8])
    expected = norm_text(row[9])
    expected_pos = any(marker in expected for marker in positive_markers)
    expected_neg = any(marker in expected for marker in negative_markers)
    issues = []
    if polarity.startswith('positive') and expected_neg and not expected_pos:
        issues.append('positive polarity but expected result is negative')
    if polarity.startswith('negative') and expected_pos and not expected_neg:
        issues.append('negative polarity but expected result is positive')
    if 'upload must pass' in title and expected_neg and not expected_pos:
        issues.append('title says pass but expected says fail')
    if 'upload must fail' in title and expected_pos and not expected_neg:
        issues.append('title says fail but expected says success')
    if 'upload' in expected and ('upload' not in title and 'upload' not in desc and 'upload' not in steps):
        issues.append('expected mentions upload but title/description/steps do not')
    if issues:
        mismatches.append((tc_id, title, issues, polarity, expected))
    rows.append((tc_id, title, polarity, expected_pos, expected_neg, issues))

print('total cases', len(rows))
print('mismatches', len(mismatches))
for tc_id, title, issues, polarity, expected in mismatches[:30]:
    print(tc_id, issues, polarity)
    print('  expected=', expected)
    print('  title=', title)
    print('')
