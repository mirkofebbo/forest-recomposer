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

export type YouTubeSearchItem = {
  id: { videoId?: string };
  snippet: {
    title: string;
    channelTitle: string;
    publishedAt: string;
    thumbnails: { medium?: { url: string } };
  };
};