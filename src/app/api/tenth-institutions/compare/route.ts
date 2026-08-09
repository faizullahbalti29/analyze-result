import Fuse from "fuse.js";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getStudentModel } from "@/lib/models/Student";
import { getTenthInstitutionModel } from "@/lib/models/TenthInstitution";

function escapeRegex(input: string): string {
  return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function computePercentage(marks: number | null): number | null {
  if (marks === null || Number.isNaN(marks)) {
    return null;
  }
  return Math.round((marks / 1100) * 10000) / 100;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const institutions = searchParams.getAll("institution").filter(Boolean);

    if (institutions.length === 0) {
      return NextResponse.json(
        { error: "At least one institution must be selected for comparison" },
        { status: 400 },
      );
    }

    if (institutions.length > 5) {
      return NextResponse.json(
        { error: "You can compare up to 5 institutions at once" },
        { status: 400 },
      );
    }

    await connectDB();
    const TenthInstitutionModel = getTenthInstitutionModel();
    const StudentModel = getStudentModel("tenth");

    const requestedInstitutions = Array.from(new Set(institutions));

    const searchFilters = requestedInstitutions.map((institution) => {
      const prefix = institution.slice(0, 40);
      return { institution: { $regex: new RegExp(`^${escapeRegex(prefix)}`, "i") } };
    });

    const docs = await TenthInstitutionModel.find(
      searchFilters.length > 0 ? { $or: searchFilters } : {},
    ).lean();

    const fuse = new Fuse(docs, {
      keys: ["institution"],
      threshold: 0.5,
      distance: 150,
      ignoreLocation: true,
    });

    const results = await Promise.all(
      requestedInstitutions.map(async (institution) => {
        const exactDoc = docs.find((item) => item.institution === institution);
        const bestMatch =
          exactDoc ||
          fuse.search(institution, { limit: 1 })[0]?.item ||
          null;

        if (!bestMatch) {
          return null;
        }

        const studentInstitution = bestMatch.institution;
        let topStudents = await StudentModel.find(
          { institution: { $regex: new RegExp(`^${escapeRegex(studentInstitution)}$`, "i") } },
          { roll_no: 1, name: 1, marks: 1 },
        )
          .sort({ marks: -1, name: 1 })
          .limit(3)
          .lean();

        if (topStudents.length === 0) {
          const studentInstitutionNames = await StudentModel.distinct<string>("institution", {
            institution: { $exists: true, $ne: "" },
          });
          const studentFuse = new Fuse(studentInstitutionNames, {
            threshold: 0.4,
            distance: 150,
            ignoreLocation: true,
          });
          const studentBestMatch = studentFuse.search(studentInstitution, { limit: 1 })[0]?.item;

          if (studentBestMatch) {
            const matchedInstitution = String(studentBestMatch);
            topStudents = await StudentModel.find(
              { institution: { $regex: new RegExp(`^${escapeRegex(matchedInstitution)}$`, "i") } },
              { roll_no: 1, name: 1, marks: 1 },
            )
              .sort({ marks: -1, name: 1 })
              .limit(3)
              .lean();
          }
        }

        return {
          institution: bestMatch.institution,
          code: bestMatch.code,
          groups: bestMatch.groups,
          topStudents: topStudents.map((student) => ({
            _id: String(student._id),
            roll_no: student.roll_no,
            name: student.name,
            marks: student.marks ?? null,
            percentage: computePercentage(student.marks ?? null),
          })),
        };
      }),
    );

    return NextResponse.json({
      results: results.filter(
        (result): result is NonNullable<typeof result> => Boolean(result),
      ),
    });
  } catch (error) {
    console.error("[GET /api/tenth-institutions/compare]", error);
    return NextResponse.json(
      { error: "Failed to fetch institution comparison" },
      { status: 500 },
    );
  }
}
