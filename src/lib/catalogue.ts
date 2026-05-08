// Mock catalogue — replace with Supabase fetch in production

export interface ContentItem {
  id: string;
  title: string;
  titleAr?: string;
  description: string;
  descriptionAr?: string;
  genre: string[];
  year: number;
  rating: string;
  duration: string;         // e.g. "2h 14m"
  score: number;            // 0-10
  backdropUrl: string;
  posterUrl: string;
  trailerUrl?: string;
  videoUrl: string;
  isFeatured?: boolean;
  isNew?: boolean;
  isTrending?: boolean;
  type: 'movie' | 'series';
  language?: string;
  seasons?: number;
  episodes?: number;
  episodesData?: {
    season: number;
    episodes: {
      id: string;
      number: number;
      title: string;
      titleAr?: string;
      duration: string;
      descriptionAr?: string;
      thumbnailUrl: string;
    }[];
  }[];
}

export const CATALOGUE: ContentItem[] = [];

export const FEATURED = null;
export const TRENDING  = [];
export const NEW_ARRIVALS = [];
