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