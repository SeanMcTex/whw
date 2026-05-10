# WHW 2026 Trip Companion

Static web app for the West Highland Way hike (Sharky, Paco, Mango, Madness — 4–11 October 2026).

**Features:** itinerary, synced group checklist, per-day shared notes, countdown, tips, and logistics.

- Frontend: single file — `index.html`
- Backend: Supabase (Postgres + Realtime)
- Hosting: Netlify, auto-deploys from `main`

---

## Making updates

Push to `main` — Netlify deploys automatically. No build step.

For safe update rules (especially around hiker names and day ordering), see **`AGENTS.md`**.

---

## Database — Supabase

**Project URL:** `https://qghfnmsoarntmmclomfd.supabase.co`  
**Schema file:** `whw_schema.sql` (reference — see warning below before running)

### Table: `checklist_state`

| Column | Type | Notes |
|---|---|---|
| `hiker` | text (PK) | One of: Sharky, Paco, Mango, Madness |
| `phase_idx` | int (PK) | 0-indexed checklist phase |
| `task_idx` | int (PK) | 0-indexed task within phase |
| `state` | smallint | 0 = unchecked, 1 = done, 2 = skipped |
| `updated_at` | timestamptz | Set on each write |

One row per hiker × task. Rows are created on first interaction. A missing row means state 0.

### Table: `day_notes`

| Column | Type | Notes |
|---|---|---|
| `day_idx` | int (PK) | 0–6, maps to Day 1–7 in order |
| `content` | text | Free-text group notes for that day |
| `updated_by` | text | Hiker name of last editor |
| `updated_at` | timestamptz | Set on each write |

### Useful SQL

Clear all checklist progress:
```sql
delete from public.checklist_state;
```

Clear one hiker's progress:
```sql
delete from public.checklist_state where hiker = 'Sharky';
```

Clear notes for one day:
```sql
delete from public.day_notes where day_idx = 0;
```

### ⚠️ Schema reset warning

`whw_schema.sql` **drops and recreates both tables** — running it against the live project erases all checklist progress and group notes. Only use it to set up a fresh Supabase project. Use `ALTER TABLE` for live schema changes.

---

## Credentials

Both values are at the top of the `<script>` block in `index.html`:

```js
const SUPABASE_URL      = 'https://qghfnmsoarntmmclomfd.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_QxgqVIaT7jcOTX33MKt3Vg_b8Il-kqK';
```

The anon key is safe to be public — it is intentionally publishable and scoped by Supabase row-level security policies.
