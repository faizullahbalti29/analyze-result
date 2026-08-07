import { type ClassValue, clsx } from "clsx";
import type { ClassLevel, ResultStats, Student, TopLimit } from "./types";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function getFbiseUrl(rollNo: string, classLevel: ClassLevel = "9th"): string {
  const is9th = classLevel === "9th";
  const endpoint = is9th ? "Result-link-ssc1.php" : "Result-link-ssc2.php";
  const annual = is9th ? "SSC-I" : "SSC-II";
  return `https://portal.fbise.edu.pk/fbise-conduct/result/${endpoint}?rollNo=${encodeURIComponent(rollNo)}&annual=${annual}`;
}

export function normalizeStatus(status: string): string {
  return status?.trim().toUpperCase().replace(/\.$/, "");
}

export function isCompartmentStatus(status: string): boolean {
  const normalized = normalizeStatus(status);
  return (
    normalized === "COMP" ||
    normalized === "COMPT" ||
    normalized === "COMPARTMENT"
  );
}

export function computeStats(students: Student[]): ResultStats {
  const stats: ResultStats = {
    total: students.length,
    pass: 0,
    compartment: 0,
    absent: 0,
    other: 0,
  };

  for (const student of students) {
    const status = normalizeStatus(student.status);

    if (status === "PASS") {
      stats.pass += 1;
    } else if (isCompartmentStatus(student.status)) {
      stats.compartment += 1;
    } else if (status === "ABSENT") {
      stats.absent += 1;
    } else {
      stats.other += 1;
    }
  }

  return stats;
}

export function getTopStudents(
  students: Student[],
  limit: string,
): Student[] {
  const ranked = [...students].sort((a, b) => {
    const marksA = a.marks ?? -1;
    const marksB = b.marks ?? -1;
    return marksB - marksA;
  });

  if (limit === "all") {
    return ranked;
  }

  return []
}

export function formatMarks(marks: number | null): string {
  return marks === null ? "—" : marks.toString();
}

export function formatGrade(grade: string | null): string {
  return grade ?? "—";
}

export function getCompartmentSubjects(remarks: string | null): string[] {
  if (!remarks) return [];
  return remarks?.trim().split(/\s+/).filter(Boolean);
}

export function getStatusColor(status: string): string {
  const normalized = normalizeStatus(status);

  switch (normalized) {
    case "PASS":
      return "bg-emerald-500/15 text-emerald-700 ring-emerald-500/30";
    case "COMP":
    case "COMPT":
    case "COMPARTMENT":
      return "bg-amber-500/15 text-amber-700 ring-amber-500/30";
    case "ABSENT":
      return "bg-slate-500/15 text-slate-600 ring-slate-500/30";
    case "FAIL":
      return "bg-rose-500/15 text-rose-700 ring-rose-500/30";
    case "WITHHELD":
      return "bg-violet-500/15 text-violet-700 ring-violet-500/30";
    default:
      return "bg-sky-500/15 text-sky-700 ring-sky-500/30";
  }
}

export function getPassRate(stats: ResultStats): number {
  if (stats.total === 0) return 0;
  return Math.round((stats.pass / stats.total) * 100);
}
