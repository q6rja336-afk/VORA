const TMDB_API_KEY = '34f74e9466af837e2f089959bc036df5';
const BASE_URL = 'https://api.themoviedb.org/3';

export async function fetchTMDBMetadata(imdbId: string) {
  try {
    // 1. Find the TMDB ID using the IMDb ID
    const findRes = await fetch(`${BASE_URL}/find/${imdbId}?api_key=${TMDB_API_KEY}&external_source=imdb_id`);
    const findData = await findRes.json();

    const movie = findData.movie_results?.[0];
    const tv = findData.tv_results?.[0];

    if (!movie && !tv) return null;

    const isTV = !!tv;
    const tmdbId = isTV ? tv.id : movie.id;
    const type = isTV ? 'tv' : 'movie';

    // 2. Get full details
    const detailsRes = await fetch(`${BASE_URL}/${type}/${tmdbId}?api_key=${TMDB_API_KEY}&language=ar-SA&append_to_response=credits`);
    let details = await detailsRes.json();

    // Fallback to English if Arabic is empty
    if (!details.overview) {
       const enRes = await fetch(`${BASE_URL}/${type}/${tmdbId}?api_key=${TMDB_API_KEY}&language=en-US`);
       const enDetails = await enRes.json();
       details.overview = enDetails.overview;
    }

    // 3. If it's a TV show, fetch all seasons/episodes
    let seasonsData = [];
    if (isTV) {
      for (let i = 1; i <= details.number_of_seasons; i++) {
        const seasonRes = await fetch(`${BASE_URL}/tv/${tmdbId}/season/${i}?api_key=${TMDB_API_KEY}&language=en-US`);
        const season = await seasonRes.json();
        if (season.episodes) {
          seasonsData.push({
            seasonNumber: i,
            episodes: season.episodes.map((ep: any) => ""), // Initialize with empty strings for our player
            episodeCount: season.episodes.length
          });
        }
      }
    }

    return {
      titleAr: details.name || details.title,
      description: details.overview,
      year: new Date(details.first_air_date || details.release_date).getFullYear(),
      score: Math.round(details.vote_average * 10) / 10,
      backdropUrl: `https://image.tmdb.org/t/p/original${details.backdrop_path}`,
      posterUrl: `https://image.tmdb.org/t/p/w500${details.poster_path}`,
      seasonsData: seasonsData,
      type: isTV ? 'series' : 'movie'
    };

  } catch (error) {
    console.error("TMDB Fetch Error:", error);
    return null;
  }
}
