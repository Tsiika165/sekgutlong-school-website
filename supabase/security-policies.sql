-- Sekgutlong: tighten Row Level Security.
-- Run in Supabase > SQL editor. It runs as one transaction: if any line
-- fails, nothing is changed.

begin;

-- 1. Helper functions ------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

create or replace function public.is_staff()
returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('staff', 'admin')
  );
$$;

-- Lets login-by-phone work while the profiles table stays private.
create or replace function public.email_for_phone(p_phone text)
returns text
language sql stable security definer set search_path = public as $$
  select email from public.profiles where phone = p_phone limit 1;
$$;

grant execute on function public.is_admin() to anon, authenticated;
grant execute on function public.is_staff() to anon, authenticated;
grant execute on function public.email_for_phone(text) to anon, authenticated;

-- 2. Remove every existing policy on these tables ---------------------------
do $$
declare r record;
begin
  for r in
    select policyname, tablename from pg_policies
    where schemaname = 'public'
      and tablename in ('admissions','alumni','announcements','contacts',
                        'gallery','news','profiles','staff','staff_submissions')
  loop
    execute format('drop policy %I on public.%I', r.policyname, r.tablename);
  end loop;
end $$;

alter table public.admissions        enable row level security;
alter table public.alumni            enable row level security;
alter table public.announcements     enable row level security;
alter table public.contacts          enable row level security;
alter table public.gallery           enable row level security;
alter table public.news              enable row level security;
alter table public.profiles          enable row level security;
alter table public.staff             enable row level security;
alter table public.staff_submissions enable row level security;

-- 3. profiles: private; nobody can choose their own role --------------------
create policy "profiles read own or admin" on public.profiles
  for select to authenticated
  using (id = auth.uid() or public.is_admin());

create policy "profiles insert own as pending_staff" on public.profiles
  for insert to authenticated
  with check (id = auth.uid() and role = 'pending_staff');

create policy "profiles update admin only" on public.profiles
  for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy "profiles delete admin only" on public.profiles
  for delete to authenticated
  using (public.is_admin());

-- 4. Public content: anyone reads, only admins write ------------------------
create policy "news public read published" on public.news
  for select to anon, authenticated using (published = true);
create policy "news admin all" on public.news
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "gallery public read" on public.gallery
  for select to anon, authenticated using (true);
create policy "gallery admin all" on public.gallery
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "staff public read" on public.staff
  for select to anon, authenticated using (true);
create policy "staff admin all" on public.staff
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "admissions public read" on public.admissions
  for select to anon, authenticated using (true);
create policy "admissions admin all" on public.admissions
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Not used by the app yet: admin only.
create policy "alumni admin all" on public.alumni
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "announcements admin all" on public.announcements
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- 5. contacts: the public may send a message, only admins read or manage ----
create policy "contacts anyone can send" on public.contacts
  for insert to anon, authenticated with check (true);
create policy "contacts admin read" on public.contacts
  for select to authenticated using (public.is_admin());
create policy "contacts admin update" on public.contacts
  for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "contacts admin delete" on public.contacts
  for delete to authenticated using (public.is_admin());

-- 6. staff_submissions: approved staff manage their own row, admins see all -
create policy "submissions read own or admin" on public.staff_submissions
  for select to authenticated
  using (public.is_admin() or lower(email) = lower(auth.jwt() ->> 'email'));

create policy "submissions insert own" on public.staff_submissions
  for insert to authenticated
  with check (public.is_staff() and lower(email) = lower(auth.jwt() ->> 'email'));

create policy "submissions update own or admin" on public.staff_submissions
  for update to authenticated
  using (public.is_admin() or (public.is_staff() and lower(email) = lower(auth.jwt() ->> 'email')))
  with check (public.is_admin() or (public.is_staff() and lower(email) = lower(auth.jwt() ->> 'email')));

commit;
