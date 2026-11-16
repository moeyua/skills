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

const SKILL_FILE = "SKILL.md";

function fileHref(skill: Skill, path: string): string {
  return path === SKILL_FILE ? `#/${skill.name}` : `#/${skill.name}/${path}`;
}

/** Resolve a relative link in `from` (a path inside the skill) to a page route, if it points at a file of this skill. */
function resolveLink(skill: Skill, from: string, href: string): string | undefined {
  if (/^[a-z]+:/i.test(href) || href.startsWith("#")) return undefined;
  const parts = from.split("/").slice(0, -1);
  for (const part of href.split("#")[0]!.split("/")) {
    if (part === "..") parts.pop();
    else if (part !== "." && part !== "") parts.push(part);
  }
  const target = parts.join("/");
  const exists = target === SKILL_FILE || skill.files.some((f) => f.path === target);
  return exists ? fileHref(skill, target) : undefined;
}

function renderMarkdown(skill: Skill, from: string, text: string): string {
  const markdown = new Marked({
    walkTokens(token) {
      if (token.type === "link") token.href = resolveLink(skill, from, token.href) ?? token.href;
    },
  });
  return markdown.parse(text) as string;
}

function renderSkill(skill: Skill, path: string): void {
  const paths = [SKILL_FILE, ...skill.files.map((f) => f.path)];
  const file = skill.files.find((f) => f.path === path);
  const body = file
    ? file.path.endsWith(".md")
      ? renderMarkdown(skill, file.path, file.content)
      : `<pre class="plain">${escape(file.content)}</pre>`
    : renderMarkdown(skill, SKILL_FILE, skill.body);
  const current = file ? file.path : SKILL_FILE;
  content.innerHTML = `
    <header class="skill-header">
      <p class="category">${escape(skill.category)}</p>
      <h1>${escape(skill.name)} ${badges(skill)}</h1>
      <p class="description">${escape(skill.description)}</p>
      ${skill.credits ? `<p class="credits">改编来源：${escape(skill.credits)}</p>` : ""}
    </header>
    ${
      paths.length > 1
        ? `<nav class="files"><span>文件</span>${paths
            .map(
              (p) =>
                `<a href="${fileHref(skill, p)}" class="${p === current ? "active" : ""}">${escape(p)}</a>`,
            )
            .join("")}</nav>`
        : ""
    }
    <article class="markdown">${body}</article>`;
}

function route(): void {
  const [name = "", ...rest] = decodeURIComponent(location.hash.replace(/^#\/?/, "")).split("/");
  const skill = skills.find((s) => s.name === name);
  renderSidebar(skill?.name);
  if (skill) renderSkill(skill, rest.join("/"));
  else content.innerHTML = "";
  window.scrollTo(0, 0);
}

window.addEventListener("hashchange", route);
route();
