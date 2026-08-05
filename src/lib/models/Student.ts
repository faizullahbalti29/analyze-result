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
 * Returns the Mongoose model bound to the given collection name
 * (either "nineth" or "tenth"). We create a new model each time
 * to avoid the "Cannot overwrite model" error across hot-reloads,
 * while still leveraging the existing model when it already exists.
 */
export function getStudentModel(collection: "nineth" | "tenth"): Model<StudentDocument> {
  const modelName = collection === "nineth" ? "NinethStudent" : "TenthStudent";
  if (mongoose.models[modelName]) {
    return mongoose.models[modelName] as Model<StudentDocument>;
  }
  return mongoose.model<StudentDocument>(modelName, studentSchema, collection);
}
