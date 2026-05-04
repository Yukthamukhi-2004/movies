import "../styles/WtachList.css";
import "primeicons/primeicons.css";
import { Ripple } from "primereact/ripple";
import type { TraktMovies } from "../types/trakt";

interface WatchlistProps {
  items: TraktMovies[];
  onRemove: (id: number) => void;
  onClear: () => void;
}

function WatchList({ items, onRemove, onClear }: WatchlistProps) {
  return (
    <div className="top-0 mx-auto h-[80%] items-center text-black dark:!text-white transition-colors rounded-xl duration-300">
      <h2 className="px-6 font-bold text-black dark:!text-white">
        My WatchList ({items.length})
      </h2>

      {items.length === 0 ? (
        <p>Your WatchList is empty .Start adding some movies!</p>
      ) : (
        <div className="flex flex-col">
          <p
            className="text-yellow-500 cursor-pointer hover mb-4"
            onClick={onClear}
          >
            Clear Watchlist
          </p>
          <ul className="grid grid-cols-4  gap-[10px] items-center p-0 m-0">
            {items.map((item) => {
              const posterPath =
                item.movie.images?.poster?.[0] || item.movie.images?.thumb?.[0];
              const posterUrl = posterPath ? `https://${posterPath}` : "";
              return (
                <li
                  key={item.movie.ids.trakt}
                  className="bg-white dark:!bg-zinc-800 text-black dark:!text-white border-gray-300 dark:!border-zinc-700 border shadow-md rounded-xl overflow-hidden p-2"
                >
                  <div className="moviebox">
                    <div className="h-80px">
                      <img
                        src={posterUrl}
                        alt={item.movie.title}
                        className="w-full object-cover rounded-lg"
                      />
                    </div>
                    <div style={{ fontSize: "1.1rem" }}>
                      <strong>{item.movie.title}</strong>
                      <div>
                        <span>{item.movie.year}</span>
                        {item.movie.runtime && (
                          <span> • {item.movie.runtime} min</span>
                        )}
                        <span>⭐ {item.movie.rating?.toFixed(1) || "N/A"}</span>
                      </div>

                      <div
                        className="p-ripple flex items-center justify-center p-2 rounded-full cursor-pointer hover:bg-gray-200 dark:!hover:bg-gray-700 transition-colors"
                        onClick={() => onRemove(item.movie.ids.trakt)}
                        style={{ position: "relative", overflow: "hidden" }}
                      >
                        <i className="pi pi-minus-circle text-red-500 text-xl"></i>
                        <Ripple
                          pt={{
                            root: {
                              style: { background: "rgba(223, 14, 14, 0.3)" },
                            },
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

export default WatchList;
