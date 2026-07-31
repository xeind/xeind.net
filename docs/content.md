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
2. **The project modal is a fixed box with a hidden scrollbar.** It is
   `h-[50vh] max-w-xl`, and its body carries both `overflow-y-auto` and
   `scrollbar-hide`. Content past the fold still scrolls, but there is no
   scrollbar to say so. Overlong copy doesn't clip — it silently disappears.

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

**Total bullet budget: ~350 characters.** The modal body has roughly 250px of
vertical room after the header, badges and separator; at `text-base` with
`leading-relaxed` that is about 9 lines, and the `max-w-xl` column fits ~60
characters per line. 350 leaves real headroom. Past ~550 you are writing below
the fold.

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
