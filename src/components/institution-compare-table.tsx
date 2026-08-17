"use client";

import Link from "next/link";
import type { ClassLevel, CompareInstitutionResult } from "@/lib/types";
import { getFbiseUrl } from "@/lib/utils";
import { ExternalLink } from "lucide-react";

interface InstitutionCompareTableProps {
  results: CompareInstitutionResult[];
  classLevel?: ClassLevel;
}

export function InstitutionCompareTable({ results, classLevel = "10th" }: InstitutionCompareTableProps) {
  const topStudentRows = results.flatMap((res) =>
    res.topStudents.map((s) => ({
      institution: res.institution,
      roll_no: s.roll_no,
      name: s.name,
      marks: s.marks,
      percentage: s.percentage,
      fbiseUrl: getFbiseUrl(s.roll_no, classLevel),
    })),
  );

  return (
    <div className="space-y-6">
      {/* Institutions summary table */}
      <div className="overflow-auto rounded-2xl border border-slate-200 bg-white custom-scrollbar">
        <div className="min-w-[900px]">
          <table className="min-w-full divide-y divide-slate-100">
            <thead className="bg-slate-50">
              <tr>
                <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold text-slate-500">Code</th>
                <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold text-slate-500">Institution</th>
                <th className="whitespace-nowrap px-4 py-3 text-right text-xs font-semibold text-slate-500">Enrolled</th>
                <th className="whitespace-nowrap px-4 py-3 text-right text-xs font-semibold text-slate-500">Pass</th>
                <th className="whitespace-nowrap px-4 py-3 text-right text-xs font-semibold text-slate-500">Fail</th>
                <th className="whitespace-nowrap px-4 py-3 text-right text-xs font-semibold text-slate-500">Absent</th>
                <th className="whitespace-nowrap px-4 py-3 text-right text-xs font-semibold text-slate-500">Appd</th>
                <th className="whitespace-nowrap px-4 py-3 text-right text-xs font-semibold text-slate-500">UFM</th>
                <th className="whitespace-nowrap px-4 py-3 text-right text-xs font-semibold text-slate-500">RL</th>
                <th className="whitespace-nowrap px-4 py-3 text-right text-xs font-semibold text-slate-500">Pass %</th>
                <th className="whitespace-nowrap px-4 py-3 text-right text-xs font-semibold text-slate-500">GPA</th>
                <th className="whitespace-nowrap px-4 py-3 text-right text-xs font-semibold text-slate-500">A1</th>
                <th className="whitespace-nowrap px-4 py-3 text-right text-xs font-semibold text-slate-500">A</th>
                <th className="whitespace-nowrap px-4 py-3 text-right text-xs font-semibold text-slate-500">B</th>
                <th className="whitespace-nowrap px-4 py-3 text-right text-xs font-semibold text-slate-500">C</th>
                <th className="whitespace-nowrap px-4 py-3 text-right text-xs font-semibold text-slate-500">D</th>
                <th className="whitespace-nowrap px-4 py-3 text-right text-xs font-semibold text-slate-500">E</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {results.map((r) => (
                <tr key={`${r.code}_${r.institution}`} className="group hover:bg-slate-50">
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-700">{r.code}</td>
                  <td className="whitespace-nowrap px-4 py-3 max-w-xl truncate text-sm font-semibold text-slate-900">
                    <Link
                      href={`/institutions/${classLevel}/${encodeURIComponent(r.institution)}`}
                      className="text-teal-700 transition-colors hover:text-teal-900 hover:underline"
                    >
                      {r.institution}
                    </Link>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-slate-700">{r.groups.total.enrolled}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-slate-700">{r.groups.total.pass}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-slate-700">{r.groups.total.fail ?? 0}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-slate-700">{r.groups.total.absent}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-slate-700">{r.groups.total.appd}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-slate-700">{r.groups.total.ufm}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-slate-700">{r.groups.total.rl}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-slate-700">{Number(r.groups.total.pass_percentage).toFixed(2)}%</td>
                  <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-slate-700">{Number(r.groups.total.gpa).toFixed(2)}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-slate-700">{r.groups.total.grades.A1 ?? 0}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-slate-700">{r.groups.total.grades.A ?? 0}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-slate-700">{r.groups.total.grades.B ?? 0}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-slate-700">{r.groups.total.grades.C ?? 0}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-slate-700">{r.groups.total.grades.D ?? 0}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-slate-700">{r.groups.total.grades.E ?? 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top students table */}
      <div className="overflow-auto rounded-2xl border border-slate-200 bg-white custom-scrollbar">
        <div className="min-w-[640px]">
          <table className="min-w-full divide-y divide-slate-100">
            <thead className="bg-slate-50">
              <tr>
                <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold text-slate-500">Institution</th>
                <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold text-slate-500">Roll No</th>
                <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold text-slate-500">Name</th>
                <th className="whitespace-nowrap px-4 py-3 text-right text-xs font-semibold text-slate-500">Marks</th>
                <th className="whitespace-nowrap px-4 py-3 text-right text-xs font-semibold text-slate-500">%</th>
                <th className="whitespace-nowrap px-4 py-3 text-right text-xs font-semibold text-slate-500">Official Sheet</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {topStudentRows.sort((a, b) => (b?.marks || 0) - (a?.marks || 0)).map((s, idx) => (
                <tr key={`${s.institution}-${s.roll_no}-${idx}`} className="hover:bg-slate-50">
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-700 max-w-xs truncate">{s.institution}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-700">{s.roll_no}</td>
                  <td className="px-4 py-3 text-sm text-slate-900 truncate">{s.name}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-slate-700">{s.marks ?? "—"}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-slate-700">{s.percentage != null ? s.percentage.toFixed(2) + "%" : "—"}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-slate-700">
                    <a
                      href={s.fbiseUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 rounded-lg border border-teal-200 bg-teal-50/60 px-3 py-1.5 text-xs font-semibold text-teal-700 transition-colors hover:bg-teal-100 hover:text-teal-900"
                    >
                      View Sheet
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
