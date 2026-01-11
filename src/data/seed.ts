import type { Video, Fragment } from "./library";

export const videos: Video[] = [
  {
    youtubeId: "HUpNlVUTzi0",
    title: "Walking series: Vosges France - Taennchels Mystical Forest 1",
    url: "https://www.youtube.com/watch?v=HUpNlVUTzi0",
  },
  {
    youtubeId: "KNPZPWqplUs",
    title: "", // not fetched
    url: "https://www.youtube.com/watch?v=KNPZPWqplUs",
  },
  {
    youtubeId: "muWCp80bQBs",
    title: "LIVE: Wildfire rages in Spain's Castile, Leon region",
    url: "https://www.youtube.com/watch?v=muWCp80bQBs",
  },
  {
    youtubeId: "_ODOP2Po0t0",
    title: "Life in the Coppice",
    url: "https://www.youtube.com/watch?v=_ODOP2Po0t0",
  },
  {
    youtubeId: "R9vVKaen-ZE",
    title: "Forest Soul | Tara Mountain | Serbia 2020.",
    url: "https://www.youtube.com/watch?v=R9vVKaen-ZE",
  },
  {
    youtubeId: "AF-JkHL2d2U",
    title: "", // not fetched
    url: "https://www.youtube.com/watch?v=AF-JkHL2d2U",
  },
  {
    youtubeId: "IK8EDXB5jVc",
    title: "Romania in 4K - Incredible Scenes & Hidden Gems",
    url: "https://www.youtube.com/watch?v=IK8EDXB5jVc",
  },
];

/**
 * NOTE: Placeholder timecodes.
 * Replace these with real fragments after you build a quick tagger UI.
 */
export const fragments: Fragment[] = [
  // ── HUpNlVUTzi0 (forest walk)
  {
    id: "vosges_1",
    youtubeId: "HUpNlVUTzi0",
    start: 20,
    end: 32,
    timeOfDay: "day",
    emotionalTone: "calm",
    speciesVisibility: 0.2,
    restorationDiscourse: ["unclear"],
    tags: ["walking", "forest", "gaze:stroll"],
  },
  {
    id: "vosges_2",
    youtubeId: "HUpNlVUTzi0",
    start: 85,
    end: 98,
    timeOfDay: "day",
    emotionalTone: "awe",
    speciesVisibility: 0.3,
    restorationDiscourse: ["unclear"],
    tags: ["wide-shot", "mystical", "gaze:landscape"],
  },

  // ── KNPZPWqplUs (unknown – still good for testing)
  {
    id: "knpz_1",
    youtubeId: "KNPZPWqplUs",
    start: 15,
    end: 27,
    timeOfDay: "unclear",
    emotionalTone: "unclear",
    speciesVisibility: 0.1,
    restorationDiscourse: ["unclear"],
    tags: ["unknown-source", "needs-tagging"],
  },
  {
    id: "knpz_2",
    youtubeId: "KNPZPWqplUs",
    start: 120,
    end: 134,
    timeOfDay: "unclear",
    emotionalTone: "unclear",
    speciesVisibility: 0.1,
    restorationDiscourse: ["unclear"],
    tags: ["unknown-source", "needs-tagging"],
  },

  // ── muWCp80bQBs (wildfire)
  {
    id: "wildfire_1",
    youtubeId: "muWCp80bQBs",
    start: 30,
    end: 45,
    timeOfDay: "day",
    emotionalTone: "tense",
    speciesVisibility: 0.0,
    colonialTraces: ["extraction"], // placeholder interpretive axis
    restorationDiscourse: ["controversy"],
    tags: ["fire", "crisis", "more-than-human:air"],
  },
  {
    id: "wildfire_2",
    youtubeId: "muWCp80bQBs",
    start: 90,
    end: 105,
    timeOfDay: "day",
    emotionalTone: "tense",
    speciesVisibility: 0.0,
    restorationDiscourse: ["controversy"],
    tags: ["smoke", "visibility", "media:live"],
  },

  // ── _ODOP2Po0t0 (coppice / management discourse likely)
  {
    id: "coppice_1",
    youtubeId: "_ODOP2Po0t0",
    start: 40,
    end: 55,
    timeOfDay: "day",
    emotionalTone: "calm",
    speciesVisibility: 0.2,
    restorationDiscourse: ["community"],
    tags: ["woodland-management", "stewardship", "practice"],
  },
  {
    id: "coppice_2",
    youtubeId: "_ODOP2Po0t0",
    start: 140,
    end: 155,
    timeOfDay: "day",
    emotionalTone: "calm",
    speciesVisibility: 0.3,
    restorationDiscourse: ["biodiversity"],
    tags: ["hands", "tools", "care-labour"],
  },

  // ── R9vVKaen-ZE (moody fog forest)
  {
    id: "tara_1",
    youtubeId: "R9vVKaen-ZE",
    start: 5,
    end: 18,
    timeOfDay: "unclear",
    emotionalTone: "awe",
    speciesVisibility: 0.1,
    restorationDiscourse: ["unclear"],
    tags: ["fog", "moody", "gaze:cinematic"],
  },
  {
    id: "tara_2",
    youtubeId: "R9vVKaen-ZE",
    start: 60,
    end: 74,
    timeOfDay: "unclear",
    emotionalTone: "calm",
    speciesVisibility: 0.1,
    restorationDiscourse: ["unclear"],
    tags: ["dark-forest", "slow", "texture"],
  },

  // ── AF-JkHL2d2U (unknown – still good for testing)
  {
    id: "afjk_1",
    youtubeId: "AF-JkHL2d2U",
    start: 25,
    end: 39,
    timeOfDay: "unclear",
    emotionalTone: "unclear",
    speciesVisibility: 0.1,
    restorationDiscourse: ["unclear"],
    tags: ["unknown-source", "needs-tagging"],
  },
  {
    id: "afjk_2",
    youtubeId: "AF-JkHL2d2U",
    start: 95,
    end: 110,
    timeOfDay: "unclear",
    emotionalTone: "unclear",
    speciesVisibility: 0.1,
    restorationDiscourse: ["unclear"],
    tags: ["unknown-source", "needs-tagging"],
  },

  // ── IK8EDXB5jVc (Romania travel — “forest adjacent” but useful contrast)
  {
    id: "romania_1",
    youtubeId: "IK8EDXB5jVc",
    start: 50,
    end: 65,
    timeOfDay: "day",
    emotionalTone: "awe",
    speciesVisibility: 0.1,
    colonialTraces: ["tourism"],
    restorationDiscourse: ["unclear"],
    tags: ["tourist-gaze", "landscape", "platform:aesthetic"],
  },
  {
    id: "romania_2",
    youtubeId: "IK8EDXB5jVc",
    start: 210,
    end: 224,
    timeOfDay: "day",
    emotionalTone: "calm",
    speciesVisibility: 0.1,
    colonialTraces: ["tourism"],
    restorationDiscourse: ["unclear"],
    tags: ["travel-montage", "place-branding"],
  },
];
