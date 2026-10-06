-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Define Custom Enums
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('farmer', 'agronomist', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE irrigation_type AS ENUM ('rainfed', 'drip', 'sprinkler', 'flood', 'furrow', 'subsurface');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE advisory_status AS ENUM ('draft', 'generating', 'active', 'archived');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE severity_level AS ENUM ('low', 'moderate', 'high', 'critical');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 1. Profiles Table (Mirrors Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    role user_role DEFAULT 'farmer' NOT NULL,
    phone_number TEXT,
    country TEXT DEFAULT 'India' NOT NULL,
    region_state TEXT NOT NULL,
    preferred_language TEXT DEFAULT 'en' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. Land Plots Table
CREATE TABLE IF NOT EXISTS public.plots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    size_acres NUMERIC(8, 2) NOT NULL CHECK (size_acres > 0),
    soil_type TEXT NOT NULL,
    irrigation_method irrigation_type DEFAULT 'rainfed' NOT NULL,
    climate_zone TEXT NOT NULL,
    latitude NUMERIC(9, 6),
    longitude NUMERIC(9, 6),
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. Soil Analysis Records
CREATE TABLE IF NOT EXISTS public.soil_tests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    plot_id UUID NOT NULL REFERENCES public.plots(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    sampled_at DATE DEFAULT CURRENT_DATE NOT NULL,
    ph NUMERIC(4, 2) NOT NULL CHECK (ph >= 0 AND ph <= 14),
    nitrogen_ppm NUMERIC(7, 2) NOT NULL CHECK (nitrogen_ppm >= 0),
    phosphorus_ppm NUMERIC(7, 2) NOT NULL CHECK (phosphorus_ppm >= 0),
    potassium_ppm NUMERIC(7, 2) NOT NULL CHECK (potassium_ppm >= 0),
    organic_matter_pct NUMERIC(4, 2) CHECK (organic_matter_pct >= 0 AND organic_matter_pct <= 100),
    electrical_conductivity_ds_m NUMERIC(5, 2) CHECK (electrical_conductivity_ds_m >= 0),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. Crop Advisories Table
CREATE TABLE IF NOT EXISTS public.crop_advisories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    plot_id UUID NOT NULL REFERENCES public.plots(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    crop_name TEXT NOT NULL,
    crop_variety TEXT,
    current_growth_stage TEXT NOT NULL,
    sowing_date DATE,
    estimated_harvest_date DATE,
    status advisory_status DEFAULT 'active' NOT NULL,
    input_snapshot JSONB NOT NULL,
    generated_plan JSONB NOT NULL,
    recommendation_summary TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 5. Pest & Disease Diagnostics Table
CREATE TABLE IF NOT EXISTS public.crop_diagnostics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    plot_id UUID REFERENCES public.plots(id) ON DELETE SET NULL,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    crop_name TEXT NOT NULL,
    image_url TEXT NOT NULL,
    image_storage_path TEXT NOT NULL,
    diagnosed_disease TEXT NOT NULL,
    pathogen_type TEXT NOT NULL, -- Fungal, Bacterial, Viral, Pest, Nutrient Deficiency
    confidence_score NUMERIC(5, 4) NOT NULL CHECK (confidence_score >= 0 AND confidence_score <= 1.0),
    severity severity_level DEFAULT 'moderate' NOT NULL,
    symptoms JSONB NOT NULL,
    organic_controls JSONB NOT NULL,
    chemical_controls JSONB NOT NULL,
    preventative_actions JSONB NOT NULL,
    status TEXT DEFAULT 'completed' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Indexes for ultra-low latency filtering
CREATE INDEX IF NOT EXISTS idx_plots_user_id ON public.plots(user_id);
CREATE INDEX IF NOT EXISTS idx_soil_tests_plot_id ON public.soil_tests(plot_id);
CREATE INDEX IF NOT EXISTS idx_crop_advisories_user_id ON public.crop_advisories(user_id);
CREATE INDEX IF NOT EXISTS idx_crop_advisories_plot_id ON public.crop_advisories(plot_id);
CREATE INDEX IF NOT EXISTS idx_crop_diagnostics_user_id ON public.crop_diagnostics(user_id);

-- Profile Sync Trigger from auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, role, country, region_state)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'Agri Farmer'),
        COALESCE((NEW.raw_user_meta_data->>'role')::public.user_role, 'farmer'),
        COALESCE(NEW.raw_user_meta_data->>'country', 'India'),
        COALESCE(NEW.raw_user_meta_data->>'region_state', 'Default State')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists to avoid errors on re-run
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- Enable RLS across all application tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.soil_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crop_advisories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crop_diagnostics ENABLE ROW LEVEL SECURITY;

-- 1. Profiles Isolation
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

-- 2. Plots Isolation
DROP POLICY IF EXISTS "Users can manage their own plots" ON public.plots;
CREATE POLICY "Users can manage their own plots"
    ON public.plots FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 3. Soil Tests Isolation
DROP POLICY IF EXISTS "Users can manage their own soil tests" ON public.soil_tests;
CREATE POLICY "Users can manage their own soil tests"
    ON public.soil_tests FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 4. Crop Advisories Isolation
DROP POLICY IF EXISTS "Users can manage their own crop advisories" ON public.crop_advisories;
CREATE POLICY "Users can manage their own crop advisories"
    ON public.crop_advisories FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 5. Crop Diagnostics Isolation
DROP POLICY IF EXISTS "Users can manage their own crop diagnostics" ON public.crop_diagnostics;
CREATE POLICY "Users can manage their own crop diagnostics"
    ON public.crop_diagnostics FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
