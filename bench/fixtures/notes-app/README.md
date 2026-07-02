# Notes App

一个极简笔记应用(shape-bench 合成 fixture)。内存存储,支持添加、列出、搜索、导出笔记。

## 结构

- `src/notes.js` — 笔记模型与增删查
- `src/storage.js` — 存储层(目前与业务逻辑耦合)
- `src/export.js` — CSV 导出
- `src/render.js` — 列表渲染(纯文本)
- `test/notes.test.js` — 基础测试

## 已知情况

- 导出含逗号或引号的笔记时 CSV 会串列
- 笔记超过几千条时列表渲染明显变慢
