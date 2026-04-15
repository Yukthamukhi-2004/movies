import { useState, useEffect } from "react";
import type { TraktMovies } from "../types/trakt";
import "primereact/resources/themes/lara-light-cyan/theme.css";
import "primeicons/primeicons.css";
import PopUp from "./PopUp.tsx";
import MovieCard from "./MovieCard.tsx";

interface TrendingProps {
  onAddToWatchlist: (movie: TraktMovies) => void;
  movies: TraktMovies[];
  setMovies: React.Dispatch<React.SetStateAction<TraktMovies[]>>;
  watchlist: TraktMovies[];
  isListView: boolean;
}

function TrendingMovies({
  movies,
  setMovies,
  onAddToWatchlist,
  watchlist,
  isListView,
}: TrendingProps) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showAll, setShowAll] = useState<boolean>(false);
  const [openModel, setOpenModel] = useState<boolean>(false);
  const [selectedMovie, setSelectedMovie] = useState<TraktMovies | null>(null);
  const [error, setError] = useState<string | null>(null);

  const displayedMovies = showAll ? movies : movies.slice(0, 21);

  const handleShowInfo = (movie: TraktMovies) => {
    setTimeout(() => {
      setSelectedMovie(movie);
      setOpenModel(true);
    }, 0);
  };

  useEffect(() => {
    async function fetchMovies(): Promise<void> {
      setIsLoading(true);
      setError(null);

      try {
        const res = await fetch(
          "https://api.trakt.tv/movies/trending?extended=full",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "trakt-api-version": "2",
              "trakt-api-key":
                "d18ef90d359e1b16311df076556165adf10f332dbf2301436a7fd23a7b4de19b",
            },
          },
        );

        if (!res.ok) {
          if (res.status === 429) {
            console.error("Rate limited! Wait a minute before refreshing.");
          }
          const errorText = await res.text();
          throw new Error(`API error ${res.status}: ${errorText}`);
        }

        const data: unknown = await res.json();
        const validData = (Array.isArray(data) ? data : []).filter(
          (item): item is TraktMovies => Boolean(item?.movie?.ids?.trakt),
        );

        setMovies(validData);
      } catch (err) {
        console.error("Fetch Error:", err);
        setError(err instanceof Error ? err.message : "Failed to load movies.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchMovies();
  }, [setMovies]);
  return (
    <div className="min-h-screen bg-white dark:bg-black! p-2 md:p-4 overflow-y-auto">
      {isLoading && (
        <p className="text-black dark:text-white!">Loading movies...</p>
      )}
      {error && <p className="text-red-600 dark:text-red-400!">{error}</p>}
      {!isLoading && !error && displayedMovies.length === 0 && (
        <p className="text-black dark:text-white!">
          {movies.length === 0
            ? "Movies are loading from the API, but nothing valid was available to render yet."
            : "No movies match the current filters."}
        </p>
      )}
      <ul
        className={
          isListView
            ? "flex flex-col gap-4"
            : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        }
      >
        {displayedMovies?.map((item) => {
          if (!item?.movie?.ids?.trakt) {
            return null;
          }

          const isAdded =
            watchlist?.some(
              (w) => w.movie?.ids?.trakt === item.movie.ids.trakt,
            ) || false;

          return (
            <MovieCard
              key={item.movie.ids.trakt}
              item={item}
              isListView={isListView}
              handleShowInfo={handleShowInfo}
              onAddToWatchlist={onAddToWatchlist}
              isAdded={isAdded}
              tooltip={null}
            />
          );
        })}
      </ul>

      {(movies.length || 0) > 21 && (
        <div className="flex justify-center mt-10 mb-10">
          <button
            onClick={() => setShowAll(!showAll)}
            className="w-4/5 h-12 rounded-2xl bg-white text-zinc-900 border border-zinc-400 dark:bg-black!   dark:text-white! dark:border-zinc-700! flex items-center justify-center gap-2 transition-all duration-300"
          >
            {showAll ? "See Less" : "See All"}
            <i
              className={showAll ? "pi pi-chevron-up" : "pi pi-chevron-down"}
            ></i>
          </button>
        </div>
      )}

      <PopUp
        visible={openModel}
        setVisible={setOpenModel}
        movie={selectedMovie}
      />
    </div>
  );
}

export default TrendingMovies;
