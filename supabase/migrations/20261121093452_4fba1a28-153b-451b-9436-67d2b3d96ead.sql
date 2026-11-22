CREATE TABLE public.portal_services (
  id text PRIMARY KEY DEFAULT ('svc-' || substr(gen_random_uuid()::text,1,12)),
  name text NOT NULL,
  name_en text NOT NULL DEFAULT '',
  url text NOT NULL,
  icon text NOT NULL DEFAULT 'globe',
  description text NOT NULL DEFAULT '',
  description_en text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT 'public',
  sort_order integer NOT NULL DEFAULT 0,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.portal_services TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.portal_services TO authenticated;
GRANT ALL ON public.portal_services TO service_role;
ALTER TABLE public.portal_services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view portal services" ON public.portal_services FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Staff add portal services" ON public.portal_services FOR INSERT TO authenticated WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "Staff edit portal services" ON public.portal_services FOR UPDATE TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "Staff delete portal services" ON public.portal_services FOR DELETE TO authenticated USING (public.is_staff(auth.uid()));
CREATE TRIGGER portal_services_updated_at BEFORE UPDATE ON public.portal_services FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE OR REPLACE FUNCTION public.validate_portal_service() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.category NOT IN ('public','private','frappe') THEN RAISE EXCEPTION 'invalid category'; END IF;
  IF NEW.url !~ '^https?://' THEN RAISE EXCEPTION 'url must start with http(s)://'; END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER portal_services_validate BEFORE INSERT OR UPDATE ON public.portal_services FOR EACH ROW EXECUTE FUNCTION public.validate_portal_service();

ALTER TABLE public.daftra_invoices ADD COLUMN IF NOT EXISTS kind text NOT NULL DEFAULT 'invoice';
GRANT SELECT ON public.daftra_invoices, public.daftra_sync_logs TO authenticated;
GRANT ALL ON public.daftra_invoices, public.daftra_sync_logs TO service_role;