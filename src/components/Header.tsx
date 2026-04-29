import { useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";

export default function Header() {
  const { theme, toggleTheme } = useContext(ThemeContext);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/60 bg-white/75 shadow-sm backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-950/75">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <a href="#top" className="flex items-center gap-3" aria-label="Ir al inicio">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-pink-500 to-violet-500 text-2xl shadow-lg shadow-pink-300/40 dark:shadow-pink-950/40">
            📷
          </span>
          <span>
            <span className="block text-lg font-black leading-none text-zinc-950 dark:text-white sm:text-2xl">
              Image Gallery
            </span>
            <span className="hidden text-xs font-bold uppercase tracking-[0.2em] text-pink-500 sm:block">
              React portfolio app
            </span>
          </span>
        </a>

        <button
          type="button"
          onClick={toggleTheme}
          aria-label={theme === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
          className="flex h-12 items-center gap-2 rounded-2xl border border-zinc-200 bg-white px-4 text-sm font-black text-zinc-800 shadow-sm transition hover:border-pink-300 hover:bg-pink-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
        >
          <span aria-hidden="true">{theme === "dark" ? "☀️" : "🌙"}</span>
          <span className="hidden sm:inline">{theme === "dark" ? "Claro" : "Oscuro"}</span>
        </button>
      </div>
    </header>
  );
}
