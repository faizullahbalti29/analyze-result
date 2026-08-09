"use client";

import { useCallback, useEffect, useState } from "react";
import { AnalysisModeSelect } from "@/components/analysis-mode-select";
import { ClassTabs } from "@/components/class-tabs";
import { Header } from "@/components/header";
import { InstitutionSelect } from "@/components/institution-select";
import { InstitutionCompareTable } from "@/components/institution-compare-table";
import { MultiInstitutionSelect } from "@/components/multi-institution-select";
import { StatsCards } from "@/components/stats-cards";
import { StudentTable } from "@/components/student-table";
import type { AnalysisMode, ClassLevel, CompareInstitutionResult, Institution, ResultStats, Student, TopLimit } from "@/lib/types";

export function ResultAnalyzer() {
  const [selectedClass, setSelectedClass] = useState<ClassLevel>("9th");
  const [analysisMode, setAnalysisMode] = useState<AnalysisMode>("result");
  const [selectedInstitution, setSelectedInstitution] = useState("");
  const [selectedInstitutions, setSelectedInstitutions] = useState<string[]>([]);
  const [topLimit, setTopLimit] = useState<string>("all");

  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [institutionsLoading, setInstitutionsLoading] = useState(false);
  const [institutionsError, setInstitutionsError] = useState<string | null>(null);
  const [compareResults, setCompareResults] = useState<CompareInstitutionResult[]>([]);
  const [compareLoading, setCompareLoading] = useState(false);
  const [compareError, setCompareError] = useState<string | null>(null);

  const [students, setStudents] = useState<Student[]>([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [studentsError, setStudentsError] = useState<string | null>(null);
  const [studentPage, setStudentPage] = useState(1);
  const [studentTotal, setStudentTotal] = useState(0);
  const [stats, setStats] = useState<ResultStats>({
    total: 0,
    pass: 0,
    compartment: 0,
    absent: 0,
    other: 0,
  });
  const [statsLoading, setStatsLoading] = useState(false);

  // Fetch institutions whenever class tab changes or search query updates
  const fetchInstitutions = useCallback(async (classLevel: ClassLevel, query: string = "") => {
    setInstitutionsLoading(true);
    setInstitutionsError(null);
    try {
      const url = new URL(`/api/institutions`, location.origin);
      url.searchParams.append("class", classLevel);
      if (query) url.searchParams.append("q", query);
      const res = await fetch(url.toString());
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json() as { institutions: Institution[] };
      setInstitutions(data.institutions);
    } catch (err) {
      console.error(err);
      setInstitutionsError("Failed to load institutions. Is MongoDB running?");
      setInstitutions([]);
    } finally {
      setInstitutionsLoading(false);
    }
  }, []);

  // Fetch students whenever institution selection changes
  const fetchStudents = useCallback(
    async (
      classLevel: ClassLevel,
      institutionName: string,
      status: string,
      page: number,
    ) => {
      if (!institutionName) {
        setStudents([]);
        setStudentTotal(0);
        return;
      }

      setStudentsLoading(true);
      setStudentsError(null);
      try {
        const url = new URL(`/api/students`, location.origin);
        url.searchParams.append("class", classLevel);
        url.searchParams.append("institution", institutionName);
        url.searchParams.append("status", status);
        url.searchParams.append("page", page.toString());

        const res = await fetch(url.toString());
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json() as {
          students: Student[];
          total: number;
          page: number;
          pageSize: number;
        };

        setStudents(data.students);
        setStudentTotal(data.total ?? 0);
      } catch (err) {
        console.error(err);
        setStudentsError("Failed to load students.");
        setStudents([]);
        setStudentTotal(0);
      } finally {
        setStudentsLoading(false);
      }
    },
    [],
  );
  // console.log(topLimit)
  const [institutionQuery, setInstitutionQuery] = useState<string>("");

  // Debounce effect for query and class level changes (initial load & search)
  useEffect(() => {
    const handler = setTimeout(() => {
      void fetchInstitutions(selectedClass, institutionQuery);
    }, 300);
    return () => clearTimeout(handler);
  }, [selectedClass, institutionQuery, fetchInstitutions]);

  const fetchCompareResults = useCallback(async (selectedInstitutions: string[]) => {
    if (selectedInstitutions.length === 0) {
      setCompareResults([]);
      setCompareError(null);
      return;
    }

    setCompareLoading(true);
    setCompareError(null);

    try {
      const url = new URL(`/api/tenth-institutions/compare`, location.origin);
      selectedInstitutions.forEach((institution) => {
        url.searchParams.append("institution", institution);
      });
      const res = await fetch(url.toString());
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json() as { results: CompareInstitutionResult[] };
      setCompareResults(data.results);
    } catch (err) {
      console.error(err);
      setCompareError("Failed to fetch compare results.");
      setCompareResults([]);
    } finally {
      setCompareLoading(false);
    }
  }, []);

  const fetchStudentCounts = useCallback(
    async (classLevel: ClassLevel, institutionName: string) => {
      if (!institutionName) {
        setStats({
          total: 0,
          pass: 0,
          compartment: 0,
          absent: 0,
          other: 0,
        });
        setStatsLoading(false);
        return;
      }

      setStatsLoading(true);
      try {
        const url = new URL(`/api/students/counts`, location.origin);
        url.searchParams.append("class", classLevel);
        url.searchParams.append("institution", institutionName);

        const res = await fetch(url.toString());
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json() as { stats: ResultStats };
        setStats(data.stats);
      } catch (err) {
        console.error(err);
        setStats({
          total: 0,
          pass: 0,
          compartment: 0,
          absent: 0,
          other: 0,
        });
      } finally {
        setStatsLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    if (analysisMode === "result") {
      void fetchStudents(selectedClass, selectedInstitution, topLimit, studentPage);
    }
  }, [analysisMode, selectedClass, selectedInstitution, topLimit, studentPage, fetchStudents]);

  useEffect(() => {
    if (analysisMode === "result") {
      setStudentPage(1);
      void fetchStudentCounts(selectedClass, selectedInstitution);
    }
  }, [analysisMode, selectedInstitution, selectedClass, fetchStudentCounts]);

  useEffect(() => {
    if (analysisMode === "institution") {
      setSelectedInstitution("");
      setTopLimit("all");
      setStudentPage(1);
      setStudentTotal(0);
      setStudents([]);
      void fetchCompareResults(selectedInstitutions);
    }
  }, [analysisMode, selectedInstitutions, fetchCompareResults]);

  const handleClassChange = (value: ClassLevel) => {
    setSelectedClass(value);
    setSelectedInstitution("");
    setInstitutionQuery("");
    setTopLimit("all");
    setStudentPage(1);
    setStudentTotal(0);
    setStudents([]);
  };

  return (
    <div className="min-h-full bg-gradient-to-b from-slate-50 via-white to-teal-50/30">
      <Header />

      <main className="mx-auto max-w-7xl px-3 py-5 sm:px-6 sm:py-8 lg:px-8">
        <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:gap-6">
          <ClassTabs selected={selectedClass} onChange={handleClassChange} />

          {institutionsError && (
            <div className="rounded-xl border border-rose-200/80 bg-rose-50/80 px-3 py-2.5 text-xs text-rose-800 sm:px-4 sm:py-3 sm:text-sm">
              <span className="font-semibold">Connection error:</span>{" "}
              {institutionsError}
            </div>
          )}
        </div>

        <section className="mb-6 sm:mb-8 grid gap-4 xl:grid-cols-[280px_1fr]">
          <div>
            <AnalysisModeSelect
              value={analysisMode}
              onChange={setAnalysisMode}
              disabled={selectedClass !== "10th"}
            />
          </div>

          {analysisMode === "result" ? (
            <InstitutionSelect
              institutions={institutions}
              loading={institutionsLoading}
              value={selectedInstitution}
              onChange={setSelectedInstitution}
              onSearch={setInstitutionQuery}
            />
          ) : (
            <MultiInstitutionSelect
              institutions={institutions}
              loading={institutionsLoading}
              selected={selectedInstitutions}
              onChange={setSelectedInstitutions}
              onSearch={setInstitutionQuery}
            />
          )}
        </section>

        {analysisMode === "institution" ? (
          <div className="animate-fade-in space-y-6 sm:space-y-8">
            <div className="flex flex-wrap items-center gap-3 rounded-xl border border-teal-200/70 bg-teal-50/50 px-4 py-3 sm:px-5">
              <div className="flex min-w-0 flex-1 items-center gap-2">
                <span className="shrink-0 flex h-8 w-8 items-center justify-center rounded-lg bg-teal-100 text-teal-600">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </span>
                <div className="min-w-0">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-teal-600">Institution Compare</p>
                  <p className="truncate text-sm font-semibold text-slate-800">
                    Comparing {selectedInstitutions.length} institutions
                  </p>
                </div>
              </div>
              <span className="shrink-0 inline-flex items-center rounded-full bg-teal-100 px-3 py-1 text-xs font-semibold text-teal-700 ring-1 ring-teal-200">
                Class 10th only
              </span>
            </div>

            {compareError ? (
              <div className="rounded-xl border border-rose-200/80 bg-rose-50/80 px-4 py-3 text-sm text-rose-800">
                {compareError}
              </div>
            ) : compareLoading ? (
              <div className="flex min-h-[260px] flex-col items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white/60 px-6">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-teal-200 border-t-teal-600" />
                <p className="text-sm text-slate-500">Loading comparison…</p>
              </div>
            ) : compareResults.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white/60 px-6 py-10 text-center text-slate-500">
                Select up to 5 institutions to compare their 10th class summaries and top students.
              </div>
            ) : (
              <InstitutionCompareTable results={compareResults} />
            )}
          </div>
        ) : !selectedInstitution ? (
          <div className="flex min-h-[320px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white/60 px-6 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-100 text-teal-600">
              <svg
                className="h-8 w-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-800">
              Select an institution to begin
            </h3>
            <p className="mt-2 max-w-md text-sm text-slate-500">
              Choose a school from the dropdown above to view result statistics
              and student rankings for Class {selectedClass}.
            </p>
          </div>
        ) : studentsLoading ? (
          <div className="flex min-h-[320px] flex-col items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white/60 px-6">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-teal-200 border-t-teal-600" />
            <p className="text-sm text-slate-500">Loading results…</p>
          </div>
        ) : studentsError ? (
          <div className="flex min-h-[200px] flex-col items-center justify-center rounded-2xl border border-rose-200 bg-rose-50/50 px-6 text-center">
            <p className="text-sm font-medium text-rose-700">{studentsError}</p>
          </div>
        ) : (
          <div className="animate-fade-in space-y-6 sm:space-y-8">
            {/* ── Selected institution banner ── */}
            <div className="flex flex-wrap items-center gap-3 rounded-xl border border-teal-200/70 bg-teal-50/50 px-4 py-3 sm:px-5">
              <div className="flex min-w-0 flex-1 items-center gap-2">
                <span className="shrink-0 flex h-8 w-8 items-center justify-center rounded-lg bg-teal-100 text-teal-600">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </span>
                <div className="min-w-0">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-teal-600">Selected Institution</p>
                  <p className="truncate text-sm font-semibold text-slate-800">{selectedInstitution}</p>
                </div>
              </div>
              <span className="shrink-0 inline-flex items-center rounded-full bg-teal-100 px-3 py-1 text-xs font-semibold text-teal-700 ring-1 ring-teal-200">
                Class {selectedClass}
              </span>
            </div>

            <StatsCards stats={stats} loading={statsLoading} />
            <StudentTable
              students={students}
              totalStudents={studentTotal}
              page={studentPage}
              limit={topLimit}
              onLimitChange={(value) => {
                setTopLimit(value);
                setStudentPage(1);
              }}
              onPageChange={setStudentPage}
              classLevel={selectedClass}
              institution={selectedInstitution}
              activeClass={selectedClass}
            />
          </div>
        )}
      </main>

      <footer className="mt-8 border-t border-slate-200/80 bg-white/50">
        {/* Disclaimer strip */}
        <div className="border-b border-amber-200/60 bg-amber-50/70 px-4 py-3 sm:px-6">
          <div className="mx-auto flex max-w-7xl items-start gap-2.5">
            <svg className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
            </svg>
            <p className="text-[11px] leading-relaxed text-amber-800 sm:text-xs">
              <span className="font-semibold">Disclaimer:</span> This is an independent, unofficial result analysis tool and is{" "}
              <span className="font-semibold">not affiliated with, endorsed by, or associated with</span> the Federal Board of
              Intermediate &amp; Secondary Education (FBISE), Islamabad, or any other government authority. Data is sourced from
              the official FBISE portal for educational and analytical purposes only. For official results and verification, visit{" "}
              <a
                href="https://portal.fbise.edu.pk/fbise-conduct/result/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold underline underline-offset-2 hover:text-amber-900"
              >
                https://portal.fbise.edu.pk/fbise-conduct/result/
              </a>.
            </p>
          </div>
        </div>

        {/* Copyright line */}
        <div className="px-4 py-4 sm:px-6 sm:py-5">
          <p className="text-center text-xs text-slate-400">
            FBISE Result Analyzer ·
            Result data © Federal Board of Intermediate &amp; Secondary Education, Islamabad
          </p>
        </div>
      </footer>
    </div>
  );
}
