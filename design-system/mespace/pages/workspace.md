# Page Override: /workspace

> Generated via ui-ux-pro-max `--design-system` search ("personal productivity dashboard
> tasks notes projects internal tool", density 8/10, variance 5/10, motion 3/10).
> Overrides `MASTER.md` for the `/workspace` route only. Public routes (`/`, `/projects`,
> `/resume`) continue to use `MASTER.md` unchanged.

---

**Page:** workspace
**Category:** Productivity / Dashboard (internal tool)
**Rationale:** Deliberately distinct from the public brand shell — signals "you've left the
portfolio and you're in your own tool" the moment `/workspace` renders, without needing auth
to make that boundary legible.

---

## Design Dials

| Dial | Value | Meaning |
|------|-------|---------|
| Variance | 5/10 | Balanced / modern |
| Motion | 3/10 | Subtle |
| Density | 8/10 | Dense / dashboard |

## Color Palette (overrides MASTER for this page only)

| Role | Hex | CSS Variable |
|------|-----|--------------|
| Primary | `#0D9488` | `--color-primary` |
| On Primary | `#FFFFFF` | `--color-on-primary` |
| Secondary | `#14B8A6` | `--color-secondary` |
| Accent/CTA | `#EA580C` | `--color-accent` |
| Background | `#F0FDFA` | `--color-background` |
| Foreground | `#134E4A` | `--color-foreground` |
| Muted | `#E8F1F4` | `--color-muted` |
| Border | `#99F6E4` | `--color-border` |
| Destructive | `#DC2626` | `--color-destructive` |
| Ring | `#0D9488` | `--color-ring` |

**Notes:** Teal focus + orange action accent. Accent adjusted from `#F97316` for WCAG 3:1.
Dark mode is primary for this page (light mode supported as the exception, not the default) —
opposite of the public site's light-first MASTER tokens.

## Typography

- **Heading Font:** Fira Sans
- **Body/Data Font:** Fira Code (tabular data, task/status metadata)
- **Mood:** dashboard, data, analytics, technical, precise
- **Google Fonts:** `https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500;600;700&family=Fira+Sans:wght@300;400;500;600;700&display=swap`

## Spacing (dense scale — overrides MASTER's `--space-*`)

Density 8/10 → 8-32px scale instead of MASTER's 16-64px marketing scale. Use for list rows,
table cells, tab bar, and card padding inside `/workspace` only.

## Style

**Name:** Modern Dark (dashboard variant)
**Keywords:** dark mode, glassmorphism, deep black avoided (use `#134E4A`-based dark, not pure
`#000000`, to avoid OLED smear), layered, frosted glass, technical
**Best For:** developer tools, pro productivity apps — matches a personal tasks/notes/projects
dashboard

## Layout Pattern

**Name:** Real-Time / Operations Landing (adapted for a dashboard shell, not a marketing page)

- Header: page title + tab bar (Tasks / Notes / Projects), sticky, `padding-top` compensation
  on body per nav height (no content obscured)
- Content: dense list/table rows per tab, status badges reusing MASTER's badge component
  pattern but at page-local density
- No hero, no CTA-focused marketing sections — this is a tool, not a landing page

## Motion

**Preset:** Scroll Reveal (Subtle) — `duration 300-400ms`, `ease: power1.out`. Used sparingly
for list-item entrance only; no ambient/ornamental motion given density 8 (dashboard use favors
speed over spectacle).

## Navigation & Accessibility (from `ux` domain search)

- Sticky tab bar: compensate body `padding-top` equal to bar height — never overlap content
- Keyboard: tab order matches visual order; all task/note/project actions reachable without a
  mouse
- Heading hierarchy: `h1` page title → `h2` per tab section → `h3` per list item, no skipped
  levels
- Skip link to main content above the tab bar (dashboard is nav-light but still keyboard-first)

## Anti-Patterns (Do NOT Use)

- ❌ Complex onboarding (this is a single-user tool — no tours/wizards)
- ❌ Ambient motion/parallax (density 8 + motion 3 rule this out)
- ❌ Emojis as icons — SVG only (Heroicons/Lucide), consistent with MASTER
- ❌ Borrowing MASTER's light monochrome+blue palette here — the point of this override is a
  visually distinct "you're in the tool now" shell

## Pre-Delivery Checklist

- [ ] No emojis as icons (SVG: Heroicons/Lucide)
- [ ] `cursor-pointer` on all clickable elements
- [ ] Hover/focus transitions 150-300ms
- [ ] Dark-mode text contrast 4.5:1 minimum (verify teal-on-dark and orange-on-dark pairs)
- [ ] Focus states visible for keyboard nav
- [ ] `prefers-reduced-motion` respected
- [ ] Responsive: 375px, 768px, 1024px, 1440px
- [ ] Sticky tab bar does not obscure content (padding-top compensation)
