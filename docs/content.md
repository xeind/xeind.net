# Content shape

Length rules for the data in `src/lib/data/`. Companion to
`docs/design-system.md`. **Enforced**: `npm run check:design` parses the data
files and fails on anything outside these bands, including marketing register
("seamless", "robust", "cutting-edge", "leveraging", "passionate").

## Why length is a design rule here

**Nothing on this site truncates.** There is no `line-clamp`, no `truncate`, no
ellipsis anywhere in `src/components/`. Two consequences decide every number
below:

1. **Award cards stretch to the tallest in the row.** `AwardsGrid` is a CSS grid
   (`sm:grid-cols-2 lg:grid-cols-3`) with default `align-items: stretch`. One
   long description doesn't just make its own card tall — it inflates every card
   beside it, and the short ones fill with dead space.
2. **The project modal sizes to its content, capped at `70vh`.** Short copy
   makes a short modal — no dead space — but past the cap the body scrolls
   with a hidden scrollbar (`scrollbar-hide`): there is nothing to say more
   exists. Overlong copy doesn't clip — it silently disappears below 70vh.

So content length is layout. Write to the budget.

---

## Projects — `src/lib/data/projects.ts`

| Field             | Rule                                                                            | Observed |
| ----------------- | ------------------------------------------------------------------------------- | -------- |
| `title`           | ≤ 16 chars. Sits on the plate in a 4-up grid.                                   | max 12   |
| `description`     | **Required unless `interactive: false`.** One phrase, ≤ 50 chars, no full stop. | max 49   |
| `longDescription` | 2 bullets (3 at a push). Each one sentence, ≤ 150 chars, ending in a full stop. | max 143  |
| `technologies`    | 3–5. They render as `Badge`es and wrap.                                         | 2–5      |
| `projectLinks`    | 0–2. Label ≤ 16 chars.                                                          | 0–2      |
| `type`            | `Personal` or `Client`. One axis — see the comment in `types.ts`.               | —        |

**Total bullet budget: ~350 characters.** The modal grows to fit, so the
budget is no longer about filling a fixed box — it is about the 70vh cap on a
phone: after the 20vh stage, header and badges, roughly 12 lines of
`text-base` fit, and the `max-w-xl` column carries ~60 characters per line.
350 keeps a one-thumb read; past ~700 you are below the cap on small phones.

### `description` is not shown on the card

Worth knowing before you write one. The plate renders the logo, the title, and
`type · year` — never `description`. The field is the modal's **fallback
bullet**, used only when `longDescription` is absent:

```tsx
(activeProject.longDescription || [activeProject.description]).filter(
  (point) => point.trim().length > 0,
);
```

So a project with an empty `description` **and** no `longDescription` opens a
modal with a separator and nothing under it. Never ship that. Either write the
two bullets or write the one-line description — one of the two is mandatory.

---

## Awards — `src/lib/data/awards.ts`

| Field         | Rule                                                      | Observed |
| ------------- | --------------------------------------------------------- | -------- |
| `title`       | ≤ 32 chars, serif, 3-up card.                             | max 28   |
| `issuer`      | ≤ 28 chars, mono eyebrow above the title.                 | max 26   |
| `description` | **120–170 chars.** Full sentences, ending in a full stop. | 137, 152 |

The band matters more than the cap. Because the row stretches, two cards at 140
and one at 260 gives you one full card and two half-empty ones. Keep entries
within about 30 characters of each other and the row reads as a set.

---

## Blog posts — `src/content/blog/<slug>/index.mdx`

Frontmatter, not `src/lib/data/`, but the same rule bites harder. `/blog` draws
every post in a 432 × 240 card — a fixed height with `overflow-hidden`, so
anything that does not fit is cut off with nothing on the page to say so.

| Field     | Rule                                | Observed |
| --------- | ----------------------------------- | -------- |
| `title`   | ≤ 80 chars. Serif, up to two lines. | max 41   |
| `excerpt` | ≤ 165 chars. Up to three lines.     | 79–155   |

Measured at 432px: a line holds 54 characters, so a title fits two lines to 93
and an excerpt three lines to 171. The caps leave a word of margin, because a
line of long words wraps sooner than a line of short ones.

Both maxima at once fill the card: 16 pad + 24 date + 48 title + 16 + 72
excerpt + 16 + 24 tags + 16 pad = 232, in a 240 box. A fourth excerpt line or a
third title line adds 24 and pushes the tag row out of sight.

There is no lower bound. The tags are pinned to the card's bottom edge, so a
short excerpt leaves white space in its own card and does not stretch its
neighbour the way an award description does. Two or three lines (roughly
110–160 characters) still reads best across a row.

---

## Voice

- **Plain and specific.** `Static analysis inside Neovim` beats
  `A powerful tool for code quality`.
- **Numbers over adjectives.** ATAX's second bullet is entropy, UACI, NPCR,
  correlation and runtime — it needs no praise words.
- **Full stops on bullets, none on `description`.** A bullet is a sentence; a
  `description` is a label.
- **No marketing register.** No "seamless", "robust", "cutting-edge",
  "leveraging", "passionate about".

---

## Currently out of contract

Fix these when you touch the file; don't let them set precedent.

- **`yield` and `pioneerdev-ai` have `description: ""` and no
  `longDescription`.** Both open an empty modal body. They need one or the
  other. `yield` also has `liveUrl: ""`.
- **`Award.stats`, `Award.type` and `Award.year` are never rendered.**
  `AwardsGrid` reads only `issuer`, `title`, `description` and `url`. Six stat
  entries currently exist as data with no output. Either render them or drop
  them from the type — but don't add more until it's decided.
