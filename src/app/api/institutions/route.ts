import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getInstitutionModel } from "@/lib/models/Institution";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const classLevel = searchParams.get("class");

    if (classLevel !== "9th" && classLevel !== "10th") {
      return NextResponse.json(
        { error: 'Query param "class" must be "9th" or "10th"' },
        { status: 400 },
      );
    }

    await connectDB();

    const collection =
      classLevel === "9th" ? "nineth_institutions" : "tenth_institutions";

    const InstitutionModel = getInstitutionModel(collection);
    const docs = await InstitutionModel.find({}).lean();

    // Normalise to { _id: string; name: string }
    // nineth_institutions stores the name in "institution" field
    // tenth_institutions stores the name in "name" field
    const institutions = docs.map((doc) => ({
      _id: String(doc._id),
      name:
        classLevel === "9th"
          ? (doc.institution ?? "")
          : (doc.name ?? ""),
    }));

    return NextResponse.json({ institutions });
  } catch (error) {
    console.error("[GET /api/institutions]", error);
    return NextResponse.json(
      { error: "Failed to fetch institutions" },
      { status: 500 },
    );
  }
}
