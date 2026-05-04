import { useState } from "react";
import type { TraktMovies } from "../types/trakt";
import { useLocation } from "react-router-dom";
import "primeicons/primeicons.css";
import PopUp from "./PopUp.tsx";
import MovieCard from "./MovieCard.tsx";
import { Button } from "primereact/button";
import TopMovieCard from "./TopMovieCard.tsx";

interface ListProps {
  onAddToWatchlist: (movie: TraktMovies) => void;
  movies: TraktMovies[];
  watchlist: TraktMovies[];
  topTenMovies: TraktMovies[];
  setOpenFilters: (open: boolean) => void;
  goHome: () => void;
  isListView: boolean;
}

function ListView({
  onAddToWatchlist,
  goHome,
  movies,
  topTenMovies,
  watchlist,
  setOpenFilters,
}: ListProps) {
  const [openModel, setOpenModel] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<TraktMovies | null>(null);

  const location = useLocation();
  const source = location.state?.source;

  const isTop10 = source === "top10";
  const heading = isTop10 ? "Top 10 Movies" : "Trending Movies";
  const displayMovies = isTop10 ? topTenMovies : movies;

  const handleShowInfo = (movie: TraktMovies) => {
    setSelectedMovie(movie);
    setOpenModel(true);
  };
  return (
    <div>
      <div className="flex flex-col max-w-[87vw] gap-4 w-full px-4">
        <div className="flex flex-row justify-between w-full mt-5 px-4">
          <Button
            icon="pi pi-arrow-left"
            label="Back"
            unstyled
            pt={{
              root: {
                className:
                  "flex items-center gap-2 cursor-pointer dark:text-white",
              },
              icon: { className: "text-black dark:text-white" },
            }}
            onClick={goHome}
          />
          <Button
            label="Filter"
            icon="pi pi-filter"
            onClick={() => setOpenFilters(true)}
            unstyled
            className="border:black dark:border-white hover:black dark:hover:border-white-500 "
          />
        </div>

        <div className="flex items-center gap-3 px-4">
          <div className="w-1.5 h-8 bg-yellow-500 rounded-sm"></div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {heading}
          </h2>
        </div>

        {displayMovies.length === 0 ? (
          <p className="text-center text-zinc-400 mt-12">
            No movies match the current filters.
          </p>
        ) : (
          <ul className={"flex flex-col gap-4 w-full px-4"}>
            {displayMovies.map((item, index) => {
              if (!item?.movie?.ids?.trakt) {
                return null;
              }

              const isAdded =
                watchlist?.some(
                  (w) => w.movie?.ids?.trakt === item.movie.ids.trakt,
                ) ?? false;

              return isTop10 ? (
                <TopMovieCard
                  key={item.movie.ids.trakt}
                  item={item}
                  index={index}
                  handleShowInfo={handleShowInfo}
                  onAddToWatchlist={onAddToWatchlist}
                  isListView={true}
                  isAdded={isAdded}
                />
              ) : (
                <MovieCard
                  key={item.movie.ids.trakt}
                  item={item}
                  handleShowInfo={handleShowInfo}
                  onAddToWatchlist={onAddToWatchlist}
                  isListView={true}
                  isAdded={isAdded}
                  tooltip={null}
                />
              );
            })}
          </ul>
        )}
      </div>
      <PopUp
        visible={openModel}
        setVisible={setOpenModel}
        movie={selectedMovie}
      />
    </div>
  );
}
export default ListView;
