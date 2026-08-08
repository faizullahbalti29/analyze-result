import { createExcelBuffer } from "@/app/services/export";
import { getStudentModel } from "@/lib/models/Student";
import { connectDB } from "@/lib/mongodb";
import { NextResponse } from "next/server";

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

        const collection =
            classLevel === "9th" ? "nineth" : "tenth";
        const StudentModel = getStudentModel(collection);

        const docs = await StudentModel.find({ institution })
            .select("-__v")
            .lean();
        const students = docs.map((doc) => ({
            "Roll no": doc.roll_no,
            Name: doc.name,
            Status: doc.status,
            Marks: doc.marks ?? null,
            Grade: doc.grade ?? null,
            Remarks: doc.remarks ?? null,
        }));

        const passCount = students.filter((student) => student.Status === "PASS").length;
        const compartmentCount = students.filter((student) => student.Status === "COMPT.").length;
        const absentCount = students.filter((student) => student.Status === "Absent").length;
        const otherCount = students.length - passCount - compartmentCount - absentCount;

        const headerRows = [
            ["Institution Name:", institution],
            ["Total Students:", students.length],
            ["Pass:", passCount],
            ["Failed/COMPT.:", compartmentCount],
            ["Absent:", absentCount],
            ["Other:", otherCount],
            [],
        ];

        const excel = createExcelBuffer(students, `${classLevel} Results`, headerRows);

        return new Response(excel, {
            headers: {
                "Content-Type":
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                "Content-Disposition":
                    'attachment; filename="students.xlsx"',
            },
        });
    } catch (error) {
        console.error("[GET /api/institutions]", error);
        return NextResponse.json(
            { error: "Failed to fetch institutions" },
            { status: 500 },
        );
    }
}