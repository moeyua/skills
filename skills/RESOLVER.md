# Praxis Skill Resolver

> 触发词到技能的路由表。Claude Code 通过每个 SKILL.md 的 `description` 自动匹配，这份文档是给人看的集中索引，也是 `tests/smoke/verify-skills.test.ts` 的校验依据。改 SKILL.md 的适用范围时，同步改这里。

## 按工作流阶段分路

### 0. 理解阶段

| 触发                                                                                                        | 技能                      |
| ----------------------------------------------------------------------------------------------------------- | ------------------------- |
| 新仓库 / 不熟悉的模块 / "先看看这个项目" / "整体了解一下" / "看一下 X 模块" / `$explore` / 为后续工作打基础 | `skills/explore/SKILL.md` |

### 1. 设计阶段

| 触发 | 技能                    |
| ---- | ----------------------- |
| TODO | `skills/think/SKILL.md` |

### 2. 执行阶段

| 触发 | 技能                        |
| ---- | --------------------------- |
| TODO | `skills/implement/SKILL.md` |

### 3. 验证阶段

| 触发 | 技能                   |
| ---- | ---------------------- |
| TODO | `skills/test/SKILL.md` |

### 4. 把关阶段

| 触发 | 技能                     |
| ---- | ------------------------ |
| TODO | `skills/review/SKILL.md` |

### 5. 入库 / 推送阶段

| 触发                                                             | 技能                     |
| ---------------------------------------------------------------- | ------------------------ |
| "提交" / "commit" / "入库" / `$commit` / 改完代码要入库          | `skills/commit/SKILL.md` |
| "开 PR" / "推送" / "提评审" / `$push` / commit 完要推到远端开 PR | `skills/push/SKILL.md`   |

## Disambiguation

> 多个技能都可能匹配时的消解规则。TODO: 写完每个 SKILL.md 后回填。

## Chaining

技能默认不自动串联。每个技能完成后会停下来等用户决定下一步。

基础闭环：

```
explore → think → implement → test → review → commit → push
```

think 内部根据意图走不同 mode：default / fix / feat / refactor / perf。
