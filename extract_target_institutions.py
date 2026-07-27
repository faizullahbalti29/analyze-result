import fitz
import json
import re

PDF_FILE = "Result Gazette SSC II 2019.pdf"

# Target institutions
TARGET_INSTITUTIONS = {
    "6676": "Public School and College, Sadpara Road, Skardu",
    "6705": "USWA Public School and College, Skardu (N.A), Gilgit-Baltistan",
    "6965": "Cadet College, Skardu",

}

VALID_STATUS = {
    "PASS",
    "FAIL",
    "COMP",
    "COMP.",
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

students = {code: [] for code in TARGET_INSTITUTIONS}

collecting = False
current_code = None
current_institution = None

for page_number in range(doc.page_count):

    print(f"Processing page {page_number + 1}/{doc.page_count}", end="\r")

    page = doc.load_page(page_number)

    lines = [
        line.strip()
        for line in page.get_text().splitlines()
        if line.strip()
    ]

    i = 0

    while i < len(lines):

        line = lines[i]

        # ----------------------------------------------------
        # Detect Institution Heading
        # ----------------------------------------------------
        match = institution_pattern.match(line)

        if match:

            current_institution = match.group(1).strip()
            current_code = match.group(2).strip()

            if current_code in TARGET_INSTITUTIONS:

                collecting = True

                print(
                    f"\nFound Target Institution: "
                    f"{current_institution} ({current_code}) "
                    f"Page {page_number + 1}"
                )

            else:

                collecting = False

            i += 1
            continue

        # ----------------------------------------------------
        # Skip everything if not collecting
        # ----------------------------------------------------
        if not collecting:
            i += 1
            continue

        # ----------------------------------------------------
        # Student Record
        # ----------------------------------------------------
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

                    students[current_code].append(
                        {
                            "roll_no": roll,
                            "name": name,
                            "status": status,
                            "grade": grade,
                            "marks": int(marks),
                            "page": page_number + 1,
                        }
                    )

                    i += 5
                    continue

        i += 1


# ----------------------------------------------------
# Sort by Marks
# ----------------------------------------------------
for code in students:
    students[code].sort(
        key=lambda x: x["marks"],
        reverse=True,
    )


# ----------------------------------------------------
# Save JSON
# ----------------------------------------------------
with open(
    "target_institutions.json",
    "w",
    encoding="utf-8",
) as f:

    json.dump(
        students,
        f,
        indent=4,
        ensure_ascii=False,
    )


# ----------------------------------------------------
# Summary
# ----------------------------------------------------
print("\n")
print("=" * 70)
print("Extraction Completed")
print("=" * 70)

total = 0

for code in TARGET_INSTITUTIONS:

    count = len(students[code])
    total += count

    print(f"{code}")
    print(f"Institution : {TARGET_INSTITUTIONS[code]}")
    print(f"Students    : {count}")
    print("-" * 70)

print(f"Total Students Extracted : {total}")

print("\nSaved as target_institutions.json")