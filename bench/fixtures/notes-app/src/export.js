// CSV export. Known bug: values containing commas or quotes are not escaped,
// so exported rows shift columns.

export function exportCsv(notes) {
  const header = "id,title,body,tags";
  const rows = notes.map((n) => `${n.id},${n.title},${n.body},${n.tags.join(";")}`);
  return [header, ...rows].join("\n");
}
