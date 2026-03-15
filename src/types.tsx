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
  clips: Array<Clip>;
};

export type Clip = {
  id: string;
  start: number;       
  end: number | null;  
  tags?: string[];
  note?: string;
};

export type RecomposeItem = {
  videoId: string;
  clipId: string;
  title: string;
  channelTitle: string;
  publishedAt: string;
  thumbnailUrl: string;
  start: number;
  end: number | null;
  tags?: string[];
  note?: string;
};
export type Manifest = {
  to_edit: Array<VideoItem>;
  in_progress: Array<VideoItem>;
  completed: Array<VideoItem>;
  recompose?: Array<RecomposeItem>;
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

