const TMDB_API_KEY = '34f74e9466af837e2f089959bc036df5';
const BASE_URL = 'https://api.themoviedb.org/3';

async function testFetch() {
  const imdbId = 'tt2149175'; // The Americans
  console.log(`Testing TMDB fetch for: ${imdbId}`);
  
  try {
    const findRes = await fetch(`${BASE_URL}/find/${imdbId}?api_key=${TMDB_API_KEY}&external_source=imdb_id`);
    const findData = await findRes.json();
    console.log("Find Results:", JSON.stringify(findData, null, 2));

    const tv = findData.tv_results?.[0];
    if (!tv) {
      console.log("No TV series found for this ID.");
      return;
    }

    const tmdbId = tv.id;
    const detailsRes = await fetch(`${BASE_URL}/tv/${tmdbId}?api_key=${TMDB_API_KEY}&language=en-US`);
    const details = await detailsRes.json();
    console.log("Seasons Count:", details.number_of_seasons);

    for (let i = 1; i <= details.number_of_seasons; i++) {
        const seasonRes = await fetch(`${BASE_URL}/tv/${tmdbId}/season/${i}?api_key=${TMDB_API_KEY}&language=en-US`);
        const season = await seasonRes.json();
        console.log(`Season ${i} episodes:`, season.episodes?.length || 0);
    }
  } catch (err) {
    console.error("Fetch failed:", err);
  }
}

testFetch();
