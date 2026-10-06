import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { supabaseAdmin } from '../config/supabase';
import { GenerateAdvisoryInputSchema } from '../schemas/validationSchemas';
import { GeminiService } from '../services/GeminiService';

export class AdvisoryController {
  static async generateAdvisory(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const validatedData = GenerateAdvisoryInputSchema.parse(req.body);

      // Fetch Plot & Soil Data
      const { data: plotData, error: plotError } = await supabaseAdmin
        .from('plots')
        .select('*, soil_tests(*)')
        .eq('id', validatedData.plot_id)
        .eq('user_id', userId)
        .single();

      if (plotError || !plotData) throw new Error('Plot not found or access denied');
      
      const latestSoilTest = plotData.soil_tests?.[0];
      if (!latestSoilTest) throw new Error('No soil test found for this plot. Please add a soil test first.');

      // Call AI Service
      const plan = await GeminiService.generateCropPlan({
        cropName: validatedData.crop_name,
        variety: validatedData.crop_variety,
        growthStage: validatedData.current_growth_stage,
        sizeAcres: plotData.size_acres,
        soilType: plotData.soil_type,
        irrigationMethod: plotData.irrigation_method,
        climateZone: plotData.climate_zone,
        soilPh: latestSoilTest.ph,
        n: latestSoilTest.nitrogen_ppm,
        p: latestSoilTest.phosphorus_ppm,
        k: latestSoilTest.potassium_ppm,
        organicMatter: latestSoilTest.organic_matter_pct,
      });

      // Save to DB
      const { data: advisoryData, error: insertError } = await supabaseAdmin
        .from('crop_advisories')
        .insert([{
          user_id: userId,
          plot_id: plotData.id,
          crop_name: validatedData.crop_name,
          crop_variety: validatedData.crop_variety,
          current_growth_stage: validatedData.current_growth_stage,
          sowing_date: validatedData.sowing_date,
          input_snapshot: { plot: plotData, soil: latestSoilTest },
          generated_plan: plan,
          recommendation_summary: plan.executive_summary,
        }])
        .select()
        .single();

      if (insertError) throw insertError;

      res.status(201).json(advisoryData);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async getAdvisories(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const { data, error } = await supabaseAdmin
        .from('crop_advisories')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      res.status(200).json(data);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async getAdvisoryById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const { id } = req.params;
      const { data, error } = await supabaseAdmin
        .from('crop_advisories')
        .select('*, plots(*)')
        .eq('id', id)
        .eq('user_id', userId)
        .single();

      if (error || !data) {
        res.status(404).json({ error: 'Advisory not found' });
        return;
      }
      res.status(200).json(data);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}
