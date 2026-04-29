import type { MouseEvent } from "react";
import type { ImageData } from "../data/images";
import { formatDate } from "../utils/gallery";

interface Props {
  image: ImageData;
  onToggleFavorite: (id: number) => void;
}

export default function ImageCard({ image, onToggleFavorite }: Props) {
  const handleFavoriteClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onToggleFavorite(image.id);
  };

  return (
    <article className="group relative min-h-[22rem] overflow-hidden rounded-[1.75rem] border border-white/60 bg-white/80 shadow-xl shadow-pink-200/30 ring-1 ring-zinc-950/5 backdrop-blur transition duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-pink-300/30 dark:border-zinc-700/80 dark:bg-zinc-900/80 dark:shadow-black/30">
      <img
        src={image.url}
        alt={image.title}
        className="h-72 w-full object-cover transition duration-500 group-hover:scale-105 group-hover:brightness-95"
        loading="lazy"
      />

      <button
        type="button"
        onClick={handleFavoriteClick}
        className={`absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full border text-xl shadow-lg backdrop-blur transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink-400 ${
          image.isFavorite
            ? "border-pink-200 bg-pink-500 text-white hover:bg-pink-600"
            : "border-white/70 bg-zinc-950/40 text-white hover:bg-zinc-950/60"
        }`}
        aria-label={image.isFavorite ? "Quitar de favoritas" : "Marcar como favorita"}
        aria-pressed={Boolean(image.isFavorite)}
      >
        {image.isFavorite ? "♥" : "♡"}
      </button>

      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-zinc-950 via-zinc-950/75 to-transparent p-5 pt-24 text-white">
        <div className="mb-3 flex flex-wrap gap-2">
          <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur">
            {image.category ?? "Sin categoría"}
          </span>
          {image.uploadedAt && (
            <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur">
              {formatDate(image.uploadedAt)}
            </span>
          )}
        </div>

        <h3 className="text-xl font-black leading-tight drop-shadow-sm">{image.title}</h3>
        <p className="gallery-clamp-2 mt-2 text-sm leading-6 text-zinc-100/90">
          {image.description}
        </p>
      </div>
    </article>
  );
}
