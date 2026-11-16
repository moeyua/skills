# Architecture

## 目录结构

```
skills/
├── engineering/        # 开发流程：explore、shape、plan、implement、verify、debug、review、release、docs、setup
└── productivity/       # 通用：handoff、explain
site/                   # 浏览全部 skill 的网页：pnpm dev 本地打开，pnpm build:site 输出到 site/dist/
docs/adr/               # 本仓库的架构决策记录
tests/skills.test.ts    # 结构检查
tests/site.test.ts      # 浏览站的 skill 解析
CONTRIBUTING.md         # 怎么写 skill
AGENTS.md               # 给 agent 的仓库说明（CLAUDE.md 只导入它）
RELEASE.md              # 改动怎么进 main、怎么发版
THIRD_PARTY_NOTICES.md  # 改编来源与许可证
```

每个 skill 是 `skills/<分类>/<名字>/` 下的一个目录：`SKILL.md` 是入口，`references/` 放按需读取的细节，`scripts/` 放脚本。

## 技术栈

- **Markdown**：skill 本身。
- **[skills](https://www.npmjs.com/package/skills) CLI**：负责安装。`pnpm install` 会触发根包的 `install` 脚本，把全部 skill 全局装到 Claude Code 和 Codex。
- **vite-plus**：`vp check` 负责格式、lint 和类型检查，`vp test` 跑测试。
- **原生 TypeScript + vite**：`site/` 浏览站，构建时用 `import.meta.glob` 读入 `skills/` 下的全部文件，`marked` 渲染 Markdown，`yaml` 解析 frontmatter。不用前端框架。
- **pnpm、Node 24**。

## skill 之间怎么配合

skill 之间只按名字互相提及（比如"用 `debug` skill"），不跨目录链接文件，所以单独安装某一个 skill 也不会出现断链。

```
explore ──读──▶  项目文档  ◀──写── shape / implement / setup
                   ▲
                   │ 格式
                  docs
```

- **docs** 是共用的格式库，九类项目文档的格式只在这里存一份。它可以被模型自动调用，所以其他 skill 都能调到它。
- **setup**、**handoff**、**explain** 只能手动调用，不占常驻上下文。
- **implement** 推送和 **release** 发版都照项目的 RELEASE.md 做，skill 里不写死 PR、预览、版本号这类按项目变化的选择。
- **implement** 会调用 debug 和 verify；**shape** 结束时会提议用 plan 把结论写下来。

## 架构不变量

- 目录名就是 skill 名，和 frontmatter 里的 `name` 一致。
- `SKILL.md` 里的相对链接只指向本 skill 目录内的文件，并且文件必须存在。
- 以上两条由 `tests/skills.test.ts` 检查。
