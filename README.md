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

## Ad placement comparison

[ad-banner-enabled](https://eu.posthog.com/project/296403/feature_flags/319553) is the only flag. Its public multivariate rollout assigns 50% of browsers to `custom` and 50% to `google-anchor`. Disable the flag to stop loading ads. Missing, invalid, or failed evaluations default to no ads. PostHog's existing browser identifier keeps assignment stable; clearing site data changes identity. No tester URLs or tester properties are used.

The custom unit sits below the map, full width on phones and centered on desktop. Its × button dismisses until reload without saving a preference. Blocked, empty and unanswered (15 seconds) slots collapse. Google anchors have Google's own close control; the app does not claim to observe their impressions or dismissals.

The anchor branch loads only Google's script with the [documented `data-overlays="collapsed-bottom"` setting](https://support.google.com/adsense/answer/7478225?hl=en), which opts into regular bottom anchors rather than expanding/top anchors. The custom branch creates only the manual unit. Keep site-wide Auto ads and Auto optimize OFF in AdSense so global placements cannot contaminate the custom group. The code override opts the anchor group into anchors separately; actual fill is Google's decision.

PostHog records `ad_variant_assigned` once per map page load, tags custom lifecycle events with `ad_variant=custom`, and records anchor script requests/failures with `ad_variant=google-anchor`. The [dashboard](https://eu.posthog.com/project/296403/dashboard/1002411) custom show/dismiss charts do not measure Google anchor closes or billable impressions. Revenue must be read from AdSense; assignment counts are not revenue or fill metrics.

Flags refresh every minute and on window focus. Once initialized, a page retains its ad mode to avoid loading both implementations. Disabling prevents new loads and unmounts our custom unit; Google's already injected anchors may persist until reload. Changing variants takes effect on a new page load.

Vercel previews and `ADSENSE_LOCAL_PREVIEW=1` use only the custom unit in Google test mode and exclude production analytics. Preview hostnames may receive no creative. Run `ADSENSE_LOCAL_PREVIEW=1 pnpm test:e2e tests/ad-preview.spec.ts` for deterministic filled/empty/blocked/timeout checks.
