declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

export default function LoadYouTubeIframeAPI(): Promise<any> {
  if (window.YT?.Player) return Promise.resolve(window.YT);

  return new Promise((resolve, reject) => {
    const existing = document.querySelector('script[data-yt-iframe-api="true"]');
    if (!existing) {
      const script = document.createElement("script");
      script.src = "https://www.youtube.com/iframe_api";
      script.async = true;
      script.dataset.ytIframeApi = "true";
      script.onerror = () => reject(new Error("Failed to load Youtube IFrame API"));
      document.body.appendChild(script);
    }

    window.onYouTubeIframeAPIReady = () => resolve(window.YT);
    setTimeout(() => {
      if (!window.YT?.Player) reject(new Error("Timed out waiting for Youtube IFrame API"))
    }, 1000);
  });
}
