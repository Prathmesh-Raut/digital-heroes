create extension if not exists citext;
create extension if not exists pgcrypto;

create type user_role as enum ('subscriber', 'admin');
create type plan_interval as enum ('monthly', 'yearly');
create type subscription_status as enum ('active', 'inactive', 'renewal_due', 'expired', 'cancelled');
create type draw_mode as enum ('random', 'weighted');
create type draw_status as enum ('simulated', 'published');
create type verification_status as enum ('not_submitted', 'pending', 'approved', 'rejected');
create type payout_status as enum ('pending', 'paid');
create type payment_kind as enum ('subscription', 'charity', 'payout');
create type payment_status as enum ('pending', 'succeeded', 'failed', 'refunded');

create table charities (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  category text not null,
  country text not null,
  description text not null,
  mission text not null,
  image_url text not null,
  spotlight boolean not null default false,
  impact_blurb text not null,
  tags text[] not null default '{}',
  website_url text not null,
  created_at timestamptz not null default now()
);

create table charity_events (
  id uuid primary key default gen_random_uuid(),
  charity_id uuid not null references charities(id) on delete cascade,
  title text not null,
  starts_at timestamptz not null,
  location text not null,
  summary text not null,
  created_at timestamptz not null default now()
);

create table app_users (
  id uuid primary key default gen_random_uuid(),
  email citext not null unique,
  password_hash text not null,
  full_name text not null,
  role user_role not null default 'subscriber',
  country text not null,
  selected_charity_id uuid not null references charities(id),
  charity_contribution_percent numeric(5,2) not null check (charity_contribution_percent between 10 and 90),
  avatar_url text,
  created_at timestamptz not null default now()
);

create table subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references app_users(id) on delete cascade,
  plan plan_interval not null,
  status subscription_status not null,
  amount_cents integer not null check (amount_cents > 0),
  currency_code text not null default 'USD',
  started_at timestamptz not null,
  renews_at timestamptz not null,
  cancelled_at timestamptz,
  stripe_customer_id text,
  stripe_subscription_id text,
  created_at timestamptz not null default now()
);

create index subscriptions_user_idx on subscriptions(user_id);

create table scores (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references app_users(id) on delete cascade,
  stableford_score smallint not null check (stableford_score between 1 and 45),
  played_at date not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, played_at)
);

create index scores_user_played_idx on scores(user_id, played_at desc);

create or replace function trim_scores_to_five()
returns trigger
language plpgsql
as $$
begin
  delete from scores
  where id in (
    select id
    from scores
    where user_id = new.user_id
    order by played_at desc, created_at desc
    offset 5
  );

  return new;
end;
$$;

create trigger scores_trim_after_insert
after insert on scores
for each row
execute function trim_scores_to_five();

create or replace function stamp_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger scores_updated_at
before update on scores
for each row
execute function stamp_updated_at();

create table draws (
  id uuid primary key default gen_random_uuid(),
  month_key date not null,
  label text not null,
  mode draw_mode not null,
  status draw_status not null,
  created_by_user_id uuid not null references app_users(id),
  participant_count integer not null default 0,
  jackpot_rollover_in_cents integer not null default 0,
  jackpot_rollover_out_cents integer not null default 0,
  prize_pool_tier3_cents integer not null default 0,
  prize_pool_tier4_cents integer not null default 0,
  prize_pool_tier5_cents integer not null default 0,
  prize_pool_total_cents integer not null default 0,
  simulated_at timestamptz,
  published_at timestamptz,
  notes text,
  created_at timestamptz not null default now()
);

create index draws_month_idx on draws(month_key desc);

create table draw_numbers (
  draw_id uuid not null references draws(id) on delete cascade,
  position smallint not null check (position between 1 and 5),
  stableford_score smallint not null check (stableford_score between 1 and 45),
  primary key (draw_id, position),
  unique (draw_id, stableford_score)
);

create table draw_entries (
  id uuid primary key default gen_random_uuid(),
  draw_id uuid not null references draws(id) on delete cascade,
  user_id uuid not null references app_users(id) on delete cascade,
  entered_at timestamptz not null default now(),
  unique (draw_id, user_id)
);

create table draw_entry_numbers (
  entry_id uuid not null references draw_entries(id) on delete cascade,
  position smallint not null check (position between 1 and 5),
  stableford_score smallint not null check (stableford_score between 1 and 45),
  primary key (entry_id, position)
);

create table winner_claims (
  id uuid primary key default gen_random_uuid(),
  draw_id uuid not null references draws(id) on delete cascade,
  user_id uuid not null references app_users(id) on delete cascade,
  match_tier smallint not null check (match_tier in (3, 4, 5)),
  amount_cents integer not null check (amount_cents >= 0),
  verification_status verification_status not null default 'not_submitted',
  payout_status payout_status not null default 'pending',
  proof_image_url text,
  submitted_at timestamptz,
  reviewed_at timestamptz,
  reviewed_by_user_id uuid references app_users(id),
  paid_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  unique (draw_id, user_id, match_tier)
);

create table payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references app_users(id) on delete set null,
  subscription_id uuid references subscriptions(id) on delete set null,
  charity_id uuid references charities(id) on delete set null,
  draw_id uuid references draws(id) on delete set null,
  kind payment_kind not null,
  status payment_status not null,
  amount_cents integer not null check (amount_cents >= 0),
  charity_amount_cents integer,
  currency_code text not null default 'USD',
  stripe_reference text,
  description text not null,
  created_at timestamptz not null default now()
);

create index payments_created_idx on payments(created_at desc);
create index payments_kind_idx on payments(kind);

create table notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references app_users(id) on delete cascade,
  subject text not null,
  body text not null,
  created_at timestamptz not null default now()
);

alter table charities enable row level security;
alter table charity_events enable row level security;
alter table app_users enable row level security;
alter table subscriptions enable row level security;
alter table scores enable row level security;
alter table draws enable row level security;
alter table draw_numbers enable row level security;
alter table draw_entries enable row level security;
alter table draw_entry_numbers enable row level security;
alter table winner_claims enable row level security;
alter table payments enable row level security;
alter table notifications enable row level security;

create policy "service role charities" on charities for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy "service role charity events" on charity_events for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy "service role app users" on app_users for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy "service role subscriptions" on subscriptions for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy "service role scores" on scores for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy "service role draws" on draws for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy "service role draw numbers" on draw_numbers for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy "service role draw entries" on draw_entries for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy "service role draw entry numbers" on draw_entry_numbers for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy "service role winner claims" on winner_claims for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy "service role payments" on payments for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy "service role notifications" on notifications for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

insert into storage.buckets (id, name, public)
values ('winner-proofs', 'winner-proofs', false)
on conflict (id) do nothing;
