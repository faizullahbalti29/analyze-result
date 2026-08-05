"use client";

import { ChevronLeft, ChevronRight, Medal, Trophy } from "lucide-react";
import { useEffect, useState } from "react";
import {
  cn,
  formatGrade,
  formatMarks,
  getCompartmentSubjects,
  getStatusColor,
  isCompartmentStatus,
} from "@/lib/utils";
import type { Student, TopLimit } from "@/lib/types";

interface StudentTableProps {
  students: Student[];
  limit: TopLimit;
  onLimitChange: (limit: TopLimit) => void;
}

const LIMIT_OPTIONS: { value: TopLimit; label: string }[] = [
  { value: 3, label: "Top 3" },
  { value: 5, label: "Top 5" },
  { value: 10, label: "Top 10" },
  { value: 20, label: "Top 20" },
  { value: "all", label: "All" },
];

const PAGE_SIZE = 50;

function RankBadge({ rank, size = "md" }: { rank: number; size?: "sm" | "md" }) {
  const sizeClass = size === "sm" ? "h-7 w-7" : "h-8 w-8";
  const iconClass = size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4";

  if (rank === 1) {
    return (
      <span
        className={cn(
          "inline-flex items-center justify-center rounded-full bg-amber-100 text-amber-700 ring-1 ring-amber-200",
          sizeClass,
        )}
      >
        <Trophy className={iconClass} />
      </span>
    );
  }

  if (rank === 2) {
    return (
      <span
        className={cn(
          "inline-flex items-center justify-center rounded-full bg-slate-200 text-slate-600 ring-1 ring-slate-300",
          sizeClass,
        )}
      >
        <Medal className={iconClass} />
      </span>
    );
  }

  if (rank === 3) {
    return (
      <span
        className={cn(
          "inline-flex items-center justify-center rounded-full bg-orange-100 text-orange-700 ring-1 ring-orange-200",
          sizeClass,
        )}
      >
        <Medal className={iconClass} />
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-500",
        sizeClass,
      )}
    >
      {rank}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset",
        getStatusColor(status),
      )}
    >
      {status}
    </span>
  );
}

function CompartmentSubjects({ remarks }: { remarks: string | null }) {
  const subjects = getCompartmentSubjects(remarks);

  if (subjects.length === 0) {
    return <span className="text-slate-400">—</span>;
  }

  return (
    <div className="space-y-1.5">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-amber-700/80">
        Compartment Subjects
      </p>
      <div className="flex flex-wrap gap-1.5">
        {subjects.map((subject) => (
          <span
            key={subject}
            className="inline-flex rounded-md bg-amber-50 px-2 py-0.5 font-mono text-xs font-medium text-amber-800 ring-1 ring-amber-200/80"
          >
            {subject}
          </span>
        ))}
      </div>
    </div>
  );
}

function StudentMobileCard({
  student,
  rank,
}: {
  student: Student;
  rank: number;
}) {
  const isCompartment = isCompartmentStatus(student.status);

  return (
    <article className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <RankBadge rank={rank} size="sm" />
          <div className="min-w-0">
            <h3 className="truncate font-semibold text-slate-900">
              {student.name}
            </h3>
            <p className="mt-0.5 font-mono text-xs text-slate-500">
              Roll: {student.roll_no}
            </p>
          </div>
        </div>
        <StatusBadge status={student.status} />
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 border-t border-slate-100 pt-3">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
            Marks
          </p>
          <p className="mt-0.5 text-sm font-semibold tabular-nums text-slate-800">
            {formatMarks(student.marks)}
          </p>
        </div>
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
            Grade
          </p>
          <p className="mt-0.5 text-sm font-semibold text-slate-800">
            {student.grade ? (
              <span className="inline-flex rounded-md bg-slate-100 px-2 py-0.5 font-semibold text-slate-700">
                {formatGrade(student.grade)}
              </span>
            ) : (
              <span className="text-slate-400">—</span>
            )}
          </p>
        </div>
      </div>

      {(isCompartment || student.remarks) && (
        <div className="mt-3 border-t border-slate-100 pt-3">
          {isCompartment ? (
            <CompartmentSubjects remarks={student.remarks} />
          ) : (
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                Remarks
              </p>
              <p className="mt-1 text-sm leading-relaxed text-slate-600">
                {student.remarks}
              </p>
            </div>
          )}
        </div>
      )}
    </article>
  );
}

/** Pagination bar — only rendered when limit === "all" and total > PAGE_SIZE */
function Pagination({
  current,
  total,
  onChange,
}: {
  current: number;
  total: number;
  onChange: (page: number) => void;
}) {
  const totalPages = Math.ceil(total / PAGE_SIZE);
  if (totalPages <= 1) return null;

  // Build a compact page-number list: always show first, last, current ±1
  const pages: (number | "…")[] = [];
  const add = new Set<number>();

  [1, current - 1, current, current + 1, totalPages].forEach((p) => {
    if (p >= 1 && p <= totalPages) add.add(p);
  });

  const sorted = [...add].sort((a, b) => a - b);
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) pages.push("…");
    pages.push(p);
  });

  return (
    <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3 sm:px-6">
      <p className="text-xs text-slate-500">
        Page <span className="font-semibold text-slate-700">{current}</span> of{" "}
        <span className="font-semibold text-slate-700">{totalPages}</span>
        <span className="ml-2 text-slate-400">
          ({total} students total)
        </span>
      </p>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onChange(current - 1)}
          disabled={current === 1}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {pages.map((p, i) =>
          p === "…" ? (
            <span
              key={`ellipsis-${i}`}
              className="flex h-8 w-8 items-center justify-center text-xs text-slate-400"
            >
              …
            </span>
          ) : (
            <button
              key={p}
              type="button"
              onClick={() => onChange(p)}
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-lg text-xs font-medium transition-colors",
                current === p
                  ? "bg-teal-600 text-white shadow-sm shadow-teal-600/30"
                  : "text-slate-600 hover:bg-slate-100",
              )}
            >
              {p}
            </button>
          ),
        )}

        <button
          type="button"
          onClick={() => onChange(current + 1)}
          disabled={current === totalPages}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export function StudentTable({
  students,
  limit,
  onLimitChange,
}: StudentTableProps) {
  const [page, setPage] = useState(1);

  // Reset to page 1 whenever the student list or limit changes
  useEffect(() => {
    setPage(1);
  }, [students, limit]);

  const isPaginated = limit === "all" && students.length > PAGE_SIZE;
  const pageStudents = isPaginated
    ? students.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
    : students;

  // Global rank offset so rank numbers are continuous across pages
  const rankOffset = isPaginated ? (page - 1) * PAGE_SIZE : 0;

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-sm sm:rounded-2xl">
      <div className="border-b border-slate-100 px-4 py-4 sm:px-6 sm:py-5">
        <div className="flex flex-col gap-3">
          <div>
            <h2 className="text-base font-semibold text-slate-900 sm:text-lg">
              Student Results
            </h2>
            <p className="text-xs text-slate-500 sm:text-sm">
              Ranked by marks —{" "}
              {limit === "all"
                ? `all ${students.length} students`
                : `top ${limit}`}
            </p>
          </div>

          <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {LIMIT_OPTIONS.map((option) => (
              <button
                key={option.label}
                type="button"
                onClick={() => onLimitChange(option.value)}
                className={cn(
                  "shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-all sm:text-sm",
                  limit === option.value
                    ? "bg-teal-600 text-white shadow-sm shadow-teal-600/30"
                    : "bg-slate-100 text-slate-600 active:bg-slate-200",
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {students.length === 0 ? (
        <div className="px-4 py-12 text-center sm:px-6 sm:py-16">
          <p className="text-sm font-medium text-slate-600">
            No students found for this institution
          </p>
          <p className="mt-1 text-sm text-slate-400">
            Select a different institution to view results
          </p>
        </div>
      ) : (
        <>
          {/* ── Mobile cards ── */}
          <div className="space-y-3 p-4 md:hidden">
            {pageStudents.map((student, index) => (
              <StudentMobileCard
                key={student._id}
                student={student}
                rank={rankOffset + index + 1}
              />
            ))}
          </div>

          {/* ── Desktop table ── */}
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/80">
                  <th className="px-6 py-3.5 font-semibold text-slate-600">
                    Rank
                  </th>
                  <th className="px-6 py-3.5 font-semibold text-slate-600">
                    Roll No
                  </th>
                  <th className="px-6 py-3.5 font-semibold text-slate-600">
                    Name
                  </th>
                  <th className="px-6 py-3.5 font-semibold text-slate-600">
                    Status
                  </th>
                  <th className="px-6 py-3.5 font-semibold text-slate-600">
                    Marks
                  </th>
                  <th className="px-6 py-3.5 font-semibold text-slate-600">
                    Grade
                  </th>
                  <th className="px-6 py-3.5 font-semibold text-slate-600">
                    Details
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pageStudents.map((student, index) => {
                  const isCompartment = isCompartmentStatus(student.status);

                  return (
                    <tr
                      key={student._id}
                      className="transition-colors hover:bg-teal-50/40"
                    >
                      <td className="px-6 py-4">
                        <RankBadge rank={rankOffset + index + 1} />
                      </td>
                      <td className="px-6 py-4 font-mono text-slate-700">
                        {student.roll_no}
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-900">
                        {student.name}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={student.status} />
                      </td>
                      <td className="px-6 py-4 font-semibold tabular-nums text-slate-800">
                        {formatMarks(student.marks)}
                      </td>
                      <td className="px-6 py-4">
                        {student.grade ? (
                          <span className="inline-flex rounded-md bg-slate-100 px-2 py-0.5 font-semibold text-slate-700">
                            {formatGrade(student.grade)}
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="max-w-xs px-6 py-4">
                        {isCompartment ? (
                          <CompartmentSubjects remarks={student.remarks} />
                        ) : (
                          <span className="text-slate-500">
                            {student.remarks ?? "—"}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* ── Pagination bar (only when All + more than PAGE_SIZE) ── */}
          <Pagination
            current={page}
            total={students.length}
            onChange={setPage}
          />
        </>
      )}
    </div>
  );
}
