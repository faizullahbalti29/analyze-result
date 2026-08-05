import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getInstitutionModel } from "@/lib/models/Institution";
import Fuse from "fuse.js";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const classLevel = searchParams.get("class");
    const query = searchParams.get("q")?.trim();

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

    if (query) {
      // Fetch all institutions from collection to perform fuzzy search on full dataset
      const docs = await InstitutionModel.find({}).lean();
      const allInstitutions = docs.map((doc) => ({
        _id: String(doc._id),
        name:
          classLevel === "9th"
            ? (doc.institution ?? "")
            : (doc.name ?? ""),
      }));

      const fuse = new Fuse(allInstitutions, {
        keys: ["name"],
        threshold: 0.4,
        distance: 200,
        minMatchCharLength: 1,
        shouldSort: true,
      });

      const results = fuse.search(query);
      const matched = results.slice(0, 50).map((res) => res.item);
      return NextResponse.json({ institutions: matched });
    }

    // Default: fetch first 50 institutions when no query is provided
    const docs = await InstitutionModel.find({}).limit(50).lean();
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

