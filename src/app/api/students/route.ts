import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getStudentModel } from "@/lib/models/Student";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const classLevel = searchParams.get("class");
    const institution = searchParams.get("institution");

    if (classLevel !== "9th" && classLevel !== "10th") {
      return NextResponse.json(
        { error: 'Query param "class" must be "9th" or "10th"' },
        { status: 400 },
      );
    }

    if (!institution) {
      return NextResponse.json(
        { error: 'Query param "institution" is required' },
        { status: 400 },
      );
    }

    await connectDB();

    const collection = classLevel === "9th" ? "nineth" : "tenth";
    const StudentModel = getStudentModel(collection);

    const docs = await StudentModel.find({ institution }).lean();

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

    return NextResponse.json({ students });
  } catch (error) {
    console.error("[GET /api/students]", error);
    return NextResponse.json(
      { error: "Failed to fetch students" },
      { status: 500 },
    );
  }
}
