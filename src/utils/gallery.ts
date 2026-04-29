export const MAX_UPLOAD_SIZE_MB = 6;
export const MAX_UPLOAD_SIZE_BYTES = MAX_UPLOAD_SIZE_MB * 1024 * 1024;
export const CATEGORY_OPTIONS = ["Paisaje", "Ciudad", "Naturaleza", "Viajes", "Personal", "Otro"] as const;
export const DEFAULT_CATEGORY = "Paisaje";
export type Category = (typeof CATEGORY_OPTIONS)[number];
export type SortMode = "manual" | "title" | "uploadedAt" | "favorites";
