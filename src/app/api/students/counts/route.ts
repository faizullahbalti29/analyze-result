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

    const [institutionTotal, passCount, compartmentCount, absentCount] = await Promise.all([
      StudentModel.countDocuments({ institution }),
      StudentModel.countDocuments({ institution, status: "PASS" }),
      StudentModel.countDocuments({
        institution,
        status: { $in: ["COMPT.", "COMP", "COMPARTMENT", "FAIL"] },
      }),
      StudentModel.countDocuments({ institution, status: "Absent" }),
    ]);

    const stats = {
      total: institutionTotal,
      pass: passCount,
      compartment: compartmentCount,
      absent: absentCount,
      other: Math.max(0, institutionTotal - passCount - compartmentCount - absentCount),
    };

    return NextResponse.json({ stats });
  } catch (error) {
    console.error("[GET /api/students/counts]", error);
    return NextResponse.json(
      { error: "Failed to fetch student counts" },
      { status: 500 },
    );
  }
}
