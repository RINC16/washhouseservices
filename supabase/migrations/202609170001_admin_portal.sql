-- Admin-only access for the first operations portal.
-- The staff enum value is retained for a possible later phase, but has no elevated access.

alter table public.profiles add column if not exists email text;

update public.profiles as profile
set email = account.email
from auth.users as account
where profile.id = account.id
  and profile.email is distinct from account.email;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    new.email
  );
  return new;
end;
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- Existing policies call is_staff(). Restrict that compatibility helper to admins
-- until staff accounts are deliberately designed and enabled.
create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select public.is_admin();
$$;

-- Browser users cannot change their own role. Trusted SQL executions (where
-- auth.uid() is null) can promote the first administrator safely.
create or replace function public.protect_profile_role()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.role is distinct from old.role
    and auth.uid() is not null
    and not public.is_admin()
  then
    raise exception 'Only an administrator can change account roles';
  end if;
  return new;
end;
$$;

create or replace function public.update_order_status(
  p_order_id uuid,
  p_status public.order_status
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_current public.order_status;
  v_valid_transition boolean := false;
begin
  if not public.is_admin() then
    raise exception 'Administrator access required';
  end if;

  select status into v_current
  from public.orders
  where id = p_order_id
  for update;

  if not found then raise exception 'Order not found'; end if;

  v_valid_transition :=
    (v_current = 'order_placed' and p_status = 'collection_scheduled') or
    (v_current = 'collection_scheduled' and p_status = 'collected') or
    (v_current = 'collected' and p_status = 'washing') or
    (v_current = 'washing' and p_status = 'drying') or
    (v_current = 'drying' and p_status = 'ironing') or
    (v_current = 'ironing' and p_status = 'ready_for_delivery') or
    (v_current = 'ready_for_delivery' and p_status = 'out_for_delivery') or
    (v_current = 'out_for_delivery' and p_status = 'delivered') or
    (v_current in ('order_placed', 'collection_scheduled') and p_status = 'cancelled');

  if not v_valid_transition then
    raise exception 'Invalid status transition from % to %', v_current, p_status;
  end if;

  update public.orders
  set
    status = p_status,
    cancelled_at = case when p_status = 'cancelled' then now() else cancelled_at end
  where id = p_order_id;
end;
$$;

-- All status changes must use the validated function above. This prevents a
-- browser client from bypassing the forward-only workflow with a direct update.
revoke update on public.orders from authenticated;
revoke insert, update, delete on public.order_status_history from authenticated;

revoke all on function public.update_order_status(uuid, public.order_status) from public;
grant execute on function public.update_order_status(uuid, public.order_status) to authenticated;
