import type { TraktMovies } from "../types/trakt";
import { Image } from "primereact/image";
import { Card } from "primereact/card";
import { Button } from "primereact/button";
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
    <div>
      <li className="list-none">
        <Tooltip
          target=".movie-title-tooltip"
          mouseTrack
          mouseTrackTop={15}
          position="top"
          showDelay={100}
          hideDelay={100}
        />
        <Card
          unstyled
          className={`overflow-hidden hover:scale-[1.01] transition-transform border shadow-md ${
            isListView ? "w-70% gap-4 h-[120px] " : "flex flex-col h-full gap-2"
          } bg-white dark:bg-zinc-900 border-gray-300 dark:border-zinc-700 rounded-xl`}
          pt={{
            root: {
              className: `flex h-full ${isListView ? "flex-row" : "flex-col"}`,
            },
            body: {
              className: "p-4 flex flex-col flex-grow min-w-0 overflow-hidden",
            }, // This styles the actual container
            content: { className: "p-0" }, // Removes default padding that might be ruining your layout
          }}
          header={
            <div
              className={
                isListView
                  ? "w-[200px] min-w-[100px] h-90% m-2 shrink-0 overflow-hidden rounded-l-xl"
                  : "w-90% aspect-2/3 overflow-hidden "
              }
            >
              <Image
                src={posterUrl}
                alt={item.movie.title}
                unstyled
                pt={{
                  root: { className: "block w-full h-full" },
                  image: {
                    className: "w-full h-full object-cover block rounded-xl",
                  },
                }}
              />
            </div>
          }
        >
          <div
            className={
              isListView
                ? "flex flex-col justify-items-start py-4 gap-6"
                : " flex flex-col text-center items-center gap-1.5 my-8 "
            }
          >
            <span className="text-sm text-gray-700 dark:text-gray-300! ">
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

            <div className="text-sm text-gray-500 dark:text-white! flex items-center gap-4">
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
                <p className=" text-gray-600 dark:text-zinc-300! text-sm line-clamp-4 leading-relaxed">
                  {overview}
                </p>
              )}
            </div>

            <div className={`mt-4 flex ${isListView ? "gap-350" : " gap-34"}`}>
              <Button
                icon="pi pi-info-circle"
                onClick={() => handleShowInfo(item)}
                text
                plain
                unstyled
                pt={{
                  root: {
                    className:
                      "flex items-center justify-center p-2 rounded-lg border-2 border-transparent text-black dark:!text-white hover:border-black dark:!hover:border-white transition-all",
                  },
                  label: { className: "hidden" },
                  icon: { className: "text-xl" },
                }}
              />

              <Button
                label={isAdded ? "Added to Watchlist" : "Add to Watchlist"}
                icon={isAdded ? "pi pi-check" : "pi pi-plus"}
                onClick={handleInternalClick}
                unstyled
                pt={{
                  root: {
                    className:
                      "flex items-center gap-2 px-3 py-2 text-black dark:!text-white px-2 py-1 rounded-lg border-2 border-transparent hover:border-black dark:!hover:border-white transition-all",
                  },
                  label: { className: "font-bold tracking-wide" },
                }}
              />
            </div>
          </div>
        </Card>
      </li>
    </div>
  );
};

export default MovieCard;
