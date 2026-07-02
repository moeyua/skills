/**
 * Scenario card validation tests: the live cards in bench/scenarios/ must all
 * parse, and malformed cards must be rejected with a reason.
 */

import { describe, it, expect } from "vite-plus/test";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { loadScenarios, parseScenarioCard, SCENARIO_MODES } from "./scenario.ts";

const BENCH_ROOT = join(import.meta.dirname, "..");
const SCENARIOS = join(BENCH_ROOT, "scenarios");
const FIXTURES = join(BENCH_ROOT, "fixtures");

const VALID_CARD = `---
id: sample-card
mode: feat
title: 样例
fixture: app
---

## 初始意图

加个功能。

## 意图卡

- 动机:测试。

## 答题策略

- 一律答「你决定」。
`;

function tempCardDir(): { dir: string; fixtures: string } {
  const dir = mkdtempSync(join(tmpdir(), "bench-scenario-"));
  const fixtures = join(dir, "fixtures");
  mkdirSync(join(fixtures, "app"), { recursive: true });
  writeFileSync(join(fixtures, "app", "README.md"), "fixture");
  return { dir, fixtures };
}

describe("live scenario cards", () => {
  it("all cards in bench/scenarios parse and validate", () => {
    const cards = loadScenarios(SCENARIOS, FIXTURES);
    expect(cards.length).toBeGreaterThanOrEqual(7);
    for (const card of cards) {
      expect(SCENARIO_MODES).toContain(card.mode);
      expect(card.initialIntent.length).toBeGreaterThan(0);
      expect(card.intentCard.length).toBeGreaterThan(0);
      expect(card.answerPolicy.length).toBeGreaterThan(0);
    }
  });

  it("covers all five modes plus failure-targeted cards", () => {
    const cards = loadScenarios(SCENARIOS, FIXTURES);
    const modes = new Set(cards.map((c) => c.mode));
    for (const mode of SCENARIO_MODES) expect(modes).toContain(mode);
  });
});

describe("parseScenarioCard validation", () => {
  it("accepts a well-formed card", () => {
    const { dir, fixtures } = tempCardDir();
    const path = join(dir, "sample-card.md");
    writeFileSync(path, VALID_CARD);
    try {
      const card = parseScenarioCard(path, fixtures);
      expect(card.id).toBe("sample-card");
      expect(card.fixture).toBe("app");
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("rejects a card with an unknown mode", () => {
    const { dir, fixtures } = tempCardDir();
    const path = join(dir, "sample-card.md");
    writeFileSync(path, VALID_CARD.replace("mode: feat", "mode: build"));
    try {
      expect(() => parseScenarioCard(path, fixtures)).toThrowError(/mode 非法/);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("rejects a card missing a required section", () => {
    const { dir, fixtures } = tempCardDir();
    const path = join(dir, "sample-card.md");
    writeFileSync(path, VALID_CARD.replace("## 答题策略", "## 其他"));
    try {
      expect(() => parseScenarioCard(path, fixtures)).toThrowError(/答题策略/);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("rejects a card whose fixture directory is missing", () => {
    const { dir, fixtures } = tempCardDir();
    const path = join(dir, "sample-card.md");
    writeFileSync(path, VALID_CARD.replace("fixture: app", "fixture: nope"));
    try {
      expect(() => parseScenarioCard(path, fixtures)).toThrowError(/fixture 目录不存在/);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("rejects id / filename mismatch", () => {
    const { dir, fixtures } = tempCardDir();
    const path = join(dir, "other-name.md");
    writeFileSync(path, VALID_CARD);
    try {
      expect(() => parseScenarioCard(path, fixtures)).toThrowError(/不一致/);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
