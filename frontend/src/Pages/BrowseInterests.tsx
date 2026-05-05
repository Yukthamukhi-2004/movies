import { useNavigate } from "react-router-dom";
import type { TraktMovies } from "../types/trakt";
import { useMemo } from "react";

interface BrowseInterestsProps {
  movies: TraktMovies[];
}

// ── Genre config: label, emoji, gradient ─────────────────────────────────────
const GENRE_CONFIG: Record<string, { emoji: string; gradient: string }> = {
  action: { emoji: "💥", gradient: "from-orange-600 via-red-700 to-rose-900" },
  adventure: {
    emoji: "🗺️",
    gradient: "from-emerald-600 via-teal-700 to-cyan-900",
  },
  animation: {
    emoji: "🎨",
    gradient: "from-purple-500 via-violet-600 to-indigo-800",
  },
  comedy: {
    emoji: "😂",
    gradient: "from-yellow-400 via-amber-500 to-orange-700",
  },
  crime: {
    emoji: "🔫",
    gradient: "from-slate-600 via-zinc-700 to-neutral-900",
  },
  documentary: {
    emoji: "🎙️",
    gradient: "from-stone-500 via-neutral-600 to-zinc-800",
  },
  drama: {
    emoji: "🎭",
    gradient: "from-blue-600 via-indigo-700 to-violet-900",
  },
  fantasy: {
    emoji: "🧙",
    gradient: "from-fuchsia-600 via-purple-700 to-indigo-900",
  },
  horror: { emoji: "👻", gradient: "from-red-900 via-rose-950 to-black" },
  mystery: { emoji: "🔍", gradient: "from-cyan-700 via-teal-800 to-slate-900" },
  romance: { emoji: "❤️", gradient: "from-pink-500 via-rose-600 to-red-800" },
  "science-fiction": {
    emoji: "🚀",
    gradient: "from-sky-500 via-blue-700 to-indigo-900",
  },
  thriller: {
    emoji: "🔪",
    gradient: "from-gray-700 via-slate-800 to-zinc-950",
  },
  western: {
    emoji: "🤠",
    gradient: "from-amber-700 via-yellow-800 to-stone-900",
  },
  family: {
    emoji: "👨‍👩‍👧",
    gradient: "from-lime-500 via-green-600 to-emerald-800",
  },
  history: {
    emoji: "🏛️",
    gradient: "from-yellow-700 via-amber-800 to-stone-900",
  },
  music: {
    emoji: "🎵",
    gradient: "from-violet-500 via-purple-600 to-fuchsia-900",
  },
  war: { emoji: "⚔️", gradient: "from-olive-600 via-stone-700 to-neutral-900" },
  anime: { emoji: "⛩️", gradient: "from-red-500 via-pink-600 to-rose-900" },
  musical: {
    emoji: "🎤",
    gradient: "from-pink-400 via-fuchsia-500 to-purple-800",
  },
};

const DEFAULT_GENRE = {
  emoji: "🎬",
  gradient: "from-zinc-600 via-slate-700 to-gray-900",
};

// ── Language config: flag emoji + display name ────────────────────────────────
const LANGUAGE_CONFIG: Record<
  string,
  { flag: string; label: string; gradient: string }
> = {
  en: {
    flag: "🇺🇸",
    label: "English",
    gradient: "from-blue-700 via-blue-800 to-indigo-950",
  },
  hi: {
    flag: "🇮🇳",
    label: "Hindi",
    gradient: "from-orange-500 via-orange-700 to-green-900",
  },
  fr: {
    flag: "🇫🇷",
    label: "French",
    gradient: "from-blue-600 via-white/10 to-red-700",
  },
  es: {
    flag: "🇪🇸",
    label: "Spanish",
    gradient: "from-yellow-500 via-red-600 to-red-900",
  },
  de: {
    flag: "🇩🇪",
    label: "German",
    gradient: "from-gray-800 via-red-700 to-yellow-500",
  },
  it: {
    flag: "🇮🇹",
    label: "Italian",
    gradient: "from-green-700 via-white/10 to-red-700",
  },
  ja: {
    flag: "🇯🇵",
    label: "Japanese",
    gradient: "from-red-600 via-rose-700 to-slate-900",
  },
  ko: {
    flag: "🇰🇷",
    label: "Korean",
    gradient: "from-blue-500 via-red-600 to-slate-900",
  },
  pt: {
    flag: "🇵🇹",
    label: "Portuguese",
    gradient: "from-green-700 via-red-600 to-yellow-700",
  },
  zh: {
    flag: "🇨🇳",
    label: "Chinese",
    gradient: "from-red-600 via-yellow-500 to-red-900",
  },
  ru: {
    flag: "🇷🇺",
    label: "Russian",
    gradient: "from-blue-700 via-blue-800 to-red-800",
  },
  ar: {
    flag: "🇸🇦",
    label: "Arabic",
    gradient: "from-green-700 via-emerald-800 to-slate-900",
  },
};

function BrowseInterests({ movies }: BrowseInterestsProps) {
  const navigate = useNavigate();

  // Derive genres dynamically from movie data
  const availableGenres = useMemo(() => {
    const set = new Set<string>();
    movies.forEach((m) => m.movie.genres?.forEach((g) => set.add(g)));
    return Array.from(set).sort();
  }, [movies]);

  // Derive languages dynamically from movie data
  const availableLanguages = useMemo(() => {
    const set = new Set<string>();
    movies.forEach((m) => {
      if (m.movie.language) set.add(m.movie.language);
    });
    // Only show languages we have config for
    return Array.from(set).filter((l) => LANGUAGE_CONFIG[l]);
  }, [movies]);

  return (
    <section className="px-4 md:px-8 py-10 bg-white dark:bg-black transition-colors duration-300">
      {/* ── Genre Row ───────────────────────────────────────────────────── */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-1.5 h-8 bg-yellow-500 rounded-sm" />
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
            Browse by Genre
          </h3>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-3">
          {availableGenres.map((genre) => {
            const cfg = GENRE_CONFIG[genre] ?? DEFAULT_GENRE;
            const count = movies.filter((m) =>
              m.movie.genres?.includes(genre),
            ).length;

            return (
              <button
                key={genre}
                onClick={() => navigate(`/genre/${encodeURIComponent(genre)}`)}
                className={`
                  group relative overflow-hidden rounded-2xl p-4
                  bg-gradient-to-br ${cfg.gradient}
                  flex flex-col items-center justify-center gap-2
                  min-h-[90px] cursor-pointer
                  border border-white/10
                  shadow-lg hover:shadow-xl
                  transition-all duration-300
                  hover:scale-105 hover:brightness-110
                `}
              >
                {/* Shimmer overlay */}
                <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-tr from-white/10 via-white/5 to-transparent pointer-events-none" />

                <span className="text-2xl drop-shadow-md">{cfg.emoji}</span>
                <span className="text-white text-xs font-bold capitalize text-center leading-tight drop-shadow">
                  {genre.replace(/-/g, " ")}
                </span>
                <span className="text-white/60 text-[10px]">
                  {count} movies
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Language Row ─────────────────────────────────────────────────── */}
      {availableLanguages.length > 0 && (
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1.5 h-8 bg-yellow-500 rounded-sm" />
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              Browse by Language
            </h3>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
            {availableLanguages.map((lang) => {
              const cfg = LANGUAGE_CONFIG[lang];
              const count = movies.filter(
                (m) => m.movie.language === lang,
              ).length;

              return (
                <button
                  key={lang}
                  onClick={() => navigate(`/language/${lang}`)}
                  className={`
                    group relative overflow-hidden rounded-2xl p-4
                    bg-gradient-to-br ${cfg.gradient}
                    flex flex-col items-center justify-center gap-2
                    min-h-[90px] cursor-pointer
                    border border-white/10
                    shadow-lg hover:shadow-xl
                    transition-all duration-300
                    hover:scale-105 hover:brightness-110
                  `}
                >
                  <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-tr from-white/10 via-white/5 to-transparent pointer-events-none" />

                  <span className="text-2xl drop-shadow-md">{cfg.flag}</span>
                  <span className="text-white text-xs font-bold text-center leading-tight drop-shadow">
                    {cfg.label}
                  </span>
                  <span className="text-white/60 text-[10px]">
                    {count} movies
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}

export default BrowseInterests;
export { GENRE_CONFIG, LANGUAGE_CONFIG };
