import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { supabaseAdmin } from '../config/supabase';
import { DiagnoseImageInputSchema } from '../schemas/validationSchemas';
import { GeminiService } from '../services/GeminiService';

export class DiagnosticsController {
  static async analyzeDiagnostic(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const file = req.file;

      if (!file) {
        res.status(400).json({ error: 'Image file is required' });
        return;
      }

      // We need to parse body here since it's multipart/form-data
      const validatedData = DiagnoseImageInputSchema.parse(req.body);

      // Call AI Service
      const diagnosis = await GeminiService.analyzePlantImage(
        file.buffer,
        file.mimetype,
        validatedData.crop_name
      );

      // In a real prod environment, you would upload the file buffer to Supabase Storage
      // and get the public URL. Here we'll mock the storage path.
      const mockStoragePath = `diagnostics/${userId}/${Date.now()}-${file.originalname}`;
      const mockImageUrl = `https://mock-storage.url/${mockStoragePath}`;

      // Save to DB
      const { data: diagnosticData, error: insertError } = await supabaseAdmin
        .from('crop_diagnostics')
        .insert([{
          user_id: userId,
          plot_id: validatedData.plot_id,
          crop_name: validatedData.crop_name,
          image_url: mockImageUrl,
          image_storage_path: mockStoragePath,
          diagnosed_disease: diagnosis.diagnosed_disease_or_pest,
          pathogen_type: diagnosis.pathogen_classification,
          confidence_score: diagnosis.confidence_score,
          severity: diagnosis.severity,
          symptoms: diagnosis.observed_symptoms,
          organic_controls: diagnosis.immediate_organic_remedies,
          chemical_controls: diagnosis.chemical_interventions,
          preventative_actions: diagnosis.long_term_prevention,
        }])
        .select()
        .single();

      if (insertError) throw insertError;

      res.status(201).json(diagnosticData);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async getDiagnostics(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const { data, error } = await supabaseAdmin
        .from('crop_diagnostics')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      res.status(200).json(data);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async getDiagnosticById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const { id } = req.params;
      const { data, error } = await supabaseAdmin
        .from('crop_diagnostics')
        .select('*')
        .eq('id', id)
        .eq('user_id', userId)
        .single();

      if (error || !data) {
         res.status(404).json({ error: 'Diagnostic not found' });
         return;
      }
      res.status(200).json(data);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}
