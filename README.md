# Nine Sols Interactive Map

Interactive item, boss and collectible map for [Nine Sols](https://ninesolsmap.com).
Built with Next.js, React Leaflet and public read-only marker data from Supabase.
English, simplified Chinese and traditional Chinese routes support direct marker links.

## Local development

Use Node.js 24 and pnpm (the single committed dependency lockfile). The runtime
is pinned in `package.json` so Vercel builds and functions use a supported version:

```sh
pnpm install --frozen-lockfile
cp .env.example .env.local
# Fill in the public Supabase URL and anonymous key.
pnpm dev
```

PostHog uses the EU project configured in `app/providers.tsx` and runs only on
`ninesolsmap.com` and `www.ninesolsmap.com`; local and preview visits are excluded.
Its project token is public browser configuration. Analytics requests use the
PostHog-managed `e.ninesolsmap.com` proxy, so they do not consume Vercel request
quota. Cloudflare has a DNS-only CNAME record:
`e` → `db17682af2d47c668012.cf-prod-eu-proxy.europehog.com`.
PostHog verified the proxy and its HTTPS certificate on 2026-10-06.
The proxy does not change analytics consent or cookieless settings. AdSense is optional; leave its
publisher ID empty for local work. AdSense
only loads when a full publisher ID is configured; this does not create a banner.
The Supabase reader uses the anonymous key without forwarding browser cookies or
sessions. Database policies must allow anonymous reads of `markers_chinese`.
Never configure a service-role key for this public endpoint.

## Checks and browser tests

```sh
pnpm lint
pnpm typecheck
pnpm build
pnpm exec playwright install chromium
pnpm test:e2e
```

The browser tests start the production build on port 3100 and a local Supabase
HTTP substitute on port 3101. They use a small checked-in dataset, block analytics
and ads, and replace remote tiles with a local pixel. No real account or database
is needed. Build before running them. Tests cover phone layouts, filtering,
marker links, locale switching, clipboard feedback, API caching and error retry.
Real tile loading and physical phone/Safari behavior need a separate manual check.

## Icons and caching

`pnpm icons:generate` builds a content-hashed PNG sprite from the original artwork
in `public/icons`. The production build regenerates it automatically. Markers and
filter thumbnails share the sprite; original icon sizes are preserved within 44px
touch targets. Generated CSS and the sprite belong in source control when these
changes are ready to be committed.

Only `/sprites/*` gets a one-year immutable browser cache because these filenames
are content-hashed. The public marker API returns JSON with a five-minute browser
cache, one-hour shared cache, and up to one additional hour of stale revalidation.
Failures return 503 and `no-store`. Supabase is queried uncached on origin misses,
so hosting-level cache behavior should be verified after any future deployment.

Map tiles remain at `map.ninesolsmap.com`. This cleanup does not migrate hosting,
create a Google ad unit, or change provider/account settings.

## Local ad preview

Set `ADSENSE_LOCAL_PREVIEW=1` before building and starting locally to preview the responsive AdSense unit in test mode. It only renders on localhost, below the map, and never enables a deployed banner. Google may return an empty slot locally.

The × button hides the unit until reload without saving a preference. Preview events are exposed as `ninesolsmap:ad-banner-event` browser events for tests; localhost does not send them to PostHog. The lifecycle covers requests, filled/empty results, loader failures, visible filled ads, and dismissal. No diagnostic console logs are added. The [PostHog dashboard](https://eu.posthog.com/project/296403/dashboard/1002411) has show/dismiss counts and dismissal rate ready for a future live rollout; these are not AdSense billable impression counts.

Run the preview tests with `ADSENSE_LOCAL_PREVIEW=1 pnpm test:e2e tests/ad-preview.spec.ts`.
