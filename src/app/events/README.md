# Upcoming events

The source is `https://luma.com/user/wds`, configured in
`src/lib/events/config.js`. Public upcoming events are discovered automatically
from this account's **hosted** events, including partnerships where WDS is a
co-host. Publish an event on Luma with WDS listed as a host; no website edit or
redeploy is needed for each new event. Attended events are not included.

Dates, times, room, description, cover art, RSVP link, count, and up to four
public guest profiles are read from each discovered event's public Luma page.

Luma's [official event API requires Luma Plus](https://docs.luma.com/reference/getting-started-with-your-api).
This adapter reads the profile's embedded account ID and the unauthenticated
hosted-event listing used by Luma's public website, then reads each public
event page's embedded metadata. These website formats are not a supported API
contract; if Luma changes them, update `src/lib/events/luma.js`. It never uses
host credentials or private guest APIs. Pagination is followed, with a guard
against loops or more than ten listing pages; exceeding it fails the refresh
instead of saving a truncated list.
Only public events, visible locations, and guest profiles that Luma shows publicly
are included. Other fields, including registration answers, are not persisted.

## Storage and cache

This uses the existing server-only `DATABASE_URL`, which connects as the
`wds_site` application role. The SQL migration grants that role the schema and
table permissions it needs, including when the table is created in Neon's SQL
Editor by an owner account. No Luma API key or Supabase configuration is needed.

`vercel.json` registers one daily job at `/api/cron/events`, scheduled for
**10:00 UTC** (6am Toronto during daylight saving time, 5am in winter).
[Vercel Hobby supports daily cron jobs](https://vercel.com/docs/cron-jobs/usage-and-pricing)
and may invoke it any time within that hour. It runs in production without page
traffic; preview deployments and `next dev` do not run the schedule.

Before deploying, add **`CRON_SECRET`** to the Vercel project's **Production**
environment variables. Generate a random value of at least 32 bytes, for
example with `openssl rand -hex 32`. Keep it out of git and browser code.
Vercel automatically supplies it as `Authorization: Bearer <secret>`.
The route rejects missing or incorrect authorization, including when the
environment variable has not been configured. See
[Vercel's cron security instructions](https://vercel.com/docs/cron-jobs/manage-cron-jobs#securing-cron-jobs).

### First deployment

1. In the Vercel dashboard, open this website's project, then **Settings →
   Environment Variables**. Confirm the existing **Production** `DATABASE_URL`
   points to the intended Neon branch/database. Local `.env` files are not pushed
   or automatically copied to Vercel. Do not print or share the connection string.
2. In the [Neon Console](https://console.neon.tech/), select the same project,
   then **Postgres database → SQL Editor**, and select the matching branch and
   database. Paste the entire contents of
   `db/migrations/20261002_event_snapshots.sql` and click **Run**. Use the existing
   application role or an owner account. This only creates the event table and
   grants its permissions; it is safe to run again. If the table was already
   created in this production database, no new database or branch is needed.
3. On your computer, run `openssl rand -hex 32`. Copy the generated 64-character
   value into a new Vercel environment variable named **`CRON_SECRET`**, scoped
   to **Production**, and save it. This is a shared password between Vercel's
   scheduler and the refresh route, not a key from Neon or Luma. Enter the value
   without quotes or a `Bearer` prefix. Do not name it `NEXT_PUBLIC_CRON_SECRET`.
4. Push the integration files, including `vercel.json`, the cron route, the
   events modules, and the migration, to the Git branch Vercel uses for
   **production**. Keep local regression tests and `.env` out of the commit.
   The connected Git deployment builds and initializes the profile snapshot
   if it is absent. If environment variables were added after that deployment,
   redeploy; environment changes only apply to new deployments.
5. After the production deployment is ready, open **Settings → Cron Jobs** and
   confirm `/api/cron/events` is listed and enabled. Use **Run** to exercise it
   once and **View Logs** to check the result. A successful response is
   `{"ok":true,"eventCount":1}` for the current event. Visit `/events` and
   confirm the Figma event appears. Opening the cron URL in an ordinary browser
   should return **401 Unauthorized**, since it has no authorization header.

To verify the saved record in Neon's SQL Editor after deployment:

```sql
SELECT source_url, fetched_at,
       jsonb_array_length(snapshot->'events') AS upcoming_event_count
FROM wds_site.event_snapshots
WHERE source_url = 'https://luma.com/user/wds';
```

### Expected free-plan usage

For a 30-day month with one upcoming event and steady page traffic, estimate:

- 30 scheduled Vercel Function invocations, plus roughly 120–150 page
  regenerations/cache reads. These are approximate; deployments, cache eviction,
  concurrent misses, manual runs, and retries add work.
- 90 public requests to Luma from the daily jobs, plus direct browser requests
  for the poster and public guest avatar images.
- 30 Neon writes and roughly 120–150 Neon reads. The current one-event profile
  payload is about 1.5 KB in Postgres; image files are not stored in Neon.
- No Supabase operations, GitHub Actions minutes, or Vercel image transforms
  for these remote event images. GitHub still triggers ordinary Vercel builds
  when changes are pushed.

[Vercel Hobby](https://vercel.com/docs/plans/hobby) currently includes one million
function invocations, four active CPU-hours, and 360 GB-hours of function memory.
[Neon Free](https://neon.com/docs/introduction/plans) currently includes 100
CU-hours and 1 GB of Postgres storage per project. Neon meters active compute,
not query count: at 0.25 CU with isolated five-minute wake-ups, 150–180 wake-ups
would use about 3.1–3.8 CU-hours. This is an estimate for this feature, not a
measurement of the whole website's database usage. Neon Free suspends after
five minutes of inactivity.

Cached page visits still use Vercel CDN requests and bandwidth. These limits
are shared with the rest of the site/team; check Vercel's **Usage** and Neon's
**Monitoring/usage** dashboards for actual totals. Here, “event snapshot” means
a normal JSON row, not a Neon managed backup/snapshot feature.

The daily function fetches the profile and its hosted-event listing, fetches
each discovered public event, and writes **one combined snapshot** to Neon.
With one upcoming event, that is three requests to Luma and one Neon upsert.
Extra listing pages or events add Luma requests, not database writes.
Only after that write succeeds does the job invalidate the upcoming-event
data cache and `/events` page. The next visit regenerates the page using the
saved data, without fetching Luma again.

Ordinary production visits use Vercel's ISR page cache and do not query Neon or
call Luma. Both the page and its data cache revalidate after **21,600 seconds
(six hours)**; a cache miss reads the single profile snapshot from Neon.
This does not check Luma again. The six-hour page regeneration also filters out
events that have ended between daily checks. Deployments and cache eviction
can cause extra database reads. Local `next dev` bypasses production ISR.

If no profile snapshot exists yet, the first build/cache miss discovers and
saves it. Thereafter the cron job is responsible for checking Luma each day.
Snapshots have no expiry. A failed discovery, malformed response, event fetch,
or database write leaves the previous snapshot intact and the job returns 503.
Successful discovery of an empty list clears the card, including events no
longer publicly hosted by WDS. Vercel does not automatically retry failed cron
runs; inspect the function logs and use **Run** in the Cron Jobs dashboard to
retry, or wait for the next daily run. If Neon fails during page regeneration,
ISR retains the previous page.

This feature does not automatically move ended events into the manually
curated past-event gallery. A page may remain stale during a provider outage.

Poster and guest images load directly from Luma's CDN using unoptimized Next
images, so this feature does not use Vercel Image Optimization for those images.
Supabase and GitHub Actions are not involved. Vercel Cron/Functions, the public
Luma website/CDN, and Neon are the only services used by this feature.

## Verification

Run `npm run build` and lint the event integration with:

```sh
npx eslint src/lib/events src/app/events src/app/api/cron/events src/components/sections/Events/eventData.js next.config.mjs
```

Regression tests are kept locally and are not pushed to this repository.
