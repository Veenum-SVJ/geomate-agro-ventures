-- Poultry Production Records
CREATE TABLE public.poultry_production (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    farm_id UUID NOT NULL REFERENCES public.farms(id) ON DELETE CASCADE,
    record_date DATE NOT NULL DEFAULT CURRENT_DATE,
    egg_count INTEGER NOT NULL DEFAULT 0,
    hen_count INTEGER NOT NULL DEFAULT 0,
    mortality INTEGER NOT NULL DEFAULT 0,
    health_notes TEXT,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Poultry Resources Records
CREATE TABLE public.poultry_resources (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    farm_id UUID NOT NULL REFERENCES public.farms(id) ON DELETE CASCADE,
    record_date DATE NOT NULL DEFAULT CURRENT_DATE,
    feed_consumed_kg NUMERIC(10,2) NOT NULL DEFAULT 0,
    water_consumed_liters NUMERIC(10,2) NOT NULL DEFAULT 0,
    medications TEXT,
    medication_cost NUMERIC(12,2) DEFAULT 0,
    feed_cost NUMERIC(12,2) DEFAULT 0,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Poultry Sales Records
CREATE TABLE public.poultry_sales (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    farm_id UUID NOT NULL REFERENCES public.farms(id) ON DELETE CASCADE,
    sale_date DATE NOT NULL DEFAULT CURRENT_DATE,
    eggs_sold INTEGER NOT NULL DEFAULT 0,
    egg_price_per_crate NUMERIC(10,2) NOT NULL DEFAULT 0,
    birds_sold INTEGER NOT NULL DEFAULT 0,
    bird_price_each NUMERIC(10,2) NOT NULL DEFAULT 0,
    customer_name TEXT,
    customer_phone TEXT,
    notes TEXT,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Fishery Production Records
CREATE TABLE public.fishery_production (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    farm_id UUID NOT NULL REFERENCES public.farms(id) ON DELETE CASCADE,
    pond_name TEXT NOT NULL,
    record_date DATE NOT NULL DEFAULT CURRENT_DATE,
    fish_species TEXT,
    stock_count INTEGER NOT NULL DEFAULT 0,
    feed_given_kg NUMERIC(10,2) NOT NULL DEFAULT 0,
    feed_cost NUMERIC(12,2) DEFAULT 0,
    water_ph NUMERIC(4,2),
    water_temperature NUMERIC(4,1),
    oxygen_level NUMERIC(4,2),
    notes TEXT,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Fishery Sales Records
CREATE TABLE public.fishery_sales (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    farm_id UUID NOT NULL REFERENCES public.farms(id) ON DELETE CASCADE,
    sale_date DATE NOT NULL DEFAULT CURRENT_DATE,
    fish_species TEXT NOT NULL,
    quantity_kg NUMERIC(10,2) NOT NULL DEFAULT 0,
    price_per_kg NUMERIC(10,2) NOT NULL DEFAULT 0,
    customer_name TEXT,
    customer_phone TEXT,
    notes TEXT,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Crop Production Records
CREATE TABLE public.crop_production (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    farm_id UUID NOT NULL REFERENCES public.farms(id) ON DELETE CASCADE,
    crop_name TEXT NOT NULL,
    plot_name TEXT,
    record_date DATE NOT NULL DEFAULT CURRENT_DATE,
    activity_type TEXT NOT NULL, -- planting, fertilizing, irrigating, pest_control, harvesting
    quantity NUMERIC(10,2),
    unit TEXT, -- kg, bags, liters
    cost NUMERIC(12,2) DEFAULT 0,
    notes TEXT,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Crop Sales Records
CREATE TABLE public.crop_sales (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    farm_id UUID NOT NULL REFERENCES public.farms(id) ON DELETE CASCADE,
    sale_date DATE NOT NULL DEFAULT CURRENT_DATE,
    crop_name TEXT NOT NULL,
    quantity_kg NUMERIC(10,2) NOT NULL DEFAULT 0,
    price_per_kg NUMERIC(10,2) NOT NULL DEFAULT 0,
    customer_name TEXT,
    customer_phone TEXT,
    notes TEXT,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Feedmill Ingredients Records
CREATE TABLE public.feedmill_ingredients (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    farm_id UUID NOT NULL REFERENCES public.farms(id) ON DELETE CASCADE,
    record_date DATE NOT NULL DEFAULT CURRENT_DATE,
    ingredient_name TEXT NOT NULL, -- maize, soya, fish_meal, vitamins, etc.
    quantity_kg NUMERIC(10,2) NOT NULL DEFAULT 0,
    cost_per_kg NUMERIC(10,2) NOT NULL DEFAULT 0,
    supplier TEXT,
    notes TEXT,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Feedmill Power/Fuel Records
CREATE TABLE public.feedmill_power (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    farm_id UUID NOT NULL REFERENCES public.farms(id) ON DELETE CASCADE,
    record_date DATE NOT NULL DEFAULT CURRENT_DATE,
    power_type TEXT NOT NULL, -- generator_fuel, electricity, maintenance
    quantity NUMERIC(10,2),
    unit TEXT, -- liters, kWh
    cost NUMERIC(12,2) NOT NULL DEFAULT 0,
    notes TEXT,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Feedmill Production Records
CREATE TABLE public.feedmill_production (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    farm_id UUID NOT NULL REFERENCES public.farms(id) ON DELETE CASCADE,
    record_date DATE NOT NULL DEFAULT CURRENT_DATE,
    feed_type TEXT NOT NULL,
    quantity_produced_kg NUMERIC(10,2) NOT NULL DEFAULT 0,
    bags_produced INTEGER DEFAULT 0,
    production_cost NUMERIC(12,2) DEFAULT 0,
    notes TEXT,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.poultry_production ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poultry_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poultry_sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fishery_production ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fishery_sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crop_production ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crop_sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedmill_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedmill_power ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedmill_production ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Poultry Production
CREATE POLICY "Users can view poultry production for their farm" ON public.poultry_production
    FOR SELECT USING (public.user_belongs_to_farm(auth.uid(), farm_id));
CREATE POLICY "Users can insert poultry production for their farm" ON public.poultry_production
    FOR INSERT WITH CHECK (public.user_belongs_to_farm(auth.uid(), farm_id));
CREATE POLICY "Users can update poultry production for their farm" ON public.poultry_production
    FOR UPDATE USING (public.user_belongs_to_farm(auth.uid(), farm_id));
CREATE POLICY "Admins can delete poultry production" ON public.poultry_production
    FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for Poultry Resources
CREATE POLICY "Users can view poultry resources for their farm" ON public.poultry_resources
    FOR SELECT USING (public.user_belongs_to_farm(auth.uid(), farm_id));
CREATE POLICY "Users can insert poultry resources for their farm" ON public.poultry_resources
    FOR INSERT WITH CHECK (public.user_belongs_to_farm(auth.uid(), farm_id));
CREATE POLICY "Users can update poultry resources for their farm" ON public.poultry_resources
    FOR UPDATE USING (public.user_belongs_to_farm(auth.uid(), farm_id));
CREATE POLICY "Admins can delete poultry resources" ON public.poultry_resources
    FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for Poultry Sales
CREATE POLICY "Users can view poultry sales for their farm" ON public.poultry_sales
    FOR SELECT USING (public.user_belongs_to_farm(auth.uid(), farm_id));
CREATE POLICY "Users can insert poultry sales for their farm" ON public.poultry_sales
    FOR INSERT WITH CHECK (public.user_belongs_to_farm(auth.uid(), farm_id));
CREATE POLICY "Users can update poultry sales for their farm" ON public.poultry_sales
    FOR UPDATE USING (public.user_belongs_to_farm(auth.uid(), farm_id));
CREATE POLICY "Admins can delete poultry sales" ON public.poultry_sales
    FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for Fishery Production
CREATE POLICY "Users can view fishery production for their farm" ON public.fishery_production
    FOR SELECT USING (public.user_belongs_to_farm(auth.uid(), farm_id));
CREATE POLICY "Users can insert fishery production for their farm" ON public.fishery_production
    FOR INSERT WITH CHECK (public.user_belongs_to_farm(auth.uid(), farm_id));
CREATE POLICY "Users can update fishery production for their farm" ON public.fishery_production
    FOR UPDATE USING (public.user_belongs_to_farm(auth.uid(), farm_id));
CREATE POLICY "Admins can delete fishery production" ON public.fishery_production
    FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for Fishery Sales
CREATE POLICY "Users can view fishery sales for their farm" ON public.fishery_sales
    FOR SELECT USING (public.user_belongs_to_farm(auth.uid(), farm_id));
CREATE POLICY "Users can insert fishery sales for their farm" ON public.fishery_sales
    FOR INSERT WITH CHECK (public.user_belongs_to_farm(auth.uid(), farm_id));
CREATE POLICY "Users can update fishery sales for their farm" ON public.fishery_sales
    FOR UPDATE USING (public.user_belongs_to_farm(auth.uid(), farm_id));
CREATE POLICY "Admins can delete fishery sales" ON public.fishery_sales
    FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for Crop Production
CREATE POLICY "Users can view crop production for their farm" ON public.crop_production
    FOR SELECT USING (public.user_belongs_to_farm(auth.uid(), farm_id));
CREATE POLICY "Users can insert crop production for their farm" ON public.crop_production
    FOR INSERT WITH CHECK (public.user_belongs_to_farm(auth.uid(), farm_id));
CREATE POLICY "Users can update crop production for their farm" ON public.crop_production
    FOR UPDATE USING (public.user_belongs_to_farm(auth.uid(), farm_id));
CREATE POLICY "Admins can delete crop production" ON public.crop_production
    FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for Crop Sales
CREATE POLICY "Users can view crop sales for their farm" ON public.crop_sales
    FOR SELECT USING (public.user_belongs_to_farm(auth.uid(), farm_id));
CREATE POLICY "Users can insert crop sales for their farm" ON public.crop_sales
    FOR INSERT WITH CHECK (public.user_belongs_to_farm(auth.uid(), farm_id));
CREATE POLICY "Users can update crop sales for their farm" ON public.crop_sales
    FOR UPDATE USING (public.user_belongs_to_farm(auth.uid(), farm_id));
CREATE POLICY "Admins can delete crop sales" ON public.crop_sales
    FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for Feedmill Ingredients
CREATE POLICY "Users can view feedmill ingredients for their farm" ON public.feedmill_ingredients
    FOR SELECT USING (public.user_belongs_to_farm(auth.uid(), farm_id));
CREATE POLICY "Users can insert feedmill ingredients for their farm" ON public.feedmill_ingredients
    FOR INSERT WITH CHECK (public.user_belongs_to_farm(auth.uid(), farm_id));
CREATE POLICY "Users can update feedmill ingredients for their farm" ON public.feedmill_ingredients
    FOR UPDATE USING (public.user_belongs_to_farm(auth.uid(), farm_id));
CREATE POLICY "Admins can delete feedmill ingredients" ON public.feedmill_ingredients
    FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for Feedmill Power
CREATE POLICY "Users can view feedmill power for their farm" ON public.feedmill_power
    FOR SELECT USING (public.user_belongs_to_farm(auth.uid(), farm_id));
CREATE POLICY "Users can insert feedmill power for their farm" ON public.feedmill_power
    FOR INSERT WITH CHECK (public.user_belongs_to_farm(auth.uid(), farm_id));
CREATE POLICY "Users can update feedmill power for their farm" ON public.feedmill_power
    FOR UPDATE USING (public.user_belongs_to_farm(auth.uid(), farm_id));
CREATE POLICY "Admins can delete feedmill power" ON public.feedmill_power
    FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for Feedmill Production
CREATE POLICY "Users can view feedmill production for their farm" ON public.feedmill_production
    FOR SELECT USING (public.user_belongs_to_farm(auth.uid(), farm_id));
CREATE POLICY "Users can insert feedmill production for their farm" ON public.feedmill_production
    FOR INSERT WITH CHECK (public.user_belongs_to_farm(auth.uid(), farm_id));
CREATE POLICY "Users can update feedmill production for their farm" ON public.feedmill_production
    FOR UPDATE USING (public.user_belongs_to_farm(auth.uid(), farm_id));
CREATE POLICY "Admins can delete feedmill production" ON public.feedmill_production
    FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- Add updated_at triggers
CREATE TRIGGER update_poultry_production_updated_at BEFORE UPDATE ON public.poultry_production
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_poultry_resources_updated_at BEFORE UPDATE ON public.poultry_resources
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_poultry_sales_updated_at BEFORE UPDATE ON public.poultry_sales
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_fishery_production_updated_at BEFORE UPDATE ON public.fishery_production
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_fishery_sales_updated_at BEFORE UPDATE ON public.fishery_sales
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_crop_production_updated_at BEFORE UPDATE ON public.crop_production
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_crop_sales_updated_at BEFORE UPDATE ON public.crop_sales
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_feedmill_ingredients_updated_at BEFORE UPDATE ON public.feedmill_ingredients
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_feedmill_power_updated_at BEFORE UPDATE ON public.feedmill_power
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_feedmill_production_updated_at BEFORE UPDATE ON public.feedmill_production
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();