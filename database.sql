-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create roles table first
create table public.roles (
  id uuid default uuid_generate_v4() primary key,
  name text not null unique,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Insert default roles
insert into public.roles (name, description) values
  ('admin', 'System administrator with full access'),
  ('net_control', 'Net control operator with elevated permissions'),
  ('volunteer', 'Verified volunteer'),
  ('ham', 'Licensed ham radio operator'),
  ('public', 'General public user');

-- Create events table first (since it's referenced by other tables)
create table public.events (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  date timestamp with time zone not null,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Insert initial events
insert into public.events (name, date, description) values
  ('Hurricane Helene', '2024-03-15 00:00:00+00', 'Category 4 hurricane impacting the Eastern Seaboard'),
  ('August Storm', '2024-08-01 00:00:00+00', 'Severe thunderstorm system causing widespread flooding');

-- Create status types table (before missing_persons since it's referenced by it)
create table public.status_types (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Insert default status types
insert into public.status_types (name, description) values
  ('Missing', 'Person is currently missing'),
  ('Investigating', 'Case is under active investigation'),
  ('Minor Injury', 'Person found with minor injuries'),
  ('Major Injury', 'Person found with major injuries'),
  ('Deceased', 'Person found deceased'),
  ('Disregard', 'Case closed - disregard');

-- Create profiles table
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  first_name text,
  last_name text,
  address text,
  city text,
  state text,
  zip text,
  ham_callsign text,
  is_volunteer boolean default false,
  role_id uuid references public.roles(id) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create missing persons table
create table public.missing_persons (
  id uuid default uuid_generate_v4() primary key,
  first_name text not null,
  last_name text not null,
  gender text,
  age integer,
  address text,
  city text,
  state text,
  zip text,
  current_status_id uuid references public.status_types(id),
  case_closed boolean default false,
  event_id uuid references public.events(id) not null,
  reported_by uuid references public.profiles(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create status updates table
create table public.status_updates (
  id uuid default uuid_generate_v4() primary key,
  person_id uuid references public.missing_persons(id) on delete cascade,
  status_id uuid references public.status_types(id),
  last_seen_date timestamp with time zone,
  address text,
  last_city text,
  last_state text,
  zip text,
  notes text,
  case_closed boolean default false,
  reported_by uuid references public.profiles(id),
  net_id uuid references public.nets(id),
  frequency text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create event_updates table
create table public.event_updates (
  id uuid default uuid_generate_v4() primary key,
  event_id uuid references public.events(id) not null,
  title text not null,
  content text not null,
  created_by uuid references public.profiles(id) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create needs table
create table public.needs (
  id uuid default uuid_generate_v4() primary key,
  event_id uuid references public.events(id) not null,
  title text not null,
  description text not null,
  priority text not null check (priority in ('low', 'medium', 'high')),
  address text,
  city text,
  state text,
  zip text,
  status text default 'open' check (status in ('open', 'in_progress', 'fulfilled', 'cancelled')),
  created_by uuid references public.profiles(id) not null,
  fulfilled_by uuid references public.profiles(id),
  fulfilled_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create statistics table
create table public.statistics (
  id uuid default uuid_generate_v4() primary key,
  total_searches integer default 0,
  closed_cases integer default 0,
  total_volunteers integer default 0,
  total_users integer default 0,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create nets table
create table public.nets (
  id uuid default uuid_generate_v4() primary key,
  name text not null unique,
  description text,
  frequency text,
  start_datetime timestamp,
  end_datetime timestamp,
  recurring_every text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Insert initial statistics record
insert into public.statistics (total_searches, closed_cases, total_volunteers, total_users)
values (0, 0, 0, 0);

-- Enable RLS
alter table public.profiles enable row level security;
alter table public.missing_persons enable row level security;
alter table public.status_updates enable row level security;
alter table public.status_types enable row level security;
alter table public.events enable row level security;
alter table public.statistics enable row level security;
alter table public.roles enable row level security;
alter table public.needs enable row level security;
alter table public.event_updates enable row level security;
alter table public.nets enable row level security;

-- Create RLS policies
create policy "Public profiles are viewable by everyone"
  on public.profiles for select
  using (true);

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can delete their own profile"
  on public.profiles for delete
  using (auth.uid() = id);

create policy "Missing persons are viewable by everyone"
  on public.missing_persons for select
  using (true);

create policy "Authorized users can insert missing persons"
  on public.missing_persons for insert
  with check (
    exists (
      select 1 from profiles p
      join roles r on p.role_id = r.id
      where p.id = auth.uid()
      and r.name != 'public'
    )
  );

create policy "Authorized users can update missing persons"
  on public.missing_persons for update
  using (
    exists (
      select 1 from profiles p
      join roles r on p.role_id = r.id
      where p.id = auth.uid()
      and r.name != 'public'
    )
  );

create policy "Status updates are viewable by everyone"
  on public.status_updates for select
  using (true);

create policy "Authorized users can insert status updates"
  on public.status_updates for insert
  with check (
    exists (
      select 1 from profiles p
      join roles r on p.role_id = r.id
      where p.id = auth.uid()
      and r.name != 'public'
    )
  );

create policy "Authorized users can update status updates"
  on public.status_updates for update
  using (
    exists (
      select 1 from profiles p
      join roles r on p.role_id = r.id
      where p.id = auth.uid()
      and r.name != 'public'
    )
  );

create policy "Authorized users can delete status updates"
  on public.status_updates for delete
  using (
    exists (
      select 1 from profiles p
      join roles r on p.role_id = r.id
      where p.id = auth.uid()
      and r.name in ('admin', 'ham', 'net_control')
    )
  );

create policy "Status types are viewable by everyone"
  on public.status_types for select
  using (true);

create policy "Events are viewable by everyone"
  on public.events for select
  using (true);

create policy "Statistics are viewable by everyone"
  on public.statistics for select
  using (true);

create policy "Authorized users can update statistics"
  on public.statistics for update
  using (
    exists (
      select 1 from profiles p
      join roles r on p.role_id = r.id
      where p.id = auth.uid()
      and r.name != 'public'
    )
  );

create policy "Roles are viewable by everyone"
  on public.roles for select
  using (true);

create policy "Needs are viewable by everyone"
  on public.needs for select
  using (true);

create policy "Authenticated users can create needs"
  on public.needs for insert
  with check (auth.uid() = created_by);

create policy "Admins and hams can update needs"
  on public.needs for update
  using (
    exists (
      select 1 from profiles p
      join roles r on p.role_id = r.id
      where p.id = auth.uid()
      and r.name in ('admin', 'ham')
    )
  );

create policy "Event updates are viewable by everyone"
  on public.event_updates for select
  using (true);

create policy "Admins can manage event updates"
  on public.event_updates for all
  using (
    exists (
      select 1 from profiles p
      join roles r on p.role_id = r.id
      where p.id = auth.uid()
      and r.name = 'admin'
    )
  );

create policy "Nets are viewable by everyone"
  on public.nets for select
  using (true);

create policy "Admins can manage nets"
  on public.nets for all
  using (
    exists (
      select 1 from profiles p
      join roles r on p.role_id = r.id
      where p.id = auth.uid()
      and r.name = 'admin'
    )
  );

-- Create functions for atomic statistics updates
create or replace function increment_total_searches()
returns void
language plpgsql
security definer
as $$
begin
  update statistics
  set total_searches = total_searches + 1,
      updated_at = now()
  where id = (select id from statistics limit 1);
end;
$$;

create or replace function increment_closed_cases()
returns void
language plpgsql
security definer
as $$
begin
  update statistics
  set closed_cases = closed_cases + 1,
      updated_at = now()
  where id = (select id from statistics limit 1);
end;
$$;

create or replace function increment_total_volunteers()
returns void
language plpgsql
security definer
as $$
begin
  update statistics
  set total_volunteers = total_volunteers + 1,
      updated_at = now()
  where id = (select id from statistics limit 1);
end;
$$;

create or replace function decrement_total_volunteers()
returns void
language plpgsql
security definer
as $$
begin
  update statistics
  set total_volunteers = greatest(0, total_volunteers - 1),
      updated_at = now()
  where id = (select id from statistics limit 1);
end;
$$;

create or replace function increment_total_users()
returns void
language plpgsql
security definer
as $$
begin
  update statistics
  set total_users = total_users + 1,
      updated_at = now()
  where id = (select id from statistics limit 1);
end;
$$;

-- Create function to determine role
create or replace function get_user_role(
  p_email text,
  p_ham_callsign text,
  p_is_volunteer boolean
)
returns uuid
language plpgsql
security definer
as $$
declare
  v_role_id uuid;
begin
  -- Check for admin email
  if p_email = 'nc4fg@hamhaw.org' then
    select id into v_role_id from roles where name = 'admin';
  -- Check for ham operator
  elsif p_ham_callsign is not null and p_ham_callsign != '' then
    select id into v_role_id from roles where name = 'ham';
  -- Check for volunteer
  elsif p_is_volunteer then
    select id into v_role_id from roles where name = 'volunteer';
  -- Default to public
  else
    select id into v_role_id from roles where name = 'public';
  end if;

  return v_role_id;
end;
$$;

-- Create function to handle new user registration
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  v_role_id uuid;
begin
  -- Get appropriate role
  select get_user_role(
    new.email,
    new.raw_user_meta_data->>'ham_callsign',
    (new.raw_user_meta_data->>'is_volunteer')::boolean
  ) into v_role_id;

  insert into public.profiles (
    id,
    email,
    first_name,
    last_name,
    address,
    city,
    state,
    zip,
    ham_callsign,
    is_volunteer,
    role_id
  )
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'last_name',
    new.raw_user_meta_data->>'address',
    new.raw_user_meta_data->>'city',
    new.raw_user_meta_data->>'state',
    new.raw_user_meta_data->>'zip',
    new.raw_user_meta_data->>'ham_callsign',
    (new.raw_user_meta_data->>'is_volunteer')::boolean,
    v_role_id
  );
  return new;
end;
$$;

-- Create trigger for new user
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();