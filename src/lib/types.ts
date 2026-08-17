export type ClassLevel = "9th" | "10th" | "11th" | "12th";

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
  /** Display name — normalised from the institution field across class levels */
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

export type AnalysisMode = "result" | "institution" | "position";

export interface PositionStudent {
  _id: string;
  roll_no: string;
  name: string;
  marks: number;
  grade?: string | null;
  institution: string;
}

export interface PositionResult {
  position: number;
  higherCount: number;
  equalCount: number;
  lowerCount: number;
  totalWithMarks: number;
  marks: number;
  percentile: number;
  topPercentage: number;
  topScore: number | null;
  topStudent?: {
    roll_no: string;
    name: string;
    marks: number;
    institution: string;
  } | null;
  higherStudents: PositionStudent[];
}

export interface SubjectGroup {
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
    science: SubjectGroup;
    humanities: SubjectGroup;
    total: SubjectGroup;
  };
}

export interface TwelfthInstitution {
  _id: string;
  code: string;
  institution: string;
  groups: Record<string, SubjectGroup>;
}

export interface CompareInstitutionResult {
  institution: string;
  code: string;
  groups: Record<string, SubjectGroup>;
  topStudents: {
    _id: string;
    roll_no: string;
    name: string;
    marks: number | null;
    percentage: number | null;
  }[];
}
