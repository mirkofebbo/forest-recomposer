import type { Video, Fragment } from "./library";

export const videos: Video[] = [
  { youtubeId: "VIDEO_ID_1", title: "Forest Walk" },
  { youtubeId: "VIDEO_ID_2", title: "Rewilding Project Update" },
];

export const fragments: Fragment[] = [
  {
    id: "f1",
    youtubeId: "VIDEO_ID_1",
    start: 12,
    end: 22,
    emotionalTone: "calm",
    timeOfDay: "day",
    speciesVisibility: 0.2,
    restorationDiscourse: ["unclear"],
  },
  {
    id: "f2",
    youtubeId: "VIDEO_ID_2",
    start: 85,
    end: 100,
    emotionalTone: "awe",
    timeOfDay: "dusk",
    speciesVisibility: 0.6,
    restorationDiscourse: ["rewilding", "biodiversity"],
  },
];
