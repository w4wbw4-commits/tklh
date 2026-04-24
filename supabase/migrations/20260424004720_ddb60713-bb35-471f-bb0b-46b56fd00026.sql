-- Create platform_packages table
CREATE TABLE public.platform_packages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL DEFAULT 0,
  includes TEXT[] NOT NULL DEFAULT '{}',
  media JSONB NOT NULL DEFAULT '[]'::jsonb,
  thumbnail_url TEXT,
  published BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.platform_packages ENABLE ROW LEVEL SECURITY;

-- Public can view published packages
CREATE POLICY "Anyone can view published platform packages"
ON public.platform_packages
FOR SELECT
USING (published = true OR has_role(auth.uid(), 'admin'::app_role));

-- Admins manage all
CREATE POLICY "Admins can insert platform packages"
ON public.platform_packages
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update platform packages"
ON public.platform_packages
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete platform packages"
ON public.platform_packages
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- updated_at trigger
CREATE TRIGGER update_platform_packages_updated_at
BEFORE UPDATE ON public.platform_packages
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Index for public listing
CREATE INDEX idx_platform_packages_published_sort
ON public.platform_packages (published, sort_order DESC, created_at DESC);

-- Storage bucket for media
INSERT INTO storage.buckets (id, name, public)
VALUES ('platform-package-media', 'platform-package-media', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Anyone can view platform package media"
ON storage.objects
FOR SELECT
USING (bucket_id = 'platform-package-media');

CREATE POLICY "Admins can upload platform package media"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'platform-package-media' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update platform package media"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'platform-package-media' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete platform package media"
ON storage.objects
FOR DELETE
USING (bucket_id = 'platform-package-media' AND has_role(auth.uid(), 'admin'::app_role));