export type ImageData = {
  id: number;
  title: string;
  description: string;
  url: string;
  category?: string;
  isFavorite?: boolean;
  originalName?: string;
  size?: number;
  mimeType?: string;
  uploadedAt?: string;
  width?: number;
  height?: number;
};

export const images: ImageData[] = [
  {
    id: 1,
    title: "Montaña Rosa",
    description: "Amanecer suave entre montañas y tonos pastel.",
    url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80",
    category: "Paisaje",
    isFavorite: true,
    originalName: "montana-rosa.jpg",
    mimeType: "image/jpeg",
    uploadedAt: "2026-03-20T09:30:00.000Z",
    width: 1200,
    height: 800,
  },
  {
    id: 2,
    title: "Ciudad Nocturna",
    description: "Luces urbanas, contraste y movimiento por la noche.",
    url: "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=1200&q=80",
    category: "Ciudad",
    originalName: "ciudad-nocturna.jpg",
    mimeType: "image/jpeg",
    uploadedAt: "2026-03-22T21:10:00.000Z",
    width: 1200,
    height: 800,
  },
  {
    id: 3,
    title: "Playa Tranquila",
    description: "Una escena limpia y relajada junto al mar.",
    url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
    category: "Viajes",
    isFavorite: true,
    originalName: "playa-tranquila.jpg",
    mimeType: "image/jpeg",
    uploadedAt: "2026-03-24T12:00:00.000Z",
    width: 1200,
    height: 800,
  },
  {
    id: 4,
    title: "Bosque Encantado",
    description: "Verde profundo, naturaleza y ambiente de calma.",
    url: "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1200&q=80",
    category: "Naturaleza",
    originalName: "bosque-encantado.jpg",
    mimeType: "image/jpeg",
    uploadedAt: "2026-03-26T15:45:00.000Z",
    width: 1200,
    height: 800,
  },
  {
    id: 5,
    title: "Vía Láctea",
    description: "Cielo estrellado con una vibra cinematográfica.",
    url: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=1200&q=80",
    category: "Paisaje",
    originalName: "via-lactea.jpg",
    mimeType: "image/jpeg",
    uploadedAt: "2026-03-28T02:20:00.000Z",
    width: 1200,
    height: 800,
  },
  {
    id: 6,
    title: "Lago Espejado",
    description: "Reflejo perfecto para una galería visual y elegante.",
    url: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=80",
    category: "Naturaleza",
    originalName: "lago-espejado.jpg",
    mimeType: "image/jpeg",
    uploadedAt: "2026-03-30T10:00:00.000Z",
    width: 1200,
    height: 800,
  },
  {
    id: 7,
    title: "Atardecer Urbano",
    description: "Colores intensos sobre edificios y calles activas.",
    url: "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=1200&q=80",
    category: "Ciudad",
    originalName: "atardecer-urbano.jpg",
    mimeType: "image/jpeg",
    uploadedAt: "2026-04-01T19:05:00.000Z",
    width: 1200,
    height: 800,
  },
  {
    id: 8,
    title: "Montaña Nevada",
    description: "Texturas frías, nieve y una vista limpia de invierno.",
    url: "https://images.unsplash.com/photo-1464820453369-31d2c0b651af?auto=format&fit=crop&w=1200&q=80",
    category: "Paisaje",
    originalName: "montana-nevada.jpg",
    mimeType: "image/jpeg",
    uploadedAt: "2026-04-03T08:25:00.000Z",
    width: 1200,
    height: 800,
  },
  {
    id: 9,
    title: "Jardín Japonés",
    description: "Paz visual, agua y vegetación con estética delicada.",
    url: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
    category: "Viajes",
    isFavorite: true,
    originalName: "jardin-japones.jpg",
    mimeType: "image/jpeg",
    uploadedAt: "2026-04-05T11:40:00.000Z",
    width: 1200,
    height: 800,
  },
];
