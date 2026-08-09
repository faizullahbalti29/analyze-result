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

export type AnalysisMode = "result" | "institution";

export interface TenthSubjectGroup {
  enrolled: number;
  absent: number;
  appd: number;
  rl: number;
  ufm: number;
  fail: number;
  pass: number;
  grades: {
    A1: number;
    A: number;
    B: number;
    C: number;
    D: number;
    E: number;
  };
  pass_percentage: number;
  gpa: number;
}

export interface TenthInstitution {
  _id: string;
  code: string;
  institution: string;
  groups: {
    science: TenthSubjectGroup;
    humanities: TenthSubjectGroup;
    total: TenthSubjectGroup;
  };
}

export interface CompareInstitutionResult {
  institution: string;
  code: string;
  groups: TenthInstitution["groups"];
  topStudents: {
    _id: string;
    roll_no: string;
    name: string;
    marks: number | null;
    percentage: number | null;
  }[];
}
