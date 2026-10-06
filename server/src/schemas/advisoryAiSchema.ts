import { Type, Schema } from '@google/genai';

export const cropAdvisoryResponseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    executive_summary: {
      type: Type.STRING,
      description: "Concise summary of soil suitability, macro limitations, and primary plan objective.",
    },
    soil_health_assessment: {
      type: Type.OBJECT,
      properties: {
        ph_status: { type: Type.STRING, description: "e.g., Strongly Acidic, Optimal, Alkaline" },
        ph_impact_comment: { type: Type.STRING, description: "Effect of this pH on nutrient availability." },
        npk_balance: {
          type: Type.OBJECT,
          properties: {
            nitrogen: { type: Type.STRING, enum: ["Deficient", "Optimal", "Excess"] },
            phosphorus: { type: Type.STRING, enum: ["Deficient", "Optimal", "Excess"] },
            potassium: { type: Type.STRING, enum: ["Deficient", "Optimal", "Excess"] },
          },
          required: ["nitrogen", "phosphorus", "potassium"],
        },
        remediation_steps: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "Steps like lime application, gypsum, sulfur, or green manuring.",
        },
      },
      required: ["ph_status", "ph_impact_comment", "npk_balance", "remediation_steps"],
    },
    fertilizer_schedule: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          growth_stage: { type: Type.STRING },
          days_after_sowing: { type: Type.STRING },
          fertilizer_name: { type: Type.STRING, description: "e.g., Urea, DAP, SOP, MOP, 19:19:19" },
          dose_per_acre: { type: Type.STRING },
          application_method: { type: Type.STRING, description: "Basal, Top Dressing, Fertigation, Foliar Spray" },
          precautions: { type: Type.STRING },
        },
        required: ["growth_stage", "days_after_sowing", "fertilizer_name", "dose_per_acre", "application_method"],
      },
    },
    irrigation_management: {
      type: Type.OBJECT,
      properties: {
        frequency_days: { type: Type.STRING },
        critical_water_stages: { type: Type.ARRAY, items: { type: Type.STRING } },
        water_saving_tips: { type: Type.STRING },
      },
      required: ["frequency_days", "critical_water_stages", "water_saving_tips"],
    },
    integrated_pest_disease_defense: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          target_threat: { type: Type.STRING },
          preventive_measure: { type: Type.STRING },
          biological_control: { type: Type.STRING },
          chemical_emergency_control: { type: Type.STRING },
          phi_days: { type: Type.INTEGER, description: "Pre-Harvest Interval in days" },
        },
        required: ["target_threat", "preventive_measure", "biological_control", "chemical_emergency_control", "phi_days"],
      },
    },
    estimated_yield_potential: {
      type: Type.OBJECT,
      properties: {
        range: { type: Type.STRING, description: "e.g., 22-26 Quintals per Acre" },
        key_limiting_factor: { type: Type.STRING },
      },
      required: ["range", "key_limiting_factor"],
    },
  },
  required: [
    "executive_summary",
    "soil_health_assessment",
    "fertilizer_schedule",
    "irrigation_management",
    "integrated_pest_disease_defense",
    "estimated_yield_potential",
  ],
};
