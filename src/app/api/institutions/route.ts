import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getStudentModel } from "@/lib/models/Student";
import Fuse from "fuse.js";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const classLevel = searchParams.get("class");
    const query = searchParams.get("q")?.trim();

    if (classLevel !== "9th" && classLevel !== "10th" && classLevel !== "11th" && classLevel !== "12th") {
      return NextResponse.json(
        { error: 'Query param "class" must be "9th", "10th", "11th", or "12th"' },
        { status: 400 },
      );
    }

    await connectDB();

    const collectionMap = {
      "9th": "nineth",
      "10th": "tenth",
      "11th": "eleventh",
      "12th": "twelfth",
    } as const;

    const StudentModel = getStudentModel(collectionMap[classLevel as keyof typeof collectionMap]);

    const distinctInstitutions = await StudentModel.distinct<string>("institution", {
      institution: { $exists: true, $ne: "" },
    });

    const normalizedInstitutions = distinctInstitutions
      .filter((name): name is string => Boolean(name))
      .map((name) => ({ _id: name, name }));

    let institutions = normalizedInstitutions;

    if (query) {
      const fuse = new Fuse(normalizedInstitutions, {
        keys: ["name"],
        threshold: 0.4,
        distance: 200,
        minMatchCharLength: 1,
        shouldSort: true,
      });

      institutions = fuse.search(query).slice(0, 50).map((res) => res.item);
    } else {
      institutions = normalizedInstitutions
        .sort((a, b) => a.name.localeCompare(b.name))
        .slice(0, 50);
    }

    return NextResponse.json({ institutions });
  } catch (error) {
    console.error("[GET /api/institutions]", error);
    return NextResponse.json(
      { error: "Failed to fetch institutions" },
      { status: 500 },
    );
  }
}

