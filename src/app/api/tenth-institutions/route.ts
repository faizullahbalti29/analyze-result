import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getTenthInstitutionModel } from "@/lib/models/TenthInstitution";

function escapeRegex(input: string) {
  return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const classLevel = searchParams.get("class");
    const query = searchParams.get("q")?.trim() ?? "";

    if (classLevel && classLevel !== "10th") {
      return NextResponse.json(
        { error: 'Institution comparison is only available for class "10th"' },
        { status: 400 },
      );
    }

    await connectDB();
    const TenthInstitutionModel = getTenthInstitutionModel();

    const filter: Record<string, unknown> = {};
    if (query) {
      filter.institution = { $regex: new RegExp(escapeRegex(query), "i") };
    }

    const docs = await TenthInstitutionModel.find(filter, { institution: 1 })
      .sort({ institution: 1 })
      .limit(100)
      .lean();

    const institutions = docs.map((doc) => ({
      _id: String(doc._id),
      name: doc.institution,
    }));

    return NextResponse.json({ institutions });
  } catch (error) {
    console.error("[GET /api/tenth-institutions]", error);
    return NextResponse.json(
      { error: "Failed to fetch tenth institution list" },
      { status: 500 },
    );
  }
}
