import { useState } from "react";
import type { TraktMovies } from "../types/trakt";
import "primereact/resources/themes/lara-light-cyan/theme.css";
import "primeicons/primeicons.css";
import PopUp from "./PopUp.tsx";
import MovieCard from "./MovieCard.tsx";
import { Button } from "primereact/button";

interface ListProps {
  onAddToWatchlist: (movie: TraktMovies) => void;
  movies: TraktMovies[];
  watchlist: TraktMovies[];
  openFilters: boolean;
  setOpenFilters: boolean;
  goHome: void;
  isListVie: boolean;
  setIsListView: React.Dispatch<React.SetStateAction<boolean>>;
}

function ListView({
  onAddToWatchlist,
  goHome,
  movies,
  watchlist,
  setOpenFilters,
}: ListProps) {
  const [openModel, setOpenModel] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<TraktMovies | null>(null);

  const handleShowInfo = (movie: TraktMovies) => {
    setSelectedMovie(movie);
    setOpenModel(true);
  };
  return (
    <div>
      <div className="flex flex-col max-w-[87vw] gap-4 w-full px-4">
        <div className="flex flex-row justify-between w-full mt-2 !px-4">
          <span className="pi pi-arrow-left" onClick={goHome}>
            Back
          </span>
          <Button
            label="Filter"
            icon="pi pi-filter"
            onClick={() => setOpenFilters(true)}
            unstyled
            className="border:black dark:border-white! hover:black dark:hover:border-white-500! "
          />
        </div>
        <ul className={"flex flex-col gap-4 w-full px-4"}>
          {movies?.map((item) => {
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
                handleShowInfo={handleShowInfo}
                onAddToWatchlist={onAddToWatchlist}
                isListView={true}
                isAdded={isAdded}
                tooltip={null}
              />
            );
          })}
        </ul>
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
