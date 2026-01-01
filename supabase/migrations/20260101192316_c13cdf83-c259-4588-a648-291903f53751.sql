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