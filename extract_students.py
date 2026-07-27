import fitz
import json
import re

PDF_FILE = "Result Gazette SSC II 2019.pdf"

doc = fitz.open(PDF_FILE)

START_PAGE = 0
END_PAGE = doc.page_count - 1

VALID_STATUS = {
    "PASS",
    "FAIL",
    "COMP.",
    "COMP",
    "ABSENT",
    "RL",
    "UFM",
}

VALID_GRADES = {
    "A1",
    "A",
    "B",
    "C",
    "D",
    "E",
    "F",
}

institution_pattern = re.compile(r"^(.*?)\((\d{4})\)$")

doc = fitz.open(PDF_FILE)

students = []

current_institution = None
current_code = None

for page_number in range(START_PAGE, END_PAGE + 1):

    print(f"Processing page {page_number + 1}")

    page = doc.load_page(page_number)

    lines = [
        line.strip()
        for line in page.get_text().splitlines()
        if line.strip()
    ]

    i = 0

    while i < len(lines):

        line = lines[i]

        # ----------------------------
        # Institution Heading
        # ----------------------------
        match = institution_pattern.match(line)

        if match:
            current_institution = match.group(1).strip()
            current_code = match.group(2).strip()

            print(f"\nInstitution Found:")
            print(current_institution)
            print(current_code)

            i += 1
            continue

        # ----------------------------
        # Student Record
        # ----------------------------
        if line.isdigit():

            if i + 4 < len(lines):

                roll = lines[i]
                name = lines[i + 1]
                status = lines[i + 2]
                grade = lines[i + 3]
                marks = lines[i + 4]

                if (
                    status in VALID_STATUS
                    and grade in VALID_GRADES
                    and marks.isdigit()
                ):

                    students.append(
                        {
                            "roll_no": roll,
                            "name": name,
                            "status": status,
                            "grade": grade,
                            "marks": int(marks),
                            "institution": current_institution,
                            "institution_code": current_code,
                            "page": page_number + 1,
                        }
                    )

                    i += 5
                    continue

        i += 1

print("\n")
print("=" * 70)
print(f"Students Extracted : {len(students)}")
print("=" * 70)

with open("students.json", "w", encoding="utf-8") as f:
    json.dump(students, f, indent=4, ensure_ascii=False)

print("students.json created successfully.")