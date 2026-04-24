import { useMemo } from "react";
import type { TraktMovies } from "../types/trakt";
import { ListBox } from "primereact/listbox";
import { Checkbox } from "primereact/checkbox";
import { Button } from "primereact/button";
import type { FilterOption } from "../components/filters";
import { FILTER_OPTIONS } from "../components/filters";
import { InputNumber } from "primereact/inputnumber";
import "../styles/Filter.css";

interface FilterProps {
  movies: TraktMovies[];
  allMovies: TraktMovies[];
  selectedYear: { min: number; max: number };
  setSelectedYear: React.Dispatch<
    React.SetStateAction<{ min: number; max: number }>
  >;
  clearAllFilters: () => void;
  selectedGenres: { name: string; key: string }[];
  setSelectedGenres: (genres: { name: string; key: string }[]) => void;
  openFilters: boolean;
  setOpenFilters: (open: boolean) => void;
  selectedFilter: FilterOption | null;
  setSelectedFilter: (filter: FilterOption | null) => void;
  ratingRange: { min: number; max: number };
  setRatingRange: React.Dispatch<
    React.SetStateAction<{ min: number; max: number }>
  >;
}

function Filter({
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
  ratingRange,
  setRatingRange,
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

  const hasActiveFilters =
    selectedYear !== null ||
    selectedGenres.length > 0 ||
    ratingRange.min > 0 ||
    ratingRange.max < 10;

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
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <label className="text-xs text-zinc-500 block mb-1">
                    From
                  </label>
                  <InputNumber
                    value={selectedYear.min}
                    onValueChange={(e) =>
                      setSelectedYear({ ...selectedYear, min: e.value ?? 1994 })
                    }
                    showButtons
                    buttonLayout="stacked"
                    incrementButtonIcon="pi pi-angle-up"
                    decrementButtonIcon="pi pi-angle-down"
                    min={selectedYear.min}
                    max={selectedYear.max}
                    useGrouping={false}
                    inputClassName="w-full p-2 border rounded dark:bg-zinc-800 dark:border-zinc-700"
                  />
                </div>

                <span className="mt-6 text-zinc-400">-</span>

                {/* TO BOX */}
                <div className="flex-1">
                  <label className="text-xs text-zinc-500 block mb-1">To</label>
                  <InputNumber
                    value={selectedYear.max}
                    onValueChange={(e) =>
                      setSelectedYear({ ...selectedYear, min: e.value ?? 2026 })
                    }
                    showButtons
                    buttonLayout="stacked"
                    incrementButtonIcon="pi pi-angle-up"
                    decrementButtonIcon="pi pi-angle-down"
                    min={selectedYear.min}
                    max={2026}
                    useGrouping={false}
                    inputClassName="w-full p-2 border rounded dark:bg-zinc-800 dark:border-zinc-700"
                  />
                </div>
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
                <h3 className="font-bold text-zinc-800 dark:text-white mb-4">
                  Rating Range
                </h3>
                <div className="font-semibold text-sm text-zinc-700 dark:text-white">
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <label className="text-xs text-zinc-500 block mb-1">
                        From
                      </label>
                      <InputNumber
                        value={ratingRange.min}
                        onValueChange={(e) =>
                          setRatingRange({ ...ratingRange, min: e.value ?? 0 })
                        }
                        showButtons
                        buttonLayout="stacked"
                        incrementButtonIcon="pi pi-angle-up"
                        decrementButtonIcon="pi pi-angle-down"
                        min={0}
                        max={10} // Prevents "From" being higher than "To"
                        minFractionDigits={1}
                        maxFractionDigits={1}
                        placeholder="0.0"
                        inputClassName="w-full p-2 border rounded dark:bg-zinc-800 dark:border-zinc-700"
                      />
                    </div>

                    <span className="mt-6 text-zinc-400">-</span>

                    {/* TO BOX */}
                    <div className="flex-1">
                      <label className="text-xs text-zinc-500 block mb-1">
                        To
                      </label>
                      <InputNumber
                        value={ratingRange.max}
                        onValueChange={(e) =>
                          setRatingRange({ ...ratingRange, max: e.value ?? 10 })
                        }
                        showButtons
                        buttonLayout="stacked"
                        incrementButtonIcon="pi pi-angle-up"
                        decrementButtonIcon="pi pi-angle-down"
                        min={0}
                        max={10}
                        minFractionDigits={1}
                        maxFractionDigits={1}
                        placeholder="0.0"
                        inputClassName="w-full p-2 border rounded dark:bg-zinc-800 dark:border-zinc-700"
                      />
                    </div>
                  </div>
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

export type { FilterProps };
