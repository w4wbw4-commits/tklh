-- =========================================
-- ENUMS
-- =========================================
CREATE TYPE public.app_role AS ENUM ('customer', 'vendor', 'admin');
CREATE TYPE public.vendor_category AS ENUM ('hall', 'catering', 'photography', 'dj', 'decor', 'cars');
CREATE TYPE public.package_tier AS ENUM ('basic', 'premium', 'royal');
CREATE TYPE public.availability_status AS ENUM ('blocked', 'booked', 'pending');
CREATE TYPE public.booking_status AS ENUM ('pending', 'confirmed', 'rejected', 'completed', 'cancelled');
CREATE TYPE public.notification_type AS ENUM ('booking_request', 'booking_confirmed', 'payment_confirmed', 'event_reminder', 'general');

-- =========================================
-- TIMESTAMP HELPER
-- =========================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- =========================================
-- PROFILES
-- =========================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles viewable by everyone"
  ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================
-- USER ROLES
-- =========================================
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
$$;

CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage roles"
  ON public.user_roles FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- =========================================
-- VENDORS
-- =========================================
CREATE TABLE public.vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  business_name TEXT NOT NULL,
  category vendor_category NOT NULL,
  bio TEXT,
  city TEXT,
  phone TEXT,
  portfolio_urls TEXT[] NOT NULL DEFAULT '{}',
  commercial_register_url TEXT,
  daily_capacity INT NOT NULL DEFAULT 1 CHECK (daily_capacity > 0),
  starting_price NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (starting_price >= 0),
  verified BOOLEAN NOT NULL DEFAULT false,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_vendors_category ON public.vendors(category) WHERE active = true;

CREATE POLICY "Vendors viewable by everyone"
  ON public.vendors FOR SELECT USING (active = true OR auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Vendor can insert own profile"
  ON public.vendors FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Vendor can update own profile (non-verification fields)"
  ON public.vendors FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Vendor can delete own profile"
  ON public.vendors FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage vendors"
  ON public.vendors FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_vendors_updated_at
  BEFORE UPDATE ON public.vendors
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Prevent vendors from self-verifying
CREATE OR REPLACE FUNCTION public.protect_vendor_verified()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.verified IS DISTINCT FROM OLD.verified
     AND NOT public.has_role(auth.uid(), 'admin') THEN
    NEW.verified := OLD.verified;
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER protect_vendor_verified_trg
  BEFORE UPDATE ON public.vendors
  FOR EACH ROW EXECUTE FUNCTION public.protect_vendor_verified();

-- =========================================
-- PACKAGES
-- =========================================
CREATE TABLE public.packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  tier package_tier NOT NULL DEFAULT 'basic',
  price NUMERIC(12,2) NOT NULL CHECK (price >= 0),
  description TEXT,
  includes TEXT[] NOT NULL DEFAULT '{}',
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_packages_vendor ON public.packages(vendor_id);

CREATE POLICY "Packages viewable by everyone"
  ON public.packages FOR SELECT USING (true);
CREATE POLICY "Vendor manages own packages"
  ON public.packages FOR ALL
  USING (EXISTS (SELECT 1 FROM public.vendors v WHERE v.id = vendor_id AND v.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.vendors v WHERE v.id = vendor_id AND v.user_id = auth.uid()));

CREATE TRIGGER update_packages_updated_at
  BEFORE UPDATE ON public.packages
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================
-- VENDOR AVAILABILITY
-- =========================================
CREATE TABLE public.vendor_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  status availability_status NOT NULL,
  note TEXT,
  booking_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (vendor_id, date)
);
ALTER TABLE public.vendor_availability ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_availability_vendor_date ON public.vendor_availability(vendor_id, date);

CREATE POLICY "Availability viewable by everyone"
  ON public.vendor_availability FOR SELECT USING (true);
CREATE POLICY "Vendor manages own availability"
  ON public.vendor_availability FOR ALL
  USING (EXISTS (SELECT 1 FROM public.vendors v WHERE v.id = vendor_id AND v.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.vendors v WHERE v.id = vendor_id AND v.user_id = auth.uid()));

-- =========================================
-- BOOKINGS
-- =========================================
CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vendor_id UUID NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  package_id UUID REFERENCES public.packages(id) ON DELETE SET NULL,
  event_date DATE NOT NULL,
  guest_count INT,
  total_price NUMERIC(12,2),
  status booking_status NOT NULL DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_bookings_vendor_date ON public.bookings(vendor_id, event_date);
CREATE INDEX idx_bookings_customer ON public.bookings(customer_id);

CREATE POLICY "Customer can view own bookings"
  ON public.bookings FOR SELECT
  USING (
    auth.uid() = customer_id
    OR EXISTS (SELECT 1 FROM public.vendors v WHERE v.id = vendor_id AND v.user_id = auth.uid())
    OR public.has_role(auth.uid(), 'admin')
  );
CREATE POLICY "Authenticated customers can create bookings"
  ON public.bookings FOR INSERT
  WITH CHECK (auth.uid() = customer_id);
CREATE POLICY "Customer or vendor can update booking"
  ON public.bookings FOR UPDATE
  USING (
    auth.uid() = customer_id
    OR EXISTS (SELECT 1 FROM public.vendors v WHERE v.id = vendor_id AND v.user_id = auth.uid())
  );

CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-block vendor calendar on booking + notify vendor
CREATE OR REPLACE FUNCTION public.handle_new_booking()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  vendor_user UUID;
  vendor_name TEXT;
BEGIN
  -- Block date on vendor calendar
  INSERT INTO public.vendor_availability (vendor_id, date, status, booking_id, note)
  VALUES (NEW.vendor_id, NEW.event_date, 'pending', NEW.id, 'حجز جديد بانتظار التأكيد')
  ON CONFLICT (vendor_id, date) DO UPDATE
    SET status = EXCLUDED.status,
        booking_id = EXCLUDED.booking_id,
        note = EXCLUDED.note;

  -- Notify vendor
  SELECT user_id, business_name INTO vendor_user, vendor_name
  FROM public.vendors WHERE id = NEW.vendor_id;

  IF vendor_user IS NOT NULL THEN
    INSERT INTO public.notifications (user_id, type, title, body)
    VALUES (
      vendor_user,
      'booking_request',
      'طلب حجز جديد',
      'لديك طلب حجز جديد بتاريخ ' || NEW.event_date::TEXT
    );
  END IF;

  RETURN NEW;
END;
$$;
CREATE TRIGGER on_booking_created
  AFTER INSERT ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_booking();

-- Sync availability when booking status changes
CREATE OR REPLACE FUNCTION public.sync_booking_availability()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    IF NEW.status = 'confirmed' THEN
      UPDATE public.vendor_availability
        SET status = 'booked', note = 'محجوز'
        WHERE booking_id = NEW.id;
    ELSIF NEW.status IN ('rejected', 'cancelled') THEN
      DELETE FROM public.vendor_availability WHERE booking_id = NEW.id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_booking_updated
  AFTER UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.sync_booking_availability();

-- =========================================
-- NOTIFICATIONS
-- =========================================
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type notification_type NOT NULL DEFAULT 'general',
  title TEXT NOT NULL,
  body TEXT,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_notifications_user ON public.notifications(user_id, read);

CREATE POLICY "Users see own notifications"
  ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users update own notifications"
  ON public.notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "System can insert notifications"
  ON public.notifications FOR INSERT WITH CHECK (true);

-- =========================================
-- AUTO PROFILE + DEFAULT ROLE ON SIGNUP
-- =========================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data ->> 'display_name', split_part(NEW.email, '@', 1)));

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'customer')
  ON CONFLICT DO NOTHING;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =========================================
-- STORAGE BUCKETS
-- =========================================
INSERT INTO storage.buckets (id, name, public)
  VALUES ('vendor-portfolios', 'vendor-portfolios', true);
INSERT INTO storage.buckets (id, name, public)
  VALUES ('vendor-documents', 'vendor-documents', false);

-- Portfolio: public read, vendor writes own folder
CREATE POLICY "Portfolio images public read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'vendor-portfolios');
CREATE POLICY "Vendors upload own portfolio"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'vendor-portfolios' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Vendors update own portfolio"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'vendor-portfolios' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Vendors delete own portfolio"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'vendor-portfolios' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Documents: private, vendor + admin only
CREATE POLICY "Vendors read own documents"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'vendor-documents'
    AND (auth.uid()::text = (storage.foldername(name))[1] OR public.has_role(auth.uid(), 'admin'))
  );
CREATE POLICY "Vendors upload own documents"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'vendor-documents' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Vendors update own documents"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'vendor-documents' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Vendors delete own documents"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'vendor-documents' AND auth.uid()::text = (storage.foldername(name))[1]);