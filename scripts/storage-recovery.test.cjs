const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const sourcePath = path.resolve(__dirname, '..', 'src', 'utils', 'gallery.ts');
const source = fs.readFileSync(sourcePath, 'utf8');

function test(name, assertion) {
  try {
    assertion();
    console.log(`ok - ${name}`);
  } catch (error) {
    console.error(`not ok - ${name}`);
    throw error;
  }
}

test('storage loader exists', () => {
  assert.match(source, /export function loadImagesFromStorage/);
});

test('storage loader protects JSON parsing', () => {
  assert.match(source, /try\s*{/);
  assert.match(source, /JSON\.parse/);
  assert.match(source, /catch\s*{/);
});

test('invalid storage is removed after recovery', () => {
  assert.match(source, /localStorage\.removeItem\(storageKey\)/);
});

test('fallback images are normalized before returning', () => {
  assert.match(source, /normalizeImages\(fallback\)/);
});

test('saved values must be arrays', () => {
  assert.match(source, /Array\.isArray\(parsed\)/);
});

test('image urls are validated during normalization', () => {
  assert.match(source, /isSafeImageUrl\(url\)/);
});

console.log('storage recovery regression checks completed');
