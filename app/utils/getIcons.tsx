
import { Icon } from "leaflet";
type IconKeys = keyof typeof Icons;

export const Icons = {
  root: new Icon({
    iconUrl: "/icons/root.png",
    iconSize: [30, 30]
  }),
  bigchest: new Icon({
    iconUrl: "/icons/bigchest.png",
    iconSize: [30, 30]
  }),
  boss: new Icon({
    iconUrl: "/icons/boss.png",
    iconSize: [40, 40]
  }),
  chest: new Icon({
    iconUrl: "/icons/chest.png",
    iconSize: [22, 18]
  }),
  chiyou: new Icon({
    iconUrl: "/icons/chiyou.png",
    iconSize: [32, 32]
  }),
  fruit: new Icon({
    iconUrl: "/icons/fruit.png",
    iconSize: [30, 30]
  }),
  hack: new Icon({
    iconUrl: "/icons/hack.png",
    iconSize: [30, 30]
  }),
  idk: new Icon({
    iconUrl: "/icons/idk.png",
    iconSize: [30, 30]
  }),
  miniboss: new Icon({
    iconUrl: "/icons/miniboss.png",
    iconSize: [30, 30]
  }),
  poison: new Icon({
    iconUrl: "/icons/poison.png",
    iconSize: [30, 30]
  }),
  shanhai: new Icon({
    iconUrl: "/icons/shanhai.png",
    iconSize: [30, 30]
  }),
  yi: new Icon({
    iconUrl: "/icons/yi.png",
    iconSize: [30, 30]
  }),
  cpu: new Icon({
    iconUrl: "/icons/cpu.png",
    iconSize: [30, 30]
  }),
  collectible: new Icon({
    iconUrl: "/icons/collectible.png",
    iconSize: [25, 25]
  }),
  data: new Icon({
    iconUrl: "/icons/data.png",
    iconSize: [25, 25]
  }),
  herb: new Icon({
    iconUrl: "/icons/herb.png",
    iconSize: [30, 30]
  }),
  vial: new Icon({
    iconUrl: "/icons/vial.png",
    iconSize: [30, 30]
  }),
  robot: new Icon({
    iconUrl: "/icons/robot.png",
    iconSize: [30, 30]
  }),
  jade: new Icon({
    iconUrl: "/icons/jade.png",
    iconSize: [30, 30]
  }),
  keyitem: new Icon({
    iconUrl: "/icons/keyitem.png",
    iconSize: [25, 25]
  }),
  artifact: new Icon({
    iconUrl: "/icons/artifact.png",
    iconSize: [25, 25]
  }),
  darksteel: new Icon({
    iconUrl: "/icons/darksteel.png",
    iconSize: [30, 30]
  })
};

export const getIcon = (type: string): typeof Icons[IconKeys] | undefined => {
  const iconKey = type.toLowerCase() as IconKeys;
  // Logging for db error
  if (Icons[iconKey]) return Icons[iconKey];
  else console.log(type);
};