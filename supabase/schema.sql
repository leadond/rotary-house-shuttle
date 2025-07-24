-- Enable Realtime
alter publication supabase_realtime add table rides, vehicles;

-- Profiles table
create table profiles (
  id uuid primary key references auth.users on delete cascade,
  role text check (role in ('rider', 'driver', 'admin')),
  name text,
  phone text,
  created_at timestamp default now()
);

-- Rides table
create table rides (
  id uuid default uuid_generate_v4() primary key,
  rider_id uuid references profiles(id),
  driver_id uuid references profiles(id),
  pickup_location geography(Point, 4326),
  dropoff_location geography(Point, 4326),
  status text check (status in ('requested', 'assigned', 'en_route', 'completed', 'cancelled')),
  created_at timestamp default now()
);

-- Vehicles table
create table vehicles (
  id uuid default uuid_generate_v4() primary key,
  driver_id uuid references profiles(id),
  location geography(Point, 4326),
  status text check (status in ('available', 'on_trip', 'offline')),
  updated_at timestamp default now()
);
