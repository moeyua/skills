# Check Specification

## Purpose

check 通过 review、test、e2e 或相称组合，对指定 change 给出有证据的只读 verdict。

## Requirements

### Requirement: 只校验不修改

check 不得修改源码、测试、plan 或 docs，不得 stage、commit、push 或修 finding；test/e2e 只能执行项目以观察结果。
Verify: manual(integration)

### Requirement: evidence 由问题和风险决定

显式请求必须选择对应 review/test/e2e；full/pre-merge gate 通常组合相关 review 与 tests，并在可运行的用户可见路径上加入 e2e。裸或模糊 check 必须先看 scope 后选择最小可信组合，不得无条件全面把关。
Verify: manual(integration)

### Requirement: 项目上下文按缺口取得

check 必须复用新鲜项目上下文，只在事实不足时调查或取得 explore context；不得把固定 explore preflight 或独立 subagent 作为每次 gate 的要求。
Verify: manual(integration)

### Requirement: 各方法只加载相关 reference

review 必须聚焦高风险、可操作 finding；test 必须运行覆盖 claim 的真实项目命令并准确报告；e2e 必须驱动真实路径并比较 observed/expected。没有选择的方法不得仅为完整感运行。
Verify: manual(integration)

### Requirement: verdict 只覆盖实际证据

check 只能对实际读取、执行或观察的 scope 使用 holds up；必须报告高置信 finding、命令/观察结果和重要未运行证据，过滤推测性或纯风格噪声。
Verify: manual(integration)
