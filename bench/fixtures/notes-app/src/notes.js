import { saveNote, loadAllNotes } from "./storage.js";

let nextId = 1;

export function addNote(title, body, tags = []) {
  const note = {
    id: nextId++,
    title,
    body,
    tags,
    createdAt: new Date().toISOString(),
  };
  saveNote(note);
  return note;
}

export function listNotes() {
  return loadAllNotes();
}

export function searchNotes(keyword) {
  return loadAllNotes().filter((n) => n.title.includes(keyword) || n.body.includes(keyword));
}
