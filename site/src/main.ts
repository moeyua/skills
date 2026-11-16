import { Marked } from "marked";
import { parseSkills, type Skill } from "./skills.ts";

const raw = import.meta.glob<string>("../../skills/**/*", {
  query: "?raw",
  import: "default",
  eager: true,
});
const files = Object.fromEntries(
  Object.entries(raw).map(([path, text]) => [path.replace("../../skills/", ""), text]),
);
const skills = parseSkills(files);

const sidebar = document.querySelector<HTMLElement>("#sidebar")!;
const content = document.querySelector<HTMLElement>("#content")!;

function escape(text: string): string {
  return text.replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!,
  );
}

function badges(skill: Skill): string {
  return skill.manualOnly ? `<span class="badge">只能手动调用</span>` : "";
}

function groups(list: Skill[]): Map<string, Skill[]> {
  const map = new Map<string, Skill[]>();
  for (const skill of list) map.set(skill.category, [...(map.get(skill.category) ?? []), skill]);
  return map;
}

function renderSidebar(current?: string): void {
  const sections = [...groups(skills)].map(
    ([category, list]) => `
      <section>
        <h2>${escape(category)}</h2>
        <ul>${list
          .map(
            (s) =>
              `<li><a href="#/${s.name}" class="${s.name === current ? "active" : ""}">${escape(s.name)}</a>${badges(s)}</li>`,
          )
          .join("")}</ul>
      </section>`,
  );
  sidebar.innerHTML = `<h1><a href="#/">Skills</a></h1>${sections.join("")}`;
}

function renderSkill(skill: Skill): void {
  const markdown = new Marked();
  content.innerHTML = `
    <header class="skill-header">
      <p class="category">${escape(skill.category)}</p>
      <h1>${escape(skill.name)} ${badges(skill)}</h1>
      <p class="description">${escape(skill.description)}</p>
      ${skill.credits ? `<p class="credits">改编来源：${escape(skill.credits)}</p>` : ""}
    </header>
    <article class="markdown">${markdown.parse(skill.body) as string}</article>`;
}

function route(): void {
  const name = decodeURIComponent(location.hash.replace(/^#\/?/, "")).split("/")[0];
  const skill = skills.find((s) => s.name === name);
  renderSidebar(skill?.name);
  if (skill) renderSkill(skill);
  else content.innerHTML = "";
  window.scrollTo(0, 0);
}

window.addEventListener("hashchange", route);
route();
