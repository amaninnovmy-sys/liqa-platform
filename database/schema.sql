-- LIQA staff console foundation. Run ONCE in a dedicated, approved project.
-- No cloud database has been selected or changed by adding this file.
begin;
create schema if not exists liqa_private;
revoke all on schema liqa_private from public, anon;
grant usage on schema liqa_private to authenticated;
create table public.liqa_staff (
 user_id uuid primary key references auth.users(id),
 display_name text not null check(length(display_name) between 1 and 100),
 role text not null check(role in ('admin','marketer')), active boolean not null default true
);
alter table public.liqa_staff enable row level security;
-- Narrow lookup prevents recursive staff policies; no user-editable role claims.
create function liqa_private.staff_role() returns text
language sql stable security definer set search_path=''
as $$ select role from public.liqa_staff where user_id=(select auth.uid()) and active and auth.uid() is not null $$;
revoke all on function liqa_private.staff_role() from public, anon;
grant execute on function liqa_private.staff_role() to authenticated;
create policy staff_read on public.liqa_staff for select to authenticated
using (user_id=(select auth.uid()) or (select liqa_private.staff_role())='admin');
create table public.liqa_offices (
 id uuid primary key default gen_random_uuid(),
 name text not null check(length(btrim(name)) between 1 and 100),
 city text not null check(length(btrim(city)) between 1 and 40),
 district text not null default '' check(length(district)<=60),
 contact text not null check(length(btrim(contact)) between 1 and 80),
 phone text check(phone is null or phone ~ '^\+9665[0-9]{8}$'),
 source text not null default 'زيارة ميدانية' check(source in ('زيارة ميدانية','إحالة شريك','اتصال وارد')),
 interest text not null default 'متوسط' check(interest in ('عالي','متوسط','منخفض')),
 assigned_to uuid not null references public.liqa_staff(user_id),
 created_by uuid not null references public.liqa_staff(user_id),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 consent_at timestamptz, interviewed_at timestamptz, interested_at timestamptz, prototype_at timestamptz, trial_at timestamptz,
 version integer not null default 1,
 check(prototype_at is null or interested_at is not null), check(trial_at is null or interested_at is not null)
);
create unique index liqa_office_identity on public.liqa_offices(lower(btrim(name)),lower(btrim(city)));
create unique index liqa_office_phone on public.liqa_offices(phone) where phone is not null;
create index liqa_office_assignment on public.liqa_offices(assigned_to);
alter table public.liqa_offices enable row level security;
create policy office_read on public.liqa_offices for select to authenticated
 using ((select liqa_private.staff_role())='admin' or ((select liqa_private.staff_role())='marketer' and assigned_to=(select auth.uid())));
create policy office_insert on public.liqa_offices for insert to authenticated
 with check(created_by=(select auth.uid()) and ((select liqa_private.staff_role())='admin' or ((select liqa_private.staff_role())='marketer' and assigned_to=(select auth.uid()))));
create policy office_update on public.liqa_offices for update to authenticated
 using ((select liqa_private.staff_role())='admin' or ((select liqa_private.staff_role())='marketer' and assigned_to=(select auth.uid())))
 with check((select liqa_private.staff_role())='admin' or ((select liqa_private.staff_role())='marketer' and assigned_to=(select auth.uid())));
create table public.liqa_notes (
 id uuid primary key default gen_random_uuid(), office_id uuid not null references public.liqa_offices(id),
 text text not null check(length(btrim(text)) between 1 and 1200),
 actor uuid not null default auth.uid() references public.liqa_staff(user_id), created_at timestamptz not null default now()
);
-- Validate survey prices in the database as well as in the UI/API.
create function liqa_private.valid_prices(v jsonb) returns boolean
language plpgsql immutable security invoker set search_path='' as $$
declare i integer; previous numeric:=-1; current_value numeric;
begin
 if v is null then return true; end if;
 if jsonb_typeof(v)<>'array' or jsonb_array_length(v)<>4 then return false;end if;
 for i in 0..3 loop
  if jsonb_typeof(v->i)<>'number' then return false;end if;
  current_value=(v->>i)::numeric;
  if current_value<0 or current_value>100000000 or current_value<previous then return false;end if;
  previous=current_value;
 end loop;
 return true;
end $$;
revoke all on function liqa_private.valid_prices(jsonb) from public,anon;
grant execute on function liqa_private.valid_prices(jsonb) to authenticated;
create table public.liqa_interviews (
 id uuid primary key default gen_random_uuid(), office_id uuid not null references public.liqa_offices(id),
 workflow text not null check(length(workflow) between 1 and 80), pain text not null default '' check(length(pain)<=1500),
 prices jsonb, research_consent boolean not null check(research_consent=true),
 actor uuid not null default auth.uid() references public.liqa_staff(user_id), created_at timestamptz not null default now(),
 check(liqa_private.valid_prices(prices))
);
create table public.liqa_tasks (
 id uuid primary key default gen_random_uuid(), office_id uuid not null references public.liqa_offices(id),
 title text not null check(length(btrim(title)) between 1 and 120), due date not null,
 done boolean not null default false, actor uuid not null default auth.uid() references public.liqa_staff(user_id),
 created_at timestamptz not null default now()
);
create table public.liqa_audit (
 id bigint generated always as identity primary key, office_id uuid not null references public.liqa_offices(id),
 actor uuid not null references public.liqa_staff(user_id), action text not null, created_at timestamptz not null default now()
);
-- Billing remains read-only for the app. No staff UI can invent a successful payment.
create table public.liqa_subscriptions (
 id uuid primary key default gen_random_uuid(), office_id uuid not null unique references public.liqa_offices(id),
 status text not null check(status in ('trialing','active','past_due','canceled')),
 amount_minor integer not null default 19600 check(amount_minor>=0), currency text not null default 'SAR',
 paid_at timestamptz, provider_reference text unique, check(paid_at is null or provider_reference is not null)
);
-- Scoped child records inherit the office policy. No broad authenticated read.
do $$ declare t text; begin
 foreach t in array array['liqa_notes','liqa_interviews','liqa_tasks','liqa_audit','liqa_subscriptions'] loop
 execute format('alter table public.%I enable row level security',t);
 execute format('create index %I on public.%I(office_id)',t||'_office',t);
 execute format('create policy scoped_read on public.%I for select to authenticated using (exists(select 1 from public.liqa_offices o where o.id=office_id))',t);
 end loop;
 foreach t in array array['liqa_notes','liqa_interviews','liqa_tasks'] loop
 execute format('create policy scoped_insert on public.%I for insert to authenticated with check(actor=(select auth.uid()) and exists(select 1 from public.liqa_offices o where o.id=office_id))',t);
 end loop;
end $$;
create policy task_update on public.liqa_tasks for update to authenticated
 using(exists(select 1 from public.liqa_offices o where o.id=office_id))
 with check(exists(select 1 from public.liqa_offices o where o.id=office_id));
create function liqa_private.office_guard() returns trigger language plpgsql security invoker set search_path='' as $$
begin
 if liqa_private.staff_role() is null then raise insufficient_privilege; end if;
 if not exists(select 1 from public.liqa_staff where user_id=new.assigned_to and active) then raise exception 'invalid_assignee'; end if;
 if tg_op='UPDATE' then
  if new.id<>old.id or new.created_by<>old.created_by or new.created_at<>old.created_at then raise exception 'immutable_fields'; end if;
  if new.trial_at is distinct from old.trial_at and liqa_private.staff_role()<>'admin' then raise insufficient_privilege; end if;
  if new.interested_at is not null and old.interested_at is null and new.consent_at is null then raise exception 'consent_required'; end if;
  if new.prototype_at is distinct from old.prototype_at and new.prototype_at is not null and new.interested_at is null then raise exception 'interest_required';end if;
  if new.trial_at is distinct from old.trial_at and new.trial_at is not null and (new.consent_at is null or new.interested_at is null) then raise exception 'consent_required';end if;
  new.version=old.version+1;
 else
  if new.trial_at is not null and liqa_private.staff_role()<>'admin' then raise insufficient_privilege; end if;
  if new.interested_at is not null and new.consent_at is null then raise exception 'consent_required'; end if;
  if new.prototype_at is not null and new.interested_at is null then raise exception 'interest_required';end if;
  if new.trial_at is not null and (new.consent_at is null or new.interested_at is null) then raise exception 'consent_required';end if;
  new.created_at=now();new.version=1;
 end if;
 new.updated_at=now();return new;
end $$;
revoke all on function liqa_private.office_guard() from public, anon;
create trigger guard_office before insert or update on public.liqa_offices for each row execute function liqa_private.office_guard();
create function liqa_private.audit_change() returns trigger language plpgsql security definer set search_path='' as $$
begin
 if auth.uid() is null then raise insufficient_privilege; end if;
 insert into public.liqa_audit(office_id,actor,action)
 values((case when tg_table_name='liqa_offices' then to_jsonb(new)->>'id' else to_jsonb(new)->>'office_id' end)::uuid,auth.uid(),tg_table_name||':'||tg_op);
 return new;
end $$;
revoke all on function liqa_private.audit_change() from public, anon, authenticated;
create trigger audit_office after insert or update on public.liqa_offices for each row execute function liqa_private.audit_change();
create trigger audit_note after insert on public.liqa_notes for each row execute function liqa_private.audit_change();
create trigger audit_interview after insert on public.liqa_interviews for each row execute function liqa_private.audit_change();
create trigger audit_task after insert or update on public.liqa_tasks for each row execute function liqa_private.audit_change();
revoke all on public.liqa_staff,public.liqa_offices,public.liqa_notes,public.liqa_interviews,public.liqa_tasks,public.liqa_audit,public.liqa_subscriptions from public,anon,authenticated;
grant select on public.liqa_staff,public.liqa_offices,public.liqa_notes,public.liqa_interviews,public.liqa_tasks,public.liqa_audit,public.liqa_subscriptions to authenticated;
grant insert on public.liqa_offices,public.liqa_notes,public.liqa_interviews,public.liqa_tasks to authenticated;
grant update(name,city,district,contact,phone,source,interest,assigned_to,consent_at,interviewed_at,interested_at,prototype_at,trial_at) on public.liqa_offices to authenticated;
grant update(done) on public.liqa_tasks to authenticated;
-- One command = one transaction; never replace browser snapshots on the server.
create function public.liqa_command(p_action text,p_office_id uuid,p_data jsonb default '{}'::jsonb) returns uuid
language plpgsql security invoker set search_path='' as $$
declare target uuid; o public.liqa_offices; changed integer; r text; a uuid;
begin
 r=liqa_private.staff_role();if r is null then raise insufficient_privilege; end if;
 if p_action='create' then
  a=case when r='admin' then (p_data->>'assignee')::uuid else auth.uid() end;
  insert into public.liqa_offices(name,city,district,contact,phone,source,interest,assigned_to,created_by,consent_at)
  values(btrim(p_data->>'name'),btrim(p_data->>'city'),coalesce(p_data->>'district',''),btrim(p_data->>'contact'),nullif(p_data->>'phone',''),p_data->>'source',p_data->>'interest',a,auth.uid(),case when (p_data->>'consent')::boolean then now() end)
  returning id into target;return target;
 end if;
 select * into o from public.liqa_offices where id=p_office_id for update;
 if not found then raise exception 'not_found'; end if;
 if p_action='edit' then
  if o.version<>(p_data->>'version')::integer or (p_data->>'version') is null then raise exception 'version_conflict'; end if;
  a=case when r='admin' then (p_data->>'assignee')::uuid else auth.uid() end;
  update public.liqa_offices set name=btrim(p_data->>'name'),city=btrim(p_data->>'city'),district=coalesce(p_data->>'district',''),contact=btrim(p_data->>'contact'),phone=nullif(p_data->>'phone',''),source=p_data->>'source',interest=p_data->>'interest',assigned_to=a,
   consent_at=case when (p_data->>'consent')::boolean then coalesce(consent_at,now()) else null end where id=p_office_id;
 elsif p_action='interest' then
  if o.consent_at is null then raise exception 'consent_required'; end if;
  update public.liqa_offices set interested_at=coalesce(interested_at,now()) where id=p_office_id;
 elsif p_action='prototype' then
  if o.interested_at is null then raise exception 'interest_required'; end if;
  update public.liqa_offices set prototype_at=coalesce(prototype_at,now()) where id=p_office_id;
 elsif p_action='trial' then
  if r<>'admin' then raise insufficient_privilege; end if;
  if o.consent_at is null or o.interested_at is null then raise exception 'consent_required'; end if;
  update public.liqa_offices set trial_at=coalesce(trial_at,now()) where id=p_office_id;
 elsif p_action='note' then
  insert into public.liqa_notes(office_id,text) values(p_office_id,p_data->>'text');
 elsif p_action='interview' then
  if coalesce((p_data->>'researchConsent')::boolean,false)=false then raise exception 'research_consent_required'; end if;
  insert into public.liqa_interviews(office_id,workflow,pain,prices,research_consent)
   values(p_office_id,p_data->>'workflow',coalesce(p_data->>'pain',''),nullif(p_data->'prices','null'::jsonb),true);
  update public.liqa_offices set interviewed_at=coalesce(interviewed_at,now()) where id=p_office_id;
 elsif p_action='task' then
  insert into public.liqa_tasks(office_id,title,due) values(p_office_id,p_data->>'title',(p_data->>'due')::date);
 elsif p_action='complete' then
  update public.liqa_tasks set done=(p_data->>'done')::boolean where id=(p_data->>'taskId')::uuid and office_id=p_office_id;
  get diagnostics changed=row_count;if changed=0 then raise exception 'not_found';end if;
 else raise exception 'unsupported_action';end if;
 return p_office_id;
end $$;
revoke all on function public.liqa_command(text,uuid,jsonb) from public,anon;
grant execute on function public.liqa_command(text,uuid,jsonb) to authenticated;
commit;
