ALTER TABLE public.daftra_invoices
  ADD COLUMN IF NOT EXISTS client_id text,
  ADD COLUMN IF NOT EXISTS due_date date,
  ADD COLUMN IF NOT EXISTS payment_status text,
  ADD COLUMN IF NOT EXISTS synced_at timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();

GRANT SELECT ON public.daftra_invoices TO authenticated;
GRANT ALL ON public.daftra_invoices TO service_role;
ALTER TABLE public.daftra_invoices ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Staff can read synced Daftra invoices" ON public.daftra_invoices;
CREATE POLICY "Staff can read synced Daftra invoices"
  ON public.daftra_invoices FOR SELECT TO authenticated
  USING (public.is_staff(auth.uid()));

CREATE INDEX IF NOT EXISTS daftra_invoices_issue_date_idx ON public.daftra_invoices (issue_date DESC);
CREATE INDEX IF NOT EXISTS daftra_invoices_doc_number_idx ON public.daftra_invoices (doc_number);

DROP TRIGGER IF EXISTS daftra_invoices_set_updated_at ON public.daftra_invoices;
CREATE TRIGGER daftra_invoices_set_updated_at
  BEFORE UPDATE ON public.daftra_invoices
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE IF NOT EXISTS public.daftra_sync_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source text NOT NULL,
  processed integer NOT NULL DEFAULT 0,
  failed integer NOT NULL DEFAULT 0,
  error text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.daftra_sync_logs TO authenticated;
GRANT ALL ON public.daftra_sync_logs TO service_role;
ALTER TABLE public.daftra_sync_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can read Daftra sync logs"
  ON public.daftra_sync_logs FOR SELECT TO authenticated
  USING (public.is_staff(auth.uid()));
CREATE INDEX IF NOT EXISTS daftra_sync_logs_created_idx ON public.daftra_sync_logs (created_at DESC);