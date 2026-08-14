import mongoose, { Schema, type Model } from "mongoose";
import type { TwelfthInstitution } from "@/lib/types";

type TwelfthInstitutionDocument = Omit<TwelfthInstitution, "_id"> & mongoose.Document;

const gradesSchema = new Schema(
  {
    A1: { type: Number, default: 0 },
    A: { type: Number, default: 0 },
    B: { type: Number, default: 0 },
    C: { type: Number, default: 0 },
    D: { type: Number, default: 0 },
    E: { type: Number, default: 0 },
  },
  { _id: false },
);

const subjectGroupSchema = new Schema(
  {
    enrolled: { type: Number, default: 0 },
    absent: { type: Number, default: 0 },
    appd: { type: Number, default: 0 },
    rl: { type: Number, default: 0 },
    ufm: { type: Number, default: 0 },
    fail: { type: Number, default: 0 },
    pass: { type: Number, default: 0 },
    grades: { type: gradesSchema, required: true },
    pass_percentage: { type: Number, default: 0 },
    gpa: { type: Number, default: 0 },
  },
  { _id: false },
);

const groupsSchema = new Schema(
  {
    "pre-medical": { type: subjectGroupSchema, required: true },
    "pre-engineering": { type: subjectGroupSchema, required: true },
    "science-general": { type: subjectGroupSchema, required: true },
    total: { type: subjectGroupSchema, required: true },
  },
  { _id: false },
);

const twelfthInstitutionSchema = new Schema<TwelfthInstitutionDocument>(
  {
    code: { type: String, required: true },
    institution: { type: String, required: true },
    groups: { type: groupsSchema, required: true },
  },
  { timestamps: false },
);

export function getTwelfthInstitutionModel(): Model<TwelfthInstitutionDocument> {
  const modelName = "TwelfthInstitution";
  if (mongoose.models[modelName]) {
    return mongoose.models[modelName] as Model<TwelfthInstitutionDocument>;
  }
  return mongoose.model<TwelfthInstitutionDocument>(modelName, twelfthInstitutionSchema, "twelfth_institutions");
}
