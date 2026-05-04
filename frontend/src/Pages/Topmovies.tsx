import { useState } from "react";
import type { TraktMovies } from "../types/trakt";
import "primeicons/primeicons.css";
import { useNavigate } from "react-router-dom";
import TopMovieCard from "./TopMovieCard";
import RemainingTopMovieCards from "./RemainingTopMovieCards.tsx";
import PopUp from "./PopUp.tsx";
import { ChevronRightIcon } from "@heroicons/react/24/outline";

interface TopMoviesProps {
  onAddToWatchlist: (movie: TraktMovies) => void;
  watchlist: TraktMovies[];
  setIsListView: React.Dispatch<React.SetStateAction<boolean>>;
  topTenMovies: TraktMovies[];
  movies: TraktMovies[];
}

function TopMovies({
  onAddToWatchlist,
  watchlist,
  setIsListView,
  topTenMovies,
}: TopMoviesProps) {
  const [openModel, setOpenModel] = useState<boolean>(false);
  const [selectedMovie, setSelectedMovie] = useState<TraktMovies | null>(null);
  const navigate = useNavigate();

  const handleShowInfo = (movie: TraktMovies) => {
    setTimeout(() => {
      setSelectedMovie(movie);
      setOpenModel(true);
    }, 0);
  };

  return (
    <div>
      <div
        className="flex items-center group cursor-pointer gap-5 w-fit mb-6 ml-2"
        onClick={() => {
          setIsListView(true);
          navigate("/ListView", { state: { source: "top10" } });
        }}
      >
        <div className="w-1.5 h-8 bg-yellow-500 rounded-sm mr-3"></div>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
          Top 10 Movies
          <ChevronRightIcon className="w-7 h-7 ml-2 text-gray-400 group-hover:text-yellow-500 transition-colors" />
        </h3>
      </div>

      <div className="grid grid-rows-2 ">
        {/* Row 1: 3 cards - larger */}
        <div className="grid grid-cols-3 gap-2">
          {topTenMovies.slice(0, 3).map((m, index) => {
            const isAdded =
              watchlist?.some(
                (w) => w.movie?.ids?.trakt === m.movie.ids.trakt,
              ) || false;

            return (
              <TopMovieCard
                item={m}
                handleShowInfo={handleShowInfo}
                onAddToWatchlist={onAddToWatchlist}
                isListView={false}
                isAdded={isAdded}
                tooltip={null}
                index={index}
              />
            );
          })}
        </div>

        {/* Row 2: 7 cards - smaller */}
        <div className="grid grid-cols-7 gap-4 -mt-10">
          {topTenMovies.slice(3).map((m, index) => {
            const isAdded =
              watchlist?.some(
                (w) => w.movie?.ids?.trakt === m.movie.ids.trakt,
              ) || false;

            return (
              <RemainingTopMovieCards
                key={m.movie.ids.trakt}
                item={m}
                handleShowInfo={handleShowInfo}
                onAddToWatchlist={onAddToWatchlist}
                isListView={false}
                isAdded={isAdded}
                tooltip={null}
                index={index + 3}
              />
            );
          })}
        </div>
      </div>
      <PopUp
        visible={openModel}
        setVisible={setOpenModel}
        movie={selectedMovie}
      />
    </div>
  );
}

export default TopMovies;
