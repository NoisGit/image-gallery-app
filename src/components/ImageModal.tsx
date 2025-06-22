import { useState, useEffect, useRef } from "react";
import type { ImageData } from "../data/images";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  image: ImageData;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: number, newTitle: string, newDesc: string) => void;
  onDelete: (id: number) => void;
}

export default function ImageModal({
  image,
  isOpen,
  onClose,
  onSave,
  onDelete,
}: Props) {
  const [title, setTitle] = useState(image.title);
  const [desc, setDesc] = useState(image.description);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTitle(image.title);
    setDesc(image.description);
    if (isOpen && inputRef.current) inputRef.current.focus();
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen, image]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl max-w-sm w-full p-6 relative flex flex-col items-center"
          initial={{ scale: 0.96, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.96, opacity: 0, y: 50 }}
          transition={{ type: "spring", bounce: 0.18, duration: 0.28 }}
          onClick={e => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-zinc-500 hover:text-pink-500 text-2xl"
            aria-label="Cerrar"
          >
            ×
          </button>
          <img
            src={image.url}
            alt={title}
            className="w-full h-56 object-cover rounded-xl mb-5 shadow"
          />
          <input
            ref={inputRef}
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="mb-2 px-3 py-2 w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 text-lg font-bold text-zinc-900 dark:text-zinc-100 focus:outline-pink-400 transition"
            placeholder="Título"
          />
          <textarea
            value={desc}
            onChange={e => setDesc(e.target.value)}
            className="mb-3 px-3 py-2 w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 text-sm text-zinc-800 dark:text-zinc-100 focus:outline-pink-400 transition resize-none"
            rows={3}
            placeholder="Descripción"
          />
          <div className="flex w-full gap-2 mt-2">
            <button
              className="flex-1 py-2 rounded-lg bg-pink-500 hover:bg-pink-600 text-white font-semibold transition"
              onClick={() => onSave(image.id, title, desc)}
            >
              Guardar
            </button>
            <button
              className="flex-1 py-2 rounded-lg bg-zinc-200 hover:bg-zinc-300 text-zinc-800 dark:bg-zinc-700 dark:text-white dark:hover:bg-zinc-600 font-semibold transition"
              onClick={() => onDelete(image.id)}
            >
              Eliminar
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
