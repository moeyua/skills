# Issue Specification

## Purpose

issue skill 把一条自然语言开发工作按用户语言整理为一个强格式 GitHub Issue，使用与 shape named modes 对齐的唯一主 label，并在创建后返回 URL。它是 core loop 外的可选入口，不管理 Project、状态或后续开发流程。

## Requirements

### Requirement: 单条自然语言工作创建为 GitHub Issue

issue 必须一次只处理一项开发工作。显式 `OWNER/REPOSITORY` 优先，否则使用当前目录对应的 GitHub 仓库；仍无法确定时必须询问用户，不得猜测仓库、创建 inbox 或自动拆分多个 Issues。
Verify: manual(integration)

### Requirement: 分类与 shape named modes 对齐

issue 必须且只能从 `fix`、`feat`、`refactor`、`perf` 中选择一个主 label；不得设置 `brainstorm`、Issue Type 或未分类兜底。无法可靠分类时必须先澄清，仍不属于四类时停止。
Verify: manual(integration)

### Requirement: 跟随用户语言的强格式正文

Issue 的理解卡、标题、section 标题、正文与结果反馈必须使用用户当前语言；用户显式指定语言时优先。每个 mode 必须按集中 reference 定义的 semantic section key 与顺序渲染完整结构，但不得向用户暴露内部 key。Mode label、代码标识符、命令与为保持精度所需的专有名词不做本地化。所有必需 section 仍必须包含确认事实或明确的待调查、待测量语义，不得为空、保留模板指令、使用占位符或编造信息。（Previously: 标题、section 标题和正文固定使用中文，reference 直接保存中文标题模板。）
Verify: manual(integration)

**Scenario: 英文用户创建 feat Issue**

- GIVEN 用户以英文描述并确认一项 `feat` 工作
- WHEN issue 渲染理解卡与 Issue
- THEN 所有用户可见 prose 与 section 标题使用英文，且 section 的语义和顺序与 `feat` schema 一致

**Scenario: 中文用户创建 fix Issue**

- GIVEN 用户以中文描述并确认一项 `fix` 工作
- WHEN issue 渲染理解卡与 Issue
- THEN 所有用户可见 prose 与 section 标题使用中文，且 section 的语义和顺序与 `fix` schema 一致

### Requirement: 创建前只确认理解摘要

issue 必须在任何 GitHub mutation 前展示只包含仓库、分类、目标、范围与限制、完成标准和遗漏项的简短理解卡片，并等待用户明确确认；不得要求用户审阅完整标题或 Issue 正文。用户拒绝或修正时不得创建 label 或 Issue。
Verify: manual(integration)

### Requirement: 缺失 label 按需创建

目标仓库缺少选中的 exact lowercase label 时，issue 必须在用户确认后只创建当前需要的 label，再用它创建 Issue。已有 exact-name label 必须直接复用且不得改写元数据；仅大小写不同的同名冲突必须停止报告。
Verify: manual(integration)

### Requirement: GitHub mutation 安全失败

issue 必须使用当前 `gh` 登录身份。认证、仓库访问、label 读取或创建、Issue 创建失败时必须报告失败阶段并停止；不得静默省略主 label、改用相邻仓库、发布不完整正文或盲目重试 Issue 创建。
Verify: manual(integration)

### Requirement: 创建完成即停止

Issue 创建成功后，issue 必须返回 canonical repository、主 label 和 canonical Issue URL，然后停止；不得自动调用 shape、implement、pr 或其他 skill，也不得继续维护 Issue 生命周期。
Verify: manual(integration)
