/**
 * Judge output parsing and schema validation.
 *
 * Hand-rolled on purpose: the repo ships zero runtime dependencies, and the
 * schema is small enough that clear error strings beat a validator library.
 */

export interface RequirementVerdict {
  requirement: string;
  verdict: "pass" | "fail" | "n.a.";
  evidenceTurns: number[];
  reason: string;
}

export interface JudgeVerdict {
  requirements: RequirementVerdict[];
  score: number;
  summary: string;
}

const VERDICTS = new Set(["pass", "fail", "n.a."]);

function stripFences(raw: string): string {
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return raw;
  return raw.slice(start, end + 1);
}

export function parseJudgeOutput(raw: string, requirementNames: string[]): JudgeVerdict {
  let parsed: unknown;
  try {
    parsed = JSON.parse(stripFences(raw));
  } catch {
    throw new Error("judge 输出不是合法 JSON");
  }
  if (typeof parsed !== "object" || parsed === null) {
    throw new Error("judge 输出不是 JSON 对象");
  }
  const o = parsed as Record<string, unknown>;
  const errors: string[] = [];

  const requirements: RequirementVerdict[] = [];
  if (!Array.isArray(o["requirements"])) {
    errors.push("缺少 requirements 数组");
  } else {
    for (const r of o["requirements"] as unknown[]) {
      const req = r as Record<string, unknown>;
      const name = req["requirement"];
      const verdict = req["verdict"];
      if (typeof name !== "string") {
        errors.push("requirements 中有元素缺 requirement 名");
        continue;
      }
      if (typeof verdict !== "string" || !VERDICTS.has(verdict)) {
        errors.push(`Requirement「${name}」的 verdict 非法:${String(verdict)}`);
        continue;
      }
      const evidenceTurns = Array.isArray(req["evidenceTurns"])
        ? (req["evidenceTurns"] as unknown[]).filter((t): t is number => typeof t === "number")
        : [];
      requirements.push({
        requirement: name,
        verdict: verdict as RequirementVerdict["verdict"],
        evidenceTurns,
        reason: typeof req["reason"] === "string" ? req["reason"] : "",
      });
    }
    const seen = new Set(requirements.map((r) => r.requirement));
    for (const name of requirementNames) {
      if (!seen.has(name)) errors.push(`缺少 Requirement「${name}」的判定`);
    }
    for (const name of seen) {
      if (!requirementNames.includes(name)) errors.push(`出现清单外的 Requirement「${name}」`);
    }
  }

  const score = o["score"];
  if (typeof score !== "number" || score < 0 || score > 10) {
    errors.push(`score 非法:${String(score)}(需 0-10 数字)`);
  }

  if (errors.length > 0) {
    throw new Error(errors.join(";"));
  }
  return {
    requirements,
    score: score as number,
    summary: typeof o["summary"] === "string" ? o["summary"] : "",
  };
}
