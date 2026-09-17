-- Trigger-only helper functions must never be callable through the API.
-- Trigger firing does not require the calling role to hold EXECUTE, so this is
-- safe: all triggers keep working unchanged.
DO $$
DECLARE
  fn text;
  names text[] := ARRAY[
    'auto_grant_primary_admin','handle_new_booking','handle_new_report','handle_new_user',
    'limit_planner_interest_rate','notify_admins_on_incident','notify_admins_on_planner_interest',
    'notify_admins_on_vendor_application','notify_customer_on_booking_status','notify_customer_on_reply',
    'notify_on_attendance','notify_on_emergency','notify_on_payment_received','notify_vendor_on_review',
    'notify_vendor_on_status_change','package_resubmit_on_edit','protect_vendor_approval_fields',
    'protect_vendor_verified','seed_event_milestones','sync_booking_availability',
    'sync_deleted_booking_availability','update_updated_at_column','vendor_resubmit_on_edit'
  ];
BEGIN
  FOREACH fn IN ARRAY names LOOP
    EXECUTE format('REVOKE ALL ON FUNCTION public.%I() FROM PUBLIC, anon, authenticated', fn);
    EXECUTE format('GRANT EXECUTE ON FUNCTION public.%I() TO service_role', fn);
  END LOOP;
END $$;
