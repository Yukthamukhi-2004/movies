import type { TraktMovies } from "../types/trakt";
import { Tooltip } from "primereact/tooltip";
import "../styles/MovieCard.css";

interface MovieCardProps {
  item: TraktMovies;
  onAddToWatchlist: (movie: TraktMovies) => void;
  isListView: boolean;
  handleShowInfo: (movie: TraktMovies) => void;
  isAdded: boolean;
  tooltip: null;
}

const MovieCard = ({
  item,
  isListView,
  onAddToWatchlist,
  handleShowInfo,
  isAdded,
}: MovieCardProps) => {
  const handleInternalClick = () => {
    if (!isAdded) {
      onAddToWatchlist(item);
    }
  };

  const posterPath =
    item.movie.images?.poster?.[0] || item.movie.images?.thumb?.[0];
  const posterUrl = posterPath ? `https://${posterPath}` : "";
  const releaseDate = item.movie.released || "";
  const formattedReleaseDate = releaseDate
    ? releaseDate.split("-").reverse().join("-")
    : "Unknown";
  const overview = item.movie.overview || item.movie.overview || "No overview";

  return (
    <div className="p-6 ">
        <Tooltip
          target=".movie-title-tooltip"
          mouseTrack
          mouseTrackTop={15}
          position="top"
          showDelay={0}
          hideDelay={100}
        />
        <div 
             onClick={() => handleShowInfo(item)
            }>
<div 
          className={`w-full rounded-xl flex   hover:scale-102 transition-transform cursor-pointer   justify-center items-center align-middle justify-items-center bg-gray-100  ${isListView ?   "flex-row gap-6":" flex-col h-[60vh]"} "} `}

>           
              <img
                src={posterUrl}
                alt={item.movie.title}
                className={`object-cover   ${isListView ?  "h-[50vh] " : "w-full"}`}            
              />
              </div>
          <div
            className={
              isListView
                ? "flex flex-col justify-items-start py-4 gap-6 mt-2"
                : " flex flex-col text-center items-center gap-1.5 my-8 "
            }
          >
            <span className="text-md text-gray-700 dark:text-gray-300! ">
              Released on: {formattedReleaseDate}
            </span>

            <div className="w-full overflow-hidden">
              <strong
                className="movie-title-tooltip text-xl md:text-2xl text-black dark:text-white! font-bold cursor-pointer hover:underline truncate"
                data-pr-tooltip={item.movie.title}
                onClick={() => handleShowInfo(item)}
              >
                {item.movie.title || "Untitled"}
              </strong>
            </div>

            <div className="text-lg text-gray-500 dark:text-white! flex items-center gap-4">
              <span>{item.movie.year || "N/A"}</span>
              <span>
                | ⭐ {item.movie.rating ? item.movie.rating.toFixed(1) : "N/A"}
              </span>
              <span>
                | {item.movie.runtime || item.movie.runtime || 0} mins
              </span>
            </div>

            <div className="flex-grow:1">
              {isListView && (
                <p className=" text-gray-600 dark:text-zinc-300! text-md line-clamp-4 leading-relaxed">
                  {overview}
                </p>
              )}
            </div>

            <div className="flex flex-row justify-between items-center w-full !p-5">
              <button
                onClick={() => handleShowInfo(item)}
                className="flex items-center justify-center p-2 rounded-lg border-2 border-transparent text-black dark:!text-white hover:border-white dark:!hover:border-black transition-all"
              >
                <span className="font-bold tracking-wide">View Details</span>
              </button>

              <button
                onClick={handleInternalClick}
                className="flex items-center justify-center p-2 rounded-lg border-2 border-transparent text-black dark:!text-white hover:border-white dark:!hover:border-black transition-all"
              >
                <span className="font-bold tracking-wide">
                  {isAdded ? "Added to Watchlist" : "Add to Watchlist"}
                </span>
              </button>
            </div>
          </div>
          </div>
    </div>
  );
};

export default MovieCard;
                
