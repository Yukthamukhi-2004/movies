  
  import React from "react";
import { Button } from "primereact/button";
import { ListBox } from "primereact/listbox";
import { Checkbox } from "primereact/checkbox";
import { Slider } from "primereact/slider";

import YearsList from "./YearsList.tsx";

interface SidebarProps {
  movies: any[];
  filters: { name: string; code: string }[];
  selectedFilter: { name: string; code: string } | null;
  setSelectedFilter: React.Dispatch<
    React.SetStateAction<{ name: string; code: string } | null>
  >;
  allGenres: { key: string; name: string }[];
  selectedGenres: { key: string; name: string }[];
  setSelectedGenres: React.Dispatch<
    React.SetStateAction<{ key: string; name: string }[]>
  >;
  ratingThreshold: number;
  setRatingThreshold: React.Dispatch<React.SetStateAction<number>>;             

  
  function Sidebar () {
  const [openFilters, setOpenFilters] = React.useState(false);
  const [selectedYear, setSelectedYear] = React.useState<string | null>(null);

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
  
    const updateDebouncedRating = useMemo(
      () => debounce((val: number) => setDebouncedRating(val), 300),
      [],
    );

  const handleGenreChange = (e: { value: { key: string; name: string }; checked: boolean }) => {
    const { value, checked } = e;
    if (checked) {
      setSelectedGenres((prev) => [...prev, value]);
    } else {
      setSelectedGenres((prev) => prev.filter((genre) => genre.key !== value.key));
    }
  }                
   const handleRatingChange =(e: any) =>{
      const newValue=e.value;
      setRatingThreshold(newValue);
      updateDebouncedRating(newValue);
  
    }
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
  
  return (
  
  <div className="sidebar-content h-full w-80 shrink-0 no-scrollbar! bg-white dark:bg-black! border-l border-zinc-200 dark:border-zinc-800! flex flex-col transition-all">
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

            <div className="filter-container flex flex-col items-center gap-8 p-4">
              <ListBox
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.value)}
                options={filters}
                optionLabel="name"
                className="w-full "
                style={{ maxHeight: "250px" }}
              />
              <div className="filter-container w-60 h-auto p-4">
                <div className="flex justify-end w-full pr-4">
                  <Button
                    label="Clear All"
                    unstyled
                    pt={{
                      root: {
                        className: "text-yellow-500 cursor-pointer hover",
                      },
                    }}
                  />
                </div>

                <div className=" bg-zinc-900 rounded-md overflow-y-auto max-h-[50vh] mt-2">
                  {selectedFilter?.code === "Y" && (
                    <div className="pl-6">
                      <h3 className="block font-bold mb-3 text-xl text-zinc-400 pl-8 uppercase tracking-wider">
                        Select Year
                      </h3>
                      <YearsList
                        movies={movies}
                        onYearChange={(year) => setSelectedYear(year)}
                        selectedYear={selectedYear}
                      />
                    </div>
                  )}

                  {selectedFilter?.code === "G" && (
                    <div>
                      <h3 className="font-bold mb-2">Select Genres</h3>
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
                                  ? "bg-yellow-500! border-yellow-600!"
                                  : "bg-white dark:bg-zinc-900 border-zinc-300",
                              }),
                              icon: {
                                className: "text-white text-xs",
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
                  )}

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
              <div className="mt-auto pt-6">
                <Button
                  label="Done"
                  unstyled
                  pt={{
                    root: {
                      className: "text-yellow-500 cursor-pointer hover",
                    },
                  }}
                />
              </div>
            </div>
          </div>
    );      
}