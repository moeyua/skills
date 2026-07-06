# Converge Specification

## Purpose

converge skill 把项目的 memory catalog 文档批量收敛到 squire 当前规范:逐份判定状态、按状态选动作,幂等。不做项目级 init/update 二分——空项目跑一遍即初始化,squire 升级后跑一遍即对齐,写了一半的项目跑一遍即补全。格式权威来源是同装 docs skill 的 formats,机械扫描复用同装 doctor 的 checker。

> 说明:converge 的行为是 agent 遵循 SKILL.md 的 prose;机械信号来自同装 doctor 的 `scripts/checker.ts`。下面每条都标 `manual(integration)`——靠实跑 `/converge` 双端验收(brownfield fixture 的 init 端 + squire 自身的 align 端)加幂等复跑(工作树零 diff)验;「同级资产引用、缺失即停」靠卸载 docs 后运行应停验。

## Requirements

### Requirement: 逐份状态判定与幂等收敛

converge 必须对 memory catalog 的每份文档逐一判定状态(不适用 / 缺失 / 格式不符 / 半成品 / 内容漂移 / 已达标)并按状态选动作;适用性按 catalog 的 When needed 判定,不适用项跳过并在报告注明;状态判定优先机械信号(checker 输出、文件存在性、节标题匹配),模型判定只用于内容漂移档。对已收敛项目紧接复跑,必须全部跳过(含不适用项)且不产生任何文件改动。
Verify: manual(integration)

### Requirement: 已有内容为权威来源

converge 对已存在的用户内容只重排结构、只补空缺,必须不推倒重写;内容与代码矛盾时必须列出矛盾交用户裁决。
Verify: manual(integration)

### Requirement: 初次创作豁免

PRODUCT 与 specs 从无到有时,converge 以维护者访谈为权威来源实填,代码仅用于印证陈述、不得反推;访谈答不上的节留骨架并注明来源缺失。文档一旦存在,内容修改权回归 shape(PRODUCT)与 docs(specs)。
Verify: manual(integration)

### Requirement: 分级确认

动内容的改动(重排用户所写、修内容漂移、访谈补缺)必须逐份先呈现「改什么 + 为什么」并获确认;纯格式对齐可批量执行,完成后必须给出总览。
Verify: manual(integration)

### Requirement: 同级资产引用、缺失即停

converge 的格式权威来源是同装 docs skill 的 references/formats/\*,机械扫描复用同装 doctor 的 scripts/checker.ts;任一缺失必须停下报依赖,不得降级或凭记忆编造格式。checker 缺 Node 24 时沿用 doctor 契约:注明跳过,模型判定继续。
Verify: manual(integration)

### Requirement: 只管 catalog 文档的批量收敛

converge 只收敛 memory catalog 文档,至多额外创建 `plans/` 目录骨架;不装 host 侧任何东西,不碰 catalog 外文档,不做依赖/CI 检查(doctor),不做单目标零散修正(docs)。
Verify: manual(integration)
