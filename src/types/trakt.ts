export interface TraktMovies {
  watchers: number;
  movie: {
    title: string;
    year: number;
    released?: string;
    overview?: string;
    runtime?: number;
    rating?: number;
    country?: string;
    trailer?: string;
    homepage?: string;
    status?: string;
    votes?: number;
    comment_count?: number;
    updated_at?: string;
    language?: string;
    available_translations?: string[];
    genres?: string[];
    ids: {
      trakt: number;
      slug?: string;
      imdb?: string;
      tmdb?: number;
    };
    images?: {
      fanart?: string[];
      poster?: string[];
      logo?: string[];
      thumb?: string[];
    };
  };
}
