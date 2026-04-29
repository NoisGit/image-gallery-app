import type { ImageData } from "../data/images";

export const MAX_UPLOAD_SIZE_MB = 6;
export const MAX_UPLOAD_SIZE_BYTES = MAX_UPLOAD_SIZE_MB * 1024 * 1024;
export const SUPPORTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const CATEGORY_OPTIONS = ["Paisaje", "Ciudad", "Naturaleza", "Viajes", "Personal", "Otro"] as const;
export const DEFAULT_CATEGORY = "Paisaje";

export type Category = (typeof CATEGORY_OPTIONS)[number];
export type SortMode = "manual" | "title" | "uploadedAt" | "favorites";

type StorageLoadResult = {
  images: ImageData[];
  recovered: boolean;
};

type ValidationResult = {
  ok: boolean;
  message?: string;
};

export function isCategory(value: unknown): value is Category {
  return typeof value === "string" && CATEGORY_OPTIONS.includes(value as Category);
}

export function sanitizeText(value: unknown, maxLength: number): string {
  if (typeof value !== "string") return "";

  return value
    .replace(/[<>]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

export function getTitleFromFileName(fileName: string): string {
  const withoutExtension = fileName.replace(/\.[^/.]+$/, "");
  const normalized = withoutExtension.replace(/[-_]+/g, " ").replace(/\s+/g, " ").trim();

  return normalized || "Nueva imagen";
}

export function isSafeImageUrl(value: unknown): value is string {
  if (typeof value !== "string") return false;
  if (value.startsWith("data:image/")) return true;

  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

function readString(source: Record<string, unknown>, key: string, fallback = ""): string {
  return typeof source[key] === "string" ? source[key] : fallback;
}

function readNumber(source: Record<string, unknown>, key: string): number | undefined {
  return typeof source[key] === "number" && Number.isFinite(source[key]) ? source[key] : undefined;
}

function readBoolean(source: Record<string, unknown>, key: string): boolean {
  return typeof source[key] === "boolean" ? source[key] : false;
}

export function normalizeImageData(value: unknown, index: number): ImageData | null {
  if (!value || typeof value !== "object") return null;

  const source = value as Record<string, unknown>;
  const url = readString(source, "url");

  if (!isSafeImageUrl(url)) return null;

  const rawId = readNumber(source, "id");
  const uploadedAt = readString(source, "uploadedAt");

  return {
    id: rawId ?? Date.now() + index,
    title: sanitizeText(readString(source, "title", "Nueva imagen"), 60) || "Nueva imagen",
    description: sanitizeText(readString(source, "description", "Sin descripción."), 180) || "Sin descripción.",
    url,
    category: isCategory(source.category) ? source.category : DEFAULT_CATEGORY,
    isFavorite: readBoolean(source, "isFavorite"),
    originalName: sanitizeText(readString(source, "originalName"), 120) || undefined,
    size: readNumber(source, "size"),
    mimeType: sanitizeText(readString(source, "mimeType"), 40) || undefined,
    uploadedAt: Number.isNaN(Date.parse(uploadedAt)) ? undefined : uploadedAt,
    width: readNumber(source, "width"),
    height: readNumber(source, "height"),
  };
}

export function normalizeImages(value: unknown): ImageData[] {
  if (!Array.isArray(value)) return [];

  const usedIds = new Set<number>();

  return value.reduce<ImageData[]>((items, item, index) => {
    const normalized = normalizeImageData(item, index);
    if (!normalized) return items;

    if (usedIds.has(normalized.id)) {
      normalized.id = Date.now() + index;
    }

    usedIds.add(normalized.id);
    items.push(normalized);
    return items;
  }, []);
}

export function loadImagesFromStorage(storageKey: string, fallback: ImageData[]): StorageLoadResult {
  if (typeof window === "undefined") {
    return { images: normalizeImages(fallback), recovered: false };
  }

  const rawValue = window.localStorage.getItem(storageKey);
  if (!rawValue) return { images: normalizeImages(fallback), recovered: false };

  try {
    const parsed = JSON.parse(rawValue) as unknown;
    if (!Array.isArray(parsed)) throw new Error("Invalid gallery data");

    const normalized = normalizeImages(parsed);
    return { images: normalized, recovered: normalized.length !== parsed.length };
  } catch {
    window.localStorage.removeItem(storageKey);
    return { images: normalizeImages(fallback), recovered: true };
  }
}

export function saveImagesToStorage(storageKey: string, images: ImageData[]): string | null {
  if (typeof window === "undefined") return null;

  try {
    window.localStorage.setItem(storageKey, JSON.stringify(images));
    return null;
  } catch {
    return "No se pudo guardar la galería. Prueba eliminando imágenes pesadas.";
  }
}

export function validateImageFile(file: File): ValidationResult {
  if (!SUPPORTED_IMAGE_TYPES.includes(file.type)) {
    return { ok: false, message: "Formato no permitido. Usa imágenes JPG, PNG o WEBP." };
  }

  if (file.size > MAX_UPLOAD_SIZE_BYTES) {
    return { ok: false, message: `La imagen supera los ${MAX_UPLOAD_SIZE_MB}MB permitidos.` };
  }

  return { ok: true };
}

export function validateImageDetails(title: string, description: string): ValidationResult {
  if (sanitizeText(title, 60).length < 2) {
    return { ok: false, message: "El título debe tener al menos 2 caracteres." };
  }

  if (sanitizeText(description, 180).length < 4) {
    return { ok: false, message: "La descripción debe tener al menos 4 caracteres." };
  }

  return { ok: true };
}

export function sortImages(images: ImageData[], sortMode: SortMode): ImageData[] {
  const items = [...images];

  if (sortMode === "title") {
    return items.sort((a, b) => a.title.localeCompare(b.title, "es", { sensitivity: "base" }));
  }

  if (sortMode === "uploadedAt") {
    return items.sort((a, b) => (Date.parse(b.uploadedAt ?? "") || 0) - (Date.parse(a.uploadedAt ?? "") || 0));
  }

  if (sortMode === "favorites") {
    return items.sort((a, b) => Number(Boolean(b.isFavorite)) - Number(Boolean(a.isFavorite)));
  }

  return items;
}

export function formatFileSize(size?: number): string {
  if (!size) return "No disponible";
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(2)} MB`;
}

export function formatDate(date?: string): string {
  if (!date || Number.isNaN(Date.parse(date))) return "No disponible";

  return new Intl.DateTimeFormat("es-CL", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
}

export function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Ocurrió un error inesperado.";
}
