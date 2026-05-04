import { useMemo, useRef } from "react";
import type { TraktMovies } from "../types/trakt";
import { ListBox } from "primereact/listbox";
import { Checkbox } from "primereact/checkbox";
import { Button } from "primereact/button";
import { OverlayPanel } from "primereact/overlaypanel";
import type { FilterOption } from "../components/filters";
import { FILTER_OPTIONS } from "../components/filters";
import type { CheckboxChangeEvent } from "primereact/checkbox";
import { InputNumber } from "primereact/inputnumber";
import "primeicons/primeicons.css";
import "../styles/Filters.css";

interface FilterProps {
  movies: TraktMovies[];
  allMovies: TraktMovies[];
  selectedYear: { min: number; max: number };
  hasActiveFilters: boolean;
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
  years: number[];
  results: number;
}

interface YearRangePickerProps {
  years: number[];
  value: { min: number; max: number };
  // Fixed: Added correct Dispatch type
  onChange: React.Dispatch<React.SetStateAction<{ min: number; max: number }>>;
}

function Filter({
  years,
  allMovies,
  selectedYear,
  setSelectedYear,
  clearAllFilters,
  selectedGenres,
  setSelectedGenres,
  openFilters,
  setOpenFilters,
  selectedFilter,
  hasActiveFilters,
  setSelectedFilter,
  ratingRange,
  setRatingRange,
  results,
}: FilterProps) {
  const allGenres = useMemo(() => {
    // 1. Ensure allMovies exists
    if (!allMovies || allMovies.length === 0) return [];

    const genresSet = new Set<string>();

    allMovies.forEach((m) => {
      // 2. Trakt API often nests movie data.
      // Check if genres exist on the root or inside the movie object
      const genres = m.movie?.genres;

      if (Array.isArray(genres)) {
        genres.forEach((g) => genresSet.add(g));
      }
    });

    // 3. Map to your expected object format
    return Array.from(genresSet).map((genre) => ({
      name: genre,
      key: genre.toLowerCase().replace(/\s+/g, "-"), // Better for keys
    }));
  }, [allMovies]);

  const isFilterActive = (code: string) => {
    switch (code) {
      case "Y":
        return (
          selectedYear.min > (years[0] ?? 0) ||
          selectedYear.max < (years[years.length - 1] ?? 2026)
        );
      case "G":
        return selectedGenres.length > 0;
      case "R":
        return ratingRange.min > 0 || ratingRange.max < 10;
      default:
        return false;
    }
  };

  const filterItemTemplate = (option: FilterOption) => {
    const isOpen = selectedFilter?.code === option.code;
    const hasValue = isFilterActive(option.code);
    return (
      <div className="flex items-center justify-between gap-60 w-full">
        <span className="text-lg isOpen ? 'text-yellow-500 font-bold' : ''">
          {option.name}
        </span>
        <div className="flex items-center justify-center">
          <i
            className={`pi ${isOpen ? "pi-minus" : "pi-plus"} 
          ${hasValue ? "text-yellow-500" : "text-zinc-500"} 
          text-[5px] font-bold`}
          />
        </div>
      </div>
    );
  };

  const handleGenreChange = (e: CheckboxChangeEvent) => {
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
      className={`hello h-full w-90 shrink-0 bg-white dark:bg-black border-l border-zinc-200 dark:border-zinc-800 flex-col transition-all z-10 overflow-y-auto ${
        openFilters ? "flex" : "hidden"
      }`}
    >
      <div className="flex justify-between items-center p-4 border-b border-zinc-100 dark:border-zinc-900">
        <h2 className="font-bold dark:text-white">Filters</h2>
        <Button
          icon="pi pi-times"
          unstyled
          pt={{
            root: { className: "bg-white dark:bg-black cursor-pointer" },
            icon: { className: "text-black dark:text-white" },
          }}
          onClick={() => setOpenFilters(false)}
        />
      </div>

      <div className="flex flex-col items-center gap-15 p-4">
        <ListBox
          value={selectedFilter}
          onChange={(e) => {
            if (selectedFilter?.code === e.value?.code) {
              setSelectedFilter(null);
            } else {
              setSelectedFilter(e.value);
            }
          }}
          options={FILTER_OPTIONS}
          optionLabel="name"
          itemTemplate={filterItemTemplate}
          className="w-full overflow-x-visible"
          style={{ maxHeight: "250px" }}
          unstyled={true}
          pt={{
            root: {
              className:
                "bg-white dark:black border border-zinc-200 dark:border-zinc-700 rounded-md overflow-hidden",
            },
            list: { className: "p-0 " },
            item: ({ context }) => ({
              className: [
                "px-4 py-3 cursor-pointer border rounded-sm dark:text-white transition-colors duration-200",
                context.selected
                  ? "bg-white dark:bg-zinc-900 text-yellow-500 dark:text-yellow-500 "
                  : "bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700 dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800",
              ]
                .join(" ")
                .trim(),
            }),
          }}
        />

        <div className="min-w-75 h-100 p-4 ">
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
                : "overflow-y-auto max-h-[40vh]"
            }`}
          >
            {selectedFilter?.code === "Y" && (
              <YearRangePicker
                years={years}
                value={selectedYear}
                onChange={setSelectedYear}
              />
            )}

            {selectedFilter?.code === "G" && (
              <div className="p-4">
                <h3 className="font-bold mb-2 text-zinc-800 dark:text-white">
                  Select Genres
                </h3>

                {allGenres && allGenres.length > 0 ? (
                  allGenres.map((genre) => (
                    <div
                      key={genre.key}
                      className="flex items-center gap-3 py-1"
                    >
                      <Checkbox
                        inputId={genre.key}
                        value={genre}
                        onChange={handleGenreChange}
                        pt={{
                          box: ({ context }) => ({
                            className: context.checked
                              ? "!bg-yellow-500 !border-yellow-500"
                              : "bg-white dark:!bg-zinc-900 border-zinc-300",
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
                  ))
                ) : (
                  <p className="text-zinc-500 text-xs italic">
                    No genres found...
                  </p>
                )}
              </div>
            )}

            {selectedFilter?.code === "R" && (
              <div className="p-4">
                <h3 className="font-bold text-zinc-800 dark:text-white mb-4">
                  Rating Range
                </h3>
                <div className="font-semibold text-md text-zinc-700 dark:text-white">
                  <div className="flex items-center gap-3">
                    <div className="flex-1 ">
                      <label className="text-md text-zinc-400 block mb-1">
                        From
                      </label>
                      <InputNumber
                        value={ratingRange.min}
                        onValueChange={(e) =>
                          setRatingRange({
                            ...ratingRange,
                            min: e.value ?? 0,
                          })
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
                        inputClassName="w-14 p-2 border box-shadow-zinc-500 rounded dark:bg-zinc-800 dark:border-zinc-700"
                      />
                    </div>

                    <span className="mt-6 text-zinc-400">-</span>

                    {/* TO BOX */}
                    <div className="flex-1">
                      <label className="text-md text-zinc-400 block mb-1">
                        To
                      </label>
                      <InputNumber
                        value={ratingRange.max}
                        onValueChange={(e) =>
                          setRatingRange({
                            ...ratingRange,
                            max: e.value ?? 10,
                          })
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
                        inputClassName="w-14 p-2 border  box-shadow-zinc-500  rounded dark:bg-zinc-800 dark:border-zinc-700"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {hasActiveFilters && (
          <div className="m-auto pt-6 flex flex-col gap-4">
            <Button
              label="Done"
              onClick={() => setOpenFilters(false)}
              unstyled
              pt={{
                root: { className: "text-yellow-500 cursor-pointer" },
              }}
            />

            <span>
              {results} {results === 1 ? "movie" : "movies"} found
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

function YearPicker({
  label,
  years,
  selected,
  onSelect,
}: {
  label: string;
  years: number[];
  selected: number;
  onSelect: (y: number) => void;
}) {
  const op = useRef<OverlayPanel>(null);
  const anchorRef = useRef<HTMLButtonElement>(null);

  const openBelow = (e: React.MouseEvent) => {
    if (!op.current || !anchorRef.current) return;
    op.current.toggle(e);

    const rect = anchorRef.current.getBoundingClientRect();
    requestAnimationFrame(() => {
      const panel = document.querySelector(
        ".year-overlay .p-overlaypanel",
      ) as HTMLElement;
      if (panel) {
        panel.style.top = `${rect.bottom + window.scrollY + 4}px`;
        panel.style.left = `${rect.bottom + window.scrollX + rect.width / 2 - 40}px`;
      }
    });
  };

  return (
    <div className="flex flex-col">
      <label className="text-md text-zinc-500 mb-1">{label}</label>
      <button
        ref={anchorRef}
        onClick={openBelow}
        className="p-2 border rounded dark:bg-zinc-900 dark:border-zinc-700 text-md min-w-[150px]"
      >
        {selected}
      </button>
      <OverlayPanel ref={op} className="year-picker-panel">
        <div className="flex flex-col p-2 max-h-60 bg-zinc-100 dark:bg-zinc-900 overflow-y-auto">
          {years.map((y) => (
            <button
              key={y}
              onClick={() => {
                onSelect(y);
              }}
              className={`p-2 text-md rounded ${selected === y ? "text-yellow-400" : "hover:text-yellow-600 "}`}
            >
              {y}
            </button>
          ))}
        </div>
      </OverlayPanel>
    </div>
  );
}

function YearRangePicker({ years, value, onChange }: YearRangePickerProps) {
  return (
    <div className="flex items-end gap-2 mb-8">
      <YearPicker
        label="From"
        years={years}
        selected={value.min}
        onSelect={(y) => onChange((prev) => ({ ...prev, min: y }))}
      />
      <span className="text-zinc-500 pb-2.5 text-sm">—</span>
      <YearPicker
        label="To"
        years={years}
        selected={value.max}
        onSelect={(y) => onChange((prev) => ({ ...prev, max: y }))}
      />
    </div>
  );
}

export default Filter;
export type { FilterProps };
