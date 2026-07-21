# Gold cases：judge 校准基准

一个人工判卷过的真实 codex shape 会话、一个截图转写和一个合成交互回归，用于校准 LLM judge 的逐项方向与 0–10 分刻度。校准目标：逐项判定方向一致、总分差 ≤1。

## 案例结构

每个 `case-*/` 目录包含：

- `manual.json` — 当前 rubric 的人工基准：总分、逐条 Requirement 的 `pass` / `fail` / `partial` / `n.a.`、来源与备注。`partial` 表示人工认为部分满足，比对时与 judge 的 pass 或 fail 都视为方向一致。
- `transcript.json`（案例 2 / 3）— normalized transcript。案例 2 来自截图转写；案例 3 是不含项目细节的重复确认合成回归。
- 案例 1 仍读取本机 archived rollout，不向仓库提交私密会话副本。

## 运行校准

```bash
node bench/src/calibrate.ts            # 每案例判 1 次
node bench/src/calibrate.ts --repeat 3 # 判 3 次，量化 judge 抖动
```

冲突项或总分差 >1 时 exit 非 0。

## 当前人工基准（2026-07-21，outcome-first rubric）

| 案例                          | 人工分 | 主要质量信号                                                    |
| ----------------------------- | -----: | --------------------------------------------------------------- |
| case-1-tapnow-qrcode          |      9 | 事实充分，只问外部契约前沿，真实 alternatives，feat plan 可实施 |
| case-2-skland-token           |      6 | 尊重明确约束，但证据不可见且静默决定了多角色等实质取舍          |
| case-3-redundant-confirmation |      4 | 已充分指定且已同意后仍重复确认，没有产出请求的 plan             |

## 当前校准处置（2026-07-21）

`node bench/src/calibrate.ts --repeat 3` 在 case 1 第一轮返回 `judge-error`；诊断确认固定 judge 模型 `claude-fable-5` 已无可用渠道，网关返回 `503 model_not_found`。维护者确认该模型已下架，而替换模型会改变 judge 本身，不能作为同一 rubric 的可比校准，因此明确停止本轮校准，不再用其他模型补跑。

本轮没有产生可用于比较的分数或逐项 verdict。当前 rubric 是**本地 schema / 单元测试已验证、实际 LLM judge 未校准**；不得沿用旧流程 rubric 的分数或抖动结论，也不得把“跳过”记成“通过”。

## 历史校准（2026-07-02，固定流程 rubric）

| 案例                 | 人工分 | judge 三次判分 | 分差最大 | 抖动 | 逐项方向   |
| -------------------- | -----: | -------------- | -------: | ---: | ---------- |
| case-1-tapnow-qrcode |      8 | 8 / 8 / 8      |        0 |    0 | 30/30 一致 |
| case-2-skland-token  |      6 | 6 / 5.5 / 5.5  |      0.5 |  0.5 | 30/30 一致 |

这些数字只记录历史 judge 的稳定性，不能与 outcome-first rubric 横向比较。2026-07-03 曾把逐枝 grill、`Design Summary` 固定标记和逐决策交回机械化；2026-07-21 已删除这些流程门，改为评估交互比例与结果质量。

## Rubric 修订记录

| 日期       | 修订                                                                                                | 动因                                                                                                            |
| ---------- | --------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| 2026-07-21 | spec 改为 grounding、收敛状态、实质决策前沿、已定内容复用、真实 trade-off、输出边界与实现 readiness | 真实会话出现已解决决定被再次交回用户、用户同意后又要求固定 summary 确认的回归；强模型被流程仪式制造了无意义轮次 |
| 2026-07-21 | judge 删除固定 phase segmentation，score 以事实充分度、交互比例、决策完备与交付质量为主             | 缺少命名阶段不等于结果差；问题数量也不能区分高效综合与遗漏决定                                                  |
| 2026-07-21 | 新增 synthetic case-3，并按新 requirement 重标 case 1 / 2                                           | 让重复确认直接可观察，同时保留旧真实证据但不提交私密 transcript                                                 |
| 2026-07-02 | render 的 plan 文件写入上限从 400 放宽到 20000 字符                                                 | 截断导致 judge 看不到案例 1 plan 的关键段落                                                                     |
| 2026-07-02 | score 区分阶段压缩与阶段缺失                                                                        | 旧 judge 把压缩 grill 误当成完全缺失                                                                            |
| 2026-07-02 | schema 的 phase turns 接受单数字与单元素数组                                                        | 单轮片段曾因过严 schema 变成 judge-error；该字段现已删除                                                        |
| 2026-07-02 | n.a. 不扣分、同根因不重复扣分、短会话只评可观察部分                                                 | 防止一个行为缺陷被多条 requirement 重复计罚                                                                     |
