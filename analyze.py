import json
from collections import Counter
from statistics import mean

TARGET_INSTITUTIONS = {
    "6676": "Public School and College, Sadpara Road, Skardu",
    "6705": "USWA Public School and College, Skardu (N.A), Gilgit-Baltistan",
}

with open("target_institutions.json", "r", encoding="utf-8") as f:
    data = json.load(f)


def analyze(code):

    students = data.get(code, [])

    if not students:
        print(f"No data found for institution {code}")
        return None

    total = len(students)

    passed = sum(1 for s in students if s["status"] == "PASS")
    failed = sum(1 for s in students if s["status"] != "PASS")

    marks = [s["marks"] for s in students]

    highest = max(marks)
    lowest = min(marks)
    average = round(mean(marks), 2)

    grades = Counter(s["grade"] for s in students)

    top10 = sorted(
        students,
        key=lambda x: x["marks"],
        reverse=True
    )[:10]

    report = {
        "institution": TARGET_INSTITUTIONS[code],
        "code": code,
        "total": total,
        "passed": passed,
        "failed": failed,
        "pass_percentage": round((passed / total) * 100, 2),
        "highest": highest,
        "lowest": lowest,
        "average": average,
        "grades": grades,
        "top10": top10,
    }

    return report


report6676 = analyze("6676")
report6705 = analyze("6705")


def print_report(report):

    print("\n")
    print("=" * 80)
    print(report["institution"])
    print(f"Code : {report['code']}")
    print("=" * 80)

    print(f"Total Students : {report['total']}")
    print(f"Passed         : {report['passed']}")
    print(f"Failed         : {report['failed']}")
    print(f"Pass %         : {report['pass_percentage']}%")
    print(f"Highest Marks  : {report['highest']}")
    print(f"Lowest Marks   : {report['lowest']}")
    print(f"Average Marks  : {report['average']}")

    print("\nGrade Distribution")

    for grade in ["A1", "A", "B", "C", "D", "E", "F"]:
        print(f"{grade:>2} : {report['grades'].get(grade,0)}")

    print("\nTop 10 Students\n")

    print(
        f"{'Rank':<5}"
        f"{'Roll No':<12}"
        f"{'Marks':<8}"
        f"{'Grade':<6}"
        f"Name"
    )

    print("-" * 80)

    for i, student in enumerate(report["top10"], start=1):

        print(
            f"{i:<5}"
            f"{student['roll_no']:<12}"
            f"{student['marks']:<8}"
            f"{student['grade']:<6}"
            f"{student['name']}"
        )


print_report(report6676)

print_report(report6705)


print("\n")
print("=" * 80)
print("COMPARISON")
print("=" * 80)

print(f"{'Metric':<25}{'6676':>12}{'6705':>12}")

print("-" * 50)

metrics = [
    ("Total Students", "total"),
    ("Passed", "passed"),
    ("Failed", "failed"),
    ("Pass %", "pass_percentage"),
    ("Highest Marks", "highest"),
    ("Lowest Marks", "lowest"),
    ("Average Marks", "average"),
]

for title, key in metrics:

    print(
        f"{title:<25}"
        f"{str(report6676[key]):>12}"
        f"{str(report6705[key]):>12}"
    )