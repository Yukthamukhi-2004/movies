import { useState } from "react";
import type { TraktMovies } from "../types/trakt";
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
  setIsListView: React.Dispatch<React.SetStateAction<boolean>>;
}

function TrendingMovies({
  movies,
  onAddToWatchlist,
  watchlist,
  setIsListView,
}: TrendingProps) {
  const [isLoading] = useState<boolean>(false);
  const [openModel, setOpenModel] = useState<boolean>(false);
  const [selectedMovie, setSelectedMovie] = useState<TraktMovies | null>(null);
  const [error] = useState<string | null>(null);

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
            onClick={() => {
              setIsListView(true);
              navigate("/ListView", { state: { source: "trending" } });
            }}
          >
            <div className="w-1.5 h-8 bg-yellow-500 rounded-sm mr-3"></div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
              Trending Movies
              <ChevronRightIcon className="w-7 h-9 ml-2 text-gray-200 group-hover:text-yellow-500 transition-colors" />
            </h3>
          </div>

          {/* Movie Slider */}
          <div className="carousel-demo w-overflow-hidden no-scrollbar scroll-smooth ">
            <Carousel
              value={movies.slice(0, 20)}
              numVisible={5}
              numScroll={4}
              circular={false}
              responsiveOptions={responsiveOptions}
              pt={{
                root: { className: "max-h-[450px] relative " },
                content: { className: "overflow-hidden" },
                container: { className: "flex h-80%" },
                itemsContainer: { className: "flex flex-row" },
                item: { className: "h-full  " },
                previousButton: {
                  className:
                    "absolute left-0 top-1/2 translate-x-2 z-10 font-bold bg-black/50 border-1px rounded dark:border-1px rounded px-2 py-1.5 hover:bg-black/80 text-white rounded-full",
                },
                nextButton: {
                  className:
                    "absolute right-0 top-1/2 translate-x-2 z-10 font-bold bg-black/50 border-1px rounded dark:border-1px rounded px-2 py-1.5 hover:bg-black/80 text-white rounded-full",
                },
                indicators: { className: "hidden!" },
              }}
              itemTemplate={(item) => {
                const isAdded =
                  watchlist?.some(
                    (w) => w.movie?.ids?.trakt === item.movie.ids.trakt,
                  ) || false;

                return (
                  <div className="px-1.5 h-500px w-auto pb-2">
                    <MovieCard
                      item={item}
                      handleShowInfo={handleShowInfo}
                      onAddToWatchlist={onAddToWatchlist}
                      isAdded={isAdded}
                      isListView={false}
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
