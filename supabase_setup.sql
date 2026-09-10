-- =============================================================================
-- HireMind — complete Supabase database setup
-- =============================================================================
-- The ONLY SQL file in this project. Run it once, whole, in the Supabase
-- SQL editor (Dashboard → SQL Editor → New query → paste → Run).
--
-- Safe to re-run: every object is created with IF NOT EXISTS, and every policy
-- is dropped before being recreated, so re-running always converges on the
-- definitions below rather than silently keeping older ones.
--
-- Accounts model
-- --------------
-- Each user signs up through Supabase Auth, which writes a row to auth.users.
-- The trigger at the bottom of section 2 mirrors that into public.profiles,
-- which holds the app-level fields (name, role, resume upload timestamp).
-- Every user-owned table keys off auth.uid() through row level security, so a
-- signed-in user can only ever read and write their own rows. Admins are
-- ordinary users with profiles.role = 'admin'.
--
-- Sections
--   1. jobs             public catalogue, written by the scraper
--   2. profiles         user accounts + admin helper + signup trigger
--   3. saved_jobs       per-user
--   4. saved_companies  per-user
--   5. resume_scores    per-user
--   6. applied_jobs     per-user
--   7. feedback         public submissions, admin triage
--   8. indexes
-- =============================================================================


-- =============================================================================
-- 1. JOBS — the public job catalogue
-- =============================================================================
-- Written exclusively by run_jobs_supabase.py using the SERVICE ROLE key,
-- which bypasses row level security entirely. Readable by everyone, including
-- signed-out visitors, because the job board is public.

create table if not exists public.jobs (
  id                    uuid primary key default gen_random_uuid(),
  created_at            timestamptz not null default now(),
  crawled_date          date not null,
  site                  text,
  job_url               text,
  job_url_direct        text,
  title                 text,
  company               text,
  location              text,
  description           text,
  date_posted           text,
  role                  text,
  city                  text,
  job_type              text,
  salary_source         text,
  interval              text,
  min_amount            numeric,
  max_amount            numeric,
  currency              text,
  is_remote             boolean,
  job_level             text,
  job_function          text,
  listing_type          text,
  company_industry      text,
  company_url           text,
  company_logo          text,
  company_url_direct    text,
  company_addresses     text,
  company_num_employees text,
  company_revenue       text,
  company_description   text,
  company_rating        numeric,
  company_reviews_count numeric,
  emails                text,
  skills                text,
  experience_range      text,
  vacancy_count         numeric,
  work_from_home_type   text,
  raw_data              jsonb,
  unique (job_url, crawled_date)
);

alter table public.jobs enable row level security;

drop policy if exists "Jobs are readable by everyone" on public.jobs;
create policy "Jobs are readable by everyone"
  on public.jobs for select
  using (true);

-- NOTE: there is deliberately NO insert/update/delete policy on jobs.
-- The previous schema granted insert with `with check (true)` and no role
-- restriction, which let anyone holding the anon key (it ships in the browser
-- bundle) write arbitrary rows into the public job board. The scraper does not
-- need a policy: the service role key bypasses RLS.
drop policy if exists "Allow authenticated upload" on public.jobs;


-- =============================================================================
-- 2. PROFILES — user accounts
-- =============================================================================

create table if not exists public.profiles (
  id                     uuid primary key references auth.users(id) on delete cascade,
  email                  text,
  first_name             text,
  last_name              text,
  role                   text not null default 'user' check (role in ('user', 'admin')),
  created_at             timestamptz not null default now(),
  last_resume_upload_at  timestamptz
);

alter table public.profiles enable row level security;

-- Admin check. SECURITY DEFINER so it runs as the owner and bypasses RLS on
-- profiles — a policy ON profiles that queried profiles directly would recurse
-- infinitely. search_path is pinned so the function cannot be hijacked.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

comment on function public.is_admin() is
  'True when the caller has role = admin. SECURITY DEFINER so it is safe to call from a profiles RLS policy.';

-- Read your own profile; admins read everyone (needed by /admin/users).
drop policy if exists "Public profiles are viewable by everyone" on public.profiles;
drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id or public.is_admin());

-- Update your own profile. WITH CHECK matters: without it a user could edit
-- their row into someone else's.
drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- RLS cannot restrict individual COLUMNS, so without this a user could set
-- role = 'admin' on their own row and walk into /admin. A column-level REVOKE
-- is ignored while a table-level grant exists, so the table grant is dropped
-- first and only the user-editable columns are granted back.
-- Fails closed: a new user-editable column must be added to this GRANT.
revoke update on public.profiles from anon, authenticated;
grant update (first_name, last_name, last_resume_upload_at)
  on public.profiles to authenticated;

-- No INSERT or DELETE policy on purpose: rows are created by the trigger below
-- and removed by the auth.users cascade.

-- Mirror new signups into profiles. This fires on the auth.users INSERT, so the
-- profile exists the moment the account is created — no email confirmation step.
-- Turn confirmation off under Authentication -> Sign In / Providers -> Email so
-- signUp() also returns a session and the user is logged straight in.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, first_name, last_name, role)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'first_name',
    new.raw_user_meta_data ->> 'last_name',
    'user'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- =============================================================================
-- 3. SAVED JOBS
-- =============================================================================

create table if not exists public.saved_jobs (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  job_id     uuid not null references public.jobs(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, job_id)
);

alter table public.saved_jobs enable row level security;

drop policy if exists "Users can view own saved jobs"   on public.saved_jobs;
drop policy if exists "Users can insert own saved jobs" on public.saved_jobs;
drop policy if exists "Users can delete own saved jobs" on public.saved_jobs;

create policy "Users can view own saved jobs"
  on public.saved_jobs for select using (auth.uid() = user_id);
create policy "Users can insert own saved jobs"
  on public.saved_jobs for insert with check (auth.uid() = user_id);
create policy "Users can delete own saved jobs"
  on public.saved_jobs for delete using (auth.uid() = user_id);


-- =============================================================================
-- 4. SAVED COMPANIES
-- =============================================================================

create table if not exists public.saved_companies (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  company_name text not null,
  created_at   timestamptz not null default now(),
  unique (user_id, company_name)
);

alter table public.saved_companies enable row level security;

drop policy if exists "Users can view their own saved companies"   on public.saved_companies;
drop policy if exists "Users can insert their own saved companies" on public.saved_companies;
drop policy if exists "Users can delete their own saved companies" on public.saved_companies;

create policy "Users can view their own saved companies"
  on public.saved_companies for select using (auth.uid() = user_id);
create policy "Users can insert their own saved companies"
  on public.saved_companies for insert with check (auth.uid() = user_id);
create policy "Users can delete their own saved companies"
  on public.saved_companies for delete using (auth.uid() = user_id);


-- =============================================================================
-- 5. RESUME SCORES
-- =============================================================================
-- score_details holds the full parser response as JSONB.

create table if not exists public.resume_scores (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  resume_name   text,
  total_score   numeric not null,
  score_details jsonb,
  created_at    timestamptz not null default now()
);

alter table public.resume_scores enable row level security;

drop policy if exists "Users can view their own resume scores"   on public.resume_scores;
drop policy if exists "Users can insert their own resume scores" on public.resume_scores;

create policy "Users can view their own resume scores"
  on public.resume_scores for select using (auth.uid() = user_id);
create policy "Users can insert their own resume scores"
  on public.resume_scores for insert with check (auth.uid() = user_id);


-- =============================================================================
-- 6. APPLIED JOBS
-- =============================================================================
-- job_id is ON DELETE SET NULL and nullable: the scraper prunes jobs after
-- 7 days, and a user's application history must survive that. The denormalised
-- title/company/url/location columns are what keep the record readable
-- afterwards.

create table if not exists public.applied_jobs (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  job_id       uuid references public.jobs(id) on delete set null,
  job_title    text,
  company_name text,
  job_url      text,
  location     text,
  applied_at   timestamptz not null default now(),
  unique (user_id, job_id)
);

alter table public.applied_jobs enable row level security;

drop policy if exists "Users can view their own applied jobs"   on public.applied_jobs;
drop policy if exists "Users can insert their own applied jobs" on public.applied_jobs;
drop policy if exists "Users can delete their own applied jobs" on public.applied_jobs;

create policy "Users can view their own applied jobs"
  on public.applied_jobs for select using (auth.uid() = user_id);
create policy "Users can insert their own applied jobs"
  on public.applied_jobs for insert with check (auth.uid() = user_id);
create policy "Users can delete their own applied jobs"
  on public.applied_jobs for delete using (auth.uid() = user_id);


-- =============================================================================
-- 7. FEEDBACK
-- =============================================================================
-- Submitted from the FeedbackWidget, triaged at /admin/feedback.

create table if not exists public.feedback (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  feedback_type text not null check (feedback_type in ('role_request', 'location_request', 'general_feedback')),
  content       text not null,
  status        text not null default 'pending' check (status in ('pending', 'reviewed', 'implemented'))
);

alter table public.feedback enable row level security;

drop policy if exists "Allow public insert access"          on public.feedback;
drop policy if exists "Anyone can submit feedback"          on public.feedback;
drop policy if exists "Admins can read feedback"            on public.feedback;
drop policy if exists "Admins can update feedback status"   on public.feedback;

-- Both anon AND authenticated. The old policy was `to anon` only, which meant
-- signed-in users — most of the people with an opinion — could not submit.
create policy "Anyone can submit feedback"
  on public.feedback for insert
  to anon, authenticated
  with check (true);

-- Reading and triaging is admin-only. Without these the /admin/feedback page
-- silently returns zero rows and status updates do nothing, because RLS denies
-- anything no policy explicitly allows.
create policy "Admins can read feedback"
  on public.feedback for select
  using (public.is_admin());

create policy "Admins can update feedback status"
  on public.feedback for update
  using (public.is_admin())
  with check (public.is_admin());


-- =============================================================================
-- 8. INDEXES
-- =============================================================================
-- The jobs page fetches one crawled_date at a time and orders by created_at;
-- that pair is the hottest query in the app. The rest back the foreign keys
-- used in RLS predicates, which are otherwise sequential scans per request.

create index if not exists jobs_crawled_date_created_at_idx
  on public.jobs (crawled_date, created_at desc);
create index if not exists jobs_company_idx          on public.jobs (company);
create index if not exists saved_jobs_user_id_idx    on public.saved_jobs (user_id);
create index if not exists saved_companies_user_id_idx on public.saved_companies (user_id);
create index if not exists resume_scores_user_id_created_at_idx
  on public.resume_scores (user_id, created_at desc);
create index if not exists applied_jobs_user_id_idx  on public.applied_jobs (user_id);
create index if not exists feedback_created_at_idx   on public.feedback (created_at desc);


-- =============================================================================
-- Done. To grant yourself admin (there is no way to do this from the app,
-- by design), run this once with your own signup email:
--
--   update public.profiles set role = 'admin' where email = 'you@example.com';
-- =============================================================================
