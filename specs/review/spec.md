# Review Specification

## Purpose

review 对设计、规划产物或代码改动给出有证据的可操作发现，判断哪里需要纠正及原因；支持调用的结果返回持有原任务授权的调用方。

## Requirements

### Requirement: 只审阅不修改

review 不得修改源码、测试、plan、Issue 或 docs，不得 stage、commit、push 或修复 finding。可以运行项目或相关测试来证实问题，但启动失败不授予修改配置的权限，发现也不授予修复权限。独立请求止于审阅结果；支持调用返回仍持有授权的调用方继续原任务。
Verify: manual(integration)

### Requirement: 审阅围绕原始目标与实际产物

review 必须根据原始请求与纠正、既定决定、适用项目契约及实际完整产物审阅，包含相关未跟踪文件；不得将计划自身的主张当作证明。复用有效事实，按缺口调查，不无条件要求 Explore 或独立 Agent。Plan 的规划审计必须在独立于编写过程的 fresh context 中审阅原始证据与实际产物，记录实际版本、生成结果及未覆盖部分；完整历史 fork 或作者摘要不能替代独立审阅，缺独立上下文、必需证据或产物访问时返回 inconclusive。本地计划须满足需求、事实、范围、依赖和可区分结果的验证；Issue 仅承载有边界的问题，不要求未知方案、技术步骤或完整验收；成对产物须语义一致且保留职责区别。部分生成只授权审阅可读范围，不得假定缺失产物内容或执行未来实现测试充当规划证据。
Verify: manual(integration)

### Requirement: 发现必须可操作且有证据

review 必须报告依据原始目标、源码、契约或实际观察成立的高置信度问题，按影响排列，并给出具体后果、可定位对象或紧凑行号、依据及修正方向，不写补丁。判断包括正确性、失败和边缘处理、意图与范围、有效覆盖及不必要复杂性，不强制全部展开。compatibility 仅在原始目标或权威契约建立时才是约束；选定范围内的失败掩盖、未授权 fallback、兼容层、迁移、双路径或 legacy，以及已授权替换后的旧路径残留须作为 finding，不能为证明全局不存在而扩大范围。证据不足须保留缺口，不提出纯风格或推测性问题。
Verify: manual(integration)

### Requirement: 审阅结论限定范围并返回调用方

review 必须对实际范围返回恰好一个 pass、findings 或 inconclusive，报告适用版本、实际命令或观察及重要缺口。pass 仅说明所阅范围未发现可操作问题，不证明运行结果或实现验收；findings 表示已有证据支持的问题，inconclusive 表示必要判断无法建立。其他范围未覆盖不能抹去已成立的发现。规划审阅结果返回 Plan 修订；修订后的定向核对不能扩展原独立 verdict 到新版本、冒充新的独立 pass、递归启动 Plan、升级 draft 或产生 candidate、accepted、done。普通 review 仅提供证据，正式验收属于 Verify。
Verify: manual(integration)
