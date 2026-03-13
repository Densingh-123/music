const CORS_PROXY = 'https://api.codetabs.com/v1/proxy/?quest=';

const getFullStreamUrl = async (title, artist) => {
  try {
    const query = encodeURIComponent(`${title} ${artist} audio`);
    let url = `https://invidious.kavin.rocks/api/v1/search?q=${query}&type=video`;
    url = `${CORS_PROXY}${encodeURIComponent(url)}`;
    
    console.log("Fetching: " + url);
    const searchRes = await fetch(url);
    if (!searchRes.ok) return null;
    
    let searchData = await searchRes.json();
    console.log("Invidious Search array len: ", searchData?.length);
    
    const topResult = searchData?.[0] || searchData?.items?.[0];
    const videoId = topResult?.videoId;
    if (!videoId) return null;
    
    console.log("Resolved Video ID:", videoId);
    
    // Now fetch streams
    let streamUrl = `https://invidious.kavin.rocks/api/v1/videos/${videoId}`;
    streamUrl = `${CORS_PROXY}${encodeURIComponent(streamUrl)}`;
    
    const sRes = await fetch(streamUrl);
    if (!sRes.ok) return null;
    
    let sData = await sRes.json();
    console.log("Video Object Keys", Object.keys(sData));

    const audioStreams = sData.adaptiveFormats?.filter(f => 
      f.type?.includes('audio') && (f.type?.includes('mp4') || f.type?.includes('m4a'))
    ) || [];
    
    // Pick the highest bitrate audio if possible
    const bestAudio = audioStreams.sort((a, b) => (b.bitrate || 0) - (a.bitrate || 0))[0];

    console.log("Resolved Best Audio URL:", bestAudio?.url?.substring(0, 50));
    return bestAudio?.url || null;
  } catch (error) {
    console.error('Invidious resolution failed:', error);
    return null;
  }
};

getFullStreamUrl("Naa Ready", "Thalapathy Vijay").then(() => console.log("Done"));
