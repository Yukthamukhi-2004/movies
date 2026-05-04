import type { MoviePick } from "./TonightPage";
import type { TraktMovies } from "../types/trakt";

interface TonightCardProps {
  pick: MoviePick;
  rank: number;
  movieData: TraktMovies | null;
  isAdded: boolean;
  onAddToWatchlist: () => void;
}

const RANK_LABELS = ["Best Match", "Great Pick", "Also Perfect"];
const RANK_COLORS = [
  "bg-yellow-400 text-black",
  "bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-200",
  "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400",
];

export default function TonightCard({
  pick,
  rank,
  movieData,
  isAdded,
  onAddToWatchlist,
}: TonightCardProps) {
  const movie = movieData?.movie;
  const genres = movie?.genres?.slice(0, 3) ?? [];
  const rating = movie?.rating ? movie.rating.toFixed(1) : null;
  const runtime = pick.runtime || movie?.runtime;

  const posterPath =
    movieData?.movie?.images?.poster?.[0] ||
    movieData?.movie?.images?.thumb?.[0];
  const posterUrl = posterPath ? `https://${posterPath}` : "";

  return (
    <div
      className={`
        relative rounded-2xl border overflow-hidden w-full px-4
        transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5
        bg-white dark:bg-zinc-900
        ${
          rank === 1
            ? "border-yellow-400 shadow-yellow-400/20 shadow-md"
            : "border-zinc-200 dark:border-zinc-700"
        }
      `}
    >
      {/* Poster Image */}
      {posterUrl && (
        <div className="w-full h-70 overflow-hidden">
          <img
            src={posterUrl}
            alt={pick.title}
            className="w-full h-full object-contain"
          />
        </div>
      )}

      {/* Top ribbon */}
      <div className="flex items-center justify-between px-4 pt-4 pb-0">
        <span
          className={`text-xs font-black px-2.5 py-1 rounded-full tracking-wide ${RANK_COLORS[rank - 1]}`}
        >
          #{rank} {RANK_LABELS[rank - 1]}
        </span>
        <span className="text-base">{pick.moodTag}</span>
      </div>

      <div className="p-4">
        {/* Title row */}
        <div className="flex items-start justify-between gap-3 mb-1">
          <div>
            <h3 className="text-lg font-black text-zinc-900 dark:text-white leading-tight">
              {pick.title}
            </h3>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className="text-xs text-zinc-400">{pick.year}</span>
              {runtime && (
                <>
                  <span className="text-zinc-300 dark:text-zinc-600">·</span>
                  <span className="text-xs text-zinc-400">{runtime} min</span>
                </>
              )}
              {rating && (
                <>
                  <span className="text-zinc-300 dark:text-zinc-600">·</span>
                  <span className="text-xs text-yellow-500 font-bold">
                    ★ {rating}
                  </span>
                </>
              )}
              {movie?.certification && (
                <>
                  <span className="text-zinc-300 dark:text-zinc-600">·</span>
                  <span className="text-xs border border-zinc-300 dark:border-zinc-600 text-zinc-500 px-1.5 py-0.5 rounded">
                    {movie.certification}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Genre pills */}
        {genres.length > 0 && (
          <div className="flex gap-1.5 mb-3 flex-wrap">
            {genres.map((g) => (
              <span
                key={g}
                className="text-md bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 px-2 py-0.5 rounded-full capitalize"
              >
                {g}
              </span>
            ))}
          </div>
        )}

        {/* Divider */}
        <div className="border-t border-zinc-100 dark:border-zinc-800 my-3" />

        {/* AI reason */}
        <div className="mb-3">
          <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
            {pick.whyTonight}
          </p>
        </div>

        {/* "Perfect for" callout */}
        <div
          className={`
          rounded-xl px-3 py-2.5 mb-4
          ${
            rank === 1
              ? "bg-yellow-400/10 border border-yellow-400/30"
              : "bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700"
          }
        `}
        >
          <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-0.5 uppercase tracking-wide">
            Perfect for
          </p>
          <p
            className={`text-sm font-medium italic ${rank === 1 ? "text-yellow-600 dark:text-yellow-400" : "text-zinc-700 dark:text-zinc-300"}`}
          >
            "{pick.perfectFor}"
          </p>
        </div>

        {/* CTA */}
        <button
          onClick={onAddToWatchlist}
          disabled={isAdded}
          className={`
            w-full py-2.5 rounded-xl text-sm font-bold transition-all duration-200
            ${
              isAdded
                ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-400 cursor-default"
                : rank === 1
                  ? "bg-yellow-400 text-black hover:bg-yellow-300 cursor-pointer"
                  : "border-2 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:border-yellow-400 hover:text-yellow-500 cursor-pointer"
            }
          `}
        >
          {isAdded ? "✓ Already in Watchlist" : "+ Add to Watchlist"}
        </button>
      </div>
    </div>
  );
}
