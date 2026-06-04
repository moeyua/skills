# Verify Specification

## Purpose

verify skill 是合并前的最后一道关:用 review(读 diff 判断)、test(跑套件取 ground truth)、e2e(驱动真实 app 看行为)三种方法确认一次改动立不立得住,给作者裁决与方向,把处置决定权留给作者。它由 review skill 升级而来,并吸收了原 test skill 的「跑测试」与端到端验证。

## Requirements

### Requirement: 只校验不改

verify 必须不修改任何文件(源码 / 测试 / plan),不给完整补丁(只给方向),不替作者调用其他 skill,不提交、不推送;test/e2e 模式可执行代码 / 起 app 以观察,但只观察、不改源。
Verify: manual(integration)

### Requirement: review 模式 5 维 + confidence 过滤 + 正面肯定

review 模式必须扫 5 个维度(plan / quality / errors / tests / simplify),或用户指定的 aspect;只报告 confidence ≥ 80 的 finding,按 Critical / Important / Suggestion 分级;且必须给出 Strengths 段,哪怕只有一两条。
Verify: manual(integration)

### Requirement: test 模式跑套件、失败是信号

test 模式必须检测并运行项目的测试命令,完整报告 pass/fail;疑似 flaky 最多重试一次,再失败即按失败处理;必须不靠 `.skip`、删测试、`--no-verify` 让测试通过;失败若反映真实 bug,指向 `/shape fix`,不就地修。
Verify: manual(integration)

### Requirement: e2e 模式跑真实 app 观察行为

e2e 模式必须先找项目自带的「启动 app」skill,没有再按项目类型兜底起 app,驱动相关路径、观察真实行为,给出 observed-vs-expected 裁决;不改源去强行启动,起不来即作为 finding 报告。
Verify: manual(integration)

### Requirement: 指向对应 skill 而非接管

verify 发现某类问题时必须指向对应 skill(bug→shape fix、缺/弱测试→build 补覆盖、简化→shape refactor、scope 蔓延→交用户决定),不接管去做。
Verify: manual(integration)
