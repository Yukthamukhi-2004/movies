// types/filters.ts
export interface FilterOption {
  name: string;
  code: string;
}

export const FILTER_OPTIONS: FilterOption[] = [
  { name: "Year", code: "Y" },
  { name: "Genres", code: "G" },
  { name: "Rating", code: "R" },
];
