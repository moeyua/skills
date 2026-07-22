# Check Specification

## Purpose

check skill 是合并前的最后一道关:用 review(读 diff 判断)、test(跑套件取 ground truth)、e2e(驱动真实 app 看行为)三种方法确认一次改动立不立得住,给作者裁决与方向,把处置决定权留给作者。它由 review skill 升级而来,并吸收了原 test skill 的「跑测试」与端到端验证(时名 verify,2026-06-11 更名 check)。

## Requirements

### Requirement: 只校验不改

check 必须不修改任何文件(源码 / 测试 / plan),不给完整补丁(只给方向),不替作者调用其他 skill,不提交、不推送;test/e2e 模式可执行代码 / 起 app 以观察,但只观察、不改源。(Previously: verify 执行该职责。)
Verify: manual(integration)

### Requirement: 把关前缺少项目上下文时先做 explore context preflight

check 在 review / test / e2e 路由与判断前，若当前项目上下文缺失、过期或不足以支撑本次把关，必须调用 explore 的 context mode 建立事实基础。调用时根据 gate 风险选择 core 或 deep，不产出独立 Explore Report，并把读取证据纳入 verdict。

该 preflight 不改变 check 只校验不修改、不替作者调用修复 skill 的边界。
Verify: manual(integration)

### Requirement: review 模式 5 维 + confidence 过滤 + 正面肯定

review 模式必须扫 5 个维度(plan / quality / errors / tests / simplify),或用户指定的 aspect;只报告 confidence ≥ 80 的 finding,按 Critical / Important / Suggestion 分级;且必须给出 Strengths 段,哪怕只有一两条。(Previously: verify 执行该职责。)
Verify: manual(integration)

### Requirement: test 模式跑套件、失败是信号

test 模式必须检测并运行项目的测试命令,完整报告 pass/fail;疑似 flaky 最多重试一次,再失败即按失败处理;必须不靠 `.skip`、删测试、`--no-verify` 让测试通过;失败若反映真实 bug,在修复已获授权时指向 implement,正确行为/根因/范围仍未决时指向 shape,不就地修。(Previously: verify 执行该职责。)
Verify: manual(integration)

### Requirement: e2e 模式跑真实 app 观察行为

e2e 模式必须先找项目自带的「启动 app」skill,没有再按项目类型兜底起 app,驱动相关路径、观察真实行为,给出 observed-vs-expected 裁决;不改源去强行启动,起不来即作为 finding 报告。(Previously: verify 执行该职责。)
Verify: manual(integration)

### Requirement: 指向对应 skill 而非接管

check 发现某类问题时必须指向对应 skill(未决正确性/根因→shape、已授权 bug 修复或缺/弱测试→implement、仍需设计判断的简化→shape、scope 蔓延→交用户决定),不接管去做。(Previously: verify 执行该职责。)
Verify: manual(integration)

### Requirement: 无明确 mode 线索时默认全面把关

用户消息无明确 mode 线索(含裸 `/check`)时,check 必须默认跑 review + test 两个 mode,并在改动触及用户可见行为且项目有可启动路径时加跑 e2e;被跳过的 mode 必须在报告中标明及原因。显式 mode 线索仍收窄到对应 mode,不默认扩展。(Previously: 裸 `/verify` 触发,verify 执行该职责。)
Verify: manual(integration)
