import fitz

PDF_FILE = "Result Gazette SSC II 2019.pdf"

doc = fitz.open(PDF_FILE)

search_text = "(6676)"

found = False

for page_no in range(doc.page_count):
    page = doc.load_page(page_no)
    text = page.get_text()

    if search_text in text:
        print("=" * 80)
        print(f"FOUND ON PAGE: {page_no + 1}")
        print("=" * 80)
        print(text)
        found = True
        break

if not found:
    print("Institution not found.")