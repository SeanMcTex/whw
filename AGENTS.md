# Agent Guide — WHW 2026 Trip Companion

A single-page web app for coordinating a West Highland Way hike (4–11 Oct 2026).
No build step. Deployed to Netlify on every push to `main`.

---

## Architecture

| Layer | Detail |
|---|---|
| Frontend | Single file: `index.html` (HTML + CSS + JS, ~900 lines) |
| Backend | Supabase (Postgres + Realtime) |
| Hosting | Netlify static, auto-deploys from `main` |
| Schema | `whw_schema.sql` — reference only, see warning below |

---

## Critical keys — must stay consistent

### Hiker names

The four hiker names appear in **five places** and must be identical in all of them:

1. `const NAMES = [...]` in the JS (order matters — it drives column layout)
2. `onclick="selectHiker('...')"` on each picker button
3. The `hiker` CHECK constraint in `whw_schema.sql`
4. The `SHARKY · PACO · ...` subtitle in the page header
5. The `<title>` tag

Current names: `Sharky`, `Paco`, `Mango`, `Madness`

**Renaming a hiker is a data migration, not a find-and-replace.** Existing `checklist_state` rows are keyed by the hiker name string. If you rename a hiker in the JS without updating Supabase, their checklist data becomes orphaned. To rename safely:
1. Update the Supabase rows first: `UPDATE checklist_state SET hiker = 'NewName' WHERE hiker = 'OldName';`
2. Then update all five locations in `index.html`.

### Day indices (`day_idx`)

`day_notes` rows use `day_idx` 0–6, corresponding to the seven day cards in the Itinerary tab in order:

| idx | Day |
|---|---|
| 0 | Milngavie → Drymen (4 Oct) |
| 1 | Drymen → Rowardennan (5 Oct) |
| 2 | Rowardennan → Inverarnan (6 Oct) |
| 3 | Inverarnan → Tyndrum (7 Oct) |
| 4 | Tyndrum → Glencoe (8 Oct) |
| 5 | Kingshouse → Kinlochleven (9 Oct) |
| 6 | Kinlochleven → Fort William (10 Oct) |

**Do not reorder day cards.** Doing so mis-routes existing notes to the wrong days.

### Checklist phase and task indices

`checklist_state` rows use `phase_idx` and `task_idx` into the `PHASES` array. Adding new tasks or phases at the **end** of a phase/array is safe. Inserting, removing, or reordering tasks or phases will corrupt existing checklist state — old ticks will land on the wrong tasks.

---

## Safe vs dangerous operations

| Operation | Safe? | Notes |
|---|---|---|
| Edit text in a day card | ✅ | Pure HTML change |
| Edit tip card content | ✅ | Pure HTML change |
| Edit logistics info | ✅ | Pure HTML change |
| Add a new checklist task at the end of a phase | ✅ | New `task_idx`, existing data unaffected |
| Add a new checklist phase at the end of `PHASES` | ✅ | New `phase_idx` |
| Insert/remove/reorder checklist tasks or phases | ⛔ | Corrupts existing state indices |
| Rename a hiker | ⚠️ | Migrate Supabase data first (see above) |
| Reorder day cards | ⛔ | Mis-routes saved notes |
| Add a new tab | ✅ | Copy pattern from existing panel |
| Change CSS | ✅ | No data impact |
| Run `whw_schema.sql` against production | ⛔ | Drops and recreates tables — wipes all data |

---

## Schema changes

`whw_schema.sql` is a **full drop-and-recreate** script. It is useful for:
- Setting up a fresh Supabase project
- Local reference for table structure

**Never run it against the live Supabase project** while the trip is in progress — it will erase all checklist progress and group notes. Use `ALTER TABLE` statements for any schema changes needed on a live database.

---

## Supabase realtime

Two named channels are subscribed after a hiker is selected:
- `whw-checklist` — watches `checklist_state`
- `whw-notes` — watches `day_notes`

Don't create additional channels with the same names or duplicate subscriptions will fire.

---

## Deployment

Push to `main` → Netlify auto-deploys. No build command. Publish directory is `.` (repo root). Config is in `netlify.toml`. Build image: Ubuntu Noble 24.04.

---

## Supabase credentials

Stored directly in `index.html` (they are publishable/anon keys — this is intentional and safe for a Supabase project with RLS enabled):

```
SUPABASE_URL      = 'https://qghfnmsoarntmmclomfd.supabase.co'
SUPABASE_ANON_KEY = 'sb_publishable_QxgqVIaT7jcOTX33MKt3Vg_b8Il-kqK'
```

Do not replace these with service-role keys. The anon key with public RLS policies is the correct pattern for a client-side app.
