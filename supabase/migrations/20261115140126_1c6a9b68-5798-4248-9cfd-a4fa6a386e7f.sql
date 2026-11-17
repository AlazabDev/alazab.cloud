-- ===== Enums =====
create type public.app_role as enum ('admin', 'staff', 'client');
create type public.project_member_role as enum ('manager', 'editor', 'viewer', 'client');
create type public.document_status as enum ('draft', 'in_review', 'approved', 'rejected', 'superseded');
create type public.approval_status as enum ('pending', 'approved', 'rejected', 'changes_requested');

-- ===== Shared updated_at trigger =====
create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = public as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- ===== Profiles =====
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  company text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;
create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

-- ===== Roles =====
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
grant select, insert, delete on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create or replace function public.is_staff(_user_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role in ('admin', 'staff'))
$$;

create policy "Users read own roles, admins read all" on public.user_roles
  for select to authenticated
  using (user_id = auth.uid() or public.has_role(auth.uid(), 'admin'));
create policy "Admins assign roles" on public.user_roles
  for insert to authenticated with check (public.has_role(auth.uid(), 'admin'));
create policy "Admins remove roles" on public.user_roles
  for delete to authenticated using (public.has_role(auth.uid(), 'admin'));

create policy "Own profile or staff can read profiles" on public.profiles
  for select to authenticated
  using (id = auth.uid() or public.is_staff(auth.uid()));
create policy "Users update own profile" on public.profiles
  for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

-- New account: create profile; the very first account becomes admin.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, email, company)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    new.email,
    nullif(new.raw_user_meta_data ->> 'company', '')
  )
  on conflict (id) do nothing;

  if not exists (select 1 from public.user_roles where role = 'admin') then
    insert into public.user_roles (user_id, role) values (new.id, 'admin');
  end if;
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ===== Projects =====
create table public.projects (
  id uuid primary key default gen_random_uuid(),
  code text,
  name text not null,
  client_name text,
  location text,
  description text,
  status text not null default 'active',
  created_by uuid default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.projects to authenticated;
grant all on public.projects to service_role;
alter table public.projects enable row level security;
create trigger projects_updated_at before update on public.projects
  for each row execute function public.set_updated_at();

create table public.project_members (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  member_role public.project_member_role not null default 'viewer',
  created_at timestamptz not null default now(),
  unique (project_id, user_id)
);
grant select, insert, update, delete on public.project_members to authenticated;
grant all on public.project_members to service_role;
alter table public.project_members enable row level security;

create or replace function public.project_role(_user_id uuid, _project_id uuid)
returns public.project_member_role language sql stable security definer set search_path = public as $$
  select member_role from public.project_members where user_id = _user_id and project_id = _project_id
$$;

create or replace function public.can_view_project(_user_id uuid, _project_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select public.has_role(_user_id, 'admin')
    or exists (select 1 from public.project_members where user_id = _user_id and project_id = _project_id)
$$;

create or replace function public.can_edit_project(_user_id uuid, _project_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select public.has_role(_user_id, 'admin')
    or exists (select 1 from public.project_members
               where user_id = _user_id and project_id = _project_id and member_role in ('manager', 'editor'))
$$;

create or replace function public.can_manage_project(_user_id uuid, _project_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select public.has_role(_user_id, 'admin')
    or exists (select 1 from public.project_members
               where user_id = _user_id and project_id = _project_id and member_role = 'manager')
$$;

create policy "Members view their projects" on public.projects
  for select to authenticated
  using (public.can_view_project(auth.uid(), id) or created_by = auth.uid());
create policy "Staff create projects" on public.projects
  for insert to authenticated
  with check (public.is_staff(auth.uid()) and created_by = auth.uid());
create policy "Managers update projects" on public.projects
  for update to authenticated
  using (public.can_manage_project(auth.uid(), id))
  with check (public.can_manage_project(auth.uid(), id));
create policy "Admins delete projects" on public.projects
  for delete to authenticated using (public.has_role(auth.uid(), 'admin'));

create policy "Members view project members" on public.project_members
  for select to authenticated using (public.can_view_project(auth.uid(), project_id));
create policy "Managers add members" on public.project_members
  for insert to authenticated with check (public.can_manage_project(auth.uid(), project_id));
create policy "Managers change members" on public.project_members
  for update to authenticated
  using (public.can_manage_project(auth.uid(), project_id))
  with check (public.can_manage_project(auth.uid(), project_id));
create policy "Managers remove members" on public.project_members
  for delete to authenticated using (public.can_manage_project(auth.uid(), project_id));

-- Creator becomes project manager.
create or replace function public.add_project_creator()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.created_by is not null then
    insert into public.project_members (project_id, user_id, member_role)
    values (new.id, new.created_by, 'manager')
    on conflict (project_id, user_id) do nothing;
  end if;
  return new;
end $$;
create trigger projects_add_creator after insert on public.projects
  for each row execute function public.add_project_creator();

-- ===== Folders =====
create table public.folders (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  parent_id uuid references public.folders(id) on delete cascade,
  name text not null,
  created_by uuid default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.folders to authenticated;
grant all on public.folders to service_role;
alter table public.folders enable row level security;
create trigger folders_updated_at before update on public.folders
  for each row execute function public.set_updated_at();
create index folders_project_idx on public.folders(project_id);

create policy "Members view folders" on public.folders
  for select to authenticated using (public.can_view_project(auth.uid(), project_id));
create policy "Editors create folders" on public.folders
  for insert to authenticated with check (public.can_edit_project(auth.uid(), project_id));
create policy "Editors rename folders" on public.folders
  for update to authenticated
  using (public.can_edit_project(auth.uid(), project_id))
  with check (public.can_edit_project(auth.uid(), project_id));
create policy "Editors delete folders" on public.folders
  for delete to authenticated using (public.can_edit_project(auth.uid(), project_id));

-- ===== Documents =====
create table public.documents (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  folder_id uuid references public.folders(id) on delete set null,
  doc_number text,
  title text not null,
  discipline text not null default 'general',
  doc_type text not null default 'document',
  status public.document_status not null default 'draft',
  description text,
  issuing_party text,
  tags text[] not null default '{}',
  client_visible boolean not null default false,
  current_version integer not null default 0,
  archived_at timestamptz,
  created_by uuid default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.documents to authenticated;
grant all on public.documents to service_role;
alter table public.documents enable row level security;
create trigger documents_updated_at before update on public.documents
  for each row execute function public.set_updated_at();
create index documents_project_idx on public.documents(project_id);
create index documents_folder_idx on public.documents(folder_id);

create or replace function public.can_view_document(_user_id uuid, _document_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.documents d
    where d.id = _document_id
      and (
        public.has_role(_user_id, 'admin')
        or public.project_role(_user_id, d.project_id) in ('manager', 'editor', 'viewer')
        or (public.project_role(_user_id, d.project_id) = 'client' and d.client_visible)
      )
  )
$$;

create or replace function public.can_edit_document(_user_id uuid, _document_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.documents d
    where d.id = _document_id and public.can_edit_project(_user_id, d.project_id)
  )
$$;

create policy "Members view documents; clients only released ones" on public.documents
  for select to authenticated
  using (
    public.has_role(auth.uid(), 'admin')
    or public.project_role(auth.uid(), project_id) in ('manager', 'editor', 'viewer')
    or (public.project_role(auth.uid(), project_id) = 'client' and client_visible)
  );
create policy "Editors create documents" on public.documents
  for insert to authenticated with check (public.can_edit_project(auth.uid(), project_id));
create policy "Editors update documents" on public.documents
  for update to authenticated
  using (public.can_edit_project(auth.uid(), project_id))
  with check (public.can_edit_project(auth.uid(), project_id));
create policy "Managers delete documents" on public.documents
  for delete to authenticated using (public.can_manage_project(auth.uid(), project_id));

-- ===== Document versions (immutable revisions) =====
create table public.document_versions (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.documents(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  version_number integer not null default 1,
  revision_label text,
  storage_path text not null unique,
  file_name text not null,
  mime_type text,
  size_bytes bigint not null default 0,
  checksum text,
  notes text,
  uploaded_by uuid default auth.uid(),
  created_at timestamptz not null default now(),
  unique (document_id, version_number)
);
grant select, insert, delete on public.document_versions to authenticated;
grant all on public.document_versions to service_role;
alter table public.document_versions enable row level security;
create index document_versions_doc_idx on public.document_versions(document_id);

create or replace function public.prepare_document_version()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  select project_id into new.project_id from public.documents where id = new.document_id;
  select coalesce(max(version_number), 0) + 1 into new.version_number
    from public.document_versions where document_id = new.document_id;
  new.uploaded_by := auth.uid();
  if new.revision_label is null or new.revision_label = '' then
    new.revision_label := 'R' || lpad((new.version_number - 1)::text, 2, '0');
  end if;
  return new;
end $$;
create trigger document_versions_prepare before insert on public.document_versions
  for each row execute function public.prepare_document_version();

create or replace function public.bump_document_version()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  update public.documents set current_version = new.version_number where id = new.document_id;
  return new;
end $$;
create trigger document_versions_bump after insert on public.document_versions
  for each row execute function public.bump_document_version();

create policy "Viewers of a document see its versions" on public.document_versions
  for select to authenticated using (public.can_view_document(auth.uid(), document_id));
create policy "Editors upload versions" on public.document_versions
  for insert to authenticated with check (public.can_edit_document(auth.uid(), document_id));
create policy "Admins delete versions" on public.document_versions
  for delete to authenticated using (public.has_role(auth.uid(), 'admin'));

-- ===== Approvals =====
create table public.approvals (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.documents(id) on delete cascade,
  version_id uuid not null references public.document_versions(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  requested_by uuid default auth.uid(),
  reviewer_id uuid references public.profiles(id) on delete set null,
  status public.approval_status not null default 'pending',
  request_note text,
  decision_note text,
  decided_by uuid,
  decided_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update on public.approvals to authenticated;
grant all on public.approvals to service_role;
alter table public.approvals enable row level security;
create trigger approvals_updated_at before update on public.approvals
  for each row execute function public.set_updated_at();
create index approvals_project_idx on public.approvals(project_id);

create or replace function public.prepare_approval()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then
    select project_id into new.project_id from public.documents where id = new.document_id;
    new.requested_by := auth.uid();
    new.status := 'pending';
    new.decided_by := null;
    new.decided_at := null;
  else
    -- Only the decision may change.
    new.document_id := old.document_id;
    new.version_id := old.version_id;
    new.project_id := old.project_id;
    new.requested_by := old.requested_by;
    new.reviewer_id := old.reviewer_id;
    new.request_note := old.request_note;
    if new.status is distinct from old.status then
      new.decided_by := auth.uid();
      new.decided_at := now();
    end if;
  end if;
  return new;
end $$;
create trigger approvals_prepare before insert or update on public.approvals
  for each row execute function public.prepare_approval();

create or replace function public.sync_document_on_approval()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then
    update public.documents set status = 'in_review' where id = new.document_id;
    -- A client reviewer must be able to see the document.
    if new.reviewer_id is not null
       and public.project_role(new.reviewer_id, new.project_id) = 'client' then
      update public.documents set client_visible = true where id = new.document_id;
    end if;
  elsif new.status is distinct from old.status then
    update public.documents
      set status = case new.status
        when 'approved' then 'approved'::public.document_status
        when 'rejected' then 'rejected'::public.document_status
        when 'changes_requested' then 'draft'::public.document_status
        else status end
      where id = new.document_id;
  end if;
  return new;
end $$;
create trigger approvals_sync after insert or update on public.approvals
  for each row execute function public.sync_document_on_approval();

create policy "Viewers of a document see its approvals" on public.approvals
  for select to authenticated
  using (public.can_view_document(auth.uid(), document_id) or reviewer_id = auth.uid());
create policy "Editors request approvals" on public.approvals
  for insert to authenticated with check (public.can_edit_document(auth.uid(), document_id));
create policy "Managers or assigned reviewer decide" on public.approvals
  for update to authenticated
  using (public.can_manage_project(auth.uid(), project_id) or reviewer_id = auth.uid())
  with check (public.can_manage_project(auth.uid(), project_id) or reviewer_id = auth.uid());

-- ===== Share links =====
create table public.share_links (
  id uuid primary key default gen_random_uuid(),
  token text not null unique default (replace(gen_random_uuid()::text, '-', '') || replace(gen_random_uuid()::text, '-', '')),
  document_id uuid not null references public.documents(id) on delete cascade,
  version_id uuid references public.document_versions(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  recipient text,
  note text,
  allow_download boolean not null default true,
  expires_at timestamptz not null,
  revoked_at timestamptz,
  view_count integer not null default 0,
  last_viewed_at timestamptz,
  created_by uuid default auth.uid(),
  created_at timestamptz not null default now()
);
grant select, insert, update on public.share_links to authenticated;
grant all on public.share_links to service_role;
alter table public.share_links enable row level security;

create or replace function public.prepare_share_link()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then
    select project_id into new.project_id from public.documents where id = new.document_id;
    new.created_by := auth.uid();
    new.view_count := 0;
    if new.expires_at <= now() then
      raise exception 'Share link expiry must be in the future';
    end if;
  else
    -- Only revoking is allowed from the app.
    new.token := old.token;
    new.document_id := old.document_id;
    new.version_id := old.version_id;
    new.project_id := old.project_id;
    new.created_by := old.created_by;
    if current_user = 'authenticated' then
      new.view_count := old.view_count;
      new.last_viewed_at := old.last_viewed_at;
    end if;
  end if;
  return new;
end $$;
create trigger share_links_prepare before insert or update on public.share_links
  for each row execute function public.prepare_share_link();

create policy "Editors view project share links" on public.share_links
  for select to authenticated using (public.can_edit_project(auth.uid(), project_id));
create policy "Editors create share links" on public.share_links
  for insert to authenticated with check (public.can_edit_document(auth.uid(), document_id));
create policy "Editors revoke share links" on public.share_links
  for update to authenticated
  using (public.can_edit_project(auth.uid(), project_id))
  with check (public.can_edit_project(auth.uid(), project_id));

-- ===== Audit log =====
create table public.audit_events (
  id bigint generated always as identity primary key,
  project_id uuid references public.projects(id) on delete cascade,
  document_id uuid references public.documents(id) on delete set null,
  actor_id uuid,
  action text not null,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
grant select on public.audit_events to authenticated;
grant all on public.audit_events to service_role;
alter table public.audit_events enable row level security;
create index audit_events_project_idx on public.audit_events(project_id, created_at desc);
create index audit_events_document_idx on public.audit_events(document_id, created_at desc);

create policy "Admins and project managers read the log" on public.audit_events
  for select to authenticated
  using (public.has_role(auth.uid(), 'admin') or public.can_manage_project(auth.uid(), project_id));

create or replace function public.log_audit()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  _doc uuid;
  _proj uuid;
  _action text;
  _details jsonb := '{}'::jsonb;
begin
  if tg_table_name = 'documents' then
    _doc := new.id; _proj := new.project_id;
    if tg_op = 'INSERT' then
      _action := 'document_created';
      _details := jsonb_build_object('title', new.title);
    else
      if (to_jsonb(new) - 'current_version' - 'updated_at') = (to_jsonb(old) - 'current_version' - 'updated_at') then
        return new;
      end if;
      if new.archived_at is distinct from old.archived_at then
        _action := case when new.archived_at is null then 'document_restored' else 'document_archived' end;
        _details := jsonb_build_object('title', new.title);
      elsif new.status is distinct from old.status then
        _action := 'status_changed';
        _details := jsonb_build_object('title', new.title, 'from', old.status, 'to', new.status);
      elsif new.client_visible is distinct from old.client_visible then
        _action := case when new.client_visible then 'released_to_client' else 'hidden_from_client' end;
        _details := jsonb_build_object('title', new.title);
      else
        _action := 'document_updated';
        _details := jsonb_build_object('title', new.title);
      end if;
    end if;
  elsif tg_table_name = 'document_versions' then
    _doc := new.document_id; _proj := new.project_id;
    _action := 'version_uploaded';
    _details := jsonb_build_object('version', new.version_number, 'revision', new.revision_label, 'file', new.file_name);
  elsif tg_table_name = 'approvals' then
    _doc := new.document_id; _proj := new.project_id;
    if tg_op = 'INSERT' then
      _action := 'approval_requested';
    elsif new.status is distinct from old.status then
      _action := 'approval_' || new.status::text;
      _details := jsonb_build_object('note', new.decision_note);
    else
      return new;
    end if;
  elsif tg_table_name = 'share_links' then
    _doc := new.document_id; _proj := new.project_id;
    if tg_op = 'INSERT' then
      _action := 'share_created';
      _details := jsonb_build_object('recipient', new.recipient, 'expires_at', new.expires_at);
    elsif new.revoked_at is distinct from old.revoked_at and new.revoked_at is not null then
      _action := 'share_revoked';
      _details := jsonb_build_object('recipient', new.recipient);
    else
      return new;
    end if;
  else
    return new;
  end if;

  insert into public.audit_events (project_id, document_id, actor_id, action, details)
  values (_proj, _doc, auth.uid(), _action, _details);
  return new;
end $$;

create trigger documents_audit after insert or update on public.documents
  for each row execute function public.log_audit();
create trigger document_versions_audit after insert on public.document_versions
  for each row execute function public.log_audit();
create trigger approvals_audit after insert or update on public.approvals
  for each row execute function public.log_audit();
create trigger share_links_audit after insert or update on public.share_links
  for each row execute function public.log_audit();

-- ===== Storage access helper =====
create or replace function public.try_uuid(_value text)
returns uuid language plpgsql immutable set search_path = public as $$
begin
  return _value::uuid;
exception when others then
  return null;
end $$;