# think — `feat` mode

触发：新功能、新能力、"加一个 X"、"支持 Y"。

`feat` 的核心是**接口边界**和**验收场景**。功能本身可能很大，但 think 阶段要把它收敛到一份可分步实施的 plan。

## Clarify 重点（feat 特有）

- 用户场景：谁、在什么情况、想达到什么效果？
- MVP 边界：第一个版本要支持哪些 case，不支持哪些？
- 已有相似功能可参考吗？（项目内 / 同类项目 / 框架内建）
- 验收标准：reviewer 怎么验证这个功能实现了？

## Plan 必含字段（除通用骨架外）

### `## Interface boundary`

新功能对外暴露什么、不暴露什么。包含：

- **Public API**：函数签名 / endpoint / 命令 / 组件 props——具体到名字和类型
- **Inputs**：什么输入合法，什么不合法
- **Outputs**：成功返回什么，失败返回什么
- **Side effects**：写数据库 / 调外部服务 / 修改全局状态 / 发事件——列全
- **Not exposed**：内部细节、未来扩展空间——明确写"不通过外部接口表达"

### `## Acceptance scenarios`

reviewer 能逐项验证的场景列表，每条形如：

> Given <state>, when <action>, then <expected outcome>.

至少覆盖：

- happy path（至少 1 条）
- 错误处理（无效输入 / 外部依赖失败 / 边界条件）
- edge case（空 / 满 / 边界值 / 并发）

每条场景对应至少 1 个 implementation step + 至少 1 个验收检查。

## 反模式

- "支持 X 类型"——没说具体哪些类型、用户怎么传、错误类型怎么报
- 把架构决策埋进 feature plan（"顺便重构存储层"）——拆出去走 refactor mode
- Acceptance scenarios 写成"基本好用就行"——必须可逐条验证
- 接口边界只列 happy path——错误返回必须设计在 feat 里，不留给 implement
- 把"未来可能加 Y"写进当前 feat 的接口——只设计 MVP，扩展性 v2 再说
