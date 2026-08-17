import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getStudentModel } from "@/lib/models/Student";
import type { PositionResult, PositionStudent } from "@/lib/types";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const classLevel = searchParams.get("class");
    const marksParam = searchParams.get("marks");
    const institution = searchParams.get("institution")?.trim();
    const region = searchParams.get("region")?.trim().toLowerCase();
    const scope = searchParams.get("scope")?.trim().toLowerCase();

    if (
      classLevel !== "9th" &&
      classLevel !== "10th" &&
      classLevel !== "11th" &&
      classLevel !== "12th"
    ) {
      return NextResponse.json(
        { error: 'Query param "class" must be "9th", "10th", "11th", or "12th"' },
        { status: 400 },
      );
    }

    if (!marksParam || isNaN(Number(marksParam))) {
      return NextResponse.json(
        { error: 'Query param "marks" is required and must be a valid number' },
        { status: 400 },
      );
    }

    const maxMarks = classLevel === "9th" || classLevel === "11th" ? 560 : 1100;
    const marks = Math.round(Number(marksParam));

    if (marks < 0 || marks > maxMarks) {
      return NextResponse.json(
        {
          error: `Marks must be between 0 and ${maxMarks} for Class ${classLevel}`,
        },
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

    const StudentModel = getStudentModel(
      collectionMap[classLevel as keyof typeof collectionMap],
    );

    const GB_REGEX_INCLUSION =
      "\\b(gilgit|baltistan|skardu|chilas|khaplu|shigar|kharmang|ghanche|astore|ghizer|hunza|nagar|gupis|yasin|phander|ishkoman|danyor|jaglot|aliabad|karimabad|gojal|shinaki|chalt|darel|tangir|babusar|goharabad|punial|gulabpur|gultari|roundu|gamba|daghoni|mashabrum|chorbat|keris|haldi|shounter|jutial|gilg|danyore|office sharote|post office rahimabad|village choungrah|begum viqar-un-nisa noon)\\b";

    const GB_REGEX_EXCLUSION =
      "\\b(irshad nagar|st\\.5 block-3, aliabad|village raazi dero taluka, gamba)\\b";

    const baseFilter: Record<string, unknown> = {};
    const isGB = region === "gb" || scope === "gb";

    if (institution) {
      baseFilter.institution = institution;
    } else if (isGB) {
      baseFilter.$and = [
        {
          institution: {
            $regex: GB_REGEX_INCLUSION,
            $options: "i",
          },
        },
        {
          institution: {
            $not: {
              $regex: GB_REGEX_EXCLUSION,
              $options: "i",
            },
          },
        },
      ];
    }

    const [
      higherCount,
      equalCount,
      lowerCount,
      totalWithMarks,
      topDoc,
      higherDocs,
    ] = await Promise.all([
      StudentModel.countDocuments({
        ...baseFilter,
        marks: { $gt: marks },
      }),
      StudentModel.countDocuments({
        ...baseFilter,
        marks: marks,
      }),
      StudentModel.countDocuments({
        ...baseFilter,
        marks: { $lt: marks, $ne: null },
      }),
      StudentModel.countDocuments({
        ...baseFilter,
        marks: { $ne: null },
      }),
      StudentModel.findOne({
        ...baseFilter,
        marks: { $ne: null },
      })
        .sort({ marks: -1 })
        .select("roll_no name marks institution")
        .lean(),
      StudentModel.find({
        ...baseFilter,
        marks: { $gt: marks },
      })
        .sort({ marks: -1 })
        .limit(50)
        .select("roll_no name marks grade institution")
        .lean(),
    ]);

    const position = higherCount + 1;
    const percentile =
      totalWithMarks > 0
        ? Number((((totalWithMarks - higherCount) / totalWithMarks) * 100).toFixed(2))
        : 100;
    const topPercentage =
      totalWithMarks > 0
        ? Number(((position / totalWithMarks) * 100).toFixed(2))
        : 0;

    const higherStudents: PositionStudent[] = higherDocs.map((doc) => ({
      _id: String(doc._id),
      roll_no: doc.roll_no,
      name: doc.name,
      marks: doc.marks as number,
      grade: doc.grade ?? null,
      institution: doc.institution,
    }));

    const result: PositionResult = {
      position,
      higherCount,
      equalCount,
      lowerCount,
      totalWithMarks,
      marks,
      percentile,
      topPercentage,
      topScore: topDoc?.marks ?? null,
      topStudent: topDoc
        ? {
          roll_no: topDoc.roll_no,
          name: topDoc.name,
          marks: topDoc.marks as number,
          institution: topDoc.institution,
        }
        : null,
      higherStudents,
      scope: isGB ? "gb" : institution ? "institution" : "board",
      region: isGB ? "Gilgit-Baltistan" : null,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("[GET /api/students/position]", error);
    return NextResponse.json(
      { error: "Failed to calculate position" },
      { status: 500 },
    );
  }
}
