DROP INDEX IF EXISTS public.daftra_invoices_doc_number_idx;

-- WhatsApp numbers connected to the company inbox
CREATE TABLE public.whatsapp_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  phone_number_id text NOT NULL UNIQUE,
  waba_id text,
  display_name text,
  display_phone text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.whatsapp_accounts TO authenticated;
GRANT ALL ON public.whatsapp_accounts TO service_role;
ALTER TABLE public.whatsapp_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff view WhatsApp numbers" ON public.whatsapp_accounts FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "Admins add WhatsApp numbers" ON public.whatsapp_accounts FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin') AND user_id = auth.uid());
CREATE POLICY "Admins edit WhatsApp numbers" ON public.whatsapp_accounts FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins remove WhatsApp numbers" ON public.whatsapp_accounts FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Per-number access tokens: server functions only, never readable from the app
CREATE TABLE public.whatsapp_account_secrets (
  account_id uuid PRIMARY KEY REFERENCES public.whatsapp_accounts(id) ON DELETE CASCADE,
  access_token text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.whatsapp_account_secrets TO service_role;
ALTER TABLE public.whatsapp_account_secrets ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  account_id uuid REFERENCES public.whatsapp_accounts(id) ON DELETE SET NULL,
  phone text NOT NULL,
  display_name text,
  whatsapp_id text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, phone)
);
GRANT SELECT, UPDATE ON public.contacts TO authenticated;
GRANT ALL ON public.contacts TO service_role;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff view contacts" ON public.contacts FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "Staff edit contacts" ON public.contacts FOR UPDATE TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

CREATE TABLE public.conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  contact_id uuid NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
  account_id uuid REFERENCES public.whatsapp_accounts(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'active',
  unread_count integer NOT NULL DEFAULT 0,
  last_message_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, contact_id)
);
GRANT SELECT, UPDATE ON public.conversations TO authenticated;
GRANT ALL ON public.conversations TO service_role;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff view conversations" ON public.conversations FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "Staff update conversations" ON public.conversations FOR UPDATE TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE INDEX conversations_last_message_idx ON public.conversations (last_message_at DESC NULLS LAST);

CREATE TABLE public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  conversation_id uuid NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  account_id uuid REFERENCES public.whatsapp_accounts(id) ON DELETE SET NULL,
  direction text NOT NULL,
  content text,
  media_type text,
  media_url text,
  status text NOT NULL DEFAULT 'sent',
  wa_message_id text,
  sent_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.messages TO authenticated;
GRANT ALL ON public.messages TO service_role;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff view messages" ON public.messages FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE INDEX messages_conversation_idx ON public.messages (conversation_id, created_at);
CREATE INDEX messages_wa_message_idx ON public.messages (wa_message_id);

CREATE TABLE public.message_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  account_id uuid REFERENCES public.whatsapp_accounts(id) ON DELETE CASCADE,
  name text NOT NULL,
  language text NOT NULL DEFAULT 'ar',
  category text NOT NULL DEFAULT 'UTILITY',
  components jsonb NOT NULL DEFAULT '[]'::jsonb,
  status text NOT NULL DEFAULT 'DRAFT',
  meta_template_id text,
  rejection_reason text,
  submitted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.message_templates TO authenticated;
GRANT ALL ON public.message_templates TO service_role;
ALTER TABLE public.message_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff view templates" ON public.message_templates FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "Staff create own templates" ON public.message_templates FOR INSERT TO authenticated WITH CHECK (public.is_staff(auth.uid()) AND user_id = auth.uid());
CREATE POLICY "Staff edit own templates" ON public.message_templates FOR UPDATE TO authenticated USING (public.is_staff(auth.uid()) AND user_id = auth.uid()) WITH CHECK (public.is_staff(auth.uid()) AND user_id = auth.uid());
CREATE POLICY "Staff delete own templates" ON public.message_templates FOR DELETE TO authenticated USING (public.is_staff(auth.uid()) AND user_id = auth.uid());

CREATE TABLE public.media_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  account_id uuid REFERENCES public.whatsapp_accounts(id) ON DELETE SET NULL,
  contact_id uuid REFERENCES public.contacts(id) ON DELETE SET NULL,
  message_id uuid REFERENCES public.messages(id) ON DELETE CASCADE,
  wa_media_id text,
  file_name text,
  mime_type text,
  media_type text,
  size_bytes bigint NOT NULL DEFAULT 0,
  storage_key text,
  storage_url text,
  status text NOT NULL DEFAULT 'stored',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.media_files TO authenticated;
GRANT ALL ON public.media_files TO service_role;
ALTER TABLE public.media_files ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff view media files" ON public.media_files FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE INDEX media_files_message_idx ON public.media_files (message_id);

CREATE OR REPLACE FUNCTION public.increment_unread(p_conversation_id uuid)
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  UPDATE public.conversations SET unread_count = unread_count + 1, updated_at = now() WHERE id = p_conversation_id;
$$;
REVOKE EXECUTE ON FUNCTION public.increment_unread(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.increment_unread(uuid) TO service_role;

CREATE TRIGGER whatsapp_accounts_set_updated_at BEFORE UPDATE ON public.whatsapp_accounts FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER whatsapp_account_secrets_set_updated_at BEFORE UPDATE ON public.whatsapp_account_secrets FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER contacts_set_updated_at BEFORE UPDATE ON public.contacts FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER conversations_set_updated_at BEFORE UPDATE ON public.conversations FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER message_templates_set_updated_at BEFORE UPDATE ON public.message_templates FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;