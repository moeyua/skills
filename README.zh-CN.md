# Skills

[English](./README.md) | 简体中文

我自己用的 Claude Code / Codex skills。每个 skill 只做一件事，写的是具体怎么做、产出长什么样。

## 日常流程

```
setup（每个项目一次）
explore → shape → plan → implement → verify → release
                           ↘ debug / review（随时调用）
```

任何一步都可以单独用，不必按顺序走。

| Skill                                                | 做什么                                                                                               | 什么时候用                                 |
| ---------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | ------------------------------------------ |
| [setup](./skills/engineering/setup/SKILL.md)         | 补齐项目文档；问清计划存在哪里，写进 CLAUDE.md 和 AGENTS.md；没有 RELEASE.md 的项目搭好发版规则和 CI | 新项目接入，或 skill 更新后，手动 `/setup` |
| [explore](./skills/engineering/explore/SKILL.md)     | 先读项目文档再读代码，文档和代码冲突时两边都报                                                       | "先看看这个项目"                           |
| [shape](./skills/engineering/shape/SKILL.md)         | 一轮轮追问，每个问题附推荐答案，回"是"就推进；定下的术语写进 GLOSSARY                                | "想想"、"我也不知道"、"怎么设计"           |
| [plan](./skills/engineering/plan/SKILL.md)           | 一屏以内的计划：目标、已定的决定（附来源）、待确认的决定（附理由）、可演示的切片                     | "写个计划"                                 |
| [implement](./skills/engineering/implement/SKILL.md) | 先复述目标；逐个切片测试先行，每个切片 commit；最后告诉你怎么亲眼看到效果、我替你做了哪些决定        | "实现"、"落实"                             |
| [verify](./skills/engineering/verify/SKILL.md)       | 真的去用一遍，逐条对照预期，每条标明实测、推断还是猜测                                               | "验证一下"、"跑测试"                       |
| [debug](./skills/engineering/debug/SKILL.md)         | 先造一个能复现 bug 的回路，再假设、插桩、修复、补回归测试                                            | "这里坏了"、"报错了"、"变慢了"             |
| [review](./skills/engineering/review/SKILL.md)       | 两个子 agent 并行审阅：是否合项目规范、是否合需求                                                    | "review 一下这个分支"                      |
| [release](./skills/engineering/release/SKILL.md)     | 按 RELEASE.md 发版、打 tag、建 GitHub Release，确认部署结果                                          | "发版"                                     |
| [docs](./skills/engineering/docs/SKILL.md)           | 八类项目文档的格式（specs、PRODUCT、ARCHITECTURE、DESIGN、ROADMAP、README、GLOSSARY、ADR）           | 其他 skill 读写项目文档时自动查阅          |
| [handoff](./skills/productivity/handoff/SKILL.md)    | 把当前会话压缩成交接文档                                                                             | 换会话前，手动 `/handoff`                  |
| [explain](./skills/productivity/explain/SKILL.md)    | 换个直白的说法重讲刚才那段                                                                           | 没看懂时，手动 `/explain`                  |

## 项目文档

八类文档是项目的长期记忆：implement、shape、setup 写，explore 读，格式统一由 docs 提供。哪类文档管什么，见 [memory-catalog](./skills/engineering/docs/references/memory-catalog.md)。

## 安装

```bash
pnpm install
```

`install` 脚本会执行 `skills add . -g -a claude-code -a codex -y`，全局安装到 Claude Code 和 Codex。只装某一个：

```bash
npx skills add . --skill plan
```

## 开发

```bash
pnpm check
pnpm test
```

测试只检查结构：skill 名和目录名一致、有 description、相对链接指向的文件存在。行为好不好，要实际用了才知道。改 skill 之前先读 [CONTRIBUTING.md](./CONTRIBUTING.md)。

## 致谢

多个 skill 改编自 [mattpocock/skills](https://github.com/mattpocock/skills)，部分写法参考了 [backnotprop/pstack](https://github.com/backnotprop/pstack)。详见 [THIRD_PARTY_NOTICES.md](./THIRD_PARTY_NOTICES.md)。

## License

MIT
