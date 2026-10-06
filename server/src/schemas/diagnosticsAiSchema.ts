import { Type, Schema } from '@google/genai';

export const cropDoctorDiagnosticSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    is_plant_tissue: {
      type: Type.BOOLEAN,
      description: "True if image contains identifiable plant/crop tissue. False if irrelevant or non-agricultural.",
    },
    diagnosed_disease_or_pest: {
      type: Type.STRING,
      description: "Common and scientific name of disease, pest, or physiological disorder (or 'Healthy Plant').",
    },
    pathogen_classification: {
      type: Type.STRING,
      enum: ["Fungal", "Bacterial", "Viral", "Insect Pest", "Nutrient Deficiency", "Healthy", "Unknown"],
    },
    confidence_score: {
      type: Type.NUMBER,
      description: "Model confidence score between 0.00 and 1.00",
    },
    severity: {
      type: Type.STRING,
      enum: ["low", "moderate", "high", "critical"],
    },
    observed_symptoms: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Visual abnormalities identified in image.",
    },
    immediate_organic_remedies: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Bio-fungicides, neem formulations, predator insects, or cultural sanitation.",
    },
    chemical_interventions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          commercial_or_active_name: { type: Type.STRING },
          recommended_dosage_per_liter: { type: Type.STRING },
          application_instructions: { type: Type.STRING },
          withholding_period_phi_days: { type: Type.INTEGER },
        },
        required: ["commercial_or_active_name", "recommended_dosage_per_liter", "application_instructions", "withholding_period_phi_days"],
      },
    },
    long_term_prevention: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Crop rotation, resistant cultivars, solarization, seed treatments.",
    },
  },
  required: [
    "is_plant_tissue",
    "diagnosed_disease_or_pest",
    "pathogen_classification",
    "confidence_score",
    "severity",
    "observed_symptoms",
    "immediate_organic_remedies",
    "chemical_interventions",
    "long_term_prevention",
  ],
};
