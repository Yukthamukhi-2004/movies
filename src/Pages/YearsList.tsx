import { useMemo } from "react";
import type { TraktMovies } from "../types/trakt";
import { ListBox } from "primereact/listbox";
import "../styles/YearList.css";

interface ScrollerProps {
  movies: TraktMovies[];
  selectedYear: number | null;
  onYearChange: (year: number | null) => void;
}

function YearsList({ movies, onYearChange, selectedYear }: ScrollerProps) {
  console.log("YearsList Component is Rendering! Movie count:", movies?.length);
  const uniqueYears = useMemo(() => {
    if (!movies || movies.length === 0) return [];
    console.log("useMemo stopped: Movies array is empty.");

    const years = movies
      .map((m) => {
        const year =
          m.movie.year ||
          (m.movie.released ? new Date(m.movie.released).getFullYear() : null);
        return year;
      })
      .filter((year): year is number => year !== null && year !== undefined);

    const result = [...new Set(years)].sort((a, b) => b - a);
    console.log("Movie Years Data:");
    console.table(result);
    return result;
  }, [movies]);

  return (
    <div className="bg-white dark:bg-black! transition-colors duration-300">
      <div className="list-container p-3">
        <ListBox
          value={selectedYear}
          onChange={(e) => onYearChange(e.value)}
          options={uniqueYears}
          className="w-full h-180px overflow-y-auto border-none shadow-none"
          pt={{
            root: { className: "bg-transparent border-none" },
            wrapper: { className: "bg-transparent dark:bg-zinc-900" },
            item: (props) => ({
              className: `p-3 text-center transition-all ${
                props?.context?.selected
                  ? "bg-white! text-yellow-500! dark:bg-black! dark:text-yellow-500!"
                  : "text-black dark:text-white hover:text-black-xl dark:hover:bg-zinc-800"
              }`,
            }),
          }}
        />
      </div>
    </div>
  );
}
export default YearsList;
