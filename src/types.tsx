export type YouTubeSearchItem = {
  id: { videoId?: string };
  snippet: {
    title: string;
    channelTitle: string;
    publishedAt: string;
    thumbnails: { medium?: { url: string } };
  };
};

export type VideoItem = {
  videoId: string;
  title: string;
  channelTitle: string;
  publishedAt: string;
  thumbnailUrl: string;
  clips: Array<Timestamp>;
};

export type Timestamp = {
  id: string;
  start: number;
  end: number;
  tags: string[];
  note: string;
};

export type TagList = 
  | "GREEN"
  | "HUMAN"
  | "WATER"
  | "ANIMAL"
  | "SUNLIGHT"
  | "SOIL"
  | "OTHER";

export type ForestRestorationDemoSite =
  | "Aquitaine, France"
  | "Castile and León, Spain"
  | "Coppice Forests, Serbia"
  | "Croatian & Serbian Border River Floodplain"
  | "Făgăraș Mountains, Romania"
  | "Nordsjælland & Thy, Denmark"
  | "North Rhine-Westphalia, Germany"
  | "Po Valley, Italy"
  | "Queen Elizabeth Forest Park, Scotland"
  | "Southern Netherlands"
  | "Vindelälven-Juhttatahkka Biosphere Reserve, Sweden"
  | "Vysočina & North Moravia, Czech Republic";

