const CORS_PROXY = 'https://api.codetabs.com/v1/proxy/?quest=';

const getFullStreamUrl = async (title, artist) => {
  try {
    const query = encodeURIComponent(`${title} ${artist}`);
    let url = `https://pipedapi.kavin.rocks/search?q=${query}&filter=music_songs`;
    url = `${CORS_PROXY}${encodeURIComponent(url)}`;
    
    console.log("Fetching: " + url);
    const searchRes = await fetch(url);
    if (!searchRes.ok) return null;
    
    let searchData = await searchRes.json();
    console.log("Piped Search Keys: ", Object.keys(searchData));
    
    const topResult = searchData.items?.[0];
    if (!topResult?.url) return null;
    
    const videoId = topResult.url.split('v=')[1] || topResult.url.split('/').pop();
    if (!videoId) return null;
    
    console.log("Resolved Video ID:", videoId);
    
    // Now fetch streams
    let streamUrl = `https://pipedapi.kavin.rocks/streams/${videoId}`;
    streamUrl = `${CORS_PROXY}${encodeURIComponent(streamUrl)}`;
    
    const sRes = await fetch(streamUrl);
    if (!sRes.ok) return null;
    
    const sData = await sRes.json();
    const audioStreams = sData.audioStreams || [];
    const bestAudio = audioStreams.find(s =>
      s.mimeType && (s.mimeType.includes('mp4') || s.mimeType.includes('m4a'))
    ) || audioStreams[0];

    console.log("Resolved Best Audio URL:", bestAudio?.url?.substring(0, 50));
    return bestAudio?.url || null;
  } catch (error) {
    console.error('Piped resolution failed:', error);
    return null;
  }
};

getFullStreamUrl("Naa Ready", "Thalapathy Vijay").then(() => console.log("Done"));
