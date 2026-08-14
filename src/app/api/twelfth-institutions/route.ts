import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getTwelfthInstitutionModel } from "@/lib/models/TwelfthInstitution";

function escapeRegex(input: string) {
  return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const classLevel = searchParams.get("class");
    const query = searchParams.get("q")?.trim() ?? "";

    if (classLevel && classLevel !== "12th") {
      return NextResponse.json(
        { error: 'Institution comparison is only available for class "12th"' },
        { status: 400 },
      );
    }

    await connectDB();
    const TwelfthInstitutionModel = getTwelfthInstitutionModel();

    const filter: Record<string, unknown> = {};
    if (query) {
      filter.institution = { $regex: new RegExp(escapeRegex(query), "i") };
    }

    const docs = await TwelfthInstitutionModel.find(filter, { institution: 1 })
      .sort({ institution: 1 })
      .limit(100)
      .lean();

    const institutions = docs.map((doc) => ({
      _id: String(doc._id),
      name: doc.institution,
    }));

    return NextResponse.json({ institutions });
  } catch (error) {
    console.error("[GET /api/twelfth-institutions]", error);
    return NextResponse.json(
      { error: "Failed to fetch twelfth institution list" },
      { status: 500 },
    );
  }
}
