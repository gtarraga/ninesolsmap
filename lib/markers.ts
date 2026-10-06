/** Public map data with parsed coordinates and normalized category names. */
export type MapMarker = {
  readonly id: string;
  readonly x: number;
  readonly y: number;
  readonly type: string;
  readonly description: string;
  readonly traditional: string;
  readonly simplified: string;
};

const categories = new Map(Object.entries({
  root: 'Root', bigchest: 'BigChest', boss: 'Boss', chest: 'Chest', chiyou: 'Chiyou',
  fruit: 'Fruit', hack: 'Hack', idk: 'Unknown', miniboss: 'Miniboss', poison: 'Poison',
  shanhai: 'Shanhai', yi: 'Yi', cpu: 'CPU', collectible: 'Collectible', data: 'Data',
  herb: 'Herb', vial: 'Vial', robot: 'Robot', jade: 'Jade', keyitem: 'KeyItem',
  artifact: 'Artifact', darksteel: 'DarkSteel',
}));
const translatedCategories = new Set(categories.values());

/** Only known category names may be passed to the message lookup; unknown names stay plain text. */
export function getCategoryTranslationKey(type: string): string | undefined {
  return translatedCategories.has(type) ? type : undefined;
}

/** A public marker payload could not be interpreted safely. */
export class InvalidMarkers extends Error {
  readonly _tag = 'InvalidMarkers' as const;
  constructor() { super('The map data could not be read.'); }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** Parse marker JSON, merge differently cased categories and fill missing translations. */
export function parseMarkers(input: unknown):
  | { readonly _tag: 'ok'; readonly value: ReadonlyArray<MapMarker> }
  | { readonly _tag: 'err'; readonly error: InvalidMarkers } {
  if (!Array.isArray(input)) return { _tag: 'err', error: new InvalidMarkers() };
  const markers: MapMarker[] = [];
  const ids = new Set<string>();
  for (const row of input) {
    if (!isRecord(row) || typeof row.id !== 'string' || !row.id.trim() || ids.has(row.id) ||
      typeof row.x !== 'number' || !Number.isFinite(row.x) ||
      typeof row.y !== 'number' || !Number.isFinite(row.y) ||
      typeof row.type !== 'string' || !row.type.trim() ||
      typeof row.description !== 'string' ||
      (row.traditional !== null && typeof row.traditional !== 'string') ||
      (row.simplified !== null && typeof row.simplified !== 'string')) {
      return { _tag: 'err', error: new InvalidMarkers() };
    }
    ids.add(row.id);
    const type = row.type.trim();
    markers.push({ id: row.id, x: row.x, y: row.y, type: categories.get(type.toLowerCase()) ?? type,
      description: row.description, traditional: row.traditional || row.description,
      simplified: row.simplified || row.description });
  }
  return { _tag: 'ok', value: markers };
}
