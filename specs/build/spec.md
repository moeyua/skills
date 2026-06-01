# Build Specification

## Purpose

build skill 把已批准的方案落实成符合项目风格的代码：按步执行、逐步验证，只执行不重开意图决策。

## Requirements

### Requirement: 基于已批准的方案

build 必须基于一份方案执行；找不到方案、或方案与代码漂移（路径错、函数缺、假设不成立）时必须停下并回 shape，不擅自调整使其对上。

#### Scenario: 方案引用的函数已不存在

- GIVEN 方案里点名的某函数在代码中找不到
- WHEN build 预检
- THEN 报告漂移并交还 shape，不悄悄改路径凑合

### Requirement: 不在受保护分支上动工

首次编辑前，若当前在受保护分支（main / master / develop）或 detached HEAD，build 必须先 `git checkout -b <plan-slug>` 开工作分支。

### Requirement: 有测试框架且 fix/feat 走 TDD

项目有测试框架且方案 mode 为 fix 或 feat 时，build 必须先写红测试再实现到绿；一写就绿说明没覆盖该场景，必须停下修测试。无框架或 refactor/perf 则按方案的 verification 验证，不硬造测试基建。

#### Scenario: 新写的测试一上来就绿

- GIVEN 为某验收场景新写的测试，未实现前就通过
- WHEN build 跑它
- THEN 判定该测试没真正覆盖场景，停下修测试，而非继续

### Requirement: 守方案范围

build 必须不改方案外的文件、不顺手修无关 bug、不擅自加依赖；发现的额外问题写进报告交还，不就地动手。

### Requirement: 不绕过质量门

build 必须不使用 `--no-verify` / `--force` / `@ts-ignore` / `eslint-disable` 绕过工具；既有测试失败是信号，必须不删、不弱化、不 skip。
