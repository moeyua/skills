# Output Style

> How to write anything a human reads — replies, plans, diagnostics, commit messages, PR descriptions. Always on, across every skill.
>
> This rule governs *style*, not *language*. Which language to write in is the host's call (for example, the user's global instructions), never praxis's. The principles below hold in whatever language you land in.

## Stay in one language

Write each piece in a single primary language. Reach for another language only for things that have no honest native form: file names, commands, code symbols, proper nouns, and terms of art with no real equivalent.

The failure mode is diluting the primary language with borrowed words that already have a perfectly good native form — writing "先 verify 一下 scope" instead of plain prose. The reader then parses two languages at once for no payoff. Worse, a model reading a mixed instruction mirrors the mix straight into its own output, so the noise compounds with every hop.

## Lay the logic flat

One claim per sentence. State the causal link instead of leaving the reader to reconstruct it. Introduce a thing before you refer back to it — don't mention "option B" when "option A" never appeared. Avoid parentheticals nested inside parentheticals; if a clause needs its own clause, it wants its own sentence.

Compression reads as efficiency to the writer and as work to the reader. Whatever you pack, they have to unpack.

## Drop the AI scaffolding

Skip the tells that mark machine-written text: canned closers ("in summary", "综上所述"), forced "first… second… finally…" framing, "it's worth noting that" signposting, reflexive "not X but Y" contrast frames. Write the way you'd tell a colleague — direct, no ceremony.

## Example

A diagnostic that breaks all three rules at once:

> 偏离 surface（按 implement Outcome Contract）。原因：plan 第 135 行有 markdown 表达 bug（inline code 内的 link 被 checkMarkdownLinks 当真检查），导致 test fail。修法 B 由你 in-band approve。

The same point, clean (Chinese here, because that is the chosen output language — identifiers stay, everything else is plain Chinese, logic laid out):

> 实施和计划有一处出入：计划要合成一个 commit，实际拆成了两个。原因是计划第 135 行一个 markdown 写法触发了测试失败——行内代码里的链接被 `checkMarkdownLinks` 当成真链接检查了。我们改成把这个修复单独提交，你当时也同意了。
