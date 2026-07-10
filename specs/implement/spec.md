# Implement Specification

## Purpose

implement skill 把已批准的方案落实成符合项目风格的代码：按步执行、逐步验证，只执行不重开意图决策。

## Requirements

### Requirement: 基于已批准的方案

implement 必须基于一份方案执行；找不到方案、或方案与代码漂移（路径错、函数缺、假设不成立）时必须停下并回 shape，不悄悄改路径凑合。(Previously: build 执行该职责。)
Verify: manual(integration)

### Requirement: 执行前缺少项目上下文时先做 explore context preflight

implement 在执行方案前，若当前项目/模块上下文缺失、过期或不足以支撑方案 scope，必须调用 explore 的 context mode 建立事实基础。调用时根据方案风险选择 core 或 deep，不产出独立 Explore Report，并把读取证据纳入实现报告。

该 preflight 不替代读取整份 plan，也不替代每步动手前在该步 scope 内定位文件。
Verify: manual(integration)

### Requirement: 仅豁免本次方案的未提交状态

implement 在工作树预检前必须先唯一确定本次执行的 plan。只有该 plan 可以处于新增或修改状态（无论 staged 或 unstaged）；除该精确路径外的任何未提交改动——包括其他 plan——都必须阻止执行。选中的 plan 被删除、重命名或处于冲突状态时也必须停止。implement 不得为满足预检而自动提交、暂存、stash 或丢弃改动；从受保护分支创建工作分支时必须原样携带该 plan。
Verify: manual(integration)

### Requirement: 不在受保护分支上动工

首次编辑前，若当前在受保护分支（main / master / develop）或 detached HEAD，implement 必须先 `git checkout -b <plan-slug>` 开工作分支。(Previously: build 执行该职责。)
Verify: manual(integration)

### Requirement: 有测试框架且 fix/feat 走 TDD

项目有测试框架且方案 mode 为 fix 或 feat 时，implement 必须先写红测试再实现到绿；一写就绿说明没覆盖该场景，必须停下修测试。implement 也承接不挂 plan 的写测试工作（补覆盖 / 回归）——同样基于真实行为、红→绿；疑似 flaky 最多重试一次，再失败按失败处理；失败若反映真实 bug 则回 shape fix，不就地改测试凑过。无框架或 refactor/perf 则按方案的 verification 验证，不硬造测试基建。(Previously: build 执行该职责。)
Verify: manual(integration)

### Requirement: 守方案范围

implement 必须不改方案外的文件、不顺手修无关 bug、不擅自加依赖；发现的额外问题写进报告交还，不就地动手。(Previously: build 执行该职责。)
Verify: manual(integration)

### Requirement: 不绕过质量门

implement 必须不使用 `--no-verify` / `--force` / `@ts-ignore` / `eslint-disable` 绕过工具；既有测试失败是信号，必须不删、不弱化、不 skip。(Previously: build 执行该职责。)
Verify: manual(integration)

### Requirement: 承接不改意图的机械决策

implement 必须自行完成方案步骤内不改意图的机械决策——行级定位、具体措辞、改动的微观顺序——不把它们的缺席当作方案不完整而弹回；每步动手前必须先读该步 scope 内文件完成定位，定位是该步的第一个动作。步骤的 scope 路径是意图层声明：结果要求触及 scope 外文件时视为方案漂移，与意图层歧义、路径错、函数缺、假设不成立同等处置——停下回 shape，不自行裁决意图。
Verify: manual(integration)
