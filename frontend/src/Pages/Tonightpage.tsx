import { useState } from "react";
import type { TraktMovies } from "../types/trakt";
import TonightCard from "./Tonightcard.tsx";

// ─── Types ────────────────────────────────────────────────────────────────────

interface TonightInputs {
  timeAvailable: string; // "under 90 min" | "90-120 min" | "2-3 hours" | "all night"
  energyLevel: string; // "exhausted" | "relaxed" | "alert" | "pumped"
  mood: string; // "feel-good" | "thrilling" | "thoughtful" | "funny" | "emotional"
  company: string; // "solo" | "partner" | "friends" | "family" | "kids"
  avoidGenres: string[]; // freeform multi-pick from available genres
}

export interface MoviePick {
  traktId: number;
  title: string;
  year: number;
  whyTonight: string; // AI's personalised reason (1-2 sentences)
  perfectFor: string; // e.g. "When you're too tired to think but want to smile"
  moodTag: string; // single emoji + word e.g. "😂 Silly"
  runtime: number;
}

interface TonightPageProps {
  movies: TraktMovies[];
  onAddToWatchlist: (movie: TraktMovies) => void;
  watchlist: TraktMovies[];
}

// ─── Option configs ───────────────────────────────────────────────────────────

const TIME_OPTIONS = [
  { value: "under90", label: "Under 90 min", icon: "⚡", sub: "Quick watch" },
  { value: "90to120", label: "90 – 120 min", icon: "🎬", sub: "Standard film" },
  { value: "2to3hrs", label: "2 – 3 hours", icon: "🍿", sub: "Epic territory" },
  { value: "allnight", label: "All night", icon: "🌙", sub: "No limits" },
];

const ENERGY_OPTIONS = [
  {
    value: "exhausted",
    label: "Exhausted",
    icon: "😴",
    sub: "Half asleep already",
  },
  { value: "relaxed", label: "Relaxed", icon: "🛋️", sub: "Comfortably zoned" },
  { value: "alert", label: "Alert", icon: "👀", sub: "Fully engaged" },
  {
    value: "pumped",
    label: "Pumped",
    icon: "⚡",
    sub: "Need to match the energy",
  },
];

const MOOD_OPTIONS = [
  {
    value: "feel-good",
    label: "Feel Good",
    icon: "☀️",
    sub: "Warm & uplifting",
  },
  {
    value: "thrilling",
    label: "Thrilling",
    icon: "🎢",
    sub: "Edge of your seat",
  },
  {
    value: "thoughtful",
    label: "Thoughtful",
    icon: "🧠",
    sub: "Make me think",
  },
  { value: "funny", label: "Funny", icon: "😂", sub: "I need to laugh" },
  {
    value: "emotional",
    label: "Emotional",
    icon: "💧",
    sub: "I want to feel things",
  },
  { value: "action", label: "Action", icon: "💥", sub: "Explosions welcome" },
];

const COMPANY_OPTIONS = [
  { value: "solo", label: "Just me", icon: "🎧", sub: "My choice, my rules" },
  { value: "partner", label: "Partner", icon: "❤️", sub: "Date night vibes" },
  { value: "friends", label: "Friends", icon: "🍻", sub: "Group energy" },
  { value: "family", label: "Family", icon: "🏠", sub: "All ages welcome" },
  { value: "kids", label: "With kids", icon: "🧒", sub: "Kid-friendly only" },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function OptionButton({
  selected,
  onClick,
  icon,
  label,
  sub,
}: {
  selected: boolean;
  onClick: () => void;
  icon: string;
  label: string;
  sub: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`
        group relative flex flex-col items-start gap-1 p-4 rounded-xl border-2 text-left
        transition-all duration-200 cursor-pointer
        ${
          selected
            ? "border-yellow-400 bg-yellow-400/10 dark:bg-yellow-400/10"
            : "border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:border-zinc-400 dark:hover:border-zinc-500"
        }
      `}
    >
      <span className="text-2xl">{icon}</span>
      <span
        className={`text-lg font-bold tracking-tight ${selected ? "text-yellow-500" : "text-zinc-800 dark:text-white"}`}
      >
        {label}
      </span>
      <span className="text-md text-zinc-400">{sub}</span>
      {selected && (
        <span className="absolute top-2 right-2 w-3.5 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
          <svg
            className="w-2.5 h-2.5 text-black"
            fill="currentColor"
            viewBox="0 0 12 12"
          >
            <path
              d="M10 3L5 8.5 2 5.5"
              stroke="currentColor"
              strokeWidth="1.8"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      )}
    </button>
  );
}

function StepHeader({
  step,
  total,
  title,
  subtitle,
}: {
  step: number;
  total: number;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-4 mb-2">
        <span className="text-lg font-bold tracking-widest text-yellow-500 uppercase">
          Step {step} of {total}
        </span>
        <div className="flex gap-2">
          {Array.from({ length: total }).map((_, i) => (
            <div
              key={i}
              className={`h-2 rounded-full transition-all duration-300 ${
                i < step
                  ? "w-6 bg-yellow-400"
                  : "w-4 bg-zinc-200 dark:bg-zinc-700"
              }`}
            />
          ))}
        </div>
      </div>
      <h2 className="text-xl font-black text-zinc-900 dark:text-white">
        {title}
      </h2>
      <p className="text-md text-zinc-400 mt-0.5">{subtitle}</p>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function TonightPage({
  movies,
  onAddToWatchlist,
  watchlist,
}: TonightPageProps) {
  const [step, setStep] = useState(1);
  const [inputs, setInputs] = useState<TonightInputs>({
    timeAvailable: "",
    energyLevel: "",
    mood: "",
    company: "",
    avoidGenres: [],
  });
  const [picks, setPicks] = useState<MoviePick[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const TOTAL_STEPS = 4;

  // Derive all genres from loaded movies
  const allGenres = Array.from(
    new Set(movies.flatMap((m) => m.movie?.genres ?? [])),
  ).sort();

  function set<K extends keyof TonightInputs>(key: K, value: TonightInputs[K]) {
    setInputs((prev) => ({ ...prev, [key]: value }));
  }

  function toggleAvoidGenre(genre: string) {
    setInputs((prev) => ({
      ...prev,
      avoidGenres: prev.avoidGenres.includes(genre)
        ? prev.avoidGenres.filter((g) => g !== genre)
        : [...prev.avoidGenres, genre],
    }));
  }

  const canAdvance = () => {
    if (step === 1) return !!inputs.timeAvailable;
    if (step === 2) return !!inputs.energyLevel;
    if (step === 3) return !!inputs.mood;
    if (step === 4) return !!inputs.company;
    return false;
  };

  // ── Build the AI prompt from movies + user inputs ──────────────────────────
  async function getShortlist() {
    setLoading(true);
    setError(null);
    setPicks([]);

    // Pass movie metadata — cap at 100 so prompt stays manageable
    const movieData = movies.slice(0, 100).map((m) => ({
      traktId: m.movie.ids.trakt,
      title: m.movie.title,
      year: m.movie.year,
      genres: m.movie.genres ?? [],
      /* rating: m.movie.rating,
      runtime: m.movie.runtime,
      overview: m.movie.overview?.slice(0, 200),
      certification: m.movie.certification, */
    }));

    const timeLabel =
      TIME_OPTIONS.find((o) => o.value === inputs.timeAvailable)?.label ??
      inputs.timeAvailable;
    const energyLabel =
      ENERGY_OPTIONS.find((o) => o.value === inputs.energyLevel)?.label ??
      inputs.energyLevel;
    const moodLabel =
      MOOD_OPTIONS.find((o) => o.value === inputs.mood)?.label ?? inputs.mood;
    const companyLabel =
      COMPANY_OPTIONS.find((o) => o.value === inputs.company)?.label ??
      inputs.company;

    const prompt = `You are a brilliant film curator. Given a user's current situation and a list of available trending movies, pick exactly 3 movies that are the PERFECT match for tonight.

USER'S SITUATION:
- Time available: ${timeLabel}
- Energy level: ${energyLabel}
- Mood: ${moodLabel}  
- Watching with: ${companyLabel}
- Genres to avoid: ${inputs.avoidGenres.length > 0 ? inputs.avoidGenres.join(", ") : "none"}

AVAILABLE MOVIES (from their trending list):
${JSON.stringify(movieData, null, 2)}

RULES:
1. Pick EXACTLY 3 movies from the list above (use the traktId exactly as provided)
2. Match time constraints — if user has "under 90 min", pick movies with runtime ≤ 90 (or unknown runtime is ok)
3. Avoid genres the user listed
4. Consider energy — exhausted users need easy-to-follow plots, pumped users can handle complex ones
5. Consider company — kids present means family-friendly, partner means potentially romantic, friends means crowd-pleasing
6. Write "whyTonight" as if talking directly to the user — warm, specific, no generic descriptions
7. "perfectFor" should be a relatable human situation like "When your brain is mush but your heart wants a story"
8. "moodTag" = one emoji + one word describing the emotional flavor e.g. "😂 Silly" or "🔥 Intense"

Respond ONLY with valid JSON — no markdown, no backticks, no explanation:
{
  "picks": [
    {
      "traktId": 123,
      "title": "Movie Title",
      "year": 2023,
      "whyTonight": "...",
      "perfectFor": "...",
      "moodTag": "😂 Silly",
      "runtime": 95
    }
  ]
}`;

    try {
      const res = await fetch("http://localhost:3001/api/shortlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mood: `${moodLabel} | Energy: ${energyLabel}`,
          genre:
            inputs.avoidGenres.length > 0
              ? `avoid: ${inputs.avoidGenres.join(", ")}`
              : "any",
          company: companyLabel,
          time: timeLabel,
          // also send full prompt and movieData for backend to use
          prompt,
          movieData,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Server error");
      }

      // ✅ Safe parsing
      const data = await res.json();
      if (!data.picks || data.picks.length === 0) {
        throw new Error("No picks returned");
      }

      setPicks(data.picks);
    } catch (err) {
      console.error(err);
      setError("Couldn't build your shortlist. Try again!");
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setStep(1);
    setInputs({
      timeAvailable: "",
      energyLevel: "",
      mood: "",
      company: "",
      avoidGenres: [],
    });
    setPicks([]);
    setError(null);
  }

  // ─── Results view ───────────────────────────────────────────────────────────
  if (picks.length > 0) {
    return (
      <div className="yuktha min-h-full  bg-white dark:bg-black items-center px-5 py-4 max-w-full ">
        <div className="mb-8 text-center">
          <div className="text-4xl mb-2">🎬</div>
          <h1 className="text-2xl font-black text-zinc-900 dark:text-white mb-1">
            Tonight's Shortlist
          </h1>
          <p className="text-md text-zinc-300">
            3 picks, curated for right now. No more scrolling.
          </p>

          {/* User's situation summary pills */}
          <div className="flex flex-wrap gap-2 justify-center mt-4">
            {[
              TIME_OPTIONS.find((o) => o.value === inputs.timeAvailable),
              ENERGY_OPTIONS.find((o) => o.value === inputs.energyLevel),
              MOOD_OPTIONS.find((o) => o.value === inputs.mood),
              COMPANY_OPTIONS.find((o) => o.value === inputs.company),
            ].map(
              (opt, i) =>
                opt && (
                  <span
                    key={i}
                    className="text-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 px-3 py-1 rounded-full"
                  >
                    {opt.icon} {opt.label}
                  </span>
                ),
            )}
          </div>
        </div>

        <div className="flex flex-row gap-5">
          {picks.map((pick, i) => {
            const movieData = movies.find(
              (m) => m.movie.ids.trakt === pick.traktId,
            );
            const isAdded = watchlist.some(
              (w) => w.movie.ids.trakt === pick.traktId,
            );
            return (
              <TonightCard
                key={pick.traktId}
                pick={pick}
                rank={i + 1}
                movieData={movieData ?? null}
                isAdded={isAdded}
                onAddToWatchlist={() =>
                  movieData && onAddToWatchlist(movieData)
                }
              />
            );
          })}
        </div>

        <button
          onClick={reset}
          className="mt-8 w-full py-3 rounded-xl border-2 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 text-sm font-semibold hover:border-yellow-400 hover:text-yellow-500 transition-all duration-200"
        >
          ↩ Start over with different answers
        </button>
      </div>
    );
  }

  // ─── Loading view ───────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-full flex flex-col items-center justify-center bg-white dark:bg-black gap-6 px-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-4 border-zinc-200 dark:border-zinc-700 border-t-yellow-400 animate-spin" />
          <span className="absolute inset-0 flex items-center justify-center text-2xl">
            🎬
          </span>
        </div>
        <div className="text-center">
          <p className="text-lg font-black text-zinc-900 dark:text-white">
            Curating your shortlist…
          </p>
          <p className="text-sm text-zinc-500 mt-1">
            Filtering through trending movies for the perfect 3
          </p>
        </div>
        <div className="flex gap-1 mt-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-yellow-400 animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    );
  }

  // ─── Step wizard ────────────────────────────────────────────────────────────
  return (
    <div className=" hello min-h-full bg-white dark:bg-black px-4 py-8 mx-auto">
      {/* Header */}
      <div className="mb-8 text-center">
        <span className="text-5xl">🌙</span>
        <h1 className="text-2xl font-black text-zinc-900 dark:text-white mt-2">
          Tonight Only
        </h1>
        <p className="text-sm text-zinc-500 mt-1">
          Answer 4 quick questions. Get exactly 3 perfect picks.
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm text-center">
          {error}
        </div>
      )}

      {/* Step 1 — Time */}
      {step === 1 && (
        <div>
          <StepHeader
            step={1}
            total={TOTAL_STEPS}
            title="How much time do you have?"
            subtitle="Be honest — no judgment"
          />
          <div className="grid grid-cols-2 gap-3">
            {TIME_OPTIONS.map((opt) => (
              <OptionButton
                key={opt.value}
                selected={inputs.timeAvailable === opt.value}
                onClick={() => set("timeAvailable", opt.value)}
                {...opt}
              />
            ))}
          </div>
        </div>
      )}

      {/* Step 2 — Energy */}
      {step === 2 && (
        <div>
          <StepHeader
            step={2}
            total={TOTAL_STEPS}
            title="What's your energy level?"
            subtitle="How much brain power can you give?"
          />
          <div className="grid grid-cols-2 gap-3">
            {ENERGY_OPTIONS.map((opt) => (
              <OptionButton
                key={opt.value}
                selected={inputs.energyLevel === opt.value}
                onClick={() => set("energyLevel", opt.value)}
                {...opt}
              />
            ))}
          </div>
        </div>
      )}

      {/* Step 3 — Mood */}
      {step === 3 && (
        <div>
          <StepHeader
            step={3}
            total={TOTAL_STEPS}
            title="What mood are you in?"
            subtitle="What do you want to feel during the movie?"
          />
          <div className="grid grid-cols-2 gap-3">
            {MOOD_OPTIONS.map((opt) => (
              <OptionButton
                key={opt.value}
                selected={inputs.mood === opt.value}
                onClick={() => set("mood", opt.value)}
                {...opt}
              />
            ))}
          </div>
        </div>
      )}

      {/* Step 4 — Company + avoid genres */}
      {step === 4 && (
        <div>
          <StepHeader
            step={4}
            total={TOTAL_STEPS}
            title="Who's watching with you?"
            subtitle="This shapes everything about the pick"
          />
          <div className="grid grid-cols-2 gap-3 mb-6">
            {COMPANY_OPTIONS.map((opt) => (
              <OptionButton
                key={opt.value}
                selected={inputs.company === opt.value}
                onClick={() => set("company", opt.value)}
                {...opt}
              />
            ))}
          </div>

          {allGenres.length > 0 && (
            <div>
              <p className="text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-2">
                Anything to avoid tonight?{" "}
                <span className="font-normal text-zinc-400">(optional)</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {allGenres.map((genre) => (
                  <button
                    key={genre}
                    onClick={() => toggleAvoidGenre(genre)}
                    className={`text-xs px-3 py-1.5 rounded-full border transition-all duration-150 capitalize cursor-pointer ${
                      inputs.avoidGenres.includes(genre)
                        ? "bg-red-500/10 border-red-400 text-red-500 line-through"
                        : "border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-zinc-400"
                    }`}
                  >
                    {inputs.avoidGenres.includes(genre) ? "✕ " : ""}
                    {genre}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Navigation */}
      <div className="flex gap-4 mt-10">
        {step > 1 && (
          <button
            onClick={() => setStep((s) => s - 1)}
            className="flex-1 py-3 rounded-xl border-2 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 font-semibold text-md hover:border-zinc-400 transition-all duration-200"
          >
            ← Back
          </button>
        )}

        {step < TOTAL_STEPS ? (
          <button
            onClick={() => setStep((s) => s + 1)}
            disabled={!canAdvance()}
            className={`flex-1 py-3 rounded-xl font-bold text-md transition-all duration-200 ${
              canAdvance()
                ? "bg-yellow-400 text-black hover:bg-yellow-300 cursor-pointer"
                : "bg-zinc-100 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed"
            }`}
          >
            Next →
          </button>
        ) : (
          <button
            onClick={getShortlist}
            disabled={!canAdvance()}
            className={`flex-1 py-3 rounded-xl font-bold text-md transition-all duration-200 ${
              canAdvance()
                ? "bg-yellow-400 text-black hover:bg-yellow-300 cursor-pointer"
                : "bg-zinc-100 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed"
            }`}
          >
            🎬 Find my 3 picks
          </button>
        )}
      </div>
    </div>
  );
}
