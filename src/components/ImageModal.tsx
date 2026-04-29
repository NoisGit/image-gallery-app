import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ImageData } from "../data/images";
import { motion, AnimatePresence } from "framer-motion";
import { CATEGORY_OPTIONS, formatDate, formatFileSize, isCategory } from "../utils/gallery";
import type { Category } from "../utils/gallery";

interface Props {
  image: ImageData;
  isOpen: boolean;
  fallbackCategory: Category;
  onClose: () => void;
  onSave: (id: number, newTitle: string, newDescription: string, newCategory: Category) => void;
  onDelete: (id: number) => void;
}

export default function ImageModal({ image, isOpen, fallbackCategory, onClose, onSave, onDelete }: Props) {
  const [title, setTitle] = useState(image.title);
  const [description, setDescription] = useState(image.description);
  const [category, setCategory] = useState<Category>(isCategory(image.category) ? image.category : fallbackCategory);
  const inputRef = useRef<HTMLInputElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const originalCategory = useMemo(
    () => (isCategory(image.category) ? image.category : fallbackCategory),
    [fallbackCategory, image.category],
  );

  const hasChanges = title !== image.title || description !== image.description || category !== originalCategory;

  useEffect(() => {
    setTitle(image.title);
    setDescription(image.description);
    setCategory(originalCategory);
  }, [image, originalCategory]);

  useEffect(() => {
    if (!isOpen) return undefined;

    previousFocusRef.current = document.activeElement as HTMLElement;
    document.body.style.overflow = "hidden";
    window.setTimeout(() => inputRef.current?.focus(), 0);

    return () => {
      document.body.style.overflow = "";
      previousFocusRef.current?.focus();
    };
  }, [isOpen]);

  const requestClose = useCallback(() => {
    if (hasChanges && !window.confirm("Tienes cambios sin guardar. ¿Cerrar de todos modos?")) return;
    onClose();
  }, [hasChanges, onClose]);

  useEffect(() => {
    if (!isOpen) return undefined;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") requestClose();
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, requestClose]);

  if (!isOpen) return null;

  const dimensions = image.width && image.height ? `${image.width} × ${image.height}px` : "No disponible";

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-zinc-950/75 p-3 backdrop-blur-md sm:p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={requestClose}
      >
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-labelledby="image-modal-title"
          className="relative grid max-h-[92vh] w-full max-w-5xl overflow-hidden rounded-[2rem] border border-white/20 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-950 lg:grid-cols-[1.1fr_0.9fr]"
          initial={{ scale: 0.96, opacity: 0, y: 40 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.96, opacity: 0, y: 40 }}
          transition={{ type: "spring", bounce: 0.18, duration: 0.28 }}
          onClick={(event) => event.stopPropagation()}
        >
          <button
            type="button"
            onClick={requestClose}
            className="absolute right-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-2xl font-bold text-zinc-700 shadow-lg transition hover:bg-pink-100 hover:text-pink-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink-400 dark:bg-zinc-900/90 dark:text-zinc-100 dark:hover:bg-zinc-800"
            aria-label="Cerrar modal"
          >
            ×
          </button>

          <div className="min-h-[18rem] bg-zinc-950 lg:min-h-[34rem]">
            <img src={image.url} alt={title} className="h-full max-h-[40vh] w-full object-cover lg:max-h-none" />
          </div>

          <div className="overflow-y-auto p-5 sm:p-7">
            <span className="mb-3 inline-flex rounded-full bg-pink-100 px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-pink-700 dark:bg-pink-500/15 dark:text-pink-200">
              Detalle de imagen
            </span>

            <label className="mb-2 block text-sm font-bold text-zinc-600 dark:text-zinc-300" htmlFor="image-title">
              Título
            </label>
            <input
              id="image-title"
              ref={inputRef}
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              maxLength={60}
              className="mb-4 w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-xl font-black text-zinc-950 transition focus:border-pink-400 focus:outline-none focus:ring-4 focus:ring-pink-200/70 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:focus:ring-pink-500/20"
              placeholder="Título"
            />

            <label className="mb-2 block text-sm font-bold text-zinc-600 dark:text-zinc-300" htmlFor="image-description">
              Descripción
            </label>
            <textarea
              id="image-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              maxLength={180}
              className="mb-4 min-h-28 w-full resize-none rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm leading-6 text-zinc-800 transition focus:border-pink-400 focus:outline-none focus:ring-4 focus:ring-pink-200/70 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:ring-pink-500/20"
              rows={4}
              placeholder="Descripción"
            />

            <label className="mb-2 block text-sm font-bold text-zinc-600 dark:text-zinc-300" htmlFor="image-category">
              Categoría
            </label>
            <select
              id="image-category"
              value={category}
              onChange={(event) => setCategory(event.target.value as Category)}
              className="mb-5 w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm font-semibold text-zinc-900 transition focus:border-pink-400 focus:outline-none focus:ring-4 focus:ring-pink-200/70 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:ring-pink-500/20"
            >
              {CATEGORY_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>

            <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <MetadataItem label="Archivo" value={image.originalName ?? "No disponible"} />
              <MetadataItem label="Peso" value={formatFileSize(image.size)} />
              <MetadataItem label="Formato" value={image.mimeType ?? "No disponible"} />
              <MetadataItem label="Dimensiones" value={dimensions} />
              <MetadataItem label="Fecha" value={formatDate(image.uploadedAt)} />
              <MetadataItem label="Favorita" value={image.isFavorite ? "Sí" : "No"} />
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                className="flex-1 rounded-2xl bg-pink-500 px-5 py-3 text-sm font-black text-white shadow-lg shadow-pink-300/40 transition hover:bg-pink-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink-400 dark:shadow-pink-950/40"
                onClick={() => onSave(image.id, title, description, category)}
              >
                Guardar cambios
              </button>
              <button
                type="button"
                className="flex-1 rounded-2xl bg-zinc-100 px-5 py-3 text-sm font-black text-zinc-700 transition hover:bg-red-100 hover:text-red-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-400 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-red-500/10 dark:hover:text-red-300"
                onClick={() => onDelete(image.id)}
              >
                Eliminar
              </button>
            </div>

            {hasChanges && (
              <p className="mt-4 rounded-2xl bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800 dark:bg-amber-500/10 dark:text-amber-200">
                Tienes cambios sin guardar.
              </p>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function MetadataItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-900/80">
      <span className="block text-xs font-black uppercase tracking-[0.16em] text-zinc-400">{label}</span>
      <span className="mt-1 block break-words text-sm font-bold text-zinc-800 dark:text-zinc-100">{value}</span>
    </div>
  );
}
