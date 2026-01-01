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