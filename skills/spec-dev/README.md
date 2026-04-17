# Spec-Dev — 规格驱动开发文档系统

一个将 **SDD（规格驱动开发）+ TDD（测试驱动开发）+ BDD（行为驱动开发）** 三种实践融为一体的文档工作流技能。它作为 feature-dev 的前后书挡：开发前用它定义「做什么」，开发后用它同步文档。

## 核心理念

核心概念（`Spec → AC → Test` 不变量、三态 AC、四层架构、SDD/TDD/BDD 分工）集中在 [references/concepts.md](references/concepts.md) —— 读一次即可，所有模式都基于它。

**速览：**

```
Spec → AC → Test
```

每个功能必须先有规格（Spec），规格中的每条验收标准（AC）必须映射到测试。AC 使用三态标记：`[x]` 已实现且已测试 / `[~]` 已实现但未测试（技术债务）/ `[ ]` 尚未实现。功能只有在所有 AC 都是 `[x]` 时才算完成。

所有文档归属于 WHY / WHAT / HOW / VERIFY 四层，层级之间仅向下依赖。完整的层级定义和变更频率见 [concepts.md](references/concepts.md#the-four-layer-architecture)。

## 工作流

```
spec-dev(Write) → feature-dev(全部阶段) → spec-dev(Update) → commit-push-pr
```

spec-dev 负责定义和记录，feature-dev 负责探索和实现。没有 spec-dev 收尾，每次新会话都要从零开始理解上下文。

## 七种模式

| 模式 | 使用时机 | 说明 |
|------|---------|------|
| **Write** | 开发前定义功能 | 7 步协作对话，生成带 Scope、AC、Verification（BDD + TDD）和一致性检查的功能规格 |
| **Update** | 开发后同步文档 | 读取代码变更，验证 AC 状态，更新模块契约，建议 ADR |
| **Status** | 查看项目进度 | 只读报告，扫描所有规格的 AC 状态，分类功能完成度 |
| **Setup** | 新项目初始化文档 | 扫描代码库，规划四层文档结构，逐步生成文档 |
| **Audit** | 检查文档合规性 | 二值通过/失败检查，验证规格结构、测试映射、交叉引用 |
| **Migrate** | 重构现有文档到 SDD 架构 | 映射旧文档到四层架构，按依赖顺序迁移 |
| **Refine** | 文档与代码不一致时重整 | 读代码 → 交叉对比文档 → 拆分/合并/删除/迁移 |

## 快速开始

### 写一个功能规格

告诉 AI 助手：

```
帮我写一个 spec：用户登录功能
```

这会触发 Write 模式，通过 7 步对话协作完成规格文档（Scope → 行为约束 → 状态机 → 验收标准 → 验证 → 一致性检查 → 落盘）。

### 开发后更新文档

```
更新 spec
```

这会触发 Update 模式，自动读取 git diff 并更新 AC 状态。

### 查看项目进度

```
看一下进度
```

这会触发 Status 模式，生成进度报告。

## 输出结构

```
docs/
├── product/
│   ├── vision.md               # WHY 层 — 产品愿景
│   ├── scope.md                # WHY 层 — 产品范围
│   └── glossary.md             # WHY 层 — 术语表
├── architecture.md             # WHAT 层 — 系统架构 + 模块注册表
├── modules/
│   └── {module-name}.md        # WHAT 层 — 模块契约（API 指向代码文件）
├── specs/
│   └── {feature-name}.md       # WHAT 层 — 功能规格（含 AC + BDD）
├── decisions/
│   └── NNN-{decision}.md       # HOW 层 — 架构决策记录
├── guides/
│   ├── conventions.md          # HOW 层 — 编码约定
│   ├── design-system.md        # HOW 层 — 设计系统（前端项目）
│   ├── testing.md              # VERIFY 层 — 测试策略（含 BDD 验证方式）
│   └── dev-workflow.md         # HOW 层 — 开发工作流
└── CLAUDE.md                   # Agent 入口
```

## 设计原则

- **Spec 优先**：如果规格和代码不一致，要么更新代码，要么更新规格，但不能同时存在矛盾
- **文本优先**：不用图片 — AI 无法读取。使用文本和 Mermaid 绘制图表（Mermaid 源码是结构化文本，AI 能理解）
- **行为优先**：规格定义系统做什么，而非长什么样。AC 中不写像素值、颜色、按钮文案
- **`[~]` 是债务**：已实现但未测试的 AC 是没有证明的承诺
- **保持文档鲜活**：过时的文档比没有文档更糟糕
- **不复制代码**：引用文件路径，而非粘贴会过时的代码片段。模块 API 和数据模型指向源文件，不复制签名或类型定义

## 参考文件

| 主题 | 文件 |
|------|------|
| 核心概念（不变量、三态 AC、四层、SDD/TDD/BDD） | [concepts.md](references/concepts.md) |
| CLAUDE.md 模板 | [templates-claude.md](references/templates-claude.md) |
| WHY 层模板（vision/scope/glossary） | [templates-why.md](references/templates-why.md) |
| WHAT 层模板（architecture/module/feature spec） | [templates-what.md](references/templates-what.md) |
| HOW 层模板（ADR/conventions/design system） | [templates-how.md](references/templates-how.md) |
| SDD→TDD→BDD 工作流 | [dev-workflow.md](references/dev-workflow.md) |
| 测试策略 | [testing-strategy.md](references/testing-strategy.md) |
| Write 模式详情 | [write-mode.md](references/write-mode.md) |
| Update 模式详情 | [update-mode.md](references/update-mode.md) |
| Status 模式详情 | [status-mode.md](references/status-mode.md) |
| Setup 模式详情 | [setup-mode.md](references/setup-mode.md) |
| Audit 模式详情 | [audit-mode.md](references/audit-mode.md) |
| Migrate 模式详情 | [migrate-mode.md](references/migrate-mode.md) |
| Refine 模式详情 | [refine-mode.md](references/refine-mode.md) |
