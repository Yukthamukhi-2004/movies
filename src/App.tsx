import { useState, useMemo } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import type { TraktMovies } from "./types/trakt";
import TrendingMovies from "./Pages/TrendingMovies";
import ListView from "./Pages/ListView";
import WatchList from "./Pages/WatchList";
import "primeicons/primeicons.css";
import "./styles/App.css";
import "primereact/resources/themes/lara-light-cyan/theme.css";
import { Button } from "primereact/button";
import ThemeToggle from "./components/ThemeToggle";
import Filter from "./Pages/Filter";
import { Chip } from "primereact/chip";
import type { FilterOption } from "./components/filters";

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

  const hasActiveFilters =
    selectedYear !== null || selectedGenres.length > 0 || ratingThreshold > 0;

  const clearAllFilters = () => {
    setSelectedYear(null);
    setSelectedGenres([]);
    setRatingThreshold(0);
    setDebouncedRating(0);
  };

  const goHome = () => {
    setOpenFilters(false);
    navigate("/");
    setSelectedYear(null);
    setSelectedGenres([]);
    setRatingThreshold(0);
    setDebouncedRating(0);
  };

  return (
    <div className="app-container flex h-screen flex-col px-2">
      <header className="z-50 h-20 max-w-[90vw] flex  shrink-0 items-center justify-between border-b border-zinc-300 bg-white px-8 transition-colors duration-300 dark:border-zinc-800! dark:bg-black!">
        <div className="flex flex-col gap-2 items-center">
          <h1
            className="text-4xl font-extrabold text-black dark:text-white! cursor-pointer hover:text-gray-600"
            onClick={goHome}
          >
            My Movie App
          </h1>
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
            onClick={goHome}
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
        </div>
      </header>
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-3 px-8 py-10 h-8 m-20  border-zinc-300 dark:border-zinc-300 bg-white dark:bg-black shrink-0 border-rounded-3xl">
          {selectedYear !== null && (
            <Chip
              label={`Year: ${selectedYear}`}
              removable
              unstyled
              onRemove={() => setSelectedYear(null)}
              pt={{
                root: {
                  className:
                    "bg-white dark:bg-black gap-2 text-zinc-900 dark:text-white! border-zinc-300 dark:border-zinc-500 ",
                },
                removeIcon: {
                  className: "text-zinc-900 dark:text-zinc-200 border-none",
                },
              }}
            />
          )}
          {selectedGenres.map((genre) => (
            <Chip
              key={genre.key}
              label={`Genre: ${genre.name}`}
              unstyled
              removable
              onRemove={() =>
                setSelectedGenres((prev) =>
                  prev.filter((g) => g.key !== genre.key),
                )
              }
              pt={{
                root: {
                  className:
                    "bg-white dark:bg-black gap-2 text-zinc-900 dark:text-white! border-zinc-300 dark:border-zinc-500 border-rounded-3xl",
                },
                removeIcon: {
                  className: "text-zinc-900 dark:text-zinc-200",
                },
              }}
            />
          ))}
          {ratingThreshold > 0 && (
            <Chip
              label={`Rating ≥ ${ratingThreshold}`}
              removable
              unstyled
              onRemove={() => {
                setRatingThreshold(0);
                setDebouncedRating(0);
              }}
              pt={{
                root: {
                  className:
                    "bg-white dark:bg-black gap-5 text-zinc-900 dark:text-white! border-zinc-300 dark:border-zinc-500  border-rounded-3xl",
                },
                removeIcon: {
                  className: "text-zinc-900 dark:text-zinc-200 ",
                },
              }}
            />
          )}
        </div>
      )}

      <main className="flex flex-1 max-w-[90vw] overflow-hidden bg-white dark:bg-zinc-950">
        <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar transition-all duration-300 ease-in-out">
          <Routes>
            <Route
              path="/"
              element={
                <TrendingMovies
                  movies={finalFilteredMovies}
                  setMovies={setMovies}
                  onAddToWatchlist={addToWatchlist}
                  isListView={isListView}
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
            <Route
              path="/ListView"
              element={
                <ListView
                  movies={movies}
                  watchlist={watchlist}
                  onAddToWatchlist={addToWatchlist}
                />
              }
            />
          </Routes>
        </div>

        <Filter
          movies={finalFilteredMovies}
          allMovies={movies}
          selectedYear={selectedYear}
          setSelectedYear={setSelectedYear}
          clearAllFilters={clearAllFilters}
          selectedGenres={selectedGenres}
          setSelectedGenres={setSelectedGenres}
          openFilters={openFilters}
          setOpenFilters={setOpenFilters}
          selectedFilter={selectedFilter}
          setSelectedFilter={setSelectedFilter}
          ratingThreshold={ratingThreshold}
          setRatingThreshold={setRatingThreshold}
          debouncedRating={debouncedRating}
          setDebouncedRating={setDebouncedRating}
        />
      </main>
    </div>
  );
}

export default App;
