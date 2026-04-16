import { useState, useMemo, useCallback } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import type { TraktMovies } from "./types/trakt";
import TrendingMovies from "./Pages/TrendingMovies";
import WatchList from "./Pages/WatchList";
import YearsList from "./Pages/YearsList";
import "primeicons/primeicons.css";
import "./styles/App.css";
import "primereact/resources/themes/lara-light-cyan/theme.css";
import { Button } from "primereact/button";
import ThemeToggle from "./components/ThemeToggle";
import { Checkbox } from "primereact/checkbox";
import { ListBox } from "primereact/listbox";
import { Slider } from "primereact/slider";
import { debounce } from "lodash";

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
  const isListView = false;
  const [selectedGenres, setSelectedGenres] = useState<
    { name: string; key: string }[]
  >([]);
  const [openFilters, setOpenFilters] = useState<boolean>(false);
  const [selectedFilter, setSelectedFilter] = useState<FilterOption | null>(
    null,
  );
  const [ratingThreshold, setRatingThreshold] = useState<number>(0);

  const filters: FilterOption[] = [
    { name: "Year", code: "Y" },
    { name: "Genres", code: "G" },
    { name: "Rating", code: "R" },
  ];
  console.log("Current Filters Array:", filters);

  const allGenres = useMemo(() => {
    const genresSet = new Set(
      movies
        .filter((m) => (m.movie && m.movie?.genres) || [])
        .flatMap((m) => m.movie.genres),
    );

    return Array.from(genresSet).map((genre) => ({
      name: genre,
      key: genre,
    }));
  }, [movies]);

  const handleRatingChange = useCallback(
    debounce((e: any) => setRatingThreshold(e.value), 100),
    [],
  );

  const handleGenreChange = (e: any) => {
    let _selectedGenres = [...selectedGenres];
    if (e.checked) {
      _selectedGenres.push(e.value);
    } else
      _selectedGenres = _selectedGenres.filter(
        (category) => category.key !== e.value.key,
      );
    setSelectedGenres(_selectedGenres);
  };

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
        <div className="flex flex-row gap-2 items-center">
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

        <div className="flex gap-4 items-center">
          <ThemeToggle />

          <Button
            label="Filter"
            icon="pi pi-filter"
            onClick={() => setOpenFilters(!openFilters)}
            unstyled
            className="border:black dark:border-white! hover:black dark:hover:border-white-500! focus:outline-2-black dark:focus:outline-white-500!"
          />
          <Button
            label={`WatchList (${watchlist.length})`}
            icon="pi pi-eye"
            onClick={() => navigate("/watchlist")}
          />
        </div>
      </header>

      <main className="flex min-h-0 flex-1 overflow-hidden">
        <div className="w-full min-h-0 flex-1 overflow-y-auto">
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
          </Routes>
        </div>

        {/* --- FIXED SIDEBAR SECTION --- */}
        {openFilters && (
          <div className="sidebar-content h-full w-80 bg-white dark:bg-black! border-l border-zinc-200 dark:border-zinc-800! flex flex-col transition-all">
            <div className="flex justify-between items-center p-4 border-b border-zinc-100 dark:border-zinc-900!">
              <h2 className="font-bold">Filters</h2>
              <Button
                icon="pi pi-times"
                className="p-button-rounded p-button-text p-button-plain"
                onClick={() => setOpenFilters(false)}
              />
            </div>

            <div className="flex-grow overflow-y-auto p-4">
              <ListBox
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.value)}
                options={filters}
                optionLabel="name"
                className="w-full "
                style={{ maxHeight: "250px" }}
              />

              <div className="filter-details ">
                {/* YEAR FILTER (Code Y) */}
                {selectedFilter?.code === "Y" && (
                  <div className="animate-fade-in">
                    <h3 className="font-bold mb-3 text-sm text-zinc-500 uppercase tracking-wider">
                      Select Year
                    </h3>
                    <YearsList
                      movies={movies}
                      onYearChange={(year) => setSelectedYear(year)}
                      selectedYear={selectedYear}
                    />
                  </div>
                )}

                {/* GENRES FILTER (Code G) */}
                {selectedFilter?.code === "G" && (
                  <div>
                    <h3 className="font-bold mb-2">Select Genres</h3>
                    <div className="grid grid-cols-1 gap-2">
                      {allGenres.map((genre) => (
                        <div
                          key={genre.key}
                          className="flex items-center gap-2"
                        >
                          <Checkbox
                            inputId={genre.key}
                            value={genre}
                            onChange={handleGenreChange}
                            checked={selectedGenres.some(
                              (item) => item.key === genre.key,
                            )}
                          />
                          <label
                            htmlFor={genre.key}
                            className="text-sm capitalize"
                          >
                            {genre.name}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* RATING FILTER (Code R) */}
                {selectedFilter?.code === "R" && (
                  <div>
                    <h3 className="font-bold">Rating Filter</h3>
                    <div>
                      <span className="text-primary font-semibold">
                        Minimum rating: {ratingThreshold}
                      </span>
                      <Slider
                        value={ratingThreshold}
                        onChange={handleRatingChange}
                        pt={{
                          handle: {
                            className:
                              "bg-yellow-500 border-yellow-600 w-4 h-4",
                          },
                          range: { className: "bg-yellow-400" },
                          root: { className: "min-w-3xs mt-5 h-[10px]" },
                        }}
                        style={{ height: "10px" }}
                        min={0}
                        max={10}
                        step={1}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
