import { useEffect, useState } from "react";
import { SunIcon, MoonIcon } from "@heroicons/react/24/solid";

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState<boolean>(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) return savedTheme === "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDark) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark((prev) => !prev);

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-xl transition-all border border-zinc-300 dark:border-zinc-600 shadow-md bg-white dark:!bg-zinc-800 text-black dark:!text-white hover:bg-gray-100 dark:!hover:bg-zinc-700 flex items-center justify-center cursor-pointer"
      aria-label="Toggle Dark Mode"
    >
      {isDark ? (
        <MoonIcon className="h-6 w-6 text-gray-400 bg-zinc-800" />
      ) : (
        <SunIcon className="h-6 w-6 text-yellow-500 bg-white" />
      )}
    </button>
  );
}
