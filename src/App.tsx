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
  const [isListView, setIsListView] = useState<boolean>(false);
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
            unstyled
            pt={{
              icons: {
                classname: " text:black dark:text-white!",
              },
              root: {
                className: "flex items-center gap-2 bg-white dark:bg-black!",
              },
            }}
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

      <main className="flex h-screen flex-1 overflow-hidden bg-white dark:bg-zinc-950">
        <div className="min-h-0 flex-1 h-full overflow-y-auto  no-scrollbar transition-all duration-300 ease-in-out">
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
        <div
          className={`
      h-full 
      bg-white dark:bg-black 
      border-l border-zinc-200 dark:border-zinc-800
      transition-all 
      duration-500 
      ease-in-out
      ${openFilters ? "w-80 opacity-100" : "w-0 opacity-0 overflow-hidden border-none"}
    `}
        >
          {openFilters && (
            <div className="sidebar-content h-full w-80 shrink-0 bg-white dark:bg-black! border-l border-zinc-200 dark:border-zinc-800! flex flex-col transition-all">
              <div className="flex justify-between items-center p-4 border-b border-zinc-100 dark:border-zinc-900!">
                <h2 className="font-bold">Filters</h2>
                <Button
                  icon="pi pi-times"
                  unstyled
                  pt={{
                    root: {
                      className:
                        "p-button-rounded p-button-text p-button-plain bg-white! dark:bg-black!",
                    },
                    icon: {
                      className: "text-black! dark:text-white!",
                    },
                  }}
                  onClick={() => setOpenFilters(false)}
                />
              </div>

              <div className="flex-grow:1 overflow-y-auto p-4">
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
                      <h3 className="block font-bold mb-3 text-md text-zinc-500 pl-8 uppercase tracking-wider">
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
                      <div className="grid grid-cols-1 gap-2 ml-2">
                        {allGenres.map((genre) => (
                          <div
                            key={genre.key}
                            className="flex items-center gap-2"
                          >
                            <Checkbox
                              inputId={genre.key}
                              value={genre}
                              onChange={handleGenreChange}
                              pt={{
                                box: ({ context }) => ({
                                  className: context.checked
                                    ? "bg-yellow-500! border-yellow-600!" // Yellow when checked
                                    : "bg-white dark:bg-zinc-900 border-zinc-300", // Default state
                                }),
                                icon: {
                                  className: "text-white text-xs", // The actual tick mark color
                                },
                              }}
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
                      <div className="no-scrollbar!">
                        <span className="text-primary font-semibold text-sm">
                        Minimum rating: {ratingThreshold}
                        </span>
                        <Slider
                          value={ratingThreshold}
                          onChange={handleRatingChange}
                          pt={{
                            handle: {
                              className:
                                "bg-yellow-500! border-2 border-yellow-600! w-3 h-3 -mt-[4px] rounded-full cursor-pointer hover:bg-yellow-600! transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-400!",
                            },
                            range: {
                              className:
                                "bg-yellow-400! h-full absolute rounded-full",
                            },
                            root: {
                              className:
                                "min-w-[10px] mt-5 bg-zinc-200 dark:bg-zinc-800 rounded-full h-2 relative",
                            },
                          }}
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
        </div>
      </main>
    </div>
  );
}

export default App;
