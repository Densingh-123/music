const url = "https://api.codetabs.com/v1/proxy/?quest=" + encodeURIComponent("https://www.jiosaavn.com/api.php?p=1&q=leo&_format=json&_marker=0&ctx=wap6dot0&n=20&__call=search.getResults");

fetch(url)
  .then(r => r.text())
  .then(d => {
    try {
      const json = JSON.parse(d);
      console.log("SUCCESS. Keys:", Object.keys(json));
      if (json.results) console.log("First Result:", json.results[0]?.title);
    } catch(e) {
      console.log("PARSE ERROR", d.substring(0, 100));
    }
  })
  .catch(e => console.error("FETCH ERROR", e));
