"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ClassTabs } from "@/components/class-tabs";
import { Header } from "@/components/header";
import { InstitutionSelect } from "@/components/institution-select";
import { StatsCards } from "@/components/stats-cards";
import { StudentTable } from "@/components/student-table";
import type { ClassLevel, Institution, Student, TopLimit } from "@/lib/types";
import { computeStats, getTopStudents } from "@/lib/utils";

export function ResultAnalyzer() {
  const [selectedClass, setSelectedClass] = useState<ClassLevel>("9th");
  const [selectedInstitution, setSelectedInstitution] = useState("");
  const [topLimit, setTopLimit] = useState<TopLimit>(10);

  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [institutionsLoading, setInstitutionsLoading] = useState(false);
  const [institutionsError, setInstitutionsError] = useState<string | null>(null);

  const [students, setStudents] = useState<Student[]>([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [studentsError, setStudentsError] = useState<string | null>(null);

  // Fetch institutions whenever class tab changes
  const fetchInstitutions = useCallback(async (classLevel: ClassLevel) => {
    setInstitutionsLoading(true);
    setInstitutionsError(null);
    try {
      const res = await fetch(`/api/institutions?class=${classLevel}`);
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
    async (classLevel: ClassLevel, institutionName: string) => {
      if (!institutionName) {
        setStudents([]);
        return;
      }
      setStudentsLoading(true);
      setStudentsError(null);
      try {
        const res = await fetch(
          `/api/students?class=${classLevel}&institution=${encodeURIComponent(institutionName)}`,
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json() as { students: Student[] };
        setStudents(data.students);
      } catch (err) {
        console.error(err);
        setStudentsError("Failed to load students.");
        setStudents([]);
      } finally {
        setStudentsLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    void fetchInstitutions(selectedClass);
  }, [selectedClass, fetchInstitutions]);

  useEffect(() => {
    void fetchStudents(selectedClass, selectedInstitution);
  }, [selectedClass, selectedInstitution, fetchStudents]);

  const stats = useMemo(() => computeStats(students), [students]);

  const displayedStudents = useMemo(
    () => getTopStudents(students, topLimit),
    [students, topLimit],
  );

  const handleClassChange = (value: ClassLevel) => {
    setSelectedClass(value);
    setSelectedInstitution("");
    setTopLimit(10);
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

        <section className="mb-6 sm:mb-8">
          <InstitutionSelect
            institutions={institutions}
            loading={institutionsLoading}
            value={selectedInstitution}
            onChange={setSelectedInstitution}
          />
        </section>

        {!selectedInstitution ? (
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
            <StatsCards stats={stats} />
            <StudentTable
              students={displayedStudents}
              limit={topLimit}
              onLimitChange={setTopLimit}
            />
          </div>
        )}
      </main>

      <footer className="mt-8 border-t border-slate-200/80 bg-white/50 py-5 sm:mt-12 sm:py-6">
        <p className="text-center text-xs text-slate-400">
          FBISE Result Analyzer · Federal Board of Intermediate &amp; Secondary
          Education, Islamabad
        </p>
      </footer>
    </div>
  );
}
