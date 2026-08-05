export type ClassLevel = "9th" | "10th";

export type StudentStatus =
  | "PASS"
  | "COMP"
  | "ABSENT"
  | "FAIL"
  | "WITHHELD"
  | string;

export interface Student {
  _id: string;
  roll_no: string;
  name: string;
  status: StudentStatus;
  marks: number | null;
  grade: string | null;
  remarks: string | null;
  institution: string;
}

export interface Institution {
  /** MongoDB ObjectId as string */
  _id: string;
  /** Display name — normalised from "institution" (9th) or "name" (10th) field */
  name: string;
}

export interface ResultStats {
  total: number;
  pass: number;
  compartment: number;
  absent: number;
  other: number;
}

export type TopLimit = 3 | 5 | 10 | 20 | "all";
