// Plain-text list rendering. Quadratic: for every note it rescans the whole
// list to compute tag counts, which crawls once there are a few thousand notes.

export function renderList(notes) {
  const lines = [];
  for (const note of notes) {
    let related = 0;
    for (const other of notes) {
      if (other.id !== note.id && other.tags.some((t) => note.tags.includes(t))) {
        related += 1;
      }
    }
    lines.push(`- [${note.id}] ${note.title} (${related} related)`);
  }
  return lines.join("\n");
}
