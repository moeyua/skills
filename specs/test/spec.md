# Test Specification

## Purpose

test skill 是测试工作的单一入口：跑测试、补覆盖、调试失败。

## Requirements

### Requirement: 按消息路由三类工作

test 必须按用户消息路由到 run（跑）、coverage（补）、debug（调）三类工作之一，无需 mode 系统。

### Requirement: 测试基于真实行为

补覆盖时必须先读被测代码看其真实行为，新测试必须绿；一写就绿说明没真正覆盖，必须停下修测试而非改代码去凑。

#### Scenario: 凭直觉写的测试

- GIVEN 不读被测代码、凭想象写的测试
- WHEN test 评估
- THEN 视为"在测一个不存在的契约"，回到读真实行为重写

### Requirement: 失败是信号不绕过

test 必须不靠 `.skip`、删测试、`--no-verify` 让测试通过；疑似 flaky 最多重试一次，再失败即按失败处理，不靠多次重试碰运气。

#### Scenario: 被要求让一个失败测试通过

- GIVEN 某测试失败，且它反映的是真实 bug
- WHEN 用户要求"让它过"
- THEN 拒绝改测试凑过，指出这是真实 bug、回 shape fix

### Requirement: 不硬造测试基建

项目没有测试框架时，test 必须报告现状、交用户决定是否引入，不凭空造框架、不静默 `pnpm add`。
