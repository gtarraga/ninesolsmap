import { divIcon } from 'leaflet';

const sizes: Readonly<Record<string, readonly [number, number]>> = {
  root:[30,30], bigchest:[30,30], boss:[40,40], chest:[22,18], chiyou:[32,32],
  fruit:[30,30], hack:[30,30], idk:[30,30], miniboss:[30,30], poison:[30,30],
  shanhai:[30,30], yi:[30,30], cpu:[30,30], collectible:[25,25], data:[25,25],
  herb:[30,30], vial:[30,30], robot:[30,30], jade:[30,30], keyitem:[25,25],
  artifact:[25,25], darksteel:[30,30],
};

function makeIcon(key:string,[width,height]:readonly [number,number]) {
  // Only lookup-table keys reach HTML; database strings cannot inject markup.
  return divIcon({className:'map-marker',iconSize:[44,44],iconAnchor:[22,22],popupAnchor:[0,-20],
    html:`<span class="marker-art marker-art-${key}" style="transform:scale(${width/40},${height/40})"></span>`,
  });
}
const fallback = makeIcon('idk',[30,30]);
const icons = new Map(Object.entries(sizes).map(([key,size])=>[key,makeIcon(key,size)]));

/** Return stable 44px marker targets with the existing artwork sizes and shared sprite. */
export function getIcon(type:string) { return icons.get(type.toLowerCase()) ?? fallback; }

/** Return a sprite class for a filter thumbnail, with a visible unknown fallback. */
export function getIconClass(type:string):string {
  const key = type.toLowerCase();
  return `marker-art marker-art-${icons.has(key) ? key : 'idk'}`;
}
