import { test } from "node:test";
import assert from "node:assert/strict";
import { addNote, listNotes, searchNotes } from "../src/notes.js";

void test("add and list", () => {
  addNote("hello", "world");
  assert.equal(listNotes().length >= 1, true);
});

void test("search by keyword", () => {
  addNote("groceries", "milk and eggs");
  assert.equal(searchNotes("milk").length >= 1, true);
});
