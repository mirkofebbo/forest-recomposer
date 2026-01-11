export type Video = {
  youtubeId: string;
  title?: string;
  channel?: string;
  url?: string;
  viewCount?: number;    
  publishedAt?: string;   
};

export type Fragment = {
  id: string;
  youtubeId: string;
  start: number; // seconds
  end: number;   // seconds
  // recomposition metadata
  tags?: string[];

  // interpretive axes:
  speciesVisibility?: number;  
  emotionalTone?: "calm" | "tense" | "awe" | "sad" | "angry" | "unclear";
  colonialTraces?: ("plantation" | "extraction" | "estate" | "military" | "tourism" | "indigenous-erasure")[];
  timeOfDay?: "dawn" | "day" | "dusk" | "night" | "unclear";
  restorationDiscourse?: ("rewilding" | "offsetting" | "carbon" | "biodiversity" | "community" | "controversy")[];

  // platform signals 
  algRankHint?: number; // if scraped rank position
};
