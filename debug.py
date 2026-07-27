import json

CODE = "6676"

with open("students.json", "r", encoding="utf-8") as f:
    students = json.load(f)

filtered = [s for s in students if s["institution_code"] == CODE]

print(f"Students: {len(filtered)}")

pages = sorted(set(s["page"] for s in filtered))

print("\nPages:")
print(pages)

print("\nFirst 10:")

for s in filtered[:10]:
    print(s)

print("\nLast 10:")

for s in filtered[-10:]:
    print(s)