import mongoose, { Schema, type Model } from "mongoose";

/**
 * nineth_institutions uses field: "institution"
 * tenth_institutions uses field:  "name"
 *
 * Both are stored here so we can project / normalise in the API route.
 */
export interface InstitutionDocument extends mongoose.Document {
  institution?: string; // nineth_institutions
  name?: string;        // tenth_institutions
}

const institutionSchema = new Schema<InstitutionDocument>(
  {
    institution: { type: String },
    name: { type: String },
  },
  { timestamps: false, strict: false },
);

export function getInstitutionModel(
  collection: "nineth_institutions" | "tenth_institutions",
): Model<InstitutionDocument> {
  const modelName =
    collection === "nineth_institutions"
      ? "NinethInstitution"
      : "TenthInstitution";

  if (mongoose.models[modelName]) {
    return mongoose.models[modelName] as Model<InstitutionDocument>;
  }
  return mongoose.model<InstitutionDocument>(
    modelName,
    institutionSchema,
    collection,
  );
}
