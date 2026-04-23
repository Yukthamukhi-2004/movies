import { useState, useEffect } from "react";
import type { TraktMovies } from "../types/trakt";
import "primereact/resources/themes/lara-light-cyan/theme.css";
import "primeicons/primeicons.css";
import { Carousel } from "primereact/carousel";
import { useNavigate } from "react-router-dom";
import PopUp from "./PopUp.tsx";
import MovieCard from "./MovieCard.tsx";
import { ChevronRightIcon } from "@heroicons/react/24/outline";

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
}: TrendingProps) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [openModel, setOpenModel] = useState<boolean>(false);
  const [selectedMovie, setSelectedMovie] = useState<TraktMovies | null>(null);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  const handleShowInfo = (movie: TraktMovies) => {
    setTimeout(() => {
      setSelectedMovie(movie);
      setOpenModel(true);
    }, 0);
  };

  const responsiveOptions = [
    { breakpoint: "1400px", numVisible: 4, numScroll: 3 },
    { breakpoint: "1199px", numVisible: 3, numScroll: 3 },
    { breakpoint: "767px", numVisible: 2, numScroll: 3 },
    { breakpoint: "575px", numVisible: 1, numScroll: 3 },
  ];

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
    <div className="bg-white p-2 md:p-4 dark:bg-black transition-colors duration-300">
      {isLoading && (
        <p className="text-black dark:text-white p-4 text-center">
          Loading movies...
        </p>
      )}

      {error && (
        <p className="text-red-600 dark:text-red-400 p-4 text-center">
          {error}
        </p>
      )}

      {!isLoading && !error && (
        <>
          {/* Section Heading */}
          <div
            className="flex items-center group cursor-pointer gap-5 w-fit mb-6 ml-2"
            onClick={() => navigate("/ListView")}
          >
            <div className="w-1.5 h-8 bg-yellow-500 rounded-sm mr-3"></div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
              Trending Movies
              <ChevronRightIcon className="w-6 h-6 ml-2 text-gray-400 group-hover:text-yellow-500 transition-colors" />
            </h3>
          </div>

          {/* Movie Slider */}
          <div className="carousel-demo w-overflow-hidden ">
            <Carousel
              value={movies.slice(0, 12)}
              numVisible={4}
              numScroll={3}
              circular={false}
              responsiveOptions={responsiveOptions}
              pt={{
                root: { className: "max-h-[550px] relative " },
                content: { className: "overflow-hidden" },
                container: { className: "flex h-full" },
                itemsContainer: { className: "flex flex-row " },
                item: { className: "flex-shrink-0 w-full h-full " },
                previousButton: {
                  className:
                    "absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/80 text-white rounded-full",
                },
                nextButton: {
                  className:
                    "absolute right-0 top-1/2  -translate-y-1/2  z-10 bg-black/50 hover:bg-black/80 text-white rounded-full",
                },
                indicators: { className: "hidden!" },
              }}
              itemTemplate={(item) => {
                const isAdded =
                  watchlist?.some(
                    (w) => w.movie?.ids?.trakt === item.movie.ids.trakt,
                  ) || false;

                return (
                  <div className="px-1.5 h-[540px] w-auto pb-2">
                    <MovieCard
                      item={item}
                      handleShowInfo={handleShowInfo}
                      onAddToWatchlist={onAddToWatchlist}
                      isListView={false}
                      isAdded={isAdded}
                      tooltip={null}
                    />
                  </div>
                );
              }}
            />
          </div>
        </>
      )}

      {/* Shared Popup Instance */}
      <PopUp
        visible={openModel}
        setVisible={setOpenModel}
        movie={selectedMovie}
      />
    </div>
  );
}

export default TrendingMovies;
