import { useState, useMemo, useEffect } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import type { TraktMovies } from "./types/trakt";
import TrendingMovies from "./Pages/TrendingMovies";
import ListView from "./Pages/ListView";
import WatchList from "./Pages/WatchList";
import TonightPage from "./Pages/Tonightpage";
import TopMovies from "./Pages/Topmovies";
import "primeicons/primeicons.css";
import "./styles/App.css";
import "primereact/resources/themes/lara-light-cyan/theme.css";
import { Button } from "primereact/button";
import ThemeToggle from "./components/ThemeToggle";
import Filter from "./Pages/Filter";
import { Chip } from "primereact/chip";
import type { FilterOption } from "./components/filters";

// ─── localStorage helpers ─────────────────────────────────────────────────────
function saveToStorage<T>(key: string, value: T) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}
function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch (_) {
    return fallback;
  }
}
// ─────────────────────────────────────────────────────────────────────────────

const TRAKT_API_KEY =
  "d18ef90d359e1b16311df076556165adf10f332dbf2301436a7fd23a7b4de19b";

function App() {
  const navigate = useNavigate();
  const location = useLocation();

  // ── State — initialised from cache so any route works after refresh ──────
  const [movies, setMoviesState] = useState<TraktMovies[]>(() =>
    loadFromStorage<TraktMovies[]>("movies", []),
  );
  const [watchlist, setWatchlistState] = useState<TraktMovies[]>(() =>
    loadFromStorage<TraktMovies[]>("watchlist", []),
  );
  const [isLoadingMovies, setIsLoadingMovies] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const topTenMovies = useMemo(() => {
    return [...movies]
      .filter((m) => m.movie?.rating != null)
      .sort((a, b) => (b.movie.rating ?? 0) - (a.movie.rating ?? 0))
      .slice(0, 10);
  }, [movies]);

  // Persist-aware setters
  const setMovies: React.Dispatch<React.SetStateAction<TraktMovies[]>> = (
    value,
  ) => {
    setMoviesState((prev) => {
      const next = typeof value === "function" ? value(prev) : value;
      saveToStorage("movies", next);
      return next;
    });
  };
  const setWatchlist: React.Dispatch<React.SetStateAction<TraktMovies[]>> = (
    value,
  ) => {
    setWatchlistState((prev) => {
      const next = typeof value === "function" ? value(prev) : value;
      saveToStorage("watchlist", next);
      return next;
    });
  };

  // This runs on mount regardless of which route the user lands on.
  // If localStorage already has data it bails out immediately (no network call).
  useEffect(() => {
    if (movies.length > 0) return; // cache hit — nothing to do

    async function fetchMovies() {
      setIsLoadingMovies(true);
      setFetchError(null);
      try {
        const res = await fetch(
          "https://api.trakt.tv/movies/trending?extended=full",
          {
            headers: {
              "Content-Type": "application/json",
              "trakt-api-version": "2",
              "trakt-api-key": TRAKT_API_KEY,
            },
          },
        );
        if (!res.ok)
          throw new Error(`API error ${res.status}: ${await res.text()}`);
        const data: unknown = await res.json();
        const valid = (Array.isArray(data) ? data : []).filter(
          (item): item is TraktMovies => Boolean(item?.movie?.ids?.trakt),
        );
        setMovies(valid);
      } catch (err) {
        console.error("Fetch error:", err);
        setFetchError(
          err instanceof Error ? err.message : "Failed to load movies.",
        );
      } finally {
        setIsLoadingMovies(false);
      }
    }

    fetchMovies();
  }, []); // empty deps — runs once on mount, any route

  // ── Derive uniqueYears whenever movies list changes ──────────────────────
  const [uniqueYears, setUniqueYears] = useState<number[]>(() => {
    // Also compute from cache on first render
    const cached = loadFromStorage<TraktMovies[]>("movies", []);
    if (!cached.length) return [];
    const years = cached
      .map(
        (m) =>
          m.movie?.year ||
          (m.movie?.released ? new Date(m.movie.released).getFullYear() : null),
      )
      .filter((y): y is number => y !== null);
    return Array.from(new Set(years)).sort((a, b) => a - b);
  });

  useEffect(() => {
    if (movies.length === 0) return;
    const years = movies
      .map(
        (m) =>
          m.movie?.year ||
          (m.movie?.released ? new Date(m.movie.released).getFullYear() : null),
      )
      .filter((y): y is number => y !== null);
    const sorted = Array.from(new Set(years)).sort((a, b) => a - b);
    setUniqueYears(sorted);
    setSelectedYear({ min: sorted[0], max: sorted[sorted.length - 1] });
  }, [movies]);

  // ── Filter state ─────────────────────────────────────────────────────────
  const [selectedYear, setSelectedYear] = useState<{
    min: number;
    max: number;
  }>({ min: 1994, max: 2026 });
  const [isListView, setIsListView] = useState<boolean>(
    () => location.pathname === "/ListView",
  );
  const [selectedGenres, setSelectedGenres] = useState<
    { name: string; key: string }[]
  >([]);
  const [openFilters, setOpenFilters] = useState<boolean>(false);
  const [selectedFilter, setSelectedFilter] = useState<FilterOption | null>(
    null,
  );
  const [ratingRange, setRatingRange] = useState<{ min: number; max: number }>({
    min: 0,
    max: 10,
  });

  const finalFilteredMovies = useMemo(() => {
    return movies.filter((m) => {
      const movieYear =
        m.movie.year ||
        (m.movie.released ? new Date(m.movie.released).getFullYear() : 0);
      const matchesYear =
        movieYear >= selectedYear.min && movieYear <= selectedYear.max;
      const matchesGenre =
        selectedGenres.length > 0
          ? selectedGenres.some((g) => m.movie.genres?.includes(g.name))
          : true;
      const movieRating = m.movie?.rating ?? 0;
      const matchesRating =
        movieRating >= ratingRange.min && movieRating <= ratingRange.max;
      return matchesYear && matchesGenre && matchesRating;
    });
  }, [movies, selectedYear, selectedGenres, ratingRange]);

  const addToWatchlist = (movie: TraktMovies) => {
    if (!watchlist.find((m) => m.movie.ids.trakt === movie.movie.ids.trakt)) {
      setWatchlist([...watchlist, movie]);
    }
  };

  const hasActiveFilters =
    (uniqueYears.length > 0 &&
      (selectedYear.min > uniqueYears[0] ||
        selectedYear.max < uniqueYears[uniqueYears.length - 1])) ||
    selectedGenres.length > 0 ||
    ratingRange.min > 0 ||
    ratingRange.max < 10;

  const clearAllFilters = () => {
    setSelectedYear({
      min: uniqueYears[0] ?? 1994,
      max: uniqueYears[uniqueYears.length - 1] ?? 2026,
    });
    setSelectedGenres([]);
    setRatingRange({ min: 0, max: 10 });
  };

  const goHome = () => {
    setOpenFilters(false);
    navigate("/");
    clearAllFilters();
  };

  const isOnListView = location.pathname === "/ListView";

  return (
    <div className="app-container flex h-screen flex-col px-2">
      <header className="z-50 h-20 max-w-[90vw] flex shrink-0 items-center justify-between border-b border-zinc-300 bg-white px-8 transition-colors duration-300 dark:border-zinc-800! dark:bg-black!">
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
              icon: { className: "text:black dark:text-white!" },
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
            label="Tonight?"
            icon="pi pi-moon"
            onClick={() => navigate("/tonight")}
            unstyled
            pt={{
              root: {
                className:
                  "flex items-center gap-2 bg-yellow-400 text-black px-3 py-1.5 rounded-lg font-bold text-sm hover:bg-yellow-300 transition-colors cursor-pointer",
              },
            }}
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

      {/* Chips — only on /ListView */}
      {isOnListView && hasActiveFilters && (
        <div className="flex flex-wrap gap-3 px-8 py-3 border-b border-zinc-300 dark:border-zinc-800 bg-white dark:bg-black shrink-0">
          {(selectedYear.min !== uniqueYears[0] ||
            selectedYear.max !== uniqueYears[uniqueYears.length - 1]) && (
            <Chip
              label={`Year: ${selectedYear.min} - ${selectedYear.max}`}
              removable
              unstyled
              onRemove={() =>
                setSelectedYear({
                  min: uniqueYears[0],
                  max: uniqueYears[uniqueYears.length - 1],
                })
              }
              pt={{
                root: {
                  className:
                    "bg-white dark:bg-black gap-2 text-zinc-900 dark:text-white! border-zinc-300 dark:border-zinc-500",
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
                    "bg-white dark:bg-black gap-2 text-zinc-900 dark:text-white! border-zinc-300 dark:border-zinc-500",
                },
                removeIcon: { className: "text-zinc-900 dark:text-zinc-200" },
              }}
            />
          ))}
          {(ratingRange.min > 0 || ratingRange.max < 10) && (
            <Chip
              label={`Rating: ${ratingRange.min} - ${ratingRange.max}`}
              removable
              unstyled
              onRemove={() => setRatingRange({ min: 0, max: 10 })}
              pt={{
                root: {
                  className:
                    "bg-white dark:bg-black gap-2 text-zinc-900 dark:text-white! border-zinc-300 dark:border-zinc-500",
                },
                removeIcon: { className: "text-zinc-900 dark:text-zinc-200" },
              }}
            />
          )}
        </div>
      )}

      <main className="flex flex-1 max-w-[90vw] overflow-hidden bg-white dark:bg-zinc-950 relative">
        {/* Global loading spinner — shows on any page while data is being fetched */}
        {isLoadingMovies && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50">
            <p className="text-white text-lg font-semibold animate-pulse">
              Loading movies…
            </p>
          </div>
        )}
        {fetchError && !isLoadingMovies && movies.length === 0 && (
          <div className="absolute inset-0 z-50 flex items-center justify-center">
            <p className="text-red-500 text-center px-8">{fetchError}</p>
          </div>
        )}

        <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar transition-all duration-300 ease-in-out">
          <Routes>
            <Route
              path="/"
              element={
                <>
                  <TrendingMovies
                    movies={movies}
                    setMovies={setMovies}
                    onAddToWatchlist={addToWatchlist}
                    isListView={isListView}
                    watchlist={watchlist}
                    setIsListView={setIsListView}
                  />
                  <div className="mt-10">
                    <TopMovies
                      movies={movies}
                      onAddToWatchlist={addToWatchlist}
                      watchlist={watchlist}
                      setIsListView={setIsListView}
                      topTenMovies={topTenMovies}
                    />
                  </div>
                  <button
                    className="border rounded-2xl w-3xl h-12 mt-6 ml-130 "
                    onClick={() => {
                      setIsListView(true);
                      navigate("/ListView", { state: { source: "top10" } });
                    }}
                  >
                    See All
                  </button>
                </>
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
                  goHome={goHome}
                  isListView={isListView}
                  movies={finalFilteredMovies}
                  topTenMovies={topTenMovies}
                  watchlist={watchlist}
                  onAddToWatchlist={addToWatchlist}
                  setOpenFilters={setOpenFilters}
                />
              }
            />
            <Route
              path="/tonight"
              element={
                <TonightPage
                  movies={movies}
                  onAddToWatchlist={addToWatchlist}
                  watchlist={watchlist}
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
          ratingRange={ratingRange}
          setRatingRange={setRatingRange}
          years={uniqueYears}
          hasActiveFilters={hasActiveFilters}
          results={finalFilteredMovies.length}
        />
      </main>
    </div>
  );
}

export default App;
