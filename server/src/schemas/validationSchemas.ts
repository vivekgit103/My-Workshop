import { z } from 'zod';

export const CreatePlotSchema = z.object({
  name: z.string().min(2, "Plot name must be at least 2 characters").max(60),
  size_acres: z.coerce.number().positive("Size must be greater than 0").max(50000),
  soil_type: z.string().min(2),
  irrigation_method: z.enum(['rainfed', 'drip', 'sprinkler', 'flood', 'furrow', 'subsurface']),
  climate_zone: z.string().min(2),
  latitude: z.coerce.number().min(-90).max(90).optional(),
  longitude: z.coerce.number().min(-180).max(180).optional(),
});

export const SoilTestInputSchema = z.object({
  plot_id: z.string().uuid(),
  ph: z.coerce.number().min(3.5).max(11.0),
  nitrogen_ppm: z.coerce.number().min(0).max(2000),
  phosphorus_ppm: z.coerce.number().min(0).max(1000),
  potassium_ppm: z.coerce.number().min(0).max(3000),
  organic_matter_pct: z.coerce.number().min(0).max(100).optional(),
  electrical_conductivity_ds_m: z.coerce.number().min(0).max(50).optional(),
  sampled_at: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Must be YYYY-MM-DD").optional(),
});

export const GenerateAdvisoryInputSchema = z.object({
  plot_id: z.string().uuid(),
  crop_name: z.string().min(2).max(100),
  crop_variety: z.string().max(100).optional(),
  current_growth_stage: z.string().min(2),
  sowing_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

export const DiagnoseImageInputSchema = z.object({
  crop_name: z.string().min(2).max(100),
  plot_id: z.string().uuid().optional(),
});
