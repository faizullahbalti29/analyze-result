import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getStudentModel } from "@/lib/models/Student";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const classLevel = searchParams.get("class");
    const institution = searchParams.get("institution");

    if (classLevel !== "9th" && classLevel !== "10th" && classLevel !== "11th" && classLevel !== "12th") {
      return NextResponse.json(
        { error: 'Query param "class" must be "9th", "10th", "11th", or "12th"' },
        { status: 400 },
      );
    }

    if (!institution) {
      return NextResponse.json(
        { error: 'Query param "institution" is required' },
        { status: 400 },
      );
    }

    const status = searchParams.get("status") ?? "all";
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
    const pageSize = 50;

    await connectDB();

    const collectionMap = {
      "9th": "nineth",
      "10th": "tenth",
      "11th": "eleventh",
      "12th": "twelfth",
    } as const;

    const StudentModel = getStudentModel(collectionMap[classLevel as keyof typeof collectionMap]);

    const filter: Record<string, unknown> = { institution };

    if (status !== "all") {
      switch (status) {
        case "PASS":
          filter.status = "PASS";
          break;
        case "COMPT.":
          filter.status = "COMPT.";
          break;
        case "ABSENT":
          filter.status = "Absent";
          break;
        case "other":
          filter.status = { $nin: ["PASS", "COMPT.", "Absent"] };
          break;
        default:
          return NextResponse.json(
            { error: 'Query param "status" must be one of "all", "PASS", "COMPT.", "ABSENT", or "other"' },
            { status: 400 },
          );
      }
    }

    const total = await StudentModel.countDocuments(filter);
    const docs = await StudentModel
      .find(filter)
      .sort({ marks: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .lean();

    const students = docs.map((doc) => ({
      _id: String(doc._id),
      roll_no: doc.roll_no,
      name: doc.name,
      status: doc.status,
      marks: doc.marks ?? null,
      grade: doc.grade ?? null,
      remarks: doc.remarks ?? null,
      institution: doc.institution,
    }));

    return NextResponse.json({ students, total, page, pageSize });
  } catch (error) {
    console.error("[GET /api/students]", error);
    return NextResponse.json(
      { error: "Failed to fetch students" },
      { status: 500 },
    );
  }
}
