-- Portfolio items table: supports image and video assets with captions
CREATE TYPE public.portfolio_media_type AS ENUM ('image', 'video');

CREATE TABLE public.vendor_portfolio_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vendor_id UUID NOT NULL,
  media_type public.portfolio_media_type NOT NULL DEFAULT 'image',
  url TEXT NOT NULL,
  caption TEXT,
  duration_seconds NUMERIC,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_vendor_portfolio_items_vendor ON public.vendor_portfolio_items(vendor_id);

ALTER TABLE public.vendor_portfolio_items ENABLE ROW LEVEL SECURITY;

-- Public can view portfolio of approved + active vendors; vendor and admin can always view their own
CREATE POLICY "Portfolio viewable by everyone for active vendors"
ON public.vendor_portfolio_items FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.vendors v
    WHERE v.id = vendor_portfolio_items.vendor_id
      AND ((v.active = true AND v.approval_status = 'approved')
           OR v.user_id = auth.uid()
           OR public.has_role(auth.uid(), 'admin'))
  )
);

CREATE POLICY "Vendor manages own portfolio items"
ON public.vendor_portfolio_items FOR ALL
USING (
  EXISTS (SELECT 1 FROM public.vendors v WHERE v.id = vendor_portfolio_items.vendor_id AND v.user_id = auth.uid())
)
WITH CHECK (
  EXISTS (SELECT 1 FROM public.vendors v WHERE v.id = vendor_portfolio_items.vendor_id AND v.user_id = auth.uid())
);

CREATE POLICY "Admins can manage portfolio items"
ON public.vendor_portfolio_items FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_vendor_portfolio_items_updated_at
BEFORE UPDATE ON public.vendor_portfolio_items
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();