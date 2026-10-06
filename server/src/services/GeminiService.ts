import { ai, MODEL_NAMES } from '../config/gemini';
import { cropAdvisoryResponseSchema } from '../schemas/advisoryAiSchema';
import { cropDoctorDiagnosticSchema } from '../schemas/diagnosticsAiSchema';

export class GeminiService {
  static async generateCropPlan(input: {
    cropName: string;
    variety?: string;
    growthStage: string;
    sizeAcres: number;
    soilType: string;
    irrigationMethod: string;
    climateZone: string;
    soilPh: number;
    n: number;
    p: number;
    k: number;
    organicMatter?: number;
  }) {
    const prompt = `
Generate an exhaustive, scientifically rigorous Agronomic Crop Advisory for the following plot parameters:
- Target Crop: ${input.cropName} (Variety: ${input.variety || 'Standard regional hybrid'})
- Current Stage: ${input.growthStage}
- Land Parcel Size: ${input.sizeAcres} Acres
- Soil Texture Class: ${input.soilType}
- Irrigation Architecture: ${input.irrigationMethod}
- Agro-Climatic Zone: ${input.climateZone}
- Soil Laboratory Analysis:
  * pH: ${input.soilPh}
  * Available Nitrogen (N): ${input.n} ppm
  * Available Phosphorus (P): ${input.p} ppm
  * Available Potassium (K): ${input.k} ppm
  * Organic Matter: ${input.organicMatter || 'Not Tested'}%

Formulate precise stage-by-stage interventions, calculating NPK deficits against standard nutrient removal requirements for ${input.cropName}. Provide specific chemical, organic, and biological actions.
`;

    const response = await ai.models.generateContent({
      model: MODEL_NAMES.ADVISORY_REASONING,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: cropAdvisoryResponseSchema,
        temperature: 0.2, // Low temperature for factual precision
        systemInstruction: 'You are AgroAdvisor Core Engine, a distinguished agronomist and crop nutrition chemist.',
      },
    });

    if (!response.text) {
      throw new Error("AI returned empty response for Advisory.");
    }
    return JSON.parse(response.text);
  }

  static async analyzePlantImage(
    imageBuffer: Buffer,
    mimeType: string,
    cropContext: string
  ) {
    const imagePart = {
      inlineData: {
        data: imageBuffer.toString('base64'),
        mimeType,
      },
    };

    const prompt = `
Examine this high-resolution agricultural photograph representing: ${cropContext}.
Conduct a clinical botanical and pathological examination:
1. Confirm if this is plant tissue.
2. Identify leaf lesions, chlorosis, fungal sporulation, stem cankers, pest frass, or necrosis.
3. Formulate differential diagnoses and converge on the most probable disease or disorder.
4. Prescribe organic and synthetic treatments with standard spray concentrations and harvest waiting periods.
`;

    const response = await ai.models.generateContent({
      model: MODEL_NAMES.MULTIMODAL_DOCTOR,
      contents: [imagePart, prompt],
      config: {
        responseMimeType: 'application/json',
        responseSchema: cropDoctorDiagnosticSchema,
        temperature: 0.1,
      },
    });

    if (!response.text) {
      throw new Error("AI returned empty response for Diagnostics.");
    }
    return JSON.parse(response.text);
  }
}
