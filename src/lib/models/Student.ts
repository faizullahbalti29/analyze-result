import mongoose, { Schema, type Model } from "mongoose";
import type { Student } from "@/lib/types";

type StudentDocument = Omit<Student, "_id"> & mongoose.Document;

const studentSchema = new Schema<StudentDocument>(
  {
    roll_no: { type: String, required: true },
    name: { type: String, required: true },
    status: { type: String, required: true },
    marks: { type: Number, default: null },
    grade: { type: String, default: null },
    remarks: { type: String, default: null },
    institution: { type: String, required: true },
  },
  { timestamps: false },
);

/**
 * Returns the Mongoose model bound to the given collection name.
 * We create a new model each time to avoid the "Cannot overwrite model" error
 * across hot-reloads while reusing existing ones when available.
 */
export function getStudentModel(
  collection: "nineth" | "tenth" | "eleventh" | "twelfth",
): Model<StudentDocument> {
  const modelNameMap: Record<typeof collection, string> = {
    nineth: "NinethStudent",
    tenth: "TenthStudent",
    eleventh: "EleventhStudent",
    twelfth: "TwelfthStudent",
  };

  const modelName = modelNameMap[collection];
  if (mongoose.models[modelName]) {
    return mongoose.models[modelName] as Model<StudentDocument>;
  }
  return mongoose.model<StudentDocument>(modelName, studentSchema, collection);
}
