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
            roll_no: doc.roll_no,
            name: doc.name,
            status: doc.status,
            marks: doc.marks ?? null,
            grade: doc.grade ?? null,
            remarks: doc.remarks ?? null,
            // institution: doc.institution,
        }));

        const passCount = students.filter((student) => student.status === "PASS").length;
        const compartmentCount = students.filter((student) => student.status === "COMPT.").length;
        const absentCount = students.filter((student) => student.status === "Absent").length;
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