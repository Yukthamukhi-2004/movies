import { Tooltip } from "primereact/tooltip";
import { Button } from "primereact/button";
import type { TraktMovies } from "../types/trakt";

interface RemainingTopMovieCardsProps {
  item: TraktMovies;
  isListView: boolean;
  onAddToWatchlist: (movie: TraktMovies) => void;
  isAdded: boolean;
  handleShowInfo: (movie: TraktMovies) => void;
  tooltip?: unknown;
  index: number;
}

const RemainingTopMovieCards = ({
  item,
  isListView,
  index,
  onAddToWatchlist,
  handleShowInfo,
  isAdded,
}: RemainingTopMovieCardsProps) => {
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

  // ✅ CAROUSEL MODE — fully custom layout, no Card header/body split
  if (!isListView) {
    return (
      <div className="h-full w-full relative">
        <li className="list-none h-full  mx-auto">
          <div className="h-full w-full flex flex-col gap-2 items-center bg-white dark:bg-zinc-900 rounded-xl overflow-hidden border border-gray-200 dark:border-zinc-700">
            <div className="w-full relative flex-shrink-0 self-stretch">
              <img
                src={posterUrl}
                alt={item.movie.title}
                className="w-full h-90 object-cover border border-none"
              />
            </div>

            {/* DETAILS — 30% */}
            <div className="flex-1 flex flex-col justify-between gap-1 px-3 py-2 bg-white dark:bg-zinc-900">
              <div className="absolute top-0 left-0 bg-blue-800  w-12 h-9 rounded z-10">
                <span className="mx-2 my-4 text-white text-xl font-bold">
                  #{index + 1}
                </span>
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Released: {formattedReleaseDate}
              </span>
              <Tooltip
                target=".movie-title-tooltip"
                mouseTrack
                mouseTrackTop={15}
                position="top"
                showDelay={0}
                hideDelay={100}
              />
              <div className="flex flex-col items-center gap-6">
                <strong
                  className="movie-title-tooltip text-lg text-black dark:text-white font-bold cursor-pointer hover:underline line-clamp-2 w-full text-center"
                  data-pr-tooltip={item.movie.title}
                  onClick={() => handleShowInfo(item)}
                >
                  {item.movie.title || "Untitled"}
                </strong>

                <div className="text-xs text-gray-500 dark:text-gray-300 flex items-center gap-2 flex-wrap justify-center">
                  <span>{item.movie.year || "N/A"}</span>
                  <span>
                    | ⭐{" "}
                    {item.movie.rating ? item.movie.rating.toFixed(1) : "N/A"}
                  </span>
                  <span>| {item.movie.runtime || 0}m</span>
                </div>

                <Button
                  label={isAdded ? "Added" : "Add to Watchlist"}
                  icon={isAdded ? "pi pi-check" : "pi pi-plus"}
                  onClick={handleInternalClick}
                  unstyled
                  pt={{
                    root: {
                      className:
                        "flex items-center gap-1.5 px-2 py-1.5 text-black dark:!text-white rounded-lg border-2 border-transparent hover:border-white dark:!hover:border-zinc-500 transition-all",
                    },
                    label: { className: "font-bold tracking-wide text-xs" },
                    icon: { className: "text-xs" },
                  }}
                />
              </div>
            </div>
          </div>
        </li>
      </div>
    );
  }
};
export default RemainingTopMovieCards;
