import { useState, useMemo, useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import type { TraktMovies } from "./types/trakt";
import TrendingMovies from "./Pages/TrendingMovies";
import WatchList from "./Pages/WatchList";
import "primeicons/primeicons.css";
import "./styles/App.css";
import "primereact/resources/themes/lara-light-cyan/theme.css";
import { Button } from "primereact/button";
import ThemeToggle from "./components/ThemeToggle";

import { debounce } from "lodash";
import { Chip } from "primereact/chip";

interface FilterOption {
  name: string;
  code: string;
}

declare global {
  interface EventTarget {
    _addEventListener: typeof EventTarget.prototype.addEventListener;
  }
}

EventTarget.prototype._addEventListener =
  EventTarget.prototype.addEventListener;
EventTarget.prototype.addEventListener = function (type, fn, options) {
  if (type === "scroll" || type === "touchstart" || type === "wheel") {
    this._addEventListener(type, fn, {
      passive: true,
      ...(typeof options === "object" ? options : {}),
    });
  } else {
    this._addEventListener(type, fn, options);
  }
};

function App() {
  const navigate = useNavigate();
  const [movies, setMovies] = useState<TraktMovies[]>([]);
  const [watchlist, setWatchlist] = useState<TraktMovies[]>([]);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [isListView, setIsListView] = useState<boolean>(false);
  const [selectedGenres, setSelectedGenres] = useState<
    { name: string; key: string }[]
  >([]);
  const [openFilters, setOpenFilters] = useState<boolean>(false);
  const [selectedFilter, setSelectedFilter] = useState<FilterOption | null>(
    null,
  );
  const [ratingThreshold, setRatingThreshold] = useState<number>(0);
  const [debouncedRating, setDebouncedRating] = useState<number>(0);

  const filters: FilterOption[] = [
    { name: "Year", code: "Y" },
    { name: "Genres", code: "G" },
    { name: "Rating", code: "R" },
  ];
  console.log("Current Filters Array:", filters);

  

 

  console.log(selectedFilter?.code);

  const finalFilteredMovies = useMemo(() => {
    return movies.filter((m) => {
      const mYear =
        m.movie.year ||
        (m.movie.released ? new Date(m.movie.released).getFullYear() : null);
      const matchesYear = !selectedYear || mYear === selectedYear;

      const matchesGenre =
        selectedGenres && selectedGenres.length > 0
          ? selectedGenres.some((g) => m.movie.genres?.includes(g.name))
          : true;

      const movieRating = m.movie?.rating ?? 0;
      const matchesRating = movieRating >= ratingThreshold;
      return matchesYear && matchesGenre && matchesRating;
    });
  }, [movies, selectedYear, selectedGenres, ratingThreshold]);

  const addToWatchlist = (movie: TraktMovies) => {
    if (!watchlist.find((m) => m.movie.ids.trakt === movie.movie.ids.trakt)) {
      setWatchlist([...watchlist, movie]);
    }
  };
  /*  console.log("Movies in App:", movies); */

  return (
    <div className="app-container flex h-screen flex-col px-2">
      <header className="z-50 flex  shrink-0 items-center justify-between border-b border-zinc-300 bg-white px-8 transition-colors duration-300 dark:border-zinc-800! dark:bg-black!">
        <div className="flex flex-col gap-2 items-center">
          <h1
            className="text-4xl font-extrabold text-black dark:text-white! cursor-pointer hover:text-gray-600"
            onClick={() => navigate("/")}
          >
            My Movie App
          </h1>
          <h2 className="text-xl text-yellow-600 dark:text-yellow-400 font-semibold mt-1">
            Trending Movies
          </h2>
        </div>

        <div className="flex gap-6 items-center">
          <ThemeToggle />
          <Button
            label="Home"
            unstyled
            pt={{
              icon: {
                className: " text:black dark:text-white!",
              },
              root: {
                className: "flex items-center gap-2 bg-white dark:bg-black!",
              },
            }}
            icon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="size-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
                />
              </svg>
            }
            onClick={() => navigate("/")}
          />

          <Button
            label="Filter"
            icon="pi pi-filter"
            onClick={() => setOpenFilters(!openFilters)}
            unstyled
            className="border:black dark:border-white! hover:black dark:hover:border-white-500! "
          />
          <Button
            label={`WatchList (${watchlist.length})`}
            icon="pi pi-eye"
            onClick={() => navigate("/watchlist")}
            unstyled
            pt={{
              root: {
                className: "flex items-center gap-2 bg-white dark:bg-black!",
              },
            }}
          />
          <Button
            label={isListView ? "GridView" : "ListView"}
            unstyled
            pt={{
              icon: {
                className: "text-black dark:text-white",
              },
              root: {
                className: "flex items-center gap-2 bg-white dark:bg-black!",
              },
            }}
            icon={
              isListView ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="size-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="size-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 12h.007v.008H3.75V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm-.375 5.25h.007v.008H3.75v-.008Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
                  />
                </svg>
              )
            }
            onClick={() => setIsListView(!isListView)}
          />
        </div>
      </header>

      <main className="flex h-screen flex-1  overflow-hidden bg-white dark:bg-zinc-950">
        <div className="min-h-0 flex-1 h-full overflow-y-auto  no-scrollbar! transition-all duration-300 ease-in-out">
          <div className="h-30px">
            {selectedFilter && (
              <Chip label="Microsoft" icon="pi pi-microsoft" removable />
            )}
          </div>
          <Routes>
            <Route
              path="/"
              element={
                <TrendingMovies
                  movies={finalFilteredMovies}
                  setMovies={setMovies}
                  onAddToWatchlist={addToWatchlist}
                  watchlist={watchlist}
                />
              }
            />
            <Route
              path="/watchlist"
              element={
                <WatchList
                  items={watchlist}
                  onRemove={(id) =>
                    setWatchlist(
                      watchlist.filter((m) => m.movie.ids.trakt !== id),
                    )
                  }
                  onClear={() => setWatchlist([])}
                />
              }
            />
          </Routes>
        </div>

        {/* --- FIXED SIDEBAR SECTION --- */}

        {openFilters && (
          
        )}
      </main>
    </div>
  );
}

export default App;
