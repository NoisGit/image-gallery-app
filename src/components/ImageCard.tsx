import type { ImageData } from "../data/images";

interface Props {
  image: ImageData;
}

export default function ImageCard({ image }: Props) {
  return (
    <div className="group relative rounded-2xl shadow-lg overflow-hidden bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:shadow-2xl hover:scale-[1.02] transition-all cursor-pointer flex flex-col">
      <img
        src={image.url}
        alt={image.title}
        className="w-full h-56 object-cover transition group-hover:brightness-90"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent flex flex-col justify-end p-4">
        <h3 className="text-lg font-extrabold text-white drop-shadow">{image.title}</h3>
        <p className="text-sm text-zinc-100">{image.description}</p>
      </div>
    </div>
  );
}
