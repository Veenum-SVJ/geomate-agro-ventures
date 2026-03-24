-- =============================================================
-- DATABASE INDEXES FOR PERFORMANCE
-- Run this in Supabase SQL Editor
-- =============================================================

-- Production tables: farm_id + date range queries (most common dashboard pattern)
CREATE INDEX IF NOT EXISTS idx_poultry_production_farm_date 
  ON public.poultry_production (farm_id, record_date DESC);

CREATE INDEX IF NOT EXISTS idx_poultry_resources_farm_date 
  ON public.poultry_resources (farm_id, record_date DESC);

CREATE INDEX IF NOT EXISTS idx_poultry_sales_farm_date 
  ON public.poultry_sales (farm_id, sale_date DESC);

CREATE INDEX IF NOT EXISTS idx_fishery_production_farm_date 
  ON public.fishery_production (farm_id, record_date DESC);

CREATE INDEX IF NOT EXISTS idx_fishery_sales_farm_date 
  ON public.fishery_sales (farm_id, sale_date DESC);

CREATE INDEX IF NOT EXISTS idx_crop_production_farm_date 
  ON public.crop_production (farm_id, record_date DESC);

CREATE INDEX IF NOT EXISTS idx_crop_sales_farm_date 
  ON public.crop_sales (farm_id, sale_date DESC);

CREATE INDEX IF NOT EXISTS idx_feedmill_ingredients_farm_date 
  ON public.feedmill_ingredients (farm_id, record_date DESC);

CREATE INDEX IF NOT EXISTS idx_feedmill_power_farm_date 
  ON public.feedmill_power (farm_id, record_date DESC);

CREATE INDEX IF NOT EXISTS idx_feedmill_production_farm_date 
  ON public.feedmill_production (farm_id, record_date DESC);

-- Tasks: filtered by farm+status on dashboard, and by assigned_to+due_date in cron
CREATE INDEX IF NOT EXISTS idx_tasks_farm_status 
  ON public.tasks (farm_id, status);

CREATE INDEX IF NOT EXISTS idx_tasks_assigned_due 
  ON public.tasks (assigned_to, due_date) WHERE status = 'pending';

-- Inventory: filtered by farm+category on inventory page
CREATE INDEX IF NOT EXISTS idx_inventory_farm_category 
  ON public.inventory (farm_id, category);

-- Team invitations: lookup during acceptance
CREATE INDEX IF NOT EXISTS idx_team_invitations_token 
  ON public.team_invitations (token) WHERE status = 'pending';

CREATE INDEX IF NOT EXISTS idx_team_invitations_email_farm 
  ON public.team_invitations (email, farm_id, status);

-- Inquiries: CMS inbox filtering
CREATE INDEX IF NOT EXISTS idx_inquiries_status_created 
  ON public.inquiries (status, created_at DESC);

-- Notifications log: user history
CREATE INDEX IF NOT EXISTS idx_notifications_log_user_sent 
  ON public.notifications_log (user_id, sent_at DESC);

-- Workers: filtered by farm
CREATE INDEX IF NOT EXISTS idx_workers_farm_status 
  ON public.workers (farm_id, status);

-- Customers: filtered by farm
CREATE INDEX IF NOT EXISTS idx_customers_farm 
  ON public.customers (farm_id);

-- User roles: frequently queried for auth checks
CREATE INDEX IF NOT EXISTS idx_user_roles_user_farm 
  ON public.user_roles (user_id, farm_id);

-- Profiles: lookup by user_id (already PK, but farm_id lookup is common)
CREATE INDEX IF NOT EXISTS idx_profiles_farm 
  ON public.profiles (farm_id);

-- =============================================================
-- DONE! All high-frequency query patterns now have indexes.
-- =============================================================
