-- Run AFTER security-policies.sql (it uses public.is_staff / is_admin).
begin;

drop policy if exists "Allow authenticated delete on news-media" on storage.objects;
drop policy if exists "Allow authenticated uploads to news-media" on storage.objects;
drop policy if exists "Allow authenticated view on news-media" on storage.objects;
drop policy if exists "Allow deleting files in news-media" on storage.objects;
drop policy if exists "Allow uploads to news-media" on storage.objects;
drop policy if exists "Allow viewing files in news-media" on storage.objects;

-- Anyone can view files (the site shows these images publicly anyway)
create policy "news-media public read" on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'news-media');

-- Only approved staff and admins can upload
create policy "news-media staff upload" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'news-media' and public.is_staff());

-- Only admins can delete
create policy "news-media admin delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'news-media' and public.is_admin());

commit;
