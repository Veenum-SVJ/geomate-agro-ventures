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