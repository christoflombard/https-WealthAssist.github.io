-- Wealth Assist Investment Opportunities Database Schema

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create enum types
create type product_type as enum ('JV_FLIP', 'INSTALMENT_SALE_RECOVERY', 'RECOVERY', 'RENTAL_INCOME', 'DEVELOPMENT');
create type opportunity_status as enum ('AVAILABLE', 'RESERVED', 'SOLD');
create type term_type as enum ('MONTHS', 'YEAR');
create type file_type as enum ('FULL_REPORT', 'VALUATION', 'TPN', 'LIGHTSTONE', 'COC', 'OTHER');

-- Main opportunities table
create table opportunities (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  suburb_or_area text,
  province text,
  product_type product_type not null default 'JV_FLIP',
  deal_code text unique,
  status opportunity_status not null default 'AVAILABLE',
  hero_image_url text,
  investment_amount numeric(15,2) not null,
  market_value numeric(15,2),
  exposure_to_market_value_pct numeric(5,2),
  units_total int,
  units_available int,
  highlight_badge_text text,
  description text,
  address text,
  property_type text,
  bedrooms int,
  bathrooms int,
  parking int,
  erf_size numeric(10,2),
  floor_size numeric(10,2),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Return rows table (flexible for any term structure)
create table opportunity_return_rows (
  id uuid primary key default uuid_generate_v4(),
  opportunity_id uuid references opportunities(id) on delete cascade,
  row_key text not null,
  label text not null,
  term_type term_type not null default 'MONTHS',
  term_value int not null,
  amount numeric(15,2),
  pct numeric(8,4),
  sort_order int default 0,
  created_at timestamptz default now()
);

-- Files table (for gated documents)
create table opportunity_files (
  id uuid primary key default uuid_generate_v4(),
  opportunity_id uuid references opportunities(id) on delete cascade,
  file_type file_type not null default 'OTHER',
  file_name text not null,
  storage_path text not null,
  requires_auth boolean default true,
  created_at timestamptz default now()
);

-- User profiles (extends Supabase auth.users)
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  phone text,
  is_admin boolean default false,
  is_verified boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create indexes for performance
create index idx_opportunities_status on opportunities(status);
create index idx_opportunities_product_type on opportunities(product_type);
create index idx_opportunities_province on opportunities(province);
create index idx_return_rows_opportunity on opportunity_return_rows(opportunity_id);
create index idx_files_opportunity on opportunity_files(opportunity_id);

-- Row Level Security policies
alter table opportunities enable row level security;
alter table opportunity_return_rows enable row level security;
alter table opportunity_files enable row level security;
alter table profiles enable row level security;

-- Public can read opportunities
create policy "Public can read opportunities" on opportunities
  for select using (true);

-- Public can read return rows
create policy "Public can read return rows" on opportunity_return_rows
  for select using (true);

-- Only authenticated users can read files metadata
create policy "Authenticated users can read files" on opportunity_files
  for select using (auth.role() = 'authenticated');

-- Users can read their own profile
create policy "Users can read own profile" on profiles
  for select using (auth.uid() = id);

-- Users can update their own profile
create policy "Users can update own profile" on profiles
  for update using (auth.uid() = id);

-- Admin policies (service role or admin users)
create policy "Admins can manage opportunities" on opportunities
  for all using (
    exists (select 1 from profiles where id = auth.uid() and is_admin = true)
  );

create policy "Admins can manage return rows" on opportunity_return_rows
  for all using (
    exists (select 1 from profiles where id = auth.uid() and is_admin = true)
  );

create policy "Admins can manage files" on opportunity_files
  for all using (
    exists (select 1 from profiles where id = auth.uid() and is_admin = true)
  );

-- Function to auto-create profile on signup
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger for new user signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- Function to update updated_at timestamp
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Trigger for opportunities updated_at
create trigger opportunities_updated_at
  before update on opportunities
  for each row execute function update_updated_at();

-- Create storage bucket for opportunity files
insert into storage.buckets (id, name, public) values ('opportunity-files', 'opportunity-files', false);

-- Storage policy: only authenticated users can download
create policy "Authenticated users can download files"
on storage.objects for select
using (bucket_id = 'opportunity-files' and auth.role() = 'authenticated');