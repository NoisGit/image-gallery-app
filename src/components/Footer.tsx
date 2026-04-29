export default function Footer() {
  return (
    <footer className="mt-auto w-full border-t border-white/60 bg-white/70 py-6 text-sm text-zinc-500 backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-950/70 dark:text-zinc-400">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 text-center sm:flex-row sm:px-6 lg:px-8">
        <span className="font-semibold">
          © {new Date().getFullYear()} Image Gallery App · Hecho con React, TypeScript y Vite
        </span>

        <div className="flex items-center gap-4">
          <a
            href="https://github.com/NoisGit/image-gallery-app"
            target="_blank"
            rel="noopener noreferrer"
            className="font-black text-zinc-700 transition hover:text-pink-500 dark:text-zinc-200"
          >
            GitHub
          </a>
          <a
            href="https://www.linkedin.com/in/borisalvialv/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-black text-zinc-700 transition hover:text-pink-500 dark:text-zinc-200"
          >
            LinkedIn
          </a>
        </div>
      </div>
    </footer>
  );
}
