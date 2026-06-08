# Health Specification

## Purpose

health skill 给项目做只读体检:审计「文档说的」与「代码做的」是否一致(主),并机械检查依赖陈旧 / CI 状态 / 文件大小 / 链接引用是否还在(次)。它只检测、只报告、只指路,绝不修改、提交或自动调用其他 skill。是校验支柱的 loop 外正交审计半边。

> 说明:health 的行为是 agent 遵循 SKILL.md 的 prose,机械层由随 skill 装的 `scripts/checker.ts` 执行;下面每条都标 `manual(integration)`——靠实跑 `/health` 验。

## Requirements

### Requirement: 只读、只指路、不接管

health 必须不修改任何文件,不提交、不推送、不自动调用其他 skill;脚本与观察命令(node checker / pnpm outdated / gh / git log)只采集事实,不改。发现问题指向对应 skill(文档漂移→persist、代码 bug→shape fix、简化→shape refactor、scope 蔓延→交用户),不接管去做。
Verify: manual(integration)

### Requirement: 主检查——文档声称 vs 代码实际

health 必须把「文档声称的行为」与「代码实际的行为」是否一致作为首要检查,逐条核实(对 squire 格式文档以每条 `### Requirement:` 为离散 claim 逐条核;对散文文档 best-effort,核不动的不硬判),标出不符处(含散文式架构 / 技术选型声称与代码不符),给 observed-vs-claimed 裁决,报告置于最前;不就地改。
Verify: manual(integration)

### Requirement: 机械先于模型、确定性层用随装脚本

health 必须先跑机械检查产出确定性事实:其中纯文件系统的确定性检查(文档格式合规、链接 / 锚点 / 引用解析、占位符、文件大小)由随 skill 装的脚本 `node ${CLAUDE_SKILL_DIR}/scripts/checker.ts` 执行,环境查询(依赖陈旧、CI 状态、git 时间戳)由 Bash 执行;模型判断只用于机械做不到的语义判断(行为是否一致),不替代可机械确定的检查。
Verify: manual(integration)

### Requirement: 两类对象、自适应且探不到即跳过

health 查两类对象:squire 写的文档(假定 squire 格式,查格式合规 + 漂移)与项目本身(任意项目,查依赖 / CI / 文件大小 / 链接)。项目本身那类必须按现状自适应(检出包管理器 / CI / 文档位置),依赖缺失(无 manifest / 无 GitHub remote / 无文档 / 无 node 24)时优雅跳过并在报告说明,不报错、不为某项目类型写专属逻辑。
Verify: manual(integration)

### Requirement: 模型 finding 过滤分级、跳过项需标明

health 报告必须含机械 findings(事实)与模型 findings;模型 findings 只报 confidence ≥ 80,按 Critical / Important / Suggestion 分级并给 routing;被跳过的检查须在报告标明。
Verify: manual(integration)
