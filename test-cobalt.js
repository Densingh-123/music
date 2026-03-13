const getStreamUrl = async (videoId) => {
  try {
    let url = `https://api.cobalt.tools/api/json`;
    const payload = { url: `https://www.youtube.com/watch?v=${videoId}`, isAudioOnly: true, aFormat: "mp3" };
    
    console.log("Fetching Cobalt");
    const res = await fetch(url, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'User-Agent': 'Mozilla/5.0'
        },
        body: JSON.stringify(payload)
    });

    if (!res.ok) {
       console.log("Cobalt failed", await res.text());
       return null;
    }

    const data = await res.json();
    console.log("Cobalt Response", data);
    return data?.url || null;
  } catch (e) {
    console.error("Failed", e);
    return null;
  }
};

getStreamUrl("1G4isv_Fylg").then(() => console.log("Done"));
