-- Create profiles table linked to Supabase Auth
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  name text,
  email text,
  preferred_role text,
  experience_years integer,
  skills text[],
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table public.profiles enable row level security;

-- Policies for profiles
create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Create resumes table
create table if not exists public.resumes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  file_name text not null,
  storage_path text not null,
  parsed_text text,
  extracted_data jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table public.resumes enable row level security;

-- Policies for resumes
create policy "Users can manage their own resumes"
  on public.resumes for all
  using (auth.uid() = user_id);

-- Create job_descriptions table
create table if not exists public.job_descriptions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  title text,
  description text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table public.job_descriptions enable row level security;

-- Policies for job_descriptions
create policy "Users can manage their own job descriptions"
  on public.job_descriptions for all
  using (auth.uid() = user_id);

-- Create resume_analysis table
create table if not exists public.resume_analysis (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  resume_id uuid references public.resumes on delete cascade,
  job_description_id uuid references public.job_descriptions on delete cascade,
  job_title text,
  match_score integer,
  ats_score integer,
  missing_skills text[],
  strengths text[],
  weaknesses text[],
  suggestions text[],
  keywords text[],
  certifications text[],
  projects text[],
  hiring_chance text,
  learning_roadmap jsonb,
  interview_questions jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table public.resume_analysis enable row level security;

-- Policies for resume_analysis
create policy "Users can manage their own analyses"
  on public.resume_analysis for all
  using (auth.uid() = user_id);

-- Trigger to automatically create a profile after signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, email)
  values (new.id, split_part(new.email, '@', 1), new.email)
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
