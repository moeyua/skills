# Skills

agent 干活时用到的 skill，以及它们共用的说法。

## 语言

**Skill**：
一个目录，`SKILL.md` 是入口，教 agent 怎么做一件具体的事。可以由模型自动调用，也可以设成只能手动调用。
_避免_：技能包、能力、capability

**切片**：
一段窄但完整的改动，穿过它涉及的每一层，做完就能单独演示。plan 按切片拆工作，implement 每做完一个切片就 commit 一次。
_避免_：任务、步骤、tracer bullet（英文里可以用，中文里统一说"切片"）

**接缝**：
测试观察行为的公开口子，比如一个函数、一条命令、一个接口或一个页面。测试只放在约定好的接缝上。对用户说话时直接说具体的函数、命令或页面，不用这个词。
_避免_：测试边界、测试层

**项目文档**：
项目的长期记忆，共八类：specs、PRODUCT、ARCHITECTURE、DESIGN、ROADMAP、README、GLOSSARY、ADR。格式由 docs 提供。
_避免_：durable memory、catalog memory

**已定**：
用户说过或同意过的决定，附上用户的原话作为来源。
_避免_：你定的、Settled（中文场景下）

**待确认**：
agent 替用户做的选择，附上理由，等用户点头后才算已定。
_避免_：我定的、建议
