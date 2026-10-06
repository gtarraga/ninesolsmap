import { parseMarkers, type MapMarker } from '../markers';

/** A marker configuration or upstream failure, safe to report without credentials. */
export class PublicMarkersUnavailable extends Error {
  readonly _tag = 'PublicMarkersUnavailable' as const;
  /** Failure stage for safe server diagnostics. */
  readonly stage: 'configuration'|'network'|'upstream'|'payload';
  constructor(stage:PublicMarkersUnavailable['stage']) {
    super('Public marker data is unavailable.'); this.stage = stage;
  }
}

/** Read only anonymous marker data; caller cookies and sessions never reach Supabase. */
export async function loadPublicMarkers(config:{readonly url:string|undefined;readonly key:string|undefined}): Promise<
  {readonly _tag:'ok';readonly value:ReadonlyArray<MapMarker>} |
  {readonly _tag:'err';readonly error:PublicMarkersUnavailable}> {
  if (!config.url || !config.key) return {_tag:'err',error:new PublicMarkersUnavailable('configuration')};
  let endpoint:URL;
  try {
    endpoint = new URL('/rest/v1/markers_chinese',config.url);
    if (!['http:','https:'].includes(endpoint.protocol)) return {_tag:'err',error:new PublicMarkersUnavailable('configuration')};
  } catch { return {_tag:'err',error:new PublicMarkersUnavailable('configuration')}; }
  endpoint.searchParams.set('select','id,x,y,type,description,traditional,simplified');
  let response:Response;
  try {
    response = await fetch(endpoint,{headers:{apikey:config.key,Authorization:`Bearer ${config.key}`},
      cache:'no-store',signal:AbortSignal.timeout(10000)});
  } catch { return {_tag:'err',error:new PublicMarkersUnavailable('network')}; }
  if (!response.ok) return {_tag:'err',error:new PublicMarkersUnavailable('upstream')};
  try {
    const payload:unknown = await response.json();
    const parsed = parseMarkers(payload);
    return parsed._tag === 'ok' ? parsed : {_tag:'err',error:new PublicMarkersUnavailable('payload')};
  } catch { return {_tag:'err',error:new PublicMarkersUnavailable('payload')}; }
}
