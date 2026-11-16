# Writing a series

```
content/blog/
  <series-slug>/
    _series.md        title, summary  (+ optional order)
    01-first-post.md  title, summary, date  (+ optional draft: true)
    02-second-post.md
```

Posts are ordered by their numeric filename prefix; the slug is the rest of the
filename. Body is Markdown. `pnpm dev` and `pnpm build` regenerate
`src/content/blog.generated.json` (the index the mind map reads).
