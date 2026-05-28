---
name: explore
description: '理解项目或不熟悉的模块，为后续 think / implement / review 等工作建立可靠 context。必读关键文档（README / ARCHITECTURE / PRODUCT / DESIGN / specs / docs / agent 指南等）并扫项目结构。Use when 用户进入新仓库、面对不熟悉的模块，或说"先看看这个项目""整体了解一下"。Not for 调试错误（用 think fix mode）、出方案（用 think）、纯回答 API 用法（直接搜代码即可）。'
when_to_use: "explore, 看项目, 项目结构, 入口, 怎么跑, 不熟悉, 先看看, 整体了解, 模块"
dispatch_intent: "为后续工作建立项目 context；必读关键文档并扫项目结构"
---

# Explore

explore 不是终点——它是其他 skill 的前置，为 think / implement / test / review 建立可工作的事实级理解。所有约束的根目的是让下游 skill 拿到的 context **可信**：基于真实读到的内容、基于代码当下状态，不基于猜测和过时假设。

explore 只读不动：

- 不修改任何文件——纯只读
- 不验证"文档说的跟代码实际是否一致"——那是未来 health skill 的工作
- 不猜测——说"未读到 / 不存在"比编造"应该是 X 吧"好

引用文档时**必须标注 source**：`per README` / `per ARCHITECTURE` / `docs 声称`——让下游 skill 知道这是"文档说的"而不是"代码事实"。两者很可能不同步，下游处理冲突时需要这个 attribution。

## Outcome Contract

- Outcome: agent 对项目有可工作的事实级理解，关键文档与项目结构被显式记录在报告里，后续 skill 可以直接基于此工作
- Done when: Project Identity / Structure / Docs Inventory 三个章节都填好；用户指定范围时 Scoped Deep-dive 章节也填好；Where to Start 给出 2-3 条切入建议
- Evidence: 真实读取的文档全文 + `pwd` / `git ls-files` / `Read` / `Grep` 等命令的输出
- Output: 结构化 Explore Report（见输出模板）

## Phase 划分

每次 explore 调用都**从 Overview Phase 开始**。用户指定范围（"看一下 auth 模块" / `/explore <某模块>`）时，Overview 完成后继续 Scoped Deep-dive Phase。**任何情况下都先做完 Overview 再深入**——直接跳 deep-dive 会缺骨架，下游 skill 看到的 context 残缺。

## Overview Phase

### Step 1: 路径确认与项目身份

- `pwd` 或 `git rev-parse --show-toplevel` 确认工作目录
- 读 `README*`，拿到项目名 + 一句话定位
- 读项目清单文件确定主语言 / 框架（按生态选）：
  - JS/TS: `package.json`
  - Rust: `Cargo.toml`
  - Python: `pyproject.toml` / `requirements.txt`
  - Go: `go.mod`
  - Java/Kotlin: `pom.xml` / `build.gradle`
  - Ruby: `Gemfile`
  - 其他生态按惯例查找
- 记录运行 / 测试 / 构建命令的出处（`package.json` scripts、`Makefile`、`justfile`、README 章节等）

### Step 2: 关键文档清单

扫描根目录与常见位置，**对存在的文档读全文**——只看标题等于猜内容，下游 skill 会因此用错。

> **v1 起步清单**（会随 document skill 的发展调整）：
>
> - `README*`
> - `ARCHITECTURE*`
> - `PRODUCT*`
> - `DESIGN*`
> - `CLAUDE.md` / `AGENTS.md`
> - `specs/` 目录下所有 `.md`
> - `docs/` 目录下所有 `.md`
> - `.cursorrules` / `.windsurfrules` / 其他 IDE 规则
> - 根目录其他 `.md` 文件

每份文档读完后记录：文档路径 + 一句话摘要（基于实际读到的内容）。

### Step 3: 项目结构

顶层目录职责（每个目录一行简述）+ 关键模块（基于目录大小、文档引用、入口文件依赖关系判断）。

### Step 4: 输出 Overview 报告

按下方"输出模板"组织。

## Scoped Deep-dive Phase

**前提**：Overview Phase 已完成。

针对用户指定的范围（模块名 / 目录 / 文件）：

- 范围内的入口与对外接口（带 `file:line` 引用）
- 关键数据流 / 调用链（grep / read 跟踪）
- 该范围相关的文档位置
- 后续工作的切入点建议

## 预算意识

explore 容易陷入"读越多越好"——读 100 个文件浪费 token 还得不到结构感。**先扫目录 + 列文档清单，再决定深读哪些**；同一个文件不要反复读。

## 输出模板

```markdown
# Explore Report: <project-name>

## Project Identity

- 项目名 / 定位 (per README:Lx)
- 主语言 / 框架 / 关键栈
- 运行 / 测试 / 构建命令 (per <source>:Lx)

## Structure

- 顶层目录职责（一行一个，带证据 `file:line` 或 `dir/`）
- 关键模块

## Docs Inventory

- README: 一句话摘要 (path)
- ARCHITECTURE: 一句话摘要 (path) — or `N/A`
- PRODUCT: 一句话摘要 (path) — or `N/A`
- DESIGN: 一句话摘要 (path) — or `N/A`
- CLAUDE.md / AGENTS.md: 一句话摘要 (path) — or `N/A`
- specs/: N docs, 关键主题 — or `N/A`
- docs/: N docs, 关键主题 — or `N/A`
- 其他: ...

## Scoped Deep-dive: <module>

> 仅当用户指定范围时输出本节

- 入口与对外接口（`file:line`）
- 关键数据流 / 调用链
- 相关文档位置
- 后续工作切入点

## Where to Start

基于以上，后续工作的入口建议（2-3 条，每条带 `file:line`）。
```

## 什么情况下停下来

explore 跟 review 一样——失败模式是"动手 / 越界"。下面这些情况停下：

- **没读关键文档就开始猜架构**——Step 2 是硬要求；先按清单扫描存在性，对存在的文档读全文。
- **用户问"看一下 auth"想直接 deep-dive 跳过 Overview**——任何情况都先 Overview，否则下游缺骨架。
- **想做"文档 vs 代码"漂移检测**——不是 explore 的工作（留给未来的 health skill）；发现疑似漂移就记录到报告里让下游判断，不动手核对。
- **想编造"应该是 X 吧"**——说"未读到 / 不存在 / 该项目没有 X"比编造好；猜测污染下游 skill 的判断。
- **想修改文件**——explore 纯只读；发现的问题写进报告，要改回对应 skill（`/think` / `/implement`）。
