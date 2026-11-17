-- Trigger-only functions: nobody calls them directly.
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.add_project_creator() from public, anon, authenticated;
revoke execute on function public.prepare_document_version() from public, anon, authenticated;
revoke execute on function public.bump_document_version() from public, anon, authenticated;
revoke execute on function public.prepare_approval() from public, anon, authenticated;
revoke execute on function public.sync_document_on_approval() from public, anon, authenticated;
revoke execute on function public.prepare_share_link() from public, anon, authenticated;
revoke execute on function public.log_audit() from public, anon, authenticated;

-- Access helpers used by access rules: signed-in users only.
revoke execute on function public.has_role(uuid, public.app_role) from public, anon;
revoke execute on function public.is_staff(uuid) from public, anon;
revoke execute on function public.project_role(uuid, uuid) from public, anon;
revoke execute on function public.can_view_project(uuid, uuid) from public, anon;
revoke execute on function public.can_edit_project(uuid, uuid) from public, anon;
revoke execute on function public.can_manage_project(uuid, uuid) from public, anon;
revoke execute on function public.can_view_document(uuid, uuid) from public, anon;
revoke execute on function public.can_edit_document(uuid, uuid) from public, anon;
grant execute on function public.has_role(uuid, public.app_role) to authenticated, service_role;
grant execute on function public.is_staff(uuid) to authenticated, service_role;
grant execute on function public.project_role(uuid, uuid) to authenticated, service_role;
grant execute on function public.can_view_project(uuid, uuid) to authenticated, service_role;
grant execute on function public.can_edit_project(uuid, uuid) to authenticated, service_role;
grant execute on function public.can_manage_project(uuid, uuid) to authenticated, service_role;
grant execute on function public.can_view_document(uuid, uuid) to authenticated, service_role;
grant execute on function public.can_edit_document(uuid, uuid) to authenticated, service_role;

-- Private project files: path = {project_id}/{document_id}/{file}
create policy "Project files: viewers of the document can read"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'project-files'
    and public.can_view_document(auth.uid(), public.try_uuid((storage.foldername(name))[2]))
  );
create policy "Project files: editors can upload"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'project-files'
    and public.can_edit_document(auth.uid(), public.try_uuid((storage.foldername(name))[2]))
  );
create policy "Project files: admins can delete"
  on storage.objects for delete to authenticated
  using (bucket_id = 'project-files' and public.has_role(auth.uid(), 'admin'));