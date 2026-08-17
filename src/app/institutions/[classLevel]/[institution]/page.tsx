import { notFound } from "next/navigation";
import { connectDB } from "@/lib/mongodb";
import { getStudentModel } from "@/lib/models/Student";
import { getTenthInstitutionModel } from "@/lib/models/TenthInstitution";
import { getTwelfthInstitutionModel } from "@/lib/models/TwelfthInstitution";
import { Header } from "@/components/header";
import { BackButton } from "@/components/back-button";
import type { ClassLevel, SubjectGroup } from "@/lib/types";
import { cn, getFbiseUrl, getStatusColor } from "@/lib/utils";
import {
  School,
  Users,
  CheckCircle2,
  AlertCircle,
  XCircle,
  TrendingUp,
  Award,
  Trophy,
  ExternalLink,
  BookOpen,
  Clock,
} from "lucide-react";


function normalizeInstitutionName(input: string): string {
  return input
    .replace(/\(\s*\d+\s*\)/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function escapeRegex(input: string): string {
  return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function titleCase(value: string): string {
  return value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

async function getInstitutionDetail(classLevel: ClassLevel, name: string) {
  await connectDB();

  const target = normalizeInstitutionName(name);

  const model =
    classLevel === "10th"
      ? getTenthInstitutionModel()
      : getTwelfthInstitutionModel();
  const docs = await model.find({} as any).lean();

  const match =
    docs.find(
      (doc) => normalizeInstitutionName(String(doc.institution)) === target,
    ) ??
    docs.find((doc) =>
      normalizeInstitutionName(String(doc.institution)).includes(target),
    ) ??
    docs.find((doc) =>
      target.includes(normalizeInstitutionName(String(doc.institution))),
    );

  if (!match) {
    return null;
  }

  const studentModel = getStudentModel(
    classLevel === "10th" ? "tenth" : "twelfth",
  );
  const institutionRegexes = [
    {
      institution: {
        $regex: new RegExp(`^${escapeRegex(String(match.institution))}$`, "i"),
      },
    },
    {
      institution: {
        $regex: new RegExp(
          `^\\s*\\(\\s*\\d+\\s*\\)\\s*${escapeRegex(normalizeInstitutionName(String(match.institution)))}\\s*$`,
          "i",
        ),
      },
    },
    {
      institution: {
        $regex: new RegExp(
          `^${escapeRegex(normalizeInstitutionName(String(match.institution)))}\\s*\\(\\s*\\d+\\s*\\)\\s*$`,
          "i",
        ),
      },
    },
  ];

  const topStudents = await studentModel
    .find(
      { $or: institutionRegexes },
      { roll_no: 1, name: 1, marks: 1, grade: 1, status: 1 },
    )
    .sort({ marks: -1, name: 1 })
    .limit(10)
    .lean();

  return {
    institution: String(match.institution),
    code: String(match.code ?? ""),
    groups: match.groups as Record<string, SubjectGroup>,
    topStudents: topStudents.map((student) => ({
      _id: String(student._id),
      roll_no: student.roll_no,
      name: student.name,
      marks: student.marks ?? null,
      grade: student.grade ?? null,
      status: student.status,
    })),
  };
}

export default async function InstitutionDetailPage({
  params,
}: {
  params: Promise<{ classLevel: string; institution: string }>;
}) {
  const { classLevel, institution } = await params;
  const normalizedClass =
    classLevel === "10th" || classLevel === "12th" ? classLevel : null;

  if (!normalizedClass) {
    notFound();
  }

  const decodedInstitution = decodeURIComponent(institution ?? "");
  const detail = await getInstitutionDetail(
    normalizedClass,
    decodedInstitution,
  );

  if (!detail) {
    notFound();
  }

  const totalGroup =
    detail.groups.total ??
    Object.values(detail.groups).find((group) => "total" in { total: group }) ??
    null;
  const nonTotalGroups = Object.entries(detail.groups).filter(
    ([key]) => key !== "total",
  );

  const formatGroupName = (key: string) => titleCase(key.replace(/_/g, "-"));
  const passPercentage = totalGroup
    ? Number(totalGroup.pass_percentage).toFixed(2)
    : "0.00";

  return (
    <div className="min-h-full bg-gradient-to-b from-slate-50 via-white to-teal-50/30">
      <Header />

      <main className="mx-auto max-w-7xl px-3 py-5 sm:px-6 sm:py-8 lg:px-8">
        {/* Navigation & Back button */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <BackButton />


          <div className="flex items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-teal-100 px-3 py-1 text-xs font-semibold text-teal-800 ring-1 ring-teal-200">
              Class {normalizedClass}{" "}
              {normalizedClass === "10th" ? "· SSC Part II" : "· HSSC Part II"}
            </span>
          </div>
        </div>

        {/* Selected Institution Banner */}
        <div className="mb-6 overflow-hidden rounded-2xl border border-teal-200/80 bg-gradient-to-br from-teal-900 via-teal-800 to-emerald-900 p-5 text-white shadow-xl shadow-teal-950/10 sm:p-7">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-3.5 sm:gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/20 backdrop-blur-sm sm:h-14 sm:w-14">
                <School className="h-6 w-6 text-emerald-200 sm:h-7 sm:w-7" />
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-semibold uppercase tracking-widest text-emerald-200/90">
                    Institution Overview
                  </span>
                  {detail.code && (
                    <span className="rounded-md bg-white/10 px-2 py-0.5 font-mono text-[11px] font-bold text-white ring-1 ring-white/20">
                      Code: {detail.code}
                    </span>
                  )}
                </div>
                <h1 className="mt-1 text-xl font-bold tracking-tight sm:text-2xl lg:text-3xl text-white">
                  {detail.institution}
                </h1>
              </div>
            </div>

            {totalGroup && (
              <div className="flex items-center gap-3 shrink-0">
                <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-2.5 backdrop-blur-sm text-center">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-200">
                    Pass Rate
                  </span>
                  <div className="mt-0.5 text-xl font-black sm:text-2xl text-emerald-300">
                    {passPercentage}%
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6 sm:space-y-8 animate-fade-in">
          {/* Primary Result Stats Cards */}
          {totalGroup && (
            <div className="space-y-4">
              <div>
                <h2 className="text-base font-semibold text-slate-900 sm:text-lg">
                  Result Overview
                </h2>
                <p className="text-xs text-slate-500 sm:text-sm">
                  Official examination summary statistics for this institution
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5">
                {/* Enrolled */}
                <div className="group relative overflow-hidden rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-sm transition-all sm:rounded-2xl sm:p-5 sm:hover:-translate-y-0.5 sm:hover:shadow-md sm:hover:shadow-teal-900/5">
                  <div className="mb-2 inline-flex h-8 w-8 items-center justify-center rounded-lg bg-teal-500/10 text-teal-600 sm:mb-4 sm:h-10 sm:w-10 sm:rounded-xl">
                    <Users className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={2} />
                  </div>
                  <p className="text-xs font-medium sm:text-sm text-slate-600">
                    Total Enrolled
                  </p>
                  <p className="mt-0.5 text-2xl font-bold tracking-tight text-teal-700 sm:mt-1 sm:text-3xl">
                    {totalGroup.enrolled}
                  </p>
                  <p className="mt-1 hidden text-xs text-slate-400 sm:mt-2 sm:block">
                    Registered candidates
                  </p>
                </div>

                {/* Appeared */}
                <div className="group relative overflow-hidden rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-sm transition-all sm:rounded-2xl sm:p-5 sm:hover:-translate-y-0.5 sm:hover:shadow-md sm:hover:shadow-teal-900/5">
                  <div className="mb-2 inline-flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500/10 text-sky-600 sm:mb-4 sm:h-10 sm:w-10 sm:rounded-xl">
                    <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={2} />
                  </div>
                  <p className="text-xs font-medium sm:text-sm text-slate-600">
                    Appeared
                  </p>
                  <p className="mt-0.5 text-2xl font-bold tracking-tight text-sky-700 sm:mt-1 sm:text-3xl">
                    {totalGroup.appd}
                  </p>
                  <p className="mt-1 hidden text-xs text-slate-400 sm:mt-2 sm:block">
                    Sat in examination
                  </p>
                </div>

                {/* Passed */}
                <div className="group relative overflow-hidden rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-sm transition-all sm:rounded-2xl sm:p-5 sm:hover:-translate-y-0.5 sm:hover:shadow-md sm:hover:shadow-teal-900/5">
                  <div className="mb-2 inline-flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 sm:mb-4 sm:h-10 sm:w-10 sm:rounded-xl">
                    <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={2} />
                  </div>
                  <p className="text-xs font-medium sm:text-sm text-slate-600">
                    Passed
                  </p>
                  <p className="mt-0.5 text-2xl font-bold tracking-tight text-emerald-700 sm:mt-1 sm:text-3xl">
                    {totalGroup.pass}
                  </p>
                  <p className="mt-1 hidden text-xs text-slate-400 sm:mt-2 sm:block">
                    {passPercentage}% pass rate
                  </p>
                </div>

                {/* Failed */}
                <div className="group relative overflow-hidden rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-sm transition-all sm:rounded-2xl sm:p-5 sm:hover:-translate-y-0.5 sm:hover:shadow-md sm:hover:shadow-teal-900/5">
                  <div className="mb-2 inline-flex h-8 w-8 items-center justify-center rounded-lg bg-rose-500/10 text-rose-600 sm:mb-4 sm:h-10 sm:w-10 sm:rounded-xl">
                    <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={2} />
                  </div>
                  <p className="text-xs font-medium sm:text-sm text-slate-600">
                    Failed / Compt.
                  </p>
                  <p className="mt-0.5 text-2xl font-bold tracking-tight text-rose-700 sm:mt-1 sm:text-3xl">
                    {totalGroup.fail ?? 0}
                  </p>
                  <p className="mt-1 hidden text-xs text-slate-400 sm:mt-2 sm:block">
                    Did not clear all papers
                  </p>
                </div>

                {/* Average GPA */}
                <div className="group relative overflow-hidden rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-sm transition-all sm:rounded-2xl sm:p-5 sm:hover:-translate-y-0.5 sm:hover:shadow-md sm:hover:shadow-teal-900/5 col-span-2 sm:col-span-1">
                  <div className="mb-2 inline-flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 sm:mb-4 sm:h-10 sm:w-10 sm:rounded-xl">
                    <Award className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={2} />
                  </div>
                  <p className="text-xs font-medium sm:text-sm text-slate-600">
                    Institution GPA
                  </p>
                  <p className="mt-0.5 text-2xl font-bold tracking-tight text-amber-700 sm:mt-1 sm:text-3xl">
                    {Number(totalGroup.gpa).toFixed(2)}
                  </p>
                  <p className="mt-1 hidden text-xs text-slate-400 sm:mt-2 sm:block">
                    Overall cumulative average
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Secondary Stats & Performance Breakdown */}
          {totalGroup && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 ring-1 ring-slate-200">
                    <XCircle className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-xs font-medium text-slate-500">
                      Absent Students
                    </div>
                    <div className="text-xl font-bold text-slate-900">
                      {totalGroup.absent ?? 0}
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600 ring-1 ring-violet-200">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-xs font-medium text-slate-500">
                      Result Later (RL)
                    </div>
                    <div className="text-xl font-bold text-slate-900">
                      {totalGroup.rl ?? 0}
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 ring-1 ring-amber-200">
                    <AlertCircle className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-xs font-medium text-slate-500">
                      Unfair Means (UFM)
                    </div>
                    <div className="text-xl font-bold text-slate-900">
                      {totalGroup.ufm ?? 0}
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-600 ring-1 ring-teal-200">
                    <BookOpen className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-xs font-medium text-slate-500">
                      Academic Groups
                    </div>
                    <div className="text-xl font-bold text-slate-900">
                      {nonTotalGroups.length}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Group-Wise Breakdown */}
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold text-slate-900 sm:text-lg">
                  Academic Group Breakdown
                </h2>
                <p className="text-xs text-slate-500 sm:text-sm">
                  Detailed performance and grade distributions by field of study
                </p>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 ring-1 ring-slate-200">
                {nonTotalGroups.length} Groups
              </span>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {nonTotalGroups.length === 0 ? (
                <div className="col-span-2 rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
                  No individual group statistics available for this institution.
                </div>
              ) : (
                nonTotalGroups.map(([key, group]) => (
                  <div
                    key={key}
                    className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition-all hover:shadow-md hover:border-teal-200"
                  >
                    <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/70 px-5 py-3.5">
                      <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                        {formatGroupName(key)}
                      </h3>
                      <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700 ring-1 ring-emerald-200">
                        {Number(group.pass_percentage).toFixed(2)}% Pass
                      </span>
                    </div>

                    <div className="p-4 sm:p-5 space-y-4">
                      <div className="grid grid-cols-3 gap-2.5 text-xs sm:grid-cols-6 sm:gap-2">
                        <div className="rounded-xl bg-slate-50 p-2.5 text-center ring-1 ring-slate-200/60">
                          <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                            Enrolled
                          </span>
                          <span className="mt-0.5 block text-sm font-bold text-slate-900">
                            {group.enrolled}
                          </span>
                        </div>
                        <div className="rounded-xl bg-slate-50 p-2.5 text-center ring-1 ring-slate-200/60">
                          <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                            Appeared
                          </span>
                          <span className="mt-0.5 block text-sm font-bold text-slate-900">
                            {group.appd}
                          </span>
                        </div>
                        <div className="rounded-xl bg-emerald-50/60 p-2.5 text-center ring-1 ring-emerald-200/60">
                          <span className="block text-[10px] font-semibold uppercase tracking-wider text-emerald-600">
                            Passed
                          </span>
                          <span className="mt-0.5 block text-sm font-bold text-emerald-900">
                            {group.pass}
                          </span>
                        </div>
                        <div className="rounded-xl bg-rose-50/60 p-2.5 text-center ring-1 ring-rose-200/60">
                          <span className="block text-[10px] font-semibold uppercase tracking-wider text-rose-600">
                            Failed
                          </span>
                          <span className="mt-0.5 block text-sm font-bold text-rose-900">
                            {group.fail ?? 0}
                          </span>
                        </div>
                        <div className="rounded-xl bg-slate-50 p-2.5 text-center ring-1 ring-slate-200/60">
                          <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                            Absent
                          </span>
                          <span className="mt-0.5 block text-sm font-bold text-slate-900">
                            {group.absent}
                          </span>
                        </div>
                        <div className="rounded-xl bg-amber-50/60 p-2.5 text-center ring-1 ring-amber-200/60">
                          <span className="block text-[10px] font-semibold uppercase tracking-wider text-amber-700">
                            GPA
                          </span>
                          <span className="mt-0.5 block text-sm font-bold text-amber-900">
                            {Number(group.gpa).toFixed(2)}
                          </span>
                        </div>
                      </div>

                      {/* Grades Breakdown Chips */}
                      <div>
                        <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                          Grade Distribution
                        </div>
                        <div className="grid grid-cols-6 gap-1.5 text-xs">
                          <div className="rounded-lg bg-emerald-100/70 p-2 text-center ring-1 ring-emerald-300/60">
                            <span className="block text-[10px] font-bold text-emerald-800">
                              A1
                            </span>
                            <span className="mt-0.5 block text-sm font-bold text-emerald-950">
                              {group.grades.A1}
                            </span>
                          </div>
                          <div className="rounded-lg bg-emerald-50 p-2 text-center ring-1 ring-emerald-200">
                            <span className="block text-[10px] font-bold text-emerald-700">
                              A
                            </span>
                            <span className="mt-0.5 block text-sm font-bold text-emerald-900">
                              {group.grades.A}
                            </span>
                          </div>
                          <div className="rounded-lg bg-teal-50 p-2 text-center ring-1 ring-teal-200">
                            <span className="block text-[10px] font-bold text-teal-700">
                              B
                            </span>
                            <span className="mt-0.5 block text-sm font-bold text-teal-900">
                              {group.grades.B}
                            </span>
                          </div>
                          <div className="rounded-lg bg-sky-50 p-2 text-center ring-1 ring-sky-200">
                            <span className="block text-[10px] font-bold text-sky-700">
                              C
                            </span>
                            <span className="mt-0.5 block text-sm font-bold text-sky-900">
                              {group.grades.C}
                            </span>
                          </div>
                          <div className="rounded-lg bg-amber-50 p-2 text-center ring-1 ring-amber-200">
                            <span className="block text-[10px] font-bold text-amber-700">
                              D
                            </span>
                            <span className="mt-0.5 block text-sm font-bold text-amber-900">
                              {group.grades.D}
                            </span>
                          </div>
                          <div className="rounded-lg bg-slate-100 p-2 text-center ring-1 ring-slate-200">
                            <span className="block text-[10px] font-bold text-slate-600">
                              E
                            </span>
                            <span className="mt-0.5 block text-sm font-bold text-slate-900">
                              {group.grades.E}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Top Students Table */}
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold text-slate-900 sm:text-lg">
                  Top High Performers
                </h2>
                <p className="text-xs text-slate-500 sm:text-sm">
                  Leading students of this institution sorted by obtained marks
                </p>
              </div>
              <span className="rounded-full bg-teal-100 px-3 py-1 text-xs font-semibold text-teal-800 ring-1 ring-teal-200">
                Top {detail.topStudents.length} Students
              </span>
            </div>

            {detail.topStudents.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
                No individual student records found for this institution.
              </div>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead className="border-b border-slate-200/80 bg-slate-50 text-slate-600">
                      <tr>
                        <th className="px-4 py-3 font-semibold text-center w-14">
                          #
                        </th>
                        <th className="px-4 py-3 font-semibold">Roll No</th>
                        <th className="px-4 py-3 font-semibold">Student Name</th>
                        <th className="px-4 py-3 font-semibold text-right">
                          Marks
                        </th>
                        <th className="px-4 py-3 font-semibold text-center">
                          Grade
                        </th>
                        <th className="px-4 py-3 font-semibold text-center">
                          Status
                        </th>
                        <th className="px-4 py-3 font-semibold text-center w-24">
                          Portal
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {detail.topStudents.map((student, idx) => {
                        const fbiseLink = getFbiseUrl(
                          student.roll_no,
                          normalizedClass,
                        );

                        return (
                          <tr
                            key={student._id}
                            className="hover:bg-teal-50/30 transition-colors"
                          >
                            <td className="px-4 py-3 text-center font-bold text-slate-500">
                              {idx === 0 ? (
                                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-amber-100 text-amber-700 ring-1 ring-amber-200">
                                  <Trophy className="h-3.5 w-3.5" />
                                </span>
                              ) : idx === 1 ? (
                                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-slate-700 ring-1 ring-slate-300">
                                  2
                                </span>
                              ) : idx === 2 ? (
                                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-amber-50 text-amber-800 ring-1 ring-amber-200">
                                  3
                                </span>
                              ) : (
                                idx + 1
                              )}
                            </td>
                            <td className="px-4 py-3 font-mono font-medium text-slate-700">
                              {student.roll_no}
                            </td>
                            <td className="px-4 py-3 font-semibold text-slate-900">
                              {student.name}
                            </td>
                            <td className="px-4 py-3 text-right">
                              {student.marks !== null ? (
                                <span className="inline-flex rounded-md bg-emerald-50 px-2 py-0.5 font-bold text-emerald-700 ring-1 ring-emerald-200">
                                  {student.marks}
                                </span>
                              ) : (
                                <span className="text-slate-400">—</span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-center">
                              {student.grade ? (
                                <span className="inline-flex rounded-md bg-slate-100 px-2 py-0.5 font-semibold text-slate-700 ring-1 ring-slate-200">
                                  {student.grade}
                                </span>
                              ) : (
                                <span className="text-slate-400">—</span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span
                                className={cn(
                                  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1",
                                  getStatusColor(student.status),
                                )}
                              >
                                {student.status}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <a
                                href={fbiseLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-teal-700 shadow-sm transition hover:border-teal-300 hover:bg-teal-50"
                              >
                                View
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer Strip */}
      <footer className="mt-12 border-t border-slate-200/80 bg-white/50">
        <div className="border-b border-amber-200/60 bg-amber-50/70 px-4 py-3 sm:px-6">
          <div className="mx-auto flex max-w-7xl items-start gap-2.5">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
            <p className="text-[11px] leading-relaxed text-amber-800 sm:text-xs">
              <span className="font-semibold">Disclaimer:</span> This is an
              independent, unofficial result analysis tool and is{" "}
              <span className="font-semibold">
                not affiliated with, endorsed by, or associated with
              </span>{" "}
              the Federal Board of Intermediate &amp; Secondary Education
              (FBISE), Islamabad. Data is sourced from the official FBISE
              portal for educational and analytical purposes only.
            </p>
          </div>
        </div>

        <div className="px-4 py-4 sm:px-6 sm:py-5">
          <p className="text-center text-xs text-slate-400">
            FBISE Result Analyzer · Result data © Federal Board of Intermediate
            &amp; Secondary Education, Islamabad
          </p>
        </div>
      </footer>
    </div>
  );
}
