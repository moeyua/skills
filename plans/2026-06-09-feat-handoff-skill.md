---
mode: feat
title: 新增 handoff skill - 会话交接摘要
created: 2026-06-09
status: done
---

# 新增 handoff skill - 会话交接摘要

## Building

新增一个 loop 外的 orthogonal tool `handoff`:当当前会话需要结束、压缩、换窗口或交给另一个 agent 继续时,它只读收集当前上下文,输出一份可粘贴到新会话的自包含交接摘要。它参考外部 handoff 模板的核心结构:保留原始用户请求、目标、已完成工作、当前状态、待办、关键文件、重要决策、显式约束和继续上下文;但不绑定 OpenCode 专属能力或文案。

## Not building

- 不接入 OpenCode 专属的 `session_read` / `todoread` API,也不写 "press n in OpenCode TUI" 之类 host-specific 说明。
- 不程序化创建新会话、不调用外部 API、不写文件、不提交、不推送。
- 不自动读取原始 transcript 或机器外的长期记忆路径;只使用当前对话可见内容、项目文件、git 状态和可用任务状态。
- 不进入 core loop,也不作为 `commit -> pull-request` 的 workflow-managed stage 默认串联。
- 不生成 markdown 报告文件;输出在对话里,由用户决定下一步怎么用。
- 不改变 `explore` / `plan` / `build` / `verify` / `document` / `commit` / `pull-request` / `health` 的行为。

## Approach

把 `handoff` 设计成和 `health` 同级的 orthogonal tool:它服务于会话连续性,不服务于某一次代码变更的开发闭环。新增 `skills/handoff/SKILL.md` 与 `specs/handoff/spec.md`,更新 `skills/RESOLVER.md`、README、ARCHITECTURE、PRODUCT(哲学 #2 一句话修订)、ROADMAP 和必要测试期望。

模板采用稳定的纯文本分段,但不要求 OpenCode 原模板的完整措辞。squire 版本的流程是:

1. Validate:确认当前会话确实有可交接内容;若没有,直接说明没有足够内容可交接。
2. Gather:只读收集可获得事实,至少包含 `git status --short`;如果当前任务涉及代码或计划,再读相关计划、近期 diff/stat、关键文件和已有任务列表。
3. Extract:按延续工作所需的信息取舍,优先保留用户原话、目标、决策、约束、文件和剩余任务。
4. Output:生成 `HANDOFF CONTEXT` 纯文本摘要,并给一段 host-neutral 的继续说明。

最小可行版是只新增 `skills/handoff/SKILL.md` 和 RESOLVER 一行。这个版本能触发命令,但缺少持久行为契约和 README/ARCHITECTURE 入口,会和 squire 现有新增 skill 模式不一致。所以采用完整版本:skill + spec + 路由 + 文档 + roadmap 移除未来项。

## Premise collapse

This plan assumes a handoff summary can be useful without privileged access to the full raw session transcript. If the active host cannot expose prior hidden turns or todo state, `/handoff` still works by summarizing visible conversation plus project/git facts, but it must honestly mark unavailable data instead of pretending the summary is complete.

## Key decisions

1. **`handoff` 是 orthogonal tool** - 它解决会话连续性,不属于一次变更的理解/设计/实现/验证/文档化闭环,也不属于提交/PR 交付阶段。
2. **Host-neutral, not OpenCode-specific** - 外部模板作为行为参考,但 squire 不绑定 `session_read`、`todoread` 或 OpenCode TUI 继续步骤。
3. **输出对话内纯文本,不写文件** - handoff 的主要用户动作是复制摘要到新会话;写文件会制造持久文档范围和清理问题,不符合这个工具的临时性。
4. **显式区分事实、限制和不可用数据** - 原始用户请求和显式约束必须尽量逐字保留;拿不到的 host 数据要写 "Not available",不从记忆或猜测补齐。
5. **最多 10 个关键文件** - 保留外部模板的约束,避免 handoff 变成长篇项目索引;文件以工作区相对路径输出。
6. **不得包含敏感信息** - 如果上下文、diff 或文件路径里出现 token、密钥、凭据内容,摘要必须省略具体值并标明已省略。
7. **PRODUCT 哲学 #2 随本计划一并修订** - handoff 服务于闭环的连续运转(会话交接),不是新的产品能力域,「开发 + 记忆」的 scope 不因此扩大;但哲学 #2 现有的「`health` 是正交工具」表述在 handoff 落地后即不完整,不改就构成落地当天的文档↔现实漂移(`/health` 主检查会照出)。修订内容经 2026-06-10 plan discussion 确认,符合 PRODUCT「内容性变更走 `/plan`」的流程要求。

## Public surface changes

- 新增 `/handoff` 命令,命令名取目录名 `skills/handoff/`。
- 新增 `skills/handoff/SKILL.md`。
- 新增 `specs/handoff/spec.md` 记录 handoff 行为契约。
- `skills/RESOLVER.md` 的 Orthogonal Tools 增加 `handoff`。
- README 的 skill 表、触发命令和工具分层增加 handoff。
- ARCHITECTURE 的目录树、skill 计数、orthogonal tools 和决策记录增加 handoff。
- PRODUCT.md 哲学 #2 的正交工具表述更新为含 handoff,并附一句修订说明(见 Key decision 7)。
- ROADMAP 移除或改写 `handoff skill` 未来项,因为本计划落地后它不再是未实现项。
- Side effects:运行 `/handoff` 时只读命令和文件;不修改工作区。

## Spec delta

```markdown
## ADDED Requirements

### Requirement: 只读生成交接摘要

handoff 必须只读收集当前会话、任务和项目状态,并在对话中输出一份自包含交接摘要;不得修改文件、创建新会话、提交、推送或自动调用其他 skill。
Verify: manual(integration)

### Requirement: 保留继续工作所需事实

handoff 输出必须包含用户原始请求、下一步目标、已完成工作、当前状态、待办任务、关键文件、重要决策、显式约束和继续上下文;缺失或不可获得的信息必须明确标注,不得猜测补齐。
Verify: manual(integration)

### Requirement: 不绑定 host 的继续说明

handoff 必须给出不绑定具体 host 的继续说明,让用户把摘要粘贴到新会话继续;不得要求 OpenCode 专属 API、TUI 按键或其他 squire 不拥有的能力。
Verify: manual(integration)

### Requirement: 敏感信息不外泄

handoff 必须避免输出 API keys、tokens、credentials、secrets 或私密配置值;若相关内容影响继续工作,只能说明已省略敏感值并保留非敏感上下文。
Verify: manual(integration)

### Requirement: 交接内容有边界

handoff 必须聚焦延续工作所需信息,关键文件不超过 10 个,不展开无关实现细节,不把摘要变成完整项目文档或长期记忆。
Verify: manual(integration)
```

## Implementation steps

1. **创建 handoff skill 目录与 references**
   - change:创建 `skills/handoff/`;照其他 skill 建 `skills/handoff/references/anti-patterns.md` 和 `skills/handoff/references/durable-context.md` 指向 `rules/` 的 symlink。
   - verify:`ls -l skills/handoff/references/` 可看到两条 symlink 且能解析。

2. **写 `skills/handoff/SKILL.md`**
   - change:frontmatter 使用:
     - `name: handoff`
     - `description: "Generate a self-contained handoff summary so work can continue in a fresh session or with another agent. Use when the current session is ending, context is getting long, or the user asks to preserve what matters for continuation. Not for project documentation (use document), whole-project exploration (use explore), or automatically creating new sessions."`
     - `when_to_use: "handoff, hand over, continue later, new session, context summary, session summary, transfer context, 交接, 交班, 交给下个会话, 新会话继续, 上下文总结"`
     - `dispatch_intent: "Generate a host-neutral, read-only handoff summary for continuing work in a fresh session"`
   - change:正文包含定位、只读边界、何时不需要 handoff、Gather 流程、输出格式、敏感信息规则、host-neutral continuation、Outcome Contract、When to stop。
   - verify:`pnpm test` 中 frontmatter、description、Outcome Contract、references 和 Jaccard 检查通过。

3. **定义输出格式**
   - change:在 `SKILL.md` 写固定纯文本模板:
     - `HANDOFF CONTEXT`
     - `USER REQUESTS (AS-IS)`
     - `GOAL`
     - `WORK COMPLETED`
     - `CURRENT STATE`
     - `PENDING TASKS`
     - `KEY FILES`
     - `IMPORTANT DECISIONS`
     - `EXPLICIT CONSTRAINTS`
     - `CONTEXT FOR CONTINUATION`
   - change:规定不用 markdown `#` 标题、不用代码围栏;文件路径用 workspace-relative;关键文件最多 10 个;用户原始请求和显式约束尽量逐字保留;拿不到的信息写 `Not available` 或 `None`。
   - verify:人工读 `SKILL.md` 能看到完整模板与所有字段规则。

4. **写 `specs/handoff/spec.md`**
   - change:按本计划的 `## Spec delta` 新建 handoff domain spec。
   - verify:`node skills/health/scripts/checker.ts . --json` 不报 handoff spec 格式问题。

5. **更新 `skills/RESOLVER.md`**
   - change:Orthogonal Tools 表增加 `handoff`,触发词覆盖 "handoff"、"new session"、"context summary"、"交接"、"新会话继续" 等;Chaining 段说明它不自动串联。
   - verify:`pnpm test` 的 `checkResolverConsistency` 通过;`rg -n "skills/handoff/SKILL.md" skills/RESOLVER.md` 有结果。

6. **更新 README / ARCHITECTURE / PRODUCT / ROADMAP**
   - change:README skill 表从 8 个改 9 个,Orthogonal tools 增加 handoff,触发命令列表增加 `/handoff`,说明它用于会话交接而非项目文档。
   - change:ARCHITECTURE 目录树增加 `skills/handoff/SKILL.md` 与 `specs/handoff/spec.md`;skill 计数、分层说明和典型工作流同步;关键设计决策记录增加一小段 "handoff 作为 orthogonal tool"。
   - change:PRODUCT.md 哲学 #2 的「`health` 是正交工具」改为「`health` / `handoff` 是正交工具」,并在该段补一句修订说明(2026-06-10 plan discussion 确认):handoff 服务于闭环的连续运转,不是新的产品能力域,「开发 + 记忆」的 scope 不因此扩大。
   - change:ROADMAP 中 `handoff skill` 未来项移除或改成已落地后的后续强化项;不得继续声称 handoff 未落地。
   - verify:`rg -n "8 个 skill|handoff skill.*未来|skills/handoff|是正交工具" README.md ARCHITECTURE.md PRODUCT.md ROADMAP.md skills specs` 结果与新模型一致(PRODUCT 的正交工具句已含 handoff);`pnpm test` markdown link 检查通过。

7. **补测试期望**
   - change:如 smoke 测试固定 `skills.size >= 7` 无需改;如新增 skill 触发 Jaccard 撞车,调整 `handoff` 的 `when_to_use` 词组,不塞过多和 `explore` / `document` 重叠的词。
   - verify:`pnpm test` 全绿。

## Verification

- command:`pnpm test`
- command:`node skills/health/scripts/checker.ts . --json`
- manual checklist:
  - [ ] `/handoff` 在有实际工作上下文时输出完整 `HANDOFF CONTEXT`。
  - [ ] 用户原始请求在 `USER REQUESTS (AS-IS)` 中尽量逐字保留。
  - [ ] 工作区有未提交改动时,`CURRENT STATE` 或 `KEY FILES` 体现 `git status --short` 的相关文件。
  - [ ] 无 meaningful context 的新会话触发 `/handoff` 时,它说明没有足够内容可交接,不编造摘要。
  - [ ] 输出不包含 OpenCode 专属继续步骤,只给 host-neutral 的 "paste this into a new session" 说明。
  - [ ] 输出不泄露 token、API key、credentials、secrets。
  - [ ] 跑完 `/handoff` 后 `git status --short` 没有新增改动。

## Rollback

删除 `skills/handoff/` 和 `specs/handoff/`,还原 `skills/RESOLVER.md`、README、ARCHITECTURE、PRODUCT、ROADMAP 中的 handoff 条目即可回退。没有运行时代码、依赖或数据迁移。

## Risks & Unknowns

- **Host 无法暴露完整历史或 todo 状态**:摘要可能不完整。缓解:SKILL.md 明确只能使用可获得事实,缺失处标注 `Not available`,不猜测。
- **handoff 被误用成项目文档**:摘要是临时会话连续性,不是 durable memory。缓解:description 与正文明确项目文档走 `/document`,长期项目理解走 `/explore`。
- **输出过长**:长会话容易生成不可用的摘要。缓解:关键文件最多 10 个,聚焦继续工作所需信息,实现细节只保留会影响下一步的部分。
- **敏感信息被带入摘要**:diff 或对话可能含秘密。缓解:SKILL.md 将 secret redaction 写成硬边界,只保留已省略说明。
- **与 `health` / `explore` 触发词重叠**:handoff 不能被 "context" 泛化到探索项目。缓解:when_to_use 偏会话交接语义,由 Jaccard 检查兜底。

## Mode-specific

### Interface boundary

- **Public command**:`/handoff`。
- **Inputs**:当前会话可见内容、用户原始请求、当前任务状态、项目文件、git 状态、相关 plan/test/build 输出。不可获得的 host-private 数据不作为必需输入。
- **Outputs**:对话内一份 `HANDOFF CONTEXT` 纯文本摘要 + host-neutral continuation instructions。
- **Side effects**:无;只读 shell/git/file inspection,不写文件。
- **Not exposed**:创建新会话、读取 raw transcript 的专属 API、持久文档写入、自动调用下一 skill、OpenCode 专属流程。

### Acceptance scenarios

- Given 当前会话完成了一个计划文件并还有待实现任务,when 用户运行 `/handoff`,then 输出包含原始请求、计划路径、已完成计划、待实现任务和继续提示。
- Given 当前工作区有 `M README.md` 和 `?? skills/handoff/SKILL.md`,when 用户运行 `/handoff`,then `KEY FILES` 最多列出 10 个相关路径并说明角色。
- Given 用户明确约束 "不要改代码",when 用户运行 `/handoff`,then `EXPLICIT CONSTRAINTS` 逐字保留该约束。
- Given 对话中出现 API key 或 token,when 用户运行 `/handoff`,then 摘要省略具体值并说明敏感信息已省略。
- Given 当前会话没有 substantive work,when 用户运行 `/handoff`,then handoff 说明没有足够上下文可交接,不生成虚假的工作摘要。
- Given 用户在任意 host 使用 handoff 摘要开启新会话,when 新会话读取 `HANDOFF CONTEXT`,then 能知道下一步目标、关键文件、决策、约束和当前状态。
