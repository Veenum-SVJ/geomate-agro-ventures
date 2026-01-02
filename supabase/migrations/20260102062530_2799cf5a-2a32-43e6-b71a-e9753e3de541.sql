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