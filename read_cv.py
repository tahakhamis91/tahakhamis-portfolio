import sys
from pypdf import PdfReader

try:
    reader = PdfReader('Abdelrhmn shaban cv.pdf')
    text = ""
    for page in reader.pages:
        text += page.extract_text() + "\n"
    
    with open('cv_extracted.txt', 'w', encoding='utf-8') as f:
        f.write(text)
    print("Success")
except Exception as e:
    print(f"Error: {e}")
