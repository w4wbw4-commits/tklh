-- Re-grant sensitive columns to authenticated so vendor owners and admins
-- can still read their own banking/contact data via RLS-restricted queries.
-- Anonymous users remain blocked from these columns.
GRANT SELECT (iban, iban_certificate_url, commercial_register_url, phone)
ON public.vendors TO authenticated;
