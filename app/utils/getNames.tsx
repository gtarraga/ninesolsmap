const markerNames = {
  "Root": "Root Nodes",
  "Chest": "Chests",
  "Collectible": "Collectibles",
  "Shanhai": "Shanhai 9000",
  "Chiyou": "Chiyou Locations",
  "Poison": "Poisons",
  "KeyItem": "Key Items",
  "Miniboss": "Minibosses",
  "Fruit": "Tao Fruits",
  "Artifact": "Artifacts",
  "CPU": "Computing Units",
  "Jade": "Jades",
  "Boss": "Bosses",
  "Robot": "Parry Robots",
  "Herb": "Herb Catalysts",
  "Data": "Data Spots",
  "DarkSteel": "Dark Steel",
  "Vial": "Pipe Vials",
  "Hack": "Hack Points",
};

export const getName = (type: string): string => {
  return markerNames[type as keyof typeof markerNames];
};