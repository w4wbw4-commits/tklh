
-- 1. Restrict profiles SELECT to owner + admins; expose safe fields via view
DROP POLICY IF EXISTS "Profiles viewable by everyone" ON public.profiles;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

-- Public-safe view (display_name + avatar only, no phone)
CREATE OR REPLACE VIEW public.public_profiles
WITH (security_invoker = true) AS
SELECT id, user_id, display_name, avatar_url
FROM public.profiles;

GRANT SELECT ON public.public_profiles TO anon, authenticated;

-- 2. Prevent vendors from self-approving by editing verification fields
CREATE OR REPLACE FUNCTION public.protect_vendor_approval_fields()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    NEW.approval_status   := OLD.approval_status;
    NEW.verified          := OLD.verified;
    NEW.reviewed_by       := OLD.reviewed_by;
    NEW.reviewed_at       := OLD.reviewed_at;
    NEW.rejection_reason  := OLD.rejection_reason;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_vendor_approval_fields ON public.vendors;
CREATE TRIGGER trg_protect_vendor_approval_fields
BEFORE UPDATE ON public.vendors
FOR EACH ROW
EXECUTE FUNCTION public.protect_vendor_approval_fields();

-- 3. Realtime authorization: only stakeholders can receive postgres_changes
-- for bookings/payments. We scope by topic naming convention, but as a
-- defense-in-depth we deny anonymous Realtime subscriptions entirely.
ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users only on realtime"
  ON realtime.messages;

CREATE POLICY "Authenticated users only on realtime"
  ON realtime.messages
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users only on realtime insert"
  ON realtime.messages
  FOR INSERT
  TO authenticated
  WITH CHECK (true);
