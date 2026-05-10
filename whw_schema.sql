-- ── Drop existing schema ─────────────────────────────────────────────────────
-- CASCADE removes dependent policies; Postgres also removes the table from
-- any publications automatically when it is dropped.

drop table if exists public.checklist_state cascade;
drop table if exists public.day_notes cascade;

-- ── Relational checklist state ────────────────────────────────────────────────

create table public.checklist_state (
  hiker      text        not null check (hiker in ('Sharky', 'Paco', 'Mango', 'Madness')),
  phase_idx  int         not null,
  task_idx   int         not null,
  state      smallint    not null default 0 check (state in (0, 1, 2)),
  updated_at timestamptz not null default now(),
  primary key (hiker, phase_idx, task_idx)
);

-- ── Row-level security ────────────────────────────────────────────────────────

alter table public.checklist_state enable row level security;

create policy "public rw" on public.checklist_state
  for all using (true) with check (true);

-- ── Realtime ──────────────────────────────────────────────────────────────────

alter publication supabase_realtime add table public.checklist_state;

-- ── Day notes ─────────────────────────────────────────────────────────────────

create table public.day_notes (
  day_idx    int         not null primary key check (day_idx between 0 and 6),
  content    text        not null default '',
  updated_by text,
  updated_at timestamptz not null default now()
);

alter table public.day_notes enable row level security;

create policy "public rw" on public.day_notes
  for all using (true) with check (true);

alter publication supabase_realtime add table public.day_notes;
