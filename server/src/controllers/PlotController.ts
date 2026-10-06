import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { supabaseAdmin } from '../config/supabase';
import { CreatePlotSchema } from '../schemas/validationSchemas';

export class PlotController {
  static async createPlot(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const validatedData = CreatePlotSchema.parse(req.body);

      const { data, error } = await supabaseAdmin
        .from('plots')
        .insert([{ ...validatedData, user_id: userId }])
        .select()
        .single();

      if (error) throw error;
      res.status(201).json(data);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async getPlots(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const { data, error } = await supabaseAdmin
        .from('plots')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      res.status(200).json(data);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async getPlotById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const { id } = req.params;

      const { data, error } = await supabaseAdmin
        .from('plots')
        .select(`*, soil_tests(*)`)
        .eq('id', id)
        .eq('user_id', userId)
        .single();

      if (error) throw error;
      if (!data) {
         res.status(404).json({ error: 'Plot not found' });
         return;
      }
      res.status(200).json(data);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}
