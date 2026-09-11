create extension if not exists pgcrypto;

create type public.app_role as enum ('customer', 'staff', 'admin');
create type public.service_unit as enum ('kg', 'item', 'order', 'surcharge');
create type public.slot_type as enum ('collection', 'delivery');
create type public.order_status as enum (
  'order_placed',
  'collection_scheduled',
  'collected',
  'washing',
  'drying',
  'ironing',
  'ready_for_delivery',
  'out_for_delivery',
  'delivered',
  'cancelled'
);

create sequence public.order_reference_seq start with 10001;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  phone text,
  role public.app_role not null default 'customer',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  label text not null default 'Home',
  phone text not null,
  address_line_1 text not null,
  address_line_2 text,
  city text not null,
  postcode text not null,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.services (
  slug text primary key,
  name text not null,
  description text not null,
  price numeric(10, 2) not null check (price >= 0),
  unit public.service_unit not null,
  turnaround text not null,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique default ('WH-' || nextval('public.order_reference_seq')::text),
  user_id uuid not null references public.profiles(id) on delete restrict,
  address_id uuid not null references public.addresses(id) on delete restrict,
  status public.order_status not null default 'order_placed',
  collection_date date not null,
  collection_start time not null,
  collection_end time not null,
  delivery_date date not null,
  delivery_start time not null,
  delivery_end time not null,
  special_instructions text,
  subtotal numeric(10, 2) not null default 0 check (subtotal >= 0),
  total numeric(10, 2) not null default 0 check (total >= 0),
  cancelled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (delivery_date > collection_date),
  check (collection_end > collection_start),
  check (delivery_end > delivery_start)
);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  service_id text not null references public.services(slug) on delete restrict,
  service_name text not null,
  unit public.service_unit not null,
  unit_price numeric(10, 2) not null check (unit_price >= 0),
  quantity numeric(10, 2) not null check (quantity > 0),
  line_total numeric(10, 2) generated always as (unit_price * quantity) stored,
  created_at timestamptz not null default now()
);

create table public.order_status_history (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  status public.order_status not null,
  note text,
  changed_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.time_slots (
  id uuid primary key default gen_random_uuid(),
  slot_date date not null,
  slot_type public.slot_type not null,
  start_time time not null,
  end_time time not null,
  capacity integer not null default 10 check (capacity > 0),
  reserved_count integer not null default 0 check (reserved_count >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (slot_date, slot_type, start_time, end_time),
  check (end_time > start_time),
  check (reserved_count <= capacity)
);

create index addresses_user_id_idx on public.addresses(user_id);
create index orders_user_id_idx on public.orders(user_id);
create index orders_status_idx on public.orders(status);
create index orders_collection_date_idx on public.orders(collection_date);
create index order_items_order_id_idx on public.order_items(order_id);
create index order_status_history_order_id_idx on public.order_status_history(order_id, created_at);
create index time_slots_lookup_idx on public.time_slots(slot_date, slot_type, is_active);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at before update on public.profiles for each row execute function public.set_updated_at();
create trigger addresses_set_updated_at before update on public.addresses for each row execute function public.set_updated_at();
create trigger services_set_updated_at before update on public.services for each row execute function public.set_updated_at();
create trigger orders_set_updated_at before update on public.orders for each row execute function public.set_updated_at();
create trigger time_slots_set_updated_at before update on public.time_slots for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('staff', 'admin')
  );
$$;

create or replace function public.protect_profile_role()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.role is distinct from old.role and not public.is_staff() then
    raise exception 'Only staff can change account roles';
  end if;
  return new;
end;
$$;

create trigger profiles_protect_role
  before update on public.profiles
  for each row execute function public.protect_profile_role();

create or replace function public.record_order_status()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    insert into public.order_status_history (order_id, status, changed_by)
    values (new.id, new.status, auth.uid());
  elsif new.status is distinct from old.status then
    insert into public.order_status_history (order_id, status, changed_by)
    values (new.id, new.status, auth.uid());
  end if;
  return new;
end;
$$;

create trigger orders_record_status
  after insert or update of status on public.orders
  for each row execute function public.record_order_status();

alter table public.profiles enable row level security;
alter table public.addresses enable row level security;
alter table public.services enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.order_status_history enable row level security;
alter table public.time_slots enable row level security;

create policy "profiles_read_own_or_staff" on public.profiles for select to authenticated using (id = auth.uid() or public.is_staff());
create policy "profiles_update_own" on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

create policy "addresses_read_own_or_staff" on public.addresses for select to authenticated using (user_id = auth.uid() or public.is_staff());
create policy "addresses_insert_own" on public.addresses for insert to authenticated with check (user_id = auth.uid());
create policy "addresses_update_own" on public.addresses for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "addresses_delete_own" on public.addresses for delete to authenticated using (user_id = auth.uid());

create policy "services_public_read" on public.services for select to anon, authenticated using (is_active or public.is_staff());
create policy "services_staff_insert" on public.services for insert to authenticated with check (public.is_staff());
create policy "services_staff_update" on public.services for update to authenticated using (public.is_staff()) with check (public.is_staff());
create policy "services_staff_delete" on public.services for delete to authenticated using (public.is_staff());

create policy "orders_read_own_or_staff" on public.orders for select to authenticated using (user_id = auth.uid() or public.is_staff());
create policy "orders_staff_update" on public.orders for update to authenticated using (public.is_staff()) with check (public.is_staff());

create policy "order_items_read_own_or_staff" on public.order_items for select to authenticated using (
  exists (select 1 from public.orders where orders.id = order_items.order_id and (orders.user_id = auth.uid() or public.is_staff()))
);

create policy "history_read_own_or_staff" on public.order_status_history for select to authenticated using (
  exists (select 1 from public.orders where orders.id = order_status_history.order_id and (orders.user_id = auth.uid() or public.is_staff()))
);
create policy "history_staff_insert" on public.order_status_history for insert to authenticated with check (public.is_staff());

create policy "time_slots_public_read" on public.time_slots for select to anon, authenticated using (is_active or public.is_staff());
create policy "time_slots_staff_insert" on public.time_slots for insert to authenticated with check (public.is_staff());
create policy "time_slots_staff_update" on public.time_slots for update to authenticated using (public.is_staff()) with check (public.is_staff());
create policy "time_slots_staff_delete" on public.time_slots for delete to authenticated using (public.is_staff());

revoke update (role) on public.profiles from authenticated;

create or replace function public.place_order(
  p_address jsonb,
  p_schedule jsonb,
  p_items jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_address_id uuid;
  v_order public.orders;
  v_item jsonb;
  v_service public.services;
  v_quantity numeric(10, 2);
  v_total numeric(10, 2) := 0;
begin
  if v_user_id is null then raise exception 'Authentication required'; end if;
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then raise exception 'Select at least one service'; end if;

  insert into public.addresses (user_id, label, phone, address_line_1, address_line_2, city, postcode)
  values (
    v_user_id,
    coalesce(nullif(trim(p_address ->> 'label'), ''), 'Home'),
    trim(p_address ->> 'phone'),
    trim(p_address ->> 'address_line_1'),
    nullif(trim(p_address ->> 'address_line_2'), ''),
    trim(p_address ->> 'city'),
    upper(trim(p_address ->> 'postcode'))
  ) returning id into v_address_id;

  insert into public.orders (
    user_id, address_id, collection_date, collection_start, collection_end,
    delivery_date, delivery_start, delivery_end, special_instructions
  ) values (
    v_user_id,
    v_address_id,
    (p_schedule ->> 'collection_date')::date,
    (p_schedule ->> 'collection_start')::time,
    (p_schedule ->> 'collection_end')::time,
    (p_schedule ->> 'delivery_date')::date,
    (p_schedule ->> 'delivery_start')::time,
    (p_schedule ->> 'delivery_end')::time,
    nullif(trim(p_schedule ->> 'special_instructions'), '')
  ) returning * into v_order;

  for v_item in select * from jsonb_array_elements(p_items)
  loop
    select * into v_service
    from public.services
    where slug = v_item ->> 'service_id' and is_active = true;

    if not found then raise exception 'A selected service is unavailable'; end if;
    v_quantity := greatest(1, coalesce((v_item ->> 'quantity')::numeric, 1));
    if v_service.unit in ('order', 'surcharge') then v_quantity := 1; end if;

    insert into public.order_items (order_id, service_id, service_name, unit, unit_price, quantity)
    values (v_order.id, v_service.slug, v_service.name, v_service.unit, v_service.price, v_quantity);
    v_total := v_total + (v_service.price * v_quantity);
  end loop;

  update public.orders set subtotal = v_total, total = v_total where id = v_order.id;
  return jsonb_build_object('id', v_order.id, 'reference', v_order.reference);
end;
$$;

create or replace function public.cancel_order(p_order_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.orders
  set status = 'cancelled', cancelled_at = now()
  where id = p_order_id
    and user_id = auth.uid()
    and status in ('order_placed', 'collection_scheduled');

  if not found then raise exception 'This order can no longer be cancelled'; end if;
end;
$$;

revoke all on function public.place_order(jsonb, jsonb, jsonb) from public;
revoke all on function public.cancel_order(uuid) from public;
grant execute on function public.place_order(jsonb, jsonb, jsonb) to authenticated;
grant execute on function public.cancel_order(uuid) to authenticated;

insert into public.services (slug, name, description, price, unit, turnaround, sort_order) values
  ('wash-dry-fold', 'Wash, Dry and Fold', 'Complete wash, professional drying and folding service for all your daily wear.', 6.00, 'kg', '24–48 hours', 1),
  ('wash-fold', 'Wash and Fold', 'Your everyday laundry washed, dried and neatly folded. Perfect for regular clothing.', 4.50, 'kg', '24–48 hours', 2),
  ('bedding-linen', 'Bedding and Linen', 'Deep cleaning for duvets, sheets, pillowcases, mattress protectors and household linens.', 12.00, 'item', '48–72 hours', 3),
  ('ironing', 'Ironing', 'Expert ironing and pressing service for crisp, wrinkle-free garments.', 2.50, 'item', '24–48 hours', 4),
  ('dry-cleaning', 'Dry Cleaning', 'Premium dry cleaning for suits, dresses, coats and delicate fabrics.', 8.50, 'item', '48–72 hours', 5),
  ('express-service', 'Express Service', 'Priority same-day or next-day turnaround.', 15.00, 'surcharge', 'Priority turnaround', 6),
  ('collection-delivery', 'Collection and Delivery', 'Door-to-door collection and delivery service.', 3.50, 'order', 'Scheduled slots', 7);
