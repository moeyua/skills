# Issue Formats

Read this file only after `issue` has selected one mode label. Render exactly one matching template; keep its `##` headings and order unchanged.

## Shared rules

- The title, headings, and prose are Chinese. Code identifiers, commands, and proper nouns may retain their original spelling for precision.
- Replace every HTML comment with confirmed content and remove the comment itself before creation.
- Every section is required and non-empty. Do not output `TODO`, `TBD`, ellipses, generic placeholders, or invented facts.
- If an unknown observation is itself part of the work, state it explicitly as a complete fact, such as “当前尚无稳定复现路径，本任务包含复现条件调查” or “当前基线尚未测量，本任务首先建立可重复基线”.
- Keep detail inside the defined sections. Do not add, remove, rename, or reorder `##` headings.
- Write acceptance criteria as Markdown checkboxes whose completion can be observed or measured.

## Label metadata

Create only the selected missing label. Never rewrite an existing label.

| Label      | Description                    | Color    |
| ---------- | ------------------------------ | -------- |
| `fix`      | 修复错误、异常行为或回归       | `d73a4a` |
| `feat`     | 新增用户可观察的能力或行为     | `a2eeef` |
| `refactor` | 保持外部行为不变的内部结构调整 | `5319e7` |
| `perf`     | 具有可测量目标的性能改进       | `fbca04` |

## `fix`

```markdown
## 背景

<!-- 说明问题出现的业务或技术上下文，以及为什么需要处理。 -->

## 问题描述

<!-- 准确描述错误、异常行为或回归，不写未经证实的根因。 -->

## 复现步骤

<!-- 写出已确认的最小复现路径；若尚不稳定，明确把复现条件调查写入任务。 -->

## 预期行为

<!-- 说明正确情况下应观察到的行为。 -->

## 实际行为

<!-- 说明当前实际观察到的行为和已知影响。 -->

## 范围

<!-- 说明本次需要覆盖的范围、限制，以及明确不处理的相邻问题。 -->

## 验收标准

- [ ] <!-- 写入一个可验证的修复结果。 -->
```

## `feat`

```markdown
## 背景

<!-- 说明提出能力的上下文和现有缺口。 -->

## 目标

<!-- 用用户可观察的结果描述要新增的能力。 -->

## 用户场景

<!-- 说明谁在什么情况下使用它并获得什么结果。 -->

## 范围

<!-- 说明第一版包含的行为、输入、输出和限制。 -->

## 非目标

<!-- 明确本 Issue 不处理的相邻能力或扩展。 -->

## 验收标准

- [ ] <!-- 写入一个可验证的功能结果。 -->
```

## `refactor`

```markdown
## 背景

<!-- 说明当前结构的问题和重构动机。 -->

## 重构目标

<!-- 说明期望得到的内部结构改善，不混入新功能或修复。 -->

## 行为不变量

<!-- 列出重构前后必须保持不变的外部行为、副作用和重要性能特征。 -->

## 范围

<!-- 说明允许调整的结构边界和明确不处理的行为变化。 -->

## 验收标准

- [ ] <!-- 写入一个可验证的结构结果或回归保障。 -->
```

## `perf`

```markdown
## 背景

<!-- 说明性能问题出现的场景及其影响。 -->

## 性能问题

<!-- 说明当前可观察的延迟、吞吐、资源或响应性问题。 -->

## 衡量指标

<!-- 指定用于判断改善的指标。 -->

## 当前基线

<!-- 写入已测基线；若未知，明确把建立可重复基线写入任务。 -->

## 目标

<!-- 写入可测目标；若目标需要先由基线推导，明确该决策条件。 -->

## 测量方式

<!-- 说明复现环境、命令、工具或采样方法。 -->

## 范围

<!-- 说明允许优化的边界、不可接受的代价和明确不处理的行为变化。 -->

## 验收标准

- [ ] <!-- 写入一个可重复验证的性能结果。 -->
```
