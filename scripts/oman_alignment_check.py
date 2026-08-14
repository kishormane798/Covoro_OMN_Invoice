from pathlib import Path
import openpyxl
import re

def norm_text(text):
    if text is None:
        return ''
    return ' '.join(str(text).split()).lower()

path = Path(r'C:/Users/Kishor Mane/Downloads/22- GSP-54396 - E Invoice __ OMAN __ As a system, it should validate the fields of E Invoices considering additional Dependent validations whenever the user uploads the excel.xlsx')
wb = openpyxl.load_workbook(path, data_only=True)
ws = wb.active

mismatches = []
rows = []
for row in ws.iter_rows(min_row=2, values_only=True):
    if not row or not row[0]:
        continue
    tc_id = str(row[0]).strip()
    polarity = norm_text(row[2])
    title = norm_text(row[5])
    desc = norm_text(row[6])
    pre = norm_text(row[7])
    steps = norm_text(row[8])
    expected = norm_text(row[9])
    issues = []
    # polarity vs expected
    if polarity and expected:
        if 'negative' in polarity and ('upload succeeds' in expected or 'must pass' in expected or 'no validation error' in expected or 'upload must pass' in expected or 'error list is empty' in expected):
            issues.append('negative polarity but expected result is positive')
        if 'positive' in polarity and ('validation error' in expected or 'upload fails' in expected or 'error file' in expected or 'invoice is listed in the error list' in expected):
            issues.append('positive polarity but expected result is negative')
    # title contains rule code bracket, maybe description too
    title_codes = re.findall(r'\[([^\]]+)\]', title)
    desc_codes = re.findall(r'\[([^\]]+)\]', desc)
    if title_codes and not any(code in desc for code in title_codes):
        issues.append('title rule code not repeated in description')
    # title/description must mention upload action if expected is about upload
    if 'upload' in expected and 'upload' not in title and 'upload' not in desc and 'upload' not in steps:
        issues.append('expected mentions upload but title/desc/steps do not')
    # if title says verify upload fails and expected says success
    if 'upload fails' in title and ('upload succeeds' in expected or 'no validation error' in expected):
        issues.append('title says fail but expected says success')
    if 'upload must pass' in title and ('upload fails' in expected or 'validation error' in expected):
        issues.append('title says pass but expected says fail')
    if issues:
        mismatches.append((tc_id, title, issues, polarity, expected))
    rows.append((tc_id, title, polarity, len(issues)))

print('total cases', len(rows))
print('mismatches', len(mismatches))
for tc_id,title,issues,pol,exp in mismatches[:50]:
    print(tc_id, title)
    for issue in issues:
        print('  -', issue)
    print('  expected=', exp)

print('\nRows with no issues sample:')
for tc_id,title,pol,score in rows[:10]:
    if score == 0:
        print(tc_id, title)
print('...')
