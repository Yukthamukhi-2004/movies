import { useMemo } from "react";
import type { TraktMovies } from "../types/trakt";
import { ListBox } from "primereact/listbox";
import { Checkbox } from "primereact/checkbox";
import { Slider } from "primereact/slider";
import { debounce } from "lodash";
import { Button } from "primereact/button";
import type { FilterOption } from "../components/filters";
import { FILTER_OPTIONS } from "../components/filters";
import "../styles/Filter.css";

interface FilterProps {
  movies: TraktMovies[];
  allMovies: TraktMovies[];
  selectedYear: number | null;
  setSelectedYear: (year: number | null) => void;
  clearAllFilters: () => void;
  selectedGenres: { name: string; key: string }[];
  setSelectedGenres: (genres: { name: string; key: string }[]) => void;
  openFilters: boolean;
  setOpenFilters: (open: boolean) => void;
  selectedFilter: FilterOption | null;
  setSelectedFilter: (filter: FilterOption | null) => void;
  ratingThreshold: number;
  setRatingThreshold: (rating: number) => void;
  debouncedRating: number;
  setDebouncedRating: (rating: number) => void;
}

interface YearsListProps {
  movies: TraktMovies[];
  onYearChange: (year: number | null) => void;
  selectedYear: number | null;
}

function Filter({
  movies,
  allMovies,
  selectedYear,
  setSelectedYear,
  clearAllFilters,
  selectedGenres,
  setSelectedGenres,
  openFilters,
  setOpenFilters,
  selectedFilter,
  setSelectedFilter,
  setRatingThreshold,
  debouncedRating,
  setDebouncedRating,
  ratingThreshold,
}: FilterProps) {
  const allGenres = useMemo(() => {
    const genresSet = new Set(
      allMovies
        .filter((m) => m.movie && m.movie?.genres)
        .flatMap((m) => m.movie.genres),
    );
    return Array.from(genresSet).map((genre) => ({
      name: genre,
      key: genre,
    }));
  }, [allMovies]);

  const updateDebouncedRating = useMemo(
    () => debounce((val: number) => setDebouncedRating(val), 300),
    [setDebouncedRating],
  );

  const hasActiveFilters =
    selectedYear !== null || selectedGenres.length > 0 || ratingThreshold > 0;

  const handleRatingChange = (e: any) => {
    const newValue = e.value;
    setRatingThreshold(newValue);
    updateDebouncedRating(newValue);
  };

  const handleGenreChange = (e: {
    value: { name: string; key: string };
    checked: boolean;
  }) => {
    let _selectedGenres = [...selectedGenres];
    if (e.checked) {
      _selectedGenres.push(e.value);
    } else {
      _selectedGenres = _selectedGenres.filter(
        (category) => category.key !== e.value.key,
      );
    }
    setSelectedGenres(_selectedGenres);
  };

  // NO early return, NO openFilters && wrapper — just hidden/flex on the div
  return (
    <div
      className={`h-full w-80 shrink-0 bg-white dark:bg-black border-l border-zinc-200 dark:border-zinc-800 flex-col transition-all z-10 overflow-y-auto ${
        openFilters ? "flex" : "hidden"
      }`}
    >
      <div className="flex justify-between items-center p-4 border-b border-zinc-100 dark:border-zinc-900">
        <h2 className="font-bold dark:text-white">Filters</h2>
        <Button
          icon="pi pi-times"
          unstyled
          pt={{
            root: { className: "bg-white dark:bg-black" },
            icon: { className: "text-black dark:text-white" },
          }}
          onClick={() => setOpenFilters(false)}
        />
      </div>

      <div className="flex flex-col items-center gap-8 p-4">
        <ListBox
          value={selectedFilter}
          onChange={(e) => setSelectedFilter(e.value)}
          options={FILTER_OPTIONS}
          optionLabel="name"
          className="w-full"
          style={{ maxHeight: "250px" }}
          pt={{
            root: {
              className:
                "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-md",
            },
            list: { className: "p-0 m-0" },
            item: ({ context }) => ({
              className: [
                "px-4 py-2 cursor-pointer rounded-sm dark:text-white",
                context.selected ? "font-semibold" : "",
              ]
                .join(" ")
                .trim(),
            }),
          }}
        />

        <div className="w-60 h-auto p-4">
          {hasActiveFilters && (
            <div className="flex justify-end w-full pr-4">
              <Button
                label="Clear All"
                onClick={clearAllFilters}
                unstyled
                pt={{
                  root: { className: "text-yellow-500 cursor-pointer" },
                }}
              />
            </div>
          )}

          <div
            className={`rounded-md mt-2 ${
              selectedFilter?.code === "R"
                ? "overflow-hidden"
                : "overflow-y-auto max-h-[50vh]"
            }`}
          >
            {selectedFilter?.code === "Y" && (
              <div className="pl-6">
                <h3 className="block font-bold mb-3 text-xl text-zinc-400 pl-8 uppercase tracking-wider">
                  Select Year
                </h3>
                <YearsList
                  movies={allMovies}
                  onYearChange={(year) => setSelectedYear(year)}
                  selectedYear={selectedYear}
                />
              </div>
            )}

            {selectedFilter?.code === "G" && (
              <div className="p-4">
                <h3 className="font-bold mb-2 text-zinc-800 dark:text-white">
                  Select Genres
                </h3>
                {allGenres.map((genre) => (
                  <div key={genre.key} className="flex items-center gap-2 py-1">
                    <Checkbox
                      inputId={genre.key}
                      value={genre}
                      onChange={handleGenreChange}
                      pt={{
                        box: ({ context }) => ({
                          className: context.checked
                            ? "bg-yellow-500 border-yellow-600"
                            : "bg-white dark:bg-zinc-900 border-zinc-300",
                        }),
                        icon: { className: "text-white text-xs" },
                      }}
                      checked={selectedGenres.some(
                        (item) => item.key === genre.key,
                      )}
                    />
                    <label
                      htmlFor={genre.key}
                      className={`text-sm capitalize cursor-pointer transition-colors duration-150 ${
                        selectedGenres.some((item) => item.key === genre.key)
                          ? "text-yellow-500 dark:text-yellow-400 font-semibold"
                          : "text-zinc-800 dark:text-zinc-200"
                      }`}
                    >
                      {genre.name}
                    </label>
                  </div>
                ))}
              </div>
            )}

            {selectedFilter?.code === "R" && (
              <div className="p-4">
                <h3 className="font-bold text-zinc-800 dark:text-white">
                  Rating Filter
                </h3>
                <div className="font-semibold text-sm text-zinc-700 dark:text-white">
                  <span className="font-semibold text-sm">
                    Minimum rating: {ratingThreshold}
                  </span>
                  <Slider
                    value={ratingThreshold}
                    onChange={handleRatingChange}
                    pt={{
                      handle: {
                        className:
                          "bg-yellow-500 border-2 border-yellow-600 w-3 h-3 rounded-full cursor-pointer hover:bg-yellow-600 transition-colors",
                      },
                      range: {
                        className: "bg-yellow-400 h-full absolute rounded-full",
                      },
                      root: {
                        className:
                          "mt-5 mb-10 bg-zinc-200 dark:bg-zinc-800 rounded-full h-2 relative",
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

        {hasActiveFilters && (
          <div className="mt-auto pt-6">
            <Button
              label="Done"
              onClick={() => setOpenFilters(false)}
              unstyled
              pt={{
                root: { className: "text-yellow-500 cursor-pointer" },
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default Filter;

function YearsList({ movies, onYearChange, selectedYear }: YearsListProps) {
  const uniqueYears = useMemo(() => {
    if (!movies || movies.length === 0) return [];
    const years = movies
      .map(
        (m) =>
          m.movie.year ||
          (m.movie.released ? new Date(m.movie.released).getFullYear() : null),
      )
      .filter((year): year is number => year !== null && year !== undefined);
    return [...new Set(years)].sort((a, b) => b - a);
  }, [movies]);

  return (
    <div className="bg-white dark:bg-black transition-colors duration-300">
      <div className="p-3">
        <ListBox
          value={selectedYear}
          onChange={(e) => onYearChange(e.value)}
          options={uniqueYears}
          className="w-full overflow-y-auto border-none shadow-none"
          pt={{
            root: { className: "bg-transparent border-none shadow-none" },
            wrapper: { className: "bg-transparent dark:bg-zinc-900" },
            item: ({ context }) => ({
              className: [
                "p-3 text-center transition-colors duration-150 cursor-pointer rounded-sm",
                context.selected
                  ? "bg-transparent text-yellow-500 dark:text-yellow-400 font-bold text-lg"
                  : "text-zinc-800 dark:text-zinc-200 hover:text-yellow-500 dark:hover:text-yellow-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 bg-transparent",
              ].join(" "),
            }),
          }}
        />
      </div>
    </div>
  );
}

export type { FilterProps };
