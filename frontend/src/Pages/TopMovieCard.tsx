import { Card } from "primereact/card";
import { Tooltip } from "primereact/tooltip";
import { Button } from "primereact/button";
import { Image } from "primereact/image";
import type { TraktMovies } from "../types/trakt";

interface TopMovieCardProps {
  item: TraktMovies;
  isListView: boolean;
  onAddToWatchlist: (movie: TraktMovies) => void;
  isAdded: boolean;
  handleShowInfo: (movie: TraktMovies) => void;
  tooltip?: unknown;
  index: number;
}

const TopMovieCard = ({
  item,
  isListView,
  index,
  onAddToWatchlist,
  handleShowInfo,
  isAdded,
}: TopMovieCardProps) => {
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
  const overview = item.movie.overview || "No overview";

  // ✅ CAROUSEL MODE — fully custom layout, no Card header/body split
  if (!isListView) {
    return (
      <div className="h-full w-full relative">
        <li className="list-none h-full  mx-auto">
          <div className="h-95% w-full flex flex-row gap-3 items-center bg-white dark:bg-zinc-900 rounded-xl overflow-hidden border border-gray-200 dark:border-zinc-700">
            <div className="w-[250px] relative flex-shrink-0 self-stretch ml-2 my-2 ">
              <img
                src={posterUrl}
                alt={item.movie.title}
                className="w-full h-95 object-cover border rounded-xl border-none"
              />
            </div>

            {/* DETAILS — 30% */}
            <div className="flex-1 flex flex-col justify-between gap-1 px-3 py-2 mt-8 bg-white dark:bg-zinc-900">
              <div className="absolute top-2 left-67 bg-blue-800  w-12 h-9 rounded z-10">
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

                <div className="text-md text-gray-500 dark:text-gray-300 flex items-center gap-2 flex-wrap justify-center">
                  <span>{item.movie.year || "N/A"}</span>
                  <span>
                    | ⭐{" "}
                    {item.movie.rating ? item.movie.rating.toFixed(1) : "N/A"}
                  </span>
                  <span>| {item.movie.runtime || 0}m</span>
                </div>
                <span
                  className="border border-zinc-300 dark:border-zinc-600 text-zinc-500 px-1.5
            py-0.5 rounded "
                >
                  {item.movie.certification}
                </span>
                <p className="text-gray-700 dark:text-zinc-300 text-md line-clamp-4 leading-relaxed">
                  {overview}
                </p>

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

  // ✅ LIST VIEW — completely unchanged
  return (
    <div className="h-[24]">
      <li className="list-none h-full">
        <Tooltip
          target=".movie-title-tooltip"
          mouseTrack
          mouseTrackTop={15}
          position="top"
          showDelay={0}
          hideDelay={100}
        />
        <Card
          unstyled
          className=" flex flex-row w-full gap-4 h-140px bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl"
          pt={{
            root: { className: "flex h-full flex-row" },
            body: { className: "p-4 flex flex-col min-w-0 overflow-hidden" },
            content: { className: "p-0" },
          }}
          header={
            <div className="w-[220px] min-w-[200px] max-w-[200px] h-full shrink-0 m-2 overflow-hidden rounded-l-xl">
              <Image
                src={posterUrl}
                alt={item.movie.title}
                unstyled
                pt={{
                  root: { className: "block w-full h-80" },
                  image: { className: "w-full h-full object-cover block" },
                }}
              />
            </div>
          }
        >
          <div className="flex flex-col justify-items-start h-full py-4 gap-6 mt-2">
            <span className="text-md text-gray-700 dark:text-gray-300">
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
              <span>| {item.movie.runtime || 0} mins</span>
            </div>
            <p className="text-gray-600 dark:text-zinc-300! text-md line-clamp-4 leading-relaxed">
              {overview}
            </p>

            <div className="flex flex-row justify-between w-full px-5">
              <Button
                icon="pi pi-info-circle"
                onClick={() => handleShowInfo(item)}
                text
                plain
                unstyled
                pt={{
                  root: {
                    className:
                      "flex items-center justify-center p-2 rounded-lg border-2 border-transparent text-black dark:!text-white hover:border-white dark:!hover:border-black transition-all",
                  },
                  label: { className: "hidden" },
                  icon: { className: "text-2xl" },
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
                      "flex items-center gap-2 px-3 py-2 text-black dark:!text-white px-2 py-1 rounded-lg border-2 border-transparent hover:border-white dark:!hover:border-black transition-all",
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

export default TopMovieCard;
