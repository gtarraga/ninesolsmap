import { loadPublicMarkers } from '@/lib/supabase/public-markers';

/** Cache public HTTP successes rather than prerendering build-time upstream failures. */
export const dynamic = 'force-dynamic';

/** Serve the same anonymous map dataset to all callers, caching successful responses only. */
export async function GET() {
  const result = await loadPublicMarkers({url:process.env.NEXT_PUBLIC_SUPABASE_URL,
    key:process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY});
  if (result._tag === 'err') {
    console.error('markers.read_failed',{stage:result.error.stage});
    return Response.json({error:'Marker data is temporarily unavailable.'},{status:503,
      headers:{'Cache-Control':'no-store'}});
  }
  return Response.json(result.value,{headers:{
    'Cache-Control':'public, max-age=300, s-maxage=3600, stale-while-revalidate=3600',
  }});
}
