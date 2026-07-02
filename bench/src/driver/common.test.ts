/**
 * Unit tests for shared driver helpers.
 */

import { describe, it, expect } from "vite-plus/test";
import { endsWithQuestion } from "./common.ts";

describe("endsWithQuestion", () => {
  it("detects a plain trailing question", () => {
    expect(endsWithQuestion("目标用户是谁?")).toBe(true);
  });

  it("detects the fullwidth question mark (U+FF1F)", () => {
    // constructed via escape so an editor can never silently downgrade it
    const fullwidth = `确认按这个设计写计划吗${"？"}如果确认,我会写 plans/2026-07-02-fix.md。`;
    expect(endsWithQuestion(fullwidth)).toBe(true);
  });

  it("detects a confirmation request whose last line ends with a period", () => {
    // real driven-session tail: the question mark sits one line above the end
    const tail =
      "唯一需要你确认:是否按推荐设计推进,并把测试脚本修复一起纳入计划?回复“按推荐来”即可,我会先写 plans/ 里的 fix plan。";
    expect(endsWithQuestion(tail)).toBe(true);
  });

  it("stays false for a closing statement", () => {
    expect(
      endsWithQuestion("Plan written to plans/2026-07-02-fix-csv.md\n\n按计划实施即可。"),
    ).toBe(false);
  });
});
