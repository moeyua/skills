# Docs Specification

## Purpose

docs 从权威来源维护六类 durable memory 或用户明确指定的项目文档；它记录 truth，不作产品决定。

## Requirements

### Requirement: 目标按需选择

用户指定目标时 docs 必须留在该 artifact；否则必须先读 memory catalog，只选择适用目标，再只读被选中的 format。不得把 catalog 当成六份文档都要填的 checklist，也不得发明第七类默认 artifact。
Verify: [durable memory architecture](../../tests/durable-memory.test.ts)

### Requirement: 每个 claim 都有 authority

内容必须来自用户/维护者决定、经用户审阅的 Shape Design Summary 中已定 claim、有权威 basis 的 plan 决定或 Spec delta、verified landed behavior、权威契约或明确 correction。Summary、plan、代码或 merged artifact 只能携带其来源已有的 authority，其存在不得建立未披露的产品 intent；代码可证明 mechanics，不得独自证明 positioning、rationale、priority 或 intended behavior。前提已被纠正的 superseded claim 不得继续传播。
Verify: manual(integration)

### Requirement: PRODUCT truth 必须已经决定

docs 可记录 already decided 的 PRODUCT positioning、哲学和边界；需要自行判断方向、价值或 scope 时必须省略该 claim 或停在具体 authority 边界。
Verify: [durable memory architecture](../../tests/durable-memory.test.ts)

### Requirement: Spec delta 按 requirement identity 合并

ADDED/MODIFIED/REMOVED 必须按持久 requirement 名加入、替换或删除，并以 landed behavior 核对最终契约；每条 requirement 保留恰好一个 `Verify:`。
Verify: manual(integration)

### Requirement: touched range 形成一致文档

docs 必须保留正确内容并重塑 touched range，不得追加补丁式纠错段落；ARCHITECTURE/DESIGN 只记当前，ROADMAP 只记已决定未来项，README 只投影已定定位与 verified usage。已授权变更是 clean break 时，当前 truth 必须移除 superseded design 而不是并列保留新旧路径；兼容或迁移只有在其 authority 已建立时才能记录。
Verify: manual(integration)

### Requirement: 文档调用止于文档结果

docs 不得编辑实现、执行项目级 drift audit、提交、推送、开 PR 或 release；完成后报告 target、truth、authority 与因缺权威省略的内容。
Verify: manual(integration)
