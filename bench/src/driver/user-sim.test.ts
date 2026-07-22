/**
 * Unit tests for the user simulator, with an injected fake model.
 */

import { describe, it, expect } from "vite-plus/test";
import { buildUserSimPrompt, simulateUser, matchOptionLabel } from "./user-sim.ts";
import type { ScenarioCard } from "../scenario.ts";

const CARD: ScenarioCard = {
  id: "feat-note-pinning",
  kind: "feat",
  title: "置顶",
  fixture: "notes-app",
  initialIntent: "我想加一个置顶笔记的功能。",
  intentCard: "- 隐藏动机:常用笔记被顶下去。\n- 约束:不大改数据结构。",
  answerPolicy: "- 被问到排序:答「后置顶的排前面」。\n- 意图卡未覆盖的信息一律答「你决定」。",
  path: "/x/feat-note-pinning.md",
};

describe("buildUserSimPrompt", () => {
  it("embeds intent card, answer policy, history, and question", () => {
    const prompt = buildUserSimPrompt({
      card: CARD,
      history: "[T1] USER: 我想加置顶",
      question: "置顶之间怎么排序?",
    });
    expect(prompt).toContain("常用笔记被顶下去");
    expect(prompt).toContain("后置顶的排前面");
    expect(prompt).toContain("[T1] USER: 我想加置顶");
    expect(prompt).toContain("置顶之间怎么排序?");
    expect(prompt).toContain("一律回答「你决定」");
  });

  it("renders AskUserQuestion options as a multiple-choice section", () => {
    const prompt = buildUserSimPrompt({
      card: CARD,
      history: "",
      question: "要哪种方向?",
      options: [{ label: "方案 A", description: "轻量" }, { label: "方案 B" }],
    });
    expect(prompt).toContain("选项");
    expect(prompt).toContain("方案 A:轻量");
    expect(prompt).toContain("方案 B");
    expect(prompt).toContain("label 原文");
  });
});

describe("matchOptionLabel", () => {
  const options = [{ label: "方案 A" }, { label: "方案 B:完整转义" }];

  it("returns the label when the reply starts with it", () => {
    expect(matchOptionLabel("方案 B:完整转义:都要处理", options)).toBe("方案 B:完整转义");
  });

  it("returns the label when the reply contains it", () => {
    expect(matchOptionLabel("就选方案 A 吧", options)).toBe("方案 A");
  });

  it("falls back to the raw reply when nothing matches", () => {
    expect(matchOptionLabel("都不要,先不做", options)).toBe("都不要,先不做");
  });
});

describe("simulateUser", () => {
  it("passes the assembled prompt to the model and trims the reply", () => {
    let seen = "";
    const reply = simulateUser(
      { card: CARD, history: "h", question: "q?" },
      {
        runModel: (p) => {
          seen = p;
          return "  你决定\n";
        },
      },
    );
    expect(reply).toBe("你决定");
    expect(seen).toContain("q?");
  });
});
