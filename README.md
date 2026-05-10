# WHW 2026 Trip Companion

Static HTML app for the West Highland Way trip (Sharky, R2, Mango, Madness — October 2026). Shared checklist state stored in Supabase; hosted on Netlify.

---

## Deploying / updating

1. Log in to netlify.com
2. Go to your site's dashboard → **Deploys** tab
3. Drag the `whw/` folder onto the deploy drop zone
4. Done — same URL, updated content

For the first deploy, go to **Sites → Add new site → Deploy manually** and drag the folder there.

> Deploy the whole `whw/` folder, not individual files — Netlify uses the folder as the site root.

---

## Database — Supabase

**Project URL:** `https://qghfnmsoarntmmclomfd.supabase.co`  
**Dashboard:** supabase.com → your project  
**Schema file:** `whw_schema.sql`

### Table: `checklist_state`

| Column | Type | Notes |
|---|---|---|
| `hiker` | text (PK) | One of: Sharky, R2, Mango, Madness |
| `phase_idx` | int (PK) | 0-indexed checklist phase |
| `task_idx` | int (PK) | 0-indexed task within phase |
| `state` | smallint | 0 = unchecked, 1 = done, 2 = skipped |
| `updated_at` | timestamptz | Set on each write |

One row per hiker × task. Rows are created on first interaction (no seed data needed). Absence of a row means state 0.

### Resetting the checklist

To clear everyone's progress:

```sql
delete from public.checklist_state;
```

To clear one hiker:

```sql
delete from public.checklist_state where hiker = 'Sharky';
```

### Re-running the schema from scratch

Run `whw_schema.sql` in the Supabase SQL editor. It drops and recreates the table cleanly.

---

## Credentials in the HTML

Both values live at the top of the `<script>` block in `WHW_Trip_Companion.html`:

```js
const SUPABASE_URL      = 'https://qghfnmsoarntmmclomfd.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_QxgqVIaT7jcOTX33MKt3Vg_b8Il-kqK';
```

The anon key is safe to be public — it is intentionally publishable and scoped by row-level security.
