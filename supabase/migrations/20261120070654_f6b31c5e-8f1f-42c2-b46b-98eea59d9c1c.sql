CREATE POLICY "No app access to WhatsApp access keys" ON public.whatsapp_account_secrets AS RESTRICTIVE FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);

CREATE INDEX contacts_account_idx ON public.contacts (account_id);
CREATE INDEX conversations_account_idx ON public.conversations (account_id);
CREATE INDEX conversations_contact_idx ON public.conversations (contact_id);
CREATE INDEX media_files_account_idx ON public.media_files (account_id);
CREATE INDEX media_files_contact_idx ON public.media_files (contact_id);
CREATE INDEX message_templates_account_idx ON public.message_templates (account_id);
CREATE INDEX messages_account_idx ON public.messages (account_id);
CREATE INDEX whatsapp_accounts_user_idx ON public.whatsapp_accounts (user_id);