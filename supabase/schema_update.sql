-- Create the leads table
create table public.leads (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  email text not null,
  message text,
  interest text, -- 'investor' or 'owner'
  ghl_contact_id text, -- ID returned from Go High Level if applicable
  status text default 'new', -- 'new', 'contacted', 'qualified', etc.
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table public.leads enable row level security;

-- Create policy to allow the service role (backend API) to do everything
create policy "Enable all access for service role"
  on public.leads
  for all
  to service_role
  using (true)
  with check (true);

-- Create policy to allow anonymous inserts (if you want client-side submissons, IF NOT using API route)
-- Since we are using an API route with the Service Role key, we technically don't need public insert access
-- but it's good practice to be explicit.
