import { useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";

export default function Header() {
  const { theme, toggleTheme } = useContext(ThemeContext);

  return (
    <header className="sticky top-0 z-30 w-full bg-zinc-900/90 dark:bg-zinc-950/90 border-b border-zinc-800 shadow-lg backdrop-blur-md">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-6 sm:px-12" style={{ height: "72px" }}>
        <div className="flex items-center gap-2">
          <span className="flex items-center" style={{ lineHeight: 1, marginBottom: "2px" }}>
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" style={{ display: "block" }}>
              <rect x="3" y="7" width="18" height="12" rx="2.5" fill="#eee" />
              <rect x="1" y="5" width="22" height="16" rx="3" fill="#a78bfa" />
              <circle cx="12" cy="13" r="4" fill="#2d2d32" />
              <circle cx="12" cy="13" r="2" fill="#a5b4fc" />
              <rect x="7" y="2" width="10" height="4" rx="2" fill="#e0e7ff" />
            </svg>
          </span>
          <span className="font-black text-2xl sm:text-3xl tracking-tight text-pink-500 select-none" style={{ lineHeight: 1, paddingTop: "2px" }}>
            Image Gallery
          </span>
        </div>
        <button
          onClick={toggleTheme}
          aria-label="Cambiar tema"
          className="w-11 h-11 rounded-full flex items-center justify-center bg-zinc-200 dark:bg-zinc-800 hover:bg-pink-200 dark:hover:bg-pink-700 shadow-md transition text-2xl"
          tabIndex={0}
        >
          {theme === "dark" ? "☀️" : "🌙"}
        </button>
      </div>
    </header>
  );
}
