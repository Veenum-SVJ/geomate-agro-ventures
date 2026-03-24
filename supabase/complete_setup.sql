-- =============================================================
-- GEOMATE AGRO VENTURES - COMPLETE DATABASE SETUP
-- Run this entire file in Supabase SQL Editor
-- =============================================================

-- ==================== MIGRATION 1: Core Tables ====================
-- Create app_role enum for role-based access control
CREATE TYPE public.app_role AS ENUM ('admin', 'manager', 'worker');

-- Create subscription_tier enum
CREATE TYPE public.subscription_tier AS ENUM ('free', 'basic', 'premium');

-- Create farms table
CREATE TABLE public.farms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    location TEXT,
    size_hectares DECIMAL(10, 2),
    farm_type TEXT[], -- e.g., ['poultry', 'fishery', 'crops']
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create profiles table
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    farm_id UUID REFERENCES public.farms(id) ON DELETE SET NULL,
    email TEXT,
    full_name TEXT,
    avatar_url TEXT,
    phone TEXT,
    subscription_tier subscription_tier NOT NULL DEFAULT 'free',
    onboarding_completed BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    farm_id UUID REFERENCES public.farms(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'worker',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, farm_id)
);

-- Enable RLS on all tables
ALTER TABLE public.farms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check user roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.user_roles
        WHERE user_id = _user_id
          AND role = _role
    )
$$;

-- Function to get user's farm_id
CREATE OR REPLACE FUNCTION public.get_user_farm_id(_user_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT farm_id FROM public.profiles WHERE user_id = _user_id LIMIT 1
$$;

-- Function to check if user belongs to a farm
CREATE OR REPLACE FUNCTION public.user_belongs_to_farm(_user_id UUID, _farm_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.user_roles
        WHERE user_id = _user_id
          AND farm_id = _farm_id
    )
$$;

-- RLS Policies for farms table
CREATE POLICY "Users can view farms they belong to"
ON public.farms
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_roles.farm_id = farms.id
          AND user_roles.user_id = auth.uid()
    )
);

CREATE POLICY "Admins can create farms"
ON public.farms
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Admins can update their farms"
ON public.farms
FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_roles.farm_id = farms.id
          AND user_roles.user_id = auth.uid()
          AND user_roles.role = 'admin'
    )
);

CREATE POLICY "Admins can delete their farms"
ON public.farms
FOR DELETE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_roles.farm_id = farms.id
          AND user_roles.user_id = auth.uid()
          AND user_roles.role = 'admin'
    )
);

-- RLS Policies for profiles table
CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can view profiles from their farm"
ON public.profiles
FOR SELECT
TO authenticated
USING (
    farm_id IN (
        SELECT farm_id FROM public.user_roles WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Users can insert their own profile"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (user_id = auth.uid());

-- RLS Policies for user_roles table
CREATE POLICY "Users can view roles for their farms"
ON public.user_roles
FOR SELECT
TO authenticated
USING (
    farm_id IN (
        SELECT ur.farm_id FROM public.user_roles ur WHERE ur.user_id = auth.uid()
    )
);

CREATE POLICY "Admins can insert roles for their farms"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.user_roles ur
        WHERE ur.farm_id = user_roles.farm_id
          AND ur.user_id = auth.uid()
          AND ur.role = 'admin'
    )
    OR NOT EXISTS (
        SELECT 1 FROM public.user_roles ur WHERE ur.farm_id = user_roles.farm_id
    )
);

CREATE POLICY "Admins can update roles for their farms"
ON public.user_roles
FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_roles ur
        WHERE ur.farm_id = user_roles.farm_id
          AND ur.user_id = auth.uid()
          AND ur.role = 'admin'
    )
);

CREATE POLICY "Admins can delete roles for their farms"
ON public.user_roles
FOR DELETE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_roles ur
        WHERE ur.farm_id = user_roles.farm_id
          AND ur.user_id = auth.uid()
          AND ur.role = 'admin'
    )
);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_farms_updated_at
    BEFORE UPDATE ON public.farms
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (user_id, email, full_name, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
        NEW.raw_user_meta_data->>'avatar_url'
    );
    RETURN NEW;
END;
$$;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- ==================== MIGRATION 2: Production Tables ====================

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
    activity_type TEXT NOT NULL,
    quantity NUMERIC(10,2),
    unit TEXT,
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
    ingredient_name TEXT NOT NULL,
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
    power_type TEXT NOT NULL,
    quantity NUMERIC(10,2),
    unit TEXT,
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

-- Enable RLS on production tables
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

-- Add updated_at triggers for production tables
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

-- ==================== MIGRATION 3: Tasks, Workers, Customers, Inventory ====================

-- Tasks table for farm operations
CREATE TABLE public.tasks (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    farm_id UUID NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    priority TEXT NOT NULL DEFAULT 'medium',
    assigned_to UUID,
    due_date DATE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Workers table
CREATE TABLE public.workers (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    farm_id UUID NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    role TEXT NOT NULL DEFAULT 'worker',
    salary NUMERIC DEFAULT 0,
    hire_date DATE DEFAULT CURRENT_DATE,
    status TEXT NOT NULL DEFAULT 'active',
    notes TEXT,
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Customers table
CREATE TABLE public.customers (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    farm_id UUID NOT NULL,
    name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    address TEXT,
    customer_type TEXT DEFAULT 'retail',
    notes TEXT,
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Inventory table
CREATE TABLE public.inventory (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    farm_id UUID NOT NULL,
    item_name TEXT NOT NULL,
    category TEXT NOT NULL,
    quantity NUMERIC NOT NULL DEFAULT 0,
    unit TEXT,
    min_stock_level NUMERIC DEFAULT 0,
    cost_per_unit NUMERIC DEFAULT 0,
    supplier TEXT,
    last_restocked DATE,
    notes TEXT,
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;

-- Tasks RLS policies
CREATE POLICY "Users can view tasks for their farm" ON public.tasks
    FOR SELECT USING (user_belongs_to_farm(auth.uid(), farm_id));

CREATE POLICY "Users can insert tasks for their farm" ON public.tasks
    FOR INSERT WITH CHECK (user_belongs_to_farm(auth.uid(), farm_id));

CREATE POLICY "Users can update tasks for their farm" ON public.tasks
    FOR UPDATE USING (user_belongs_to_farm(auth.uid(), farm_id));

CREATE POLICY "Admins can delete tasks" ON public.tasks
    FOR DELETE USING (has_role(auth.uid(), 'admin'));

-- Workers RLS policies
CREATE POLICY "Users can view workers for their farm" ON public.workers
    FOR SELECT USING (user_belongs_to_farm(auth.uid(), farm_id));

CREATE POLICY "Admins can insert workers for their farm" ON public.workers
    FOR INSERT WITH CHECK (user_belongs_to_farm(auth.uid(), farm_id) AND has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update workers for their farm" ON public.workers
    FOR UPDATE USING (user_belongs_to_farm(auth.uid(), farm_id) AND has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete workers" ON public.workers
    FOR DELETE USING (has_role(auth.uid(), 'admin'));

-- Customers RLS policies
CREATE POLICY "Users can view customers for their farm" ON public.customers
    FOR SELECT USING (user_belongs_to_farm(auth.uid(), farm_id));

CREATE POLICY "Users can insert customers for their farm" ON public.customers
    FOR INSERT WITH CHECK (user_belongs_to_farm(auth.uid(), farm_id));

CREATE POLICY "Users can update customers for their farm" ON public.customers
    FOR UPDATE USING (user_belongs_to_farm(auth.uid(), farm_id));

CREATE POLICY "Admins can delete customers" ON public.customers
    FOR DELETE USING (has_role(auth.uid(), 'admin'));

-- Inventory RLS policies
CREATE POLICY "Users can view inventory for their farm" ON public.inventory
    FOR SELECT USING (user_belongs_to_farm(auth.uid(), farm_id));

CREATE POLICY "Users can insert inventory for their farm" ON public.inventory
    FOR INSERT WITH CHECK (user_belongs_to_farm(auth.uid(), farm_id));

CREATE POLICY "Users can update inventory for their farm" ON public.inventory
    FOR UPDATE USING (user_belongs_to_farm(auth.uid(), farm_id));

CREATE POLICY "Admins can delete inventory" ON public.inventory
    FOR DELETE USING (has_role(auth.uid(), 'admin'));

-- Add updated_at triggers
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON public.tasks
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_workers_updated_at BEFORE UPDATE ON public.workers
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON public.customers
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_inventory_updated_at BEFORE UPDATE ON public.inventory
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ==================== MIGRATION 4: Inquiries (Contact Form) ====================

-- Create inquiries table for contact form submissions
CREATE TABLE public.inquiries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'unread',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (public contact form)
CREATE POLICY "Anyone can submit inquiries"
ON public.inquiries
FOR INSERT
WITH CHECK (true);

-- Only authenticated admins can view/update inquiries
CREATE POLICY "Authenticated users can view inquiries"
ON public.inquiries
FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update inquiries"
ON public.inquiries
FOR UPDATE
USING (auth.uid() IS NOT NULL);

-- ==================== MIGRATION 5: Website CMS Tables ====================

-- Create website products table for CMS
CREATE TABLE public.website_products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('poultry', 'crops', 'cattle')),
  image_url TEXT,
  stock_status TEXT NOT NULL DEFAULT 'in_stock' CHECK (stock_status IN ('in_stock', 'low_stock', 'out_of_stock')),
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create website pages table for CMS
CREATE TABLE public.website_pages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  content TEXT,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id)
);

-- Create gallery images table for CMS
CREATE TABLE public.gallery_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  image_url TEXT NOT NULL,
  alt_text TEXT,
  category TEXT DEFAULT 'Farm',
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  uploaded_by UUID REFERENCES auth.users(id)
);

-- Enable RLS on all tables
ALTER TABLE public.website_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.website_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_images ENABLE ROW LEVEL SECURITY;

-- Public read access for website display
CREATE POLICY "Anyone can view active products" ON public.website_products
  FOR SELECT USING (is_active = true);

CREATE POLICY "Anyone can view pages" ON public.website_pages
  FOR SELECT USING (true);

CREATE POLICY "Anyone can view active gallery images" ON public.gallery_images
  FOR SELECT USING (is_active = true);

-- Admin write access (authenticated users)
CREATE POLICY "Authenticated users can manage products" ON public.website_products
  FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can manage pages" ON public.website_pages
  FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can manage gallery" ON public.gallery_images
  FOR ALL USING (auth.uid() IS NOT NULL);

-- Create storage bucket for gallery images
INSERT INTO storage.buckets (id, name, public) VALUES ('gallery', 'gallery', true);

-- Storage policies
CREATE POLICY "Anyone can view gallery images" ON storage.objects
  FOR SELECT USING (bucket_id = 'gallery');

CREATE POLICY "Authenticated users can upload gallery images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'gallery' AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete gallery images" ON storage.objects
  FOR DELETE USING (bucket_id = 'gallery' AND auth.uid() IS NOT NULL);

-- Insert default pages
INSERT INTO public.website_pages (slug, title, content) VALUES
  ('about', 'About Us', 'Geomate Agro Ventures was founded in Ibadan, Nigeria, with a simple but powerful vision: to bridge the gap between sustainable farming practices and the growing demand for high-quality agricultural products.

What started as a small family operation has grown into a thriving agricultural enterprise. Over the years, we have invested in modern farming techniques while staying true to traditional values of hard work, integrity, and respect for the land.

Today, we serve both local consumers and business partners across Nigeria, providing fresh poultry products, organically grown crops, and premium cattle products—all produced with care and commitment to excellence.'),
  ('practices', 'Our Farming Practices', 'At Geomate Agro Ventures, sustainability is not just a buzzword—it is how we do business. We believe that responsible farming practices lead to better products, healthier communities, and a thriving environment.');

-- Insert sample products
INSERT INTO public.website_products (name, description, category, stock_status) VALUES
  ('Fresh Eggs', 'Farm-fresh eggs from our free-range chickens. Rich in nutrients and flavor.', 'poultry', 'in_stock'),
  ('Whole Chicken', 'Healthy, antibiotic-free whole chickens ready for your table.', 'poultry', 'in_stock'),
  ('Turkey', 'Premium turkeys perfect for special occasions and family gatherings.', 'poultry', 'low_stock'),
  ('Maize', 'Quality maize grains for consumption and animal feed.', 'crops', 'in_stock'),
  ('Cassava', 'Fresh cassava tubers, a staple food crop with multiple uses.', 'crops', 'in_stock'),
  ('Fresh Beef', 'Premium grass-fed beef, tender and full of flavor.', 'cattle', 'in_stock'),
  ('Fresh Milk', 'Pure, unpasteurized milk from healthy dairy cows.', 'cattle', 'in_stock');

-- ==================== MIGRATION 6: Role Policy Fixes ====================

-- Drop problematic policies on user_roles
DROP POLICY IF EXISTS "Admins can delete roles for their farms" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can insert roles for their farms" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can update roles for their farms" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view roles for their farms" ON public.user_roles;

-- Create a security definer function to check if user is admin of a farm
CREATE OR REPLACE FUNCTION public.is_farm_admin(_user_id uuid, _farm_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND farm_id = _farm_id
      AND role = 'admin'
  )
$$;

-- Create a security definer function to get user's farm ids
CREATE OR REPLACE FUNCTION public.get_user_farm_ids(_user_id uuid)
RETURNS SETOF uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT farm_id FROM public.user_roles WHERE user_id = _user_id
$$;

-- Create a security definer function to check if farm has any roles yet
CREATE OR REPLACE FUNCTION public.farm_has_no_roles(_farm_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT NOT EXISTS (
    SELECT 1 FROM public.user_roles WHERE farm_id = _farm_id
  )
$$;

-- Recreate policies using security definer functions
CREATE POLICY "Users can view roles for their farms"
ON public.user_roles
FOR SELECT
USING (farm_id IN (SELECT public.get_user_farm_ids(auth.uid())));

CREATE POLICY "Admins can insert roles for their farms"
ON public.user_roles
FOR INSERT
WITH CHECK (
  public.is_farm_admin(auth.uid(), farm_id) 
  OR (user_id = auth.uid() AND public.farm_has_no_roles(farm_id))
);

CREATE POLICY "Admins can update roles for their farms"
ON public.user_roles
FOR UPDATE
USING (public.is_farm_admin(auth.uid(), farm_id));

CREATE POLICY "Admins can delete roles for their farms"
ON public.user_roles
FOR DELETE
USING (public.is_farm_admin(auth.uid(), farm_id));

-- ==================== MIGRATION 7: Farm Creation Policy Fix ====================

-- Drop the restrictive insert policy
DROP POLICY IF EXISTS "Admins can create farms" ON public.farms;

-- Create a permissive policy that allows authenticated users to create farms
CREATE POLICY "Authenticated users can create farms"
ON public.farms
FOR INSERT
TO authenticated
WITH CHECK (true);

-- ==================== MIGRATION 8: Farm Creation Function ====================

-- Create a function to handle farm setup atomically
CREATE OR REPLACE FUNCTION public.create_farm_with_role(
  _name text,
  _location text DEFAULT NULL,
  _size_hectares numeric DEFAULT NULL,
  _farm_type text[] DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _farm_id uuid;
  _user_id uuid;
BEGIN
  -- Get the current user id
  _user_id := auth.uid();
  
  IF _user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  
  -- Create the farm
  INSERT INTO public.farms (name, location, size_hectares, farm_type)
  VALUES (_name, _location, _size_hectares, _farm_type)
  RETURNING id INTO _farm_id;
  
  -- Create the admin role for this user
  INSERT INTO public.user_roles (user_id, farm_id, role)
  VALUES (_user_id, _farm_id, 'admin');
  
  -- Update the user's profile
  UPDATE public.profiles
  SET farm_id = _farm_id, onboarding_completed = true
  WHERE user_id = _user_id;
  
  RETURN _farm_id;
END;
$$;

-- ==================== MIGRATION 9: Default Farm Setup ====================

-- Create the single Geomate Agro Ventures farm if it doesn't exist
INSERT INTO public.farms (id, name, location, farm_type)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Geomate Agro Ventures',
  'Nigeria',
  ARRAY['poultry', 'fishery', 'crops', 'feedmill']
)
ON CONFLICT (id) DO NOTHING;

-- Update the handle_new_user function to auto-assign users to the single farm
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  default_farm_id uuid := '00000000-0000-0000-0000-000000000001';
BEGIN
    -- Create profile with default farm
    INSERT INTO public.profiles (user_id, email, full_name, avatar_url, farm_id, onboarding_completed)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
        NEW.raw_user_meta_data->>'avatar_url',
        default_farm_id,
        true
    );
    
    -- Auto-assign admin role to the default farm (first user is admin)
    INSERT INTO public.user_roles (user_id, farm_id, role)
    VALUES (NEW.id, default_farm_id, 'admin');
    
    RETURN NEW;
END;
$$;

-- ==================== MIGRATION 10: Team Invitations ====================

-- Create table for team invitations
CREATE TABLE public.team_invitations (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT NOT NULL,
    farm_id UUID NOT NULL REFERENCES public.farms(id) ON DELETE CASCADE,
    role public.app_role NOT NULL DEFAULT 'worker',
    invited_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    token UUID NOT NULL DEFAULT gen_random_uuid(),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'cancelled')),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '7 days'),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(email, farm_id, status)
);

-- Enable RLS
ALTER TABLE public.team_invitations ENABLE ROW LEVEL SECURITY;

-- Policy: Farm admins can view invitations for their farm
CREATE POLICY "Farm admins can view invitations"
ON public.team_invitations
FOR SELECT
TO authenticated
USING (public.is_farm_admin(auth.uid(), farm_id));

-- Policy: Farm admins can create invitations
CREATE POLICY "Farm admins can create invitations"
ON public.team_invitations
FOR INSERT
TO authenticated
WITH CHECK (public.is_farm_admin(auth.uid(), farm_id));

-- Policy: Farm admins can update invitations (cancel them)
CREATE POLICY "Farm admins can update invitations"
ON public.team_invitations
FOR UPDATE
TO authenticated
USING (public.is_farm_admin(auth.uid(), farm_id));

-- Policy: Farm admins can delete invitations
CREATE POLICY "Farm admins can delete invitations"
ON public.team_invitations
FOR DELETE
TO authenticated
USING (public.is_farm_admin(auth.uid(), farm_id));

-- Create trigger for updated_at
CREATE TRIGGER update_team_invitations_updated_at
BEFORE UPDATE ON public.team_invitations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to accept an invitation (called by the invited user)
CREATE OR REPLACE FUNCTION public.accept_invitation(_token uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    _invitation record;
    _user_id uuid;
BEGIN
    _user_id := auth.uid();
    
    IF _user_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
    END IF;
    
    -- Find the invitation
    SELECT * INTO _invitation
    FROM public.team_invitations
    WHERE token = _token
      AND status = 'pending'
      AND expires_at > now();
    
    IF _invitation IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Invitation not found or expired');
    END IF;
    
    -- Check if user already has a role in this farm
    IF EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND farm_id = _invitation.farm_id) THEN
        -- Update existing role
        UPDATE public.user_roles
        SET role = _invitation.role
        WHERE user_id = _user_id AND farm_id = _invitation.farm_id;
    ELSE
        -- Create new role
        INSERT INTO public.user_roles (user_id, farm_id, role)
        VALUES (_user_id, _invitation.farm_id, _invitation.role);
    END IF;
    
    -- Update user's profile farm_id if not set
    UPDATE public.profiles
    SET farm_id = _invitation.farm_id
    WHERE user_id = _user_id AND farm_id IS NULL;
    
    -- Mark invitation as accepted
    UPDATE public.team_invitations
    SET status = 'accepted', updated_at = now()
    WHERE id = _invitation.id;
    
    RETURN jsonb_build_object(
        'success', true, 
        'farm_id', _invitation.farm_id,
        'invitation_id', _invitation.id
    );
END;
$$;

-- ==================== MIGRATION 11: Website Settings & Content ====================

-- Create table for site settings (contact info, stats, general settings)
CREATE TABLE public.website_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.website_settings ENABLE ROW LEVEL SECURITY;

-- Anyone can view settings (for public website)
CREATE POLICY "Anyone can view settings" 
ON public.website_settings 
FOR SELECT 
USING (true);

-- Authenticated users can manage settings
CREATE POLICY "Authenticated users can manage settings" 
ON public.website_settings 
FOR ALL 
USING (auth.uid() IS NOT NULL);

-- Create table for core values (About page)
CREATE TABLE public.website_values (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT 'Target',
  color TEXT NOT NULL DEFAULT 'from-emerald-500 to-green-600',
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.website_values ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active values" 
ON public.website_values 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Authenticated users can manage values" 
ON public.website_values 
FOR ALL 
USING (auth.uid() IS NOT NULL);

-- Create table for milestones (About page timeline)
CREATE TABLE public.website_milestones (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  year TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.website_milestones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active milestones" 
ON public.website_milestones 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Authenticated users can manage milestones" 
ON public.website_milestones 
FOR ALL 
USING (auth.uid() IS NOT NULL);

-- Create table for sustainability practices
CREATE TABLE public.website_practices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  content TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT 'Leaf',
  color TEXT NOT NULL DEFAULT 'from-green-500 to-emerald-600',
  bg_color TEXT NOT NULL DEFAULT 'bg-green-500/10',
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.website_practices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active practices" 
ON public.website_practices 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Authenticated users can manage practices" 
ON public.website_practices 
FOR ALL 
USING (auth.uid() IS NOT NULL);

-- Create table for product categories
CREATE TABLE public.website_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT,
  color TEXT NOT NULL DEFAULT 'from-green-600 to-emerald-700',
  icon TEXT NOT NULL DEFAULT 'Wheat',
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.website_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active categories" 
ON public.website_categories 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Authenticated users can manage categories" 
ON public.website_categories 
FOR ALL 
USING (auth.uid() IS NOT NULL);

-- Insert default settings
INSERT INTO public.website_settings (key, value) VALUES
('contact', '{"address": "Geomate Agro Ventures\nIbadan, Oyo State, Nigeria", "phone": "+234 801 234 5678", "email": "info@geomateagro.com", "whatsapp": "+2348012345678", "business_hours": "Mon - Fri: 8AM - 6PM\nSat: 9AM - 4PM\nSun: Closed", "maps_url": "https://maps.google.com/?q=Ibadan,Nigeria"}'),
('stats', '[{"number": "500+", "label": "Hectares of Farmland"}, {"number": "10K+", "label": "Happy Customers"}, {"number": "50+", "label": "Team Members"}, {"number": "9+", "label": "Years of Excellence"}]'),
('hero', '{"title": "About Geomate", "subtitle": "From humble beginnings to becoming a trusted name in Nigerian agriculture", "image_url": "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1920&h=1080&fit=crop"}'),
('mission', '{"title": "Our Mission", "content": "To provide high-quality, sustainably produced agricultural products that meet the needs of our customers while promoting environmental stewardship and supporting local communities. We strive to be a trusted partner for individuals and businesses seeking reliable, fresh, and ethically sourced farm products."}'),
('vision', '{"title": "Our Vision", "content": "To become Nigeria''s leading sustainable agriculture enterprise, recognized for innovation, quality, and positive impact on both people and the planet. We envision a future where modern farming practices and traditional wisdom come together to create a more food-secure nation."}'),
('practices_stats', '[{"number": "100%", "label": "Organic Fertilizers"}, {"number": "50%", "label": "Water Savings"}, {"number": "Zero", "label": "Harmful Chemicals"}, {"number": "24/7", "label": "Animal Monitoring"}]');

-- Insert default values
INSERT INTO public.website_values (title, description, icon, color, display_order) VALUES
('Quality First', 'We never compromise on the quality of our products, ensuring only the best reaches our customers.', 'Target', 'from-emerald-500 to-green-600', 1),
('Transparency', 'We believe in open communication and honest practices with all our stakeholders.', 'Eye', 'from-amber-500 to-yellow-600', 2),
('Sustainability', 'Our farming methods prioritize environmental health and long-term sustainability.', 'Heart', 'from-green-600 to-emerald-700', 3),
('Community', 'We are committed to supporting local communities and contributing to their growth.', 'Users', 'from-stone-500 to-stone-700', 4);

-- Insert default milestones
INSERT INTO public.website_milestones (year, title, description, display_order) VALUES
('2015', 'The Beginning', 'Started as a small family poultry farm in Ibadan', 1),
('2017', 'Expansion', 'Added crop cultivation and expanded to 50 hectares', 2),
('2019', 'Cattle Division', 'Introduced cattle rearing and dairy production', 3),
('2022', 'Modernization', 'Implemented sustainable practices and modern equipment', 4),
('2024', 'Today', 'Serving thousands of customers across Nigeria', 5);

-- Insert default practices
INSERT INTO public.website_practices (title, description, content, icon, color, bg_color, display_order) VALUES
('Soil Health Management', 'Our approach to maintaining healthy, productive soil.', 'At Geomate Agro Ventures, we understand that healthy soil is the foundation of sustainable agriculture. We employ several practices to maintain and improve soil health:

• Crop rotation to prevent nutrient depletion
• Cover cropping during off-seasons
• Minimal tillage to preserve soil structure
• Regular soil testing and targeted nutrient application
• Use of organic matter and compost to enhance fertility

These practices ensure that our soil remains productive for generations to come while reducing our environmental footprint.', 'Leaf', 'from-green-500 to-emerald-600', 'bg-green-500/10', 1),
('Water Conservation', 'Efficient water use through modern irrigation systems.', 'Water is a precious resource, and we take its conservation seriously. Our water management strategies include:

• Drip irrigation systems that deliver water directly to plant roots
• Rainwater harvesting and storage facilities
• Scheduling irrigation based on weather data and soil moisture levels
• Mulching to reduce evaporation
• Regular maintenance of irrigation equipment to prevent leaks

Through these methods, we significantly reduce water waste while ensuring our crops and animals receive the hydration they need.', 'Droplets', 'from-blue-500 to-cyan-600', 'bg-blue-500/10', 2),
('Animal Welfare', 'Ethical treatment and care for all our livestock.', 'We believe that happy, healthy animals produce the best products. Our animal welfare standards include:

• Spacious, clean housing for all livestock
• Access to outdoor areas and natural light
• Balanced, nutritious diets without unnecessary antibiotics
• Regular veterinary check-ups and preventive care
• Humane handling practices at all times

Our commitment to animal welfare is not just ethical—it results in healthier animals and higher quality products for our customers.', 'Heart', 'from-rose-500 to-pink-600', 'bg-rose-500/10', 3),
('Sustainable Energy', 'Utilizing renewable energy sources on the farm.', 'We are working towards reducing our carbon footprint through sustainable energy practices:

• Solar panels for powering farm equipment and facilities
• Energy-efficient lighting and cooling systems
• Biogas production from farm waste
• Natural ventilation in animal housing where possible

These initiatives help reduce our operating costs while contributing to a cleaner environment for our community.', 'Sun', 'from-amber-500 to-orange-600', 'bg-amber-500/10', 4),
('Waste Management', 'Converting farm waste into valuable resources.', 'Nothing goes to waste at Geomate Agro Ventures. Our waste management approach includes:

• Composting plant materials and manure for use as organic fertilizer
• Biogas production from organic waste
• Recycling packaging materials
• Proper disposal of any non-recyclable waste

By turning waste into resources, we close the loop and create a more sustainable farming operation.', 'Recycle', 'from-teal-500 to-green-600', 'bg-teal-500/10', 5),
('Integrated Pest Management', 'Minimizing chemical use through natural pest control.', 'We prioritize natural pest control methods to protect both our crops and the environment:

• Introduction of beneficial insects that prey on pests
• Companion planting to deter harmful insects
• Regular crop monitoring to catch infestations early
• Use of biological pesticides when intervention is needed
• Chemical pesticides only as a last resort and in minimal quantities

This approach protects our ecosystem while producing healthier, safer food for our customers.', 'Shield', 'from-indigo-500 to-purple-600', 'bg-indigo-500/10', 6);

-- Insert default categories
INSERT INTO public.website_categories (slug, name, description, image_url, color, icon, display_order) VALUES
('poultry', 'Poultry', 'Fresh eggs and quality chicken products', 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=800&h=600&fit=crop', 'from-amber-600 to-orange-700', 'Egg', 1),
('crops', 'Crops', 'Organically grown vegetables and grains', 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=800&h=600&fit=crop', 'from-green-600 to-emerald-700', 'Wheat', 2),
('cattle', 'Cattle', 'Premium beef and dairy products', 'https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=800&h=600&fit=crop', 'from-stone-600 to-stone-800', 'Beef', 3);

-- =============================================================
-- SETUP COMPLETE!
-- Now create an admin user in Authentication → Users
-- =============================================================
