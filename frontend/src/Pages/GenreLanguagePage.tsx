import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import type { TraktMovies } from "../types/trakt";
import { GENRE_CONFIG, LANGUAGE_CONFIG } from "./BrowseInterests";
import MovieCard from "./MovieCard";
import PopUp from "./PopUp";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";

interface GenreLanguagePageProps {
  movies: TraktMovies[];
  onAddToWatchlist: (movie: TraktMovies) => void;
  watchlist: TraktMovies[];
  emoji: string;
}

// ── Genre Page ─────────────────────────────────────────────────────────────────
export function GenrePage({
  movies,
  onAddToWatchlist,
  watchlist,
}: GenreLanguagePageProps) {
  const { genre } = useParams<{ genre: string }>();
  const navigate = useNavigate();
  const [selectedMovie, setSelectedMovie] = useState<TraktMovies | null>(null);
  const [popupOpen, setPopupOpen] = useState(false);

  const decodedGenre = decodeURIComponent(genre ?? "");
  const cfg = GENRE_CONFIG[decodedGenre] ?? {
    emoji: "🎬",
    gradient: "from-zinc-600 to-gray-900",
  };

  const filtered = useMemo(
    () => movies.filter((m) => m.movie.genres?.includes(decodedGenre)),
    [movies, decodedGenre],
  );

  const handleShowInfo = (movie: TraktMovies) => {
    setSelectedMovie(movie);
    setPopupOpen(true);
  };

  return (
    <PageShell
      title={decodedGenre.replace(/-/g, " ")}
      emoji={cfg.emoji}
      gradient={cfg.gradient}
      count={filtered.length}
      label="genre"
      onBack={() => navigate("/")}
    >
      <MovieGrid
        movies={filtered}
        watchlist={watchlist}
        onAddToWatchlist={onAddToWatchlist}
        onShowInfo={handleShowInfo}
      />
      <PopUp
        visible={popupOpen}
        setVisible={setPopupOpen}
        movie={selectedMovie}
      />
    </PageShell>
  );
}

// ── Language Page ──────────────────────────────────────────────────────────────
export function LanguagePage({
  movies,
  onAddToWatchlist,
  watchlist,
}: GenreLanguagePageProps) {
  const { lang } = useParams<{ lang: string }>();
  const navigate = useNavigate();
  const [selectedMovie, setSelectedMovie] = useState<TraktMovies | null>(null);
  const [popupOpen, setPopupOpen] = useState(false);

  const langCode = lang ?? "";
  const cfg = LANGUAGE_CONFIG[langCode] ?? {
    flag: "🌐",
    label: langCode,
    gradient: "from-zinc-600 to-gray-900",
  };

  const filtered = useMemo(
    () => movies.filter((m) => m.movie.language === langCode),
    [movies, langCode],
  );

  const handleShowInfo = (movie: TraktMovies) => {
    setSelectedMovie(movie);
    setPopupOpen(true);
  };

  return (
    <PageShell
      title={cfg.label}
      emoji={"flag" in cfg ? cfg.flag : "🌐"}
      gradient={cfg.gradient}
      count={filtered.length}
      label="language"
      onBack={() => navigate("/")}
    >
      <MovieGrid
        movies={filtered}
        watchlist={watchlist}
        onAddToWatchlist={onAddToWatchlist}
        onShowInfo={handleShowInfo}
      />
      <PopUp
        visible={popupOpen}
        setVisible={setPopupOpen}
        movie={selectedMovie}
      />
    </PageShell>
  );
}

// ── Shared shell ───────────────────────────────────────────────────────────────
function PageShell({
  title,
  count,
  label,
  onBack,
  children,
}: {
  title: string;
  emoji: string;
  gradient: string;
  count: number;
  label: string;
  onBack: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-full bg-white dark:bg-zinc-950 transition-colors duration-300">
      {/* Hero banner */}
      <div className={`px-8 py-10 relative overflow-hidden`}>
        {/* decorative blurred circle */}
        <div className="absolute -top-10 -right-10 w-60 h-60 rounded-full bg-white/5 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-20 w-40 h-40 rounded-full bg-black/20 blur-2xl pointer-events-none" />

        <button
          onClick={onBack}
          className="flex items-center gap-1 text-white/70 hover:text-white mb-6 text-sm"
        >
          <ChevronLeftIcon className="w-4 h-4" />
          Back to Home
        </button>

        <div className="flex items-center gap-4">
          <div>
            <p className="text-white/60 text-sm font-medium uppercase tracking-widest mb-1">
              {label}
            </p>
            <h1 className="text-4xl font-extrabold text-white capitalize drop-shadow">
              {title}
            </h1>
            <p className="text-white/70 text-sm mt-1">
              {count} {count === 1 ? "movie" : "movies"} found
            </p>
          </div>
        </div>
      </div>

      {/* Grid area */}
      <div className="px-6 py-8">
        {count === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-zinc-400">
            <span className="text-5xl">🎬</span>
            <p className="text-lg font-semibold">
              No movies found for this {label}.
            </p>
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
}

// ── Movie grid ─────────────────────────────────────────────────────────────────
function MovieGrid({
  movies,
  watchlist,
  onAddToWatchlist,
  onShowInfo,
}: {
  movies: TraktMovies[];
  watchlist: TraktMovies[];
  onAddToWatchlist: (m: TraktMovies) => void;
  onShowInfo: (m: TraktMovies) => void;
}) {
  return (
    <ul className="grid grid-cols-5 gap-y-6 gap-x-3 list-none p-0 m-0">
      {movies.map((movie) => {
        const isAdded = watchlist.some(
          (w) => w.movie.ids.trakt === movie.movie.ids.trakt,
        );
        return (
          <MovieCard
            key={movie.movie.ids.trakt}
            item={movie}
            isListView={false}
            onAddToWatchlist={onAddToWatchlist}
            isAdded={isAdded}
            handleShowInfo={onShowInfo}
            tooltip={null}
          />
        );
      })}
    </ul>
  );
}
