import json

with open("students.json", "r", encoding="utf-8") as f:
    students = json.load(f)

print(students[:10])