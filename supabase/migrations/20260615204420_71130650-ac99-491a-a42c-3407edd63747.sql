TRUNCATE TABLE
  public.payments,
  public.bookings,
  public.events,
  public.guests,
  public.vendor_invoices,
  public.payout_requests,
  public.emergency_requests,
  public.incident_reports,
  public.review_replies,
  public.reviews,
  public.content_reports,
  public.notifications,
  public.booking_checklists,
  public.timeline_milestones,
  public.vendor_availability,
  public.customer_leads
RESTART IDENTITY CASCADE;