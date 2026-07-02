// In-memory storage. Persistence, caching and note bookkeeping all live here,
// tangled together — candidates keep asking to split it.

const notes = [];
const titleIndex = new Map();
let dirty = false;
let lastSavedAt = null;

export function saveNote(note) {
  notes.push(note);
  titleIndex.set(note.title, note.id);
  dirty = true;
  lastSavedAt = Date.now();
}

export function loadAllNotes() {
  return notes.slice();
}

export function findIdByTitle(title) {
  return titleIndex.get(title);
}

export function isDirty() {
  return dirty;
}

export function lastSaved() {
  return lastSavedAt;
}
