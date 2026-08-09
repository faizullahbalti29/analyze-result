"use client";

import type { CompareInstitutionResult } from "@/lib/types";
import { cn, formatGrade } from "@/lib/utils";
import { ExternalLink } from "lucide-react";

interface InstitutionCompareTableProps {
  results: CompareInstitutionResult[];
}

export function InstitutionCompareTable({ results }: InstitutionCompareTableProps) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 xl:grid-cols-2">
        {results.map((institution) => (
          <div key={institution.code} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {institution.code}
                </p>
                <h2 className="truncate text-base font-semibold text-slate-900">
                  {institution.institution}
                </h2>
              </div>
              <span className="inline-flex items-center rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700 ring-1 ring-teal-200">
                Class 10th
              </span>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {Object.entries(institution.groups.total.grades).map(([grade, count]) => (
                <div key={grade} className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-center">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{grade}</p>
                  <p className="mt-2 text-2xl font-semibold text-slate-900">{count}</p>
                </div>
              ))}
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3 text-sm text-slate-700 sm:grid-cols-3">
              <div className="rounded-2xl bg-slate-50 p-3">
                <p className="text-xs uppercase tracking-wide text-slate-500">Enrolled</p>
                <p className="mt-2 text-xl font-semibold text-slate-900">{institution.groups.total.enrolled}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-3">
                <p className="text-xs uppercase tracking-wide text-slate-500">Pass</p>
                <p className="mt-2 text-xl font-semibold text-slate-900">{institution.groups.total.pass}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-3">
                <p className="text-xs uppercase tracking-wide text-slate-500">Pass %</p>
                <p className="mt-2 text-xl font-semibold text-slate-900">{institution.groups.total.pass_percentage.toFixed(2)}%</p>
              </div>
            </div>

            <div className="mt-6 overflow-hidden rounded-3xl border border-slate-200">
              <div className="bg-slate-100 px-4 py-3 text-sm font-semibold uppercase tracking-wide text-slate-600">
                Top Students
              </div>
              <div className="divide-y divide-slate-200 bg-white">
                {institution.topStudents.map((student, index) => (
                  <div key={student._id} className="flex flex-col gap-2 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900">{student.name}</p>
                      <p className="mt-1 text-xs text-slate-500">Roll No: {student.roll_no}</p>
                    </div>
                    <div className="grid gap-2 sm:grid-cols-3 sm:text-right">
                      <p className="text-sm text-slate-700">Marks: {student.marks ?? "—"}</p>
                      <p className="text-sm text-slate-700">%: {student.percentage?.toFixed(2) ?? "—"}</p>
                      <p className="text-sm text-slate-700">Rank: {index + 1}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
