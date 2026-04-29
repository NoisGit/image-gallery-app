const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');

function readSource(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

function test(name, assertion) {
  try {
    assertion();
    console.log(`ok - ${name}`);
  } catch (error) {
    console.error(`not ok - ${name}`);
    throw error;
  }
}

const gallery = readSource('src/components/Gallery.tsx');
const modal = readSource('src/components/ImageModal.tsx');
const card = readSource('src/components/ImageCard.tsx');
const compression = readSource('src/utils/imageCompression.ts');

test('gallery keeps search and filtering controls', () => {
  assert.match(gallery, /placeholder="Buscar por título, descripción o categoría\.\.\."/);
  assert.match(gallery, /setCategoryFilter/);
  assert.match(gallery, /setShowFavoritesOnly/);
});

test('gallery keeps import and export actions', () => {
  assert.match(gallery, /Exportar JSON/);
  assert.match(gallery, /Importar JSON/);
  assert.match(gallery, /handleImport/);
  assert.match(gallery, /exportGallery/);
});

test('gallery compresses uploads before saving', () => {
  assert.match(gallery, /compressImageFile/);
  assert.match(gallery, /Optimizando imagen/);
  assert.match(compression, /canvas\.toBlob/);
});

test('modal keeps keyboard and unsaved changes protection', () => {
  assert.match(modal, /KeyboardEvent/);
  assert.match(modal, /Escape/);
  assert.match(modal, /Tienes cambios sin guardar/);
});

test('image card keeps favorite action accessibility', () => {
  assert.match(card, /aria-pressed/);
  assert.match(card, /Marcar como favorita/);
  assert.match(card, /Quitar de favoritas/);
});

test('gallery keeps empty state guidance', () => {
  assert.match(gallery, /Tu galería está vacía/);
  assert.match(gallery, /No encontramos resultados/);
  assert.match(gallery, /Limpiar filtros/);
});

console.log('component regression checks completed');
