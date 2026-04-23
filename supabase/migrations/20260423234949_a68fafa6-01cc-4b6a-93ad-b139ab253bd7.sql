-- Add visibility control fields to vendors
ALTER TABLE public.vendors
  ADD COLUMN IF NOT EXISTS hidden boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS hidden_until timestamptz;

-- Update the public SELECT policy on vendors to filter hidden ones
DROP POLICY IF EXISTS "Vendors viewable by everyone" ON public.vendors;

CREATE POLICY "Vendors viewable by everyone"
ON public.vendors
FOR SELECT
USING (
  (
    active = true
    AND approval_status = 'approved'::approval_status
    AND (
      hidden = false
      OR (hidden = true AND hidden_until IS NOT NULL AND hidden_until <= now())
    )
  )
  OR auth.uid() = user_id
  OR has_role(auth.uid(), 'admin'::app_role)
);

-- Helpful index for fast filtering on public lists
CREATE INDEX IF NOT EXISTS idx_vendors_visibility
  ON public.vendors (approval_status, active, hidden, hidden_until);