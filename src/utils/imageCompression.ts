export const MAX_COMPRESSED_WIDTH = 1600;
export const IMAGE_COMPRESSION_QUALITY = 0.82;
export const OUTPUT_IMAGE_TYPE = "image/webp";

type CompressedImageResult = {
  dataUrl: string;
  width: number;
  height: number;
  size: number;
  mimeType: string;
};

function readBlobAsDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("No se pudo preparar la imagen comprimida."));
    reader.readAsDataURL(blob);
  });
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("El archivo no pudo cargarse como imagen."));
    };

    image.src = objectUrl;
  });
}

function createOutputBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("No se pudo comprimir la imagen."));
          return;
        }

        resolve(blob);
      },
      OUTPUT_IMAGE_TYPE,
      IMAGE_COMPRESSION_QUALITY,
    );
  });
}

export async function compressImageFile(file: File): Promise<CompressedImageResult> {
  const image = await loadImage(file);
  const scale = Math.min(MAX_COMPRESSED_WIDTH / image.naturalWidth, 1);
  const width = Math.max(1, Math.round(image.naturalWidth * scale));
  const height = Math.max(1, Math.round(image.naturalHeight * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Tu navegador no pudo preparar la compresión.");
  }

  context.drawImage(image, 0, 0, width, height);

  const blob = await createOutputBlob(canvas);
  const dataUrl = await readBlobAsDataUrl(blob);

  return {
    dataUrl,
    width,
    height,
    size: blob.size,
    mimeType: blob.type || OUTPUT_IMAGE_TYPE,
  };
}
