import { useEffect, useMemo, useRef, useState } from "react";
import type { ChangeEvent, KeyboardEvent } from "react";
import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";
import type { DropResult } from "@hello-pangea/dnd";
import { AnimatePresence, motion } from "framer-motion";
import toast from "react-hot-toast";
import { images as initialImages, type ImageData } from "../data/images";
import {
  CATEGORY_OPTIONS,
  DEFAULT_CATEGORY,
  getErrorMessage,
  getTitleFromFileName,
  loadImagesFromStorage,
  normalizeImages,
  sanitizeText,
  saveImagesToStorage,
  sortImages,
  validateImageDetails,
  validateImageFile,
} from "../utils/gallery";
import type { Category, SortMode } from "../utils/gallery";
import ImageCard from "./ImageCard";
import ImageModal from "./ImageModal";

const STORAGE_KEY = "image_gallery_items";

type DeletedImage = {
  image: ImageData;
  index: number;
};

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("No se pudo leer la imagen."));
    reader.readAsDataURL(file);
  });
}

export default function Gallery() {
  const [initialState] = useState(() => loadImagesFromStorage(STORAGE_KEY, initialImages));
  const [images, setImages] = useState<ImageData[]>(initialState.images);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<Category | "all">("all");
  const [sortMode, setSortMode] = useState<SortMode>("manual");
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedImageId, setSelectedImageId] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [storageRecovered, setStorageRecovered] = useState(initialState.recovered);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const importInputRef = useRef<HTMLInputElement>(null);
  const storageErrorShownRef = useRef(false);
  const lastDeletedRef = useRef<DeletedImage | null>(null);
  const undoTimeoutRef = useRef<number | null>(null);

  const selectedImage = useMemo(
    () => images.find((image) => image.id === selectedImageId) ?? null,
    [images, selectedImageId],
  );

  const displayedImages = useMemo(() => {
    const query = search.trim().toLowerCase();
    const filteredImages = images.filter((image) => {
      const text = `${image.title} ${image.description} ${image.category ?? ""}`.toLowerCase();
      const matchesText = text.includes(query);
      const matchesCategory = categoryFilter === "all" || image.category === categoryFilter;
      const matchesFavorite = !showFavoritesOnly || Boolean(image.isFavorite);
      return matchesText && matchesCategory && matchesFavorite;
    });

    return sortImages(filteredImages, sortMode);
  }, [categoryFilter, images, search, showFavoritesOnly, sortMode]);

  const totalFavorites = images.filter((image) => image.isFavorite).length;
  const hasActiveFilters = Boolean(search.trim()) || categoryFilter !== "all" || showFavoritesOnly;

  useEffect(() => {
    if (!storageRecovered) return;
    toast.error("Se restauró la galería porque había datos guardados inválidos.");
    setStorageRecovered(false);
  }, [storageRecovered]);

  useEffect(() => {
    const error = saveImagesToStorage(STORAGE_KEY, images);
    if (error && !storageErrorShownRef.current) {
      toast.error(error);
      storageErrorShownRef.current = true;
    }
  }, [images]);

  useEffect(() => {
    return () => {
      if (undoTimeoutRef.current) window.clearTimeout(undoTimeoutRef.current);
    };
  }, []);

  const resetUploadInput = () => {
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const resetImportInput = () => {
    if (importInputRef.current) importInputRef.current.value = "";
  };

  const openModal = (image: ImageData) => {
    setSelectedImageId(image.id);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedImageId(null);
  };

  const saveChanges = (id: number, newTitle: string, newDescription: string, newCategory: Category) => {
    const validation = validateImageDetails(newTitle, newDescription);
    if (!validation.ok) {
      toast.error(validation.message ?? "Revisa los datos de la imagen.");
      return;
    }

    setImages((currentImages) =>
      currentImages.map((image) =>
        image.id === id
          ? {
              ...image,
              title: sanitizeText(newTitle, 60),
              description: sanitizeText(newDescription, 180),
              category: newCategory,
            }
          : image,
      ),
    );

    toast.success("Cambios guardados");
    closeModal();
  };

  const restoreDeletedImage = () => {
    const deleted = lastDeletedRef.current;
    if (!deleted) return;

    setImages((currentImages) => {
      if (currentImages.some((image) => image.id === deleted.image.id)) return currentImages;
      const restoredImages = [...currentImages];
      restoredImages.splice(Math.min(deleted.index, restoredImages.length), 0, deleted.image);
      return restoredImages;
    });

    lastDeletedRef.current = null;
    toast.success("Imagen restaurada");
  };

  const deleteImage = (id: number) => {
    setImages((currentImages) => {
      const imageIndex = currentImages.findIndex((image) => image.id === id);
      if (imageIndex === -1) return currentImages;
      lastDeletedRef.current = { image: currentImages[imageIndex], index: imageIndex };
      return currentImages.filter((image) => image.id !== id);
    });

    if (undoTimeoutRef.current) window.clearTimeout(undoTimeoutRef.current);
    undoTimeoutRef.current = window.setTimeout(() => {
      lastDeletedRef.current = null;
    }, 6500);

    toast(
      (toastItem) => (
        <span className="flex items-center gap-3">
          Imagen eliminada
          <button
            type="button"
            onClick={() => {
              restoreDeletedImage();
              toast.dismiss(toastItem.id);
            }}
            className="rounded-full bg-zinc-950 px-3 py-1 text-xs font-bold text-white transition hover:bg-pink-600 dark:bg-white dark:text-zinc-950"
          >
            Deshacer
          </button>
        </span>
      ),
      { duration: 6000, icon: "🗑️" },
    );

    closeModal();
  };

  const toggleFavorite = (id: number) => {
    setImages((currentImages) =>
      currentImages.map((image) => (image.id === id ? { ...image, isFavorite: !image.isFavorite } : image)),
    );
  };

  const handleUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);

    try {
      const validation = validateImageFile(file);
      if (!validation.ok) throw new Error(validation.message);

      const dataUrl = await readFileAsDataUrl(file);
      const isDuplicate = images.some((image) => image.url === dataUrl || image.originalName === file.name);
      if (isDuplicate) throw new Error("Esta imagen ya existe en la galería.");

      const newImage: ImageData = {
        id: Date.now(),
        title: getTitleFromFileName(file.name),
        description: "Haz clic para editar la descripción.",
        url: dataUrl,
        category: "Personal",
        isFavorite: false,
        originalName: file.name,
        size: file.size,
        mimeType: file.type,
        uploadedAt: new Date().toISOString(),
      };

      setImages((currentImages) => [newImage, ...currentImages]);
      toast.success("Imagen subida");
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setUploading(false);
      resetUploadInput();
    }
  };

  const exportGallery = () => {
    const backup = {
      app: "image-gallery-app",
      version: 2,
      exportedAt: new Date().toISOString(),
      images,
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `image-gallery-backup-${new Date().toISOString().slice(0, 10)}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    toast.success("Backup exportado");
  };

  const handleImport = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImporting(true);

    try {
      const parsed = JSON.parse(await file.text()) as unknown;
      const candidate = parsed && typeof parsed === "object" && "images" in parsed ? (parsed as { images: unknown }).images : parsed;
      const importedImages = normalizeImages(candidate);
      if (!Array.isArray(candidate) || (candidate.length > 0 && importedImages.length === 0)) {
        throw new Error("El archivo no tiene una galería válida.");
      }

      setImages(importedImages);
      toast.success(`Galería importada (${importedImages.length} imágenes)`);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setImporting(false);
      resetImportInput();
    }
  };

  const clearFilters = () => {
    setSearch("");
    setCategoryFilter("all");
    setShowFavoritesOnly(false);
    setSortMode("manual");
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    if (sortMode !== "manual") {
      toast.error("Vuelve al orden manual para arrastrar imágenes.");
      return;
    }

    const reordered = Array.from(displayedImages);
    const [removed] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, removed);

    if (displayedImages.length !== images.length) {
      const nextImages = [...images];
      const filteredIndexes = images
        .map((image, index) => (displayedImages.some((item) => item.id === image.id) ? index : -1))
        .filter((index) => index !== -1);

      filteredIndexes.forEach((imageIndex, index) => {
        nextImages[imageIndex] = reordered[index];
      });
      setImages(nextImages);
    } else {
      setImages(reordered);
    }

    toast.success("Imágenes reordenadas");
  };

  const handleCardKeyDown = (event: KeyboardEvent<HTMLDivElement>, image: ImageData) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    openModal(image);
  };

  return (
    <section className="w-full max-w-7xl">
      <motion.div
        className="relative mb-8 overflow-hidden rounded-[2rem] border border-white/70 bg-white/75 p-6 shadow-2xl shadow-pink-200/40 backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-900/80 dark:shadow-black/40 sm:p-8"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <div className="pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full bg-pink-300/40 blur-3xl dark:bg-pink-700/30" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-56 w-56 rounded-full bg-violet-300/40 blur-3xl dark:bg-violet-700/30" />

        <div className="relative grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
          <div>
            <span className="mb-3 inline-flex rounded-full bg-pink-100 px-4 py-1.5 text-xs font-black uppercase tracking-[0.2em] text-pink-700 dark:bg-pink-500/15 dark:text-pink-200">
              Portfolio gallery
            </span>
            <h1 className="max-w-3xl text-4xl font-black tracking-tight text-zinc-950 dark:text-white sm:text-5xl">
              Galería visual con filtros, favoritos y persistencia local.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-zinc-600 dark:text-zinc-300">
              Sube imágenes, ordénalas, edita sus datos, respáldalas en JSON y mantén una experiencia cuidada para escritorio y mobile.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center">
            <StatCard label="Imágenes" value={images.length} />
            <StatCard label="Favoritas" value={totalFavorites} />
            <StatCard label="Visibles" value={displayedImages.length} />
          </div>
        </div>
      </motion.div>

      <div className="mb-8 rounded-[1.5rem] border border-white/70 bg-white/80 p-4 shadow-xl shadow-pink-100/50 backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/75 dark:shadow-black/30 sm:p-5">
        <div className="grid gap-3 lg:grid-cols-[1.3fr_0.8fr_0.8fr_auto]">
          <input
            type="text"
            placeholder="Buscar por título, descripción o categoría..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="h-12 w-full rounded-2xl border border-zinc-200 bg-white px-4 text-zinc-900 shadow-sm transition placeholder:text-zinc-400 focus:border-pink-400 focus:outline-none focus:ring-4 focus:ring-pink-200/70 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:ring-pink-500/20"
            aria-label="Buscar imágenes"
          />

          <select
            value={categoryFilter}
            onChange={(event) => setCategoryFilter(event.target.value as Category | "all")}
            className="h-12 w-full rounded-2xl border border-zinc-200 bg-white px-4 text-zinc-900 shadow-sm transition focus:border-pink-400 focus:outline-none focus:ring-4 focus:ring-pink-200/70 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:ring-pink-500/20"
            aria-label="Filtrar por categoría"
          >
            <option value="all">Todas las categorías</option>
            {CATEGORY_OPTIONS.map((category) => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>

          <select
            value={sortMode}
            onChange={(event) => setSortMode(event.target.value as SortMode)}
            className="h-12 w-full rounded-2xl border border-zinc-200 bg-white px-4 text-zinc-900 shadow-sm transition focus:border-pink-400 focus:outline-none focus:ring-4 focus:ring-pink-200/70 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:ring-pink-500/20"
            aria-label="Ordenar imágenes"
          >
            <option value="manual">Orden manual</option>
            <option value="title">Título A-Z</option>
            <option value="uploadedAt">Más recientes</option>
            <option value="favorites">Favoritas primero</option>
          </select>

          <button
            type="button"
            onClick={() => setShowFavoritesOnly((value) => !value)}
            className={`h-12 rounded-2xl px-5 text-sm font-black shadow-sm transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink-400 ${
              showFavoritesOnly
                ? "bg-pink-500 text-white hover:bg-pink-600"
                : "bg-zinc-100 text-zinc-700 hover:bg-pink-100 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
            }`}
            aria-pressed={showFavoritesOnly}
          >
            ♥ Favoritas
          </button>
        </div>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            <motion.label whileTap={{ scale: 0.97 }} className="inline-flex h-11 cursor-pointer items-center justify-center rounded-2xl bg-pink-500 px-5 text-sm font-black text-white shadow-lg shadow-pink-300/40 transition hover:bg-pink-600 dark:shadow-pink-950/40">
              {uploading ? "Cargando..." : "+ Subir imagen"}
              <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleUpload} className="hidden" disabled={uploading} />
            </motion.label>

            <button type="button" onClick={exportGallery} className="h-11 rounded-2xl bg-zinc-950 px-5 text-sm font-black text-white shadow-sm transition hover:bg-zinc-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink-400 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200">
              Exportar JSON
            </button>

            <motion.label whileTap={{ scale: 0.97 }} className="inline-flex h-11 cursor-pointer items-center justify-center rounded-2xl bg-zinc-100 px-5 text-sm font-black text-zinc-700 shadow-sm transition hover:bg-pink-100 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700">
              {importing ? "Importando..." : "Importar JSON"}
              <input ref={importInputRef} type="file" accept="application/json,.json" onChange={handleImport} className="hidden" disabled={importing} />
            </motion.label>
          </div>

          <div className="flex items-center gap-3 text-sm font-semibold text-zinc-500 dark:text-zinc-400">
            <span>{displayedImages.length} / {images.length} visibles</span>
            {hasActiveFilters && (
              <button type="button" onClick={clearFilters} className="rounded-full px-3 py-1 text-pink-600 transition hover:bg-pink-100 dark:text-pink-300 dark:hover:bg-pink-500/10">
                Limpiar filtros
              </button>
            )}
          </div>
        </div>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="gallery">
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps} className="grid grid-cols-1 gap-7 sm:grid-cols-2 xl:grid-cols-3">
              <AnimatePresence>
                {displayedImages.length === 0 ? (
                  <motion.div key="empty-state" className="col-span-full rounded-[2rem] border border-dashed border-pink-300 bg-white/70 p-10 text-center shadow-lg shadow-pink-100/50 dark:border-pink-700/60 dark:bg-zinc-900/70 dark:shadow-black/30" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 16 }}>
                    <span className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-pink-100 text-3xl dark:bg-pink-500/15">{images.length === 0 ? "📸" : "🔎"}</span>
                    <h2 className="text-2xl font-black text-zinc-950 dark:text-white">{images.length === 0 ? "Tu galería está vacía" : "No encontramos resultados"}</h2>
                    <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-zinc-500 dark:text-zinc-400">{images.length === 0 ? "Sube tu primera imagen para comenzar." : "Prueba limpiando filtros o usando otra palabra."}</p>
                    {hasActiveFilters && <button type="button" onClick={clearFilters} className="mt-5 rounded-2xl bg-pink-500 px-5 py-2.5 text-sm font-black text-white transition hover:bg-pink-600">Limpiar filtros</button>}
                  </motion.div>
                ) : (
                  displayedImages.map((image, index) => (
                    <Draggable key={image.id} draggableId={image.id.toString()} index={index} isDragDisabled={sortMode !== "manual"}>
                      {(draggableProvided, snapshot) => (
                        <div ref={draggableProvided.innerRef} {...draggableProvided.draggableProps} {...draggableProvided.dragHandleProps} role="button" tabIndex={0} aria-label={`Abrir detalle de ${image.title}`} onKeyDown={(event) => handleCardKeyDown(event, image)} onClick={() => openModal(image)} className="focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-pink-400" style={{ ...draggableProvided.draggableProps.style, zIndex: snapshot.isDragging ? 30 : 1, cursor: sortMode === "manual" ? (snapshot.isDragging ? "grabbing" : "grab") : "pointer" }}>
                          <motion.div layout initial={{ opacity: 0, scale: 0.97, y: 18 }} animate={{ opacity: 1, scale: snapshot.isDragging ? 1.04 : 1, y: 0 }} exit={{ opacity: 0, scale: 0.97, y: 18 }} transition={{ duration: 0.18 }}>
                            <ImageCard image={image} onToggleFavorite={toggleFavorite} />
                          </motion.div>
                        </div>
                      )}
                    </Draggable>
                  ))
                )}
              </AnimatePresence>
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {selectedImage && <ImageModal image={selectedImage} isOpen={modalOpen} onClose={closeModal} onSave={saveChanges} onDelete={deleteImage} fallbackCategory={DEFAULT_CATEGORY} />}
    </section>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white/80 p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-950/50">
      <strong className="block text-3xl font-black text-pink-500">{value}</strong>
      <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">{label}</span>
    </div>
  );
}
