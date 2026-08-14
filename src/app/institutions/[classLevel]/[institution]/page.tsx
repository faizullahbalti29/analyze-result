import Link from "next/link";
import { notFound } from "next/navigation";
import { connectDB } from "@/lib/mongodb";
import { getStudentModel } from "@/lib/models/Student";
import { getTenthInstitutionModel } from "@/lib/models/TenthInstitution";
import { getTwelfthInstitutionModel } from "@/lib/models/TwelfthInstitution";
import type { ClassLevel, SubjectGroup } from "@/lib/types";

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

  const model = classLevel === "10th" ? getTenthInstitutionModel() : getTwelfthInstitutionModel();
  const docs = await model.find({} as any).lean();

  const match = docs.find((doc) => normalizeInstitutionName(String(doc.institution)) === target)
    ?? docs.find((doc) => normalizeInstitutionName(String(doc.institution)).includes(target))
    ?? docs.find((doc) => target.includes(normalizeInstitutionName(String(doc.institution))));

  if (!match) {
    return null;
  }

  const studentModel = getStudentModel(classLevel === "10th" ? "tenth" : "twelfth");
  const institutionRegexes = [
    { institution: { $regex: new RegExp(`^${escapeRegex(String(match.institution))}$`, "i") } },
    { institution: { $regex: new RegExp(`^\\s*\\(\\s*\\d+\\s*\\)\\s*${escapeRegex(normalizeInstitutionName(String(match.institution)))}\\s*$`, "i") } },
    { institution: { $regex: new RegExp(`^${escapeRegex(normalizeInstitutionName(String(match.institution)))}\\s*\\(\\s*\\d+\\s*\\)\\s*$`, "i") } },
  ];

  const topStudents = await studentModel.find({ $or: institutionRegexes }, { roll_no: 1, name: 1, marks: 1, grade: 1, status: 1 })
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
  const normalizedClass = classLevel === "10th" || classLevel === "12th" ? classLevel : null;

  if (!normalizedClass) {
    notFound();
  }

  const decodedInstitution = decodeURIComponent(institution ?? "");
  const detail = await getInstitutionDetail(normalizedClass, decodedInstitution);

  if (!detail) {
    notFound();
  }

  const totalGroup = detail.groups.total ?? Object.values(detail.groups).find((group) => "total" in { total: group }) ?? null;
  const nonTotalGroups = Object.entries(detail.groups).filter(([key]) => key !== "total");

  const formatGroupName = (key: string) => titleCase(key.replace(/_/g, "-"));

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-teal-50/30 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between gap-3">
          <Link
            href="/"
            className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm transition hover:border-teal-200 hover:text-teal-700"
          >
            ← Back to analyzer
          </Link>
          <span className="inline-flex items-center rounded-full bg-teal-100 px-3 py-1 text-xs font-semibold text-teal-700 ring-1 ring-teal-200">
            {normalizedClass} Institution
          </span>
        </div>

        <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_20px_60px_-30px_rgba(15,118,110,0.45)]">
          <div className="relative overflow-hidden bg-gradient-to-r from-teal-600 via-teal-500 to-cyan-500 p-6 text-white sm:p-8">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.28),_transparent_45%)]" />
            <div className="relative flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div className="max-w-3xl">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-teal-50/90">Institution overview</p>
                <h1 className="mt-3 text-2xl font-bold sm:text-3xl lg:text-4xl">{detail.institution}</h1>
              </div>

              <div className="rounded-2xl border border-white/20 bg-white/10 p-3 backdrop-blur-sm">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-teal-50/80">Code</p>
                <p className="mt-1 text-lg font-bold text-white">{detail.code || "—"}</p>
              </div>
            </div>
          </div>

          <div className="p-5 sm:p-6 lg:p-8">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
              {totalGroup ? (
                <>
                  <StatCard label="Enrolled" value={String(totalGroup.enrolled)} tone="teal" />
                  <StatCard label="Appeared" value={String(totalGroup.appd)} tone="sky" />
                  <StatCard label="Passed" value={String(totalGroup.pass)} tone="emerald" />
                  <StatCard label="Failed" value={String(totalGroup.fail)} tone="rose" />
                  <StatCard label="Pass %" value={`${Number(totalGroup.pass_percentage).toFixed(2)}%`} tone="amber" />
                </>
              ) : null}
            </div>

            <div className="mt-8 grid gap-4 lg:grid-cols-2">
              <SummaryPanel
                title="Overall stats"
                items={[
                  { label: "Absent", value: String(totalGroup?.absent ?? 0) },
                  { label: "RL", value: String(totalGroup?.rl ?? 0) },
                  { label: "UFM", value: String(totalGroup?.ufm ?? 0) },
                  { label: "GPA", value: totalGroup ? Number(totalGroup.gpa).toFixed(2) : "0.00" },
                ]}
              />
              <SummaryPanel
                title="Performance summary"
                items={[
                  { label: "Enrolled", value: String(totalGroup?.enrolled ?? 0) },
                  { label: "Appeared", value: String(totalGroup?.appd ?? 0) },
                  { label: "Pass", value: String(totalGroup?.pass ?? 0) },
                  { label: "Fail", value: String(totalGroup?.fail ?? 0) },
                ]}
              />
            </div>

            <div className="mt-8">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="text-lg font-semibold text-slate-900">Group-wise breakdown</h2>
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-600">
                  {nonTotalGroups.length} groups
                </span>
              </div>

              <div className="grid gap-4 xl:grid-cols-2">
                {nonTotalGroups.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-sm text-slate-600">
                    No group statistics available for this institution.
                  </div>
                ) : (
                  nonTotalGroups.map(([key, group]) => (
                    <GroupCard key={key} title={formatGroupName(key)} group={group as SubjectGroup} />
                  ))
                )}
              </div>
            </div>

            <div className="mt-8">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="text-lg font-semibold text-slate-900">Top students</h2>
                <span className="rounded-full bg-teal-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-teal-700">
                  {detail.topStudents.length} shown
                </span>
              </div>

              {detail.topStudents.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-sm text-slate-600">
                  An Error occurred while fetching top students for this institution.
                </div>
              ) : (
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <div className="overflow-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Roll No</th>
                          <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Name</th>
                          <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Marks</th>
                          <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Grade</th>
                          <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 bg-white">
                        {detail.topStudents.map((student) => (
                          <tr key={student._id} className="hover:bg-slate-50">
                            <td className="px-4 py-3 text-sm font-medium text-slate-700">{student.roll_no}</td>
                            <td className="px-4 py-3 text-sm font-medium text-slate-900">{student.name}</td>
                            <td className="px-4 py-3 text-right text-sm text-slate-700">{student.marks ?? "—"}</td>
                            <td className="px-4 py-3 text-right text-sm text-slate-700">{student.grade ?? "—"}</td>
                            <td className="px-4 py-3 text-right text-sm text-slate-700">{student.status}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function StatCard({ label, value, tone }: { label: string; value: string; tone: "teal" | "sky" | "emerald" | "rose" | "amber" }) {
  const toneClasses: Record<string, string> = {
    teal: "border-teal-200 bg-teal-50 text-teal-800",
    sky: "border-sky-200 bg-sky-50 text-sky-800",
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-800",
    rose: "border-rose-200 bg-rose-50 text-rose-800",
    amber: "border-amber-200 bg-amber-50 text-amber-800",
  };

  return (
    <div className={`rounded-2xl border p-4 shadow-sm ${toneClasses[tone]}`}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] opacity-80">{label}</p>
      <p className="mt-2 text-2xl font-bold">{value}</p>
    </div>
  );
}

function SummaryPanel({ title, items }: { title: string; items: { label: string; value: string }[] }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
      <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-700">{title}</h3>
      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        {items.map((item) => (
          <div key={item.label} className="rounded-xl bg-white px-3 py-2.5 ring-1 ring-slate-200">
            <span className="block text-[10px] font-medium uppercase tracking-[0.16em] text-slate-500">{item.label}</span>
            <span className="mt-1.5 block text-lg font-bold text-slate-900">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function GroupCard({ title, group }: { title: string; group: SubjectGroup }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm ring-1 ring-slate-100">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-base font-semibold text-slate-900">{title}</h3>
        <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-600">
          {Number(group.pass_percentage).toFixed(2)}%
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <Metric label="Enrolled" value={group.enrolled} />
        <Metric label="Appeared" value={group.appd} />
        <Metric label="Passed" value={group.pass} />
        <Metric label="Failed" value={group.fail} />
        <Metric label="Absent" value={group.absent} />
        <Metric label="GPA" value={Number(group.gpa).toFixed(2)} />
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 text-xs sm:grid-cols-6">
        <GradePill label="A1" value={group.grades.A1} />
        <GradePill label="A" value={group.grades.A} />
        <GradePill label="B" value={group.grades.B} />
        <GradePill label="C" value={group.grades.C} />
        <GradePill label="D" value={group.grades.D} />
        <GradePill label="E" value={group.grades.E} />
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-xl bg-slate-50 px-3 py-2 ring-1 ring-slate-200">
      <span className="block text-[10px] font-medium uppercase tracking-[0.15em] text-slate-500">{label}</span>
      <span className="mt-1.5 block text-base font-bold text-slate-900">{value}</span>
    </div>
  );
}

function GradePill({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg bg-slate-100 px-2 py-2 text-center ring-1 ring-slate-200">
      <div className="text-[9px] font-semibold uppercase tracking-[0.14em] text-slate-500">{label}</div>
      <div className="mt-1 text-sm font-bold text-slate-800">{value}</div>
    </div>
  );
}
