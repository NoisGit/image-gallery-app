import { useState, useEffect } from "react";
import type { ChangeEvent } from "react";
import { images as initialImages, type ImageData } from "../data/images";
import ImageCard from "./ImageCard";
import ImageModal from "./ImageModal";
import { motion, AnimatePresence } from "framer-motion";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import type { DropResult } from "@hello-pangea/dnd";
import toast from "react-hot-toast";

const LS_KEY = "digitala_images";

function getInitialImages(): ImageData[] {
  const ls = localStorage.getItem(LS_KEY);
  return ls ? JSON.parse(ls) : initialImages;
}

export default function Gallery() {
  const [images, setImages] = useState<ImageData[]>(getInitialImages());
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<ImageData | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(images));
  }, [images]);

  const filtered = images.filter((img) =>
    (img.title + img.description).toLowerCase().includes(search.toLowerCase())
  );

  const openModal = (img: ImageData) => {
    setSelectedImage(img);
    setModalOpen(true);
  };

  const closeModal = () => setModalOpen(false);

  const saveChanges = (id: number, newTitle: string, newDesc: string) => {
    setImages((imgs) =>
      imgs.map((img) =>
        img.id === id ? { ...img, title: newTitle, description: newDesc } : img
      )
    );
    toast.success("Cambios guardados");
    setModalOpen(false);
  };

  const deleteImage = (id: number) => {
    setImages((imgs) => imgs.filter((img) => img.id !== id));
    toast("Imagen eliminada", { icon: "🗑️" });
    setModalOpen(false);
  };

  const handleUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      const isDuplicate = images.some(
        img => img.title === file.name.replace(/\.\w+$/, "") && img.url === reader.result
      );
      if (isDuplicate) {
        toast.error("¡Esta imagen ya fue subida!");
        setUploading(false);
        return;
      }
      const newImage: ImageData = {
        id: Date.now(),
        title: file.name.replace(/\.\w+$/, ""),
        description: "Haz clic para editar la descripción.",
        url: reader.result as string,
      };
      setImages((imgs) => [newImage, ...imgs]);
      toast.success("Imagen subida");
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  // Drag & Drop reorder
  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const reordered = Array.from(filtered);
    const [removed] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, removed);

    if (filtered.length !== images.length) {
      // Actualiza sólo el subset filtrado en el array global
      const newImages = [...images];
      const filteredIndexes = images
        .map((img, idx) => (filtered.find((f) => f.id === img.id) ? idx : -1))
        .filter((idx) => idx !== -1);

      filteredIndexes.forEach((imgIdx, i) => {
        newImages[imgIdx] = reordered[i];
      });
      setImages(newImages);
    } else {
      setImages(reordered);
    }
    toast.success("Imágenes reordenadas");
  };

  return (
    <section className="w-full max-w-6xl mx-auto flex flex-col items-center justify-center">
      <div className="w-full flex flex-col gap-2 mb-6">
        <div className="w-full flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <input
            type="text"
            placeholder="Buscar imágenes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-lg border border-zinc-300 dark:border-zinc-700 px-4 py-2.5
                       bg-zinc-900 text-zinc-100 dark:bg-zinc-900 dark:text-zinc-100
                       focus:outline-pink-400 transition shadow
                       w-full sm:w-[370px] h-[46px] flex-shrink-0"
            style={{ minHeight: 46, maxHeight: 46 }}
          />
          <motion.label
            whileTap={{ scale: 0.96 }}
            className="flex items-center justify-center gap-2 cursor-pointer px-5 py-2.5
                      rounded-lg bg-pink-500 hover:bg-pink-600 text-white text-sm font-semibold
                      transition shadow disabled:opacity-60 h-[46px] min-w-[160px] flex-shrink-0"
            style={{ minHeight: 46, maxHeight: 46 }}
          >
            {uploading ? (
              <motion.span
                key="loading"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.15 }}
              >
                Cargando...
              </motion.span>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth="2" d="M12 16V4m0 0L8 8m4-4 4 4M4 20h16"/></svg>
                Subir imagen
              </>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleUpload}
              className="hidden"
              disabled={uploading}
            />
          </motion.label>
        </div>
        <div className="w-full flex justify-end">
          <span className="text-zinc-500 dark:text-zinc-300 text-sm px-1 select-none">
            {filtered.length} / {images.length}
          </span>
        </div>
      </div>
      <div className="w-full flex justify-center">
        <motion.div layout className="w-full">
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="gallery">
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 w-full"
                >
                  <AnimatePresence>
                    {filtered.length === 0 ? (
                      <motion.div
                        className="col-span-full text-center py-10 text-zinc-400 dark:text-zinc-200"
                        key="noresult"
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 16 }}
                      >
                        Sin resultados 😢
                      </motion.div>
                    ) : (
                      filtered.map((img, idx) => (
                        <Draggable
                          key={img.id}
                          draggableId={img.id.toString()}
                          index={idx}
                        >
                          {(draggableProvided, snapshot) => (
                            <motion.div
                              layout
                              initial={{ opacity: 0, scale: 0.97, y: 18 }}
                              animate={{
                                opacity: 1,
                                scale: snapshot.isDragging ? 1.06 : 1,
                                y: 0,
                                boxShadow: snapshot.isDragging
                                  ? "0 6px 40px 0 #fbc2eb99"
                                  : "0 2px 12px 0 #e9a9ea11"
                              }}
                              exit={{ opacity: 0, scale: 0.97, y: 18 }}
                              transition={{ duration: 0.18 }}
                              ref={draggableProvided.innerRef}
                              {...draggableProvided.draggableProps}
                              {...draggableProvided.dragHandleProps}
                              style={{
                                ...draggableProvided.draggableProps.style,
                                zIndex: snapshot.isDragging ? 30 : 1,
                                cursor: snapshot.isDragging
                                  ? "grabbing"
                                  : "grab"
                              }}
                              onClick={() => openModal(img)}
                            >
                              <ImageCard image={img} />
                            </motion.div>
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
        </motion.div>
      </div>
      {selectedImage && (
        <ImageModal
          image={selectedImage}
          isOpen={modalOpen}
          onClose={closeModal}
          onSave={saveChanges}
          onDelete={deleteImage}
        />
      )}
    </section>
  );
}
