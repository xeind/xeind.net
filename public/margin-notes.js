/* Margin notes (blog/MarginNote.astro): places each note for the width, and
   draws it on as it scrolls into view. The note renders fully drawn and in
   place; without this script a reader loses the motion and, on a narrow
   screen, gets the note under the line that holds its phrase instead of
   under the paragraph. It only moves the aside and adds classes; the
   timings are set by the component from src/lib/config/animation.ts.

   Loaded only by pages that have a note, so a ClientRouter navigation onto one
   can run it again. The flag keeps that to one set of listeners;
   astro:page-load re-reads the notes after every swap. */
(() => {
  if (window.__marginNotes) return;
  window.__marginNotes = true;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  /* The component's breakpoint, where the paper beside the sheet holds the
     note. Change one, change both. */
  const wide = window.matchMedia("(min-width: 92rem)");
  /* Where each moved aside came from, so it can go back. */
  const homes = new WeakMap();
  let observer = null;

  /* Narrow: each aside moves to just after its paragraph, in source order,
     so the sentence it annotates reads through. Wide: back into the phrase's
     wrapper, where the float lines it up with the phrase. A note in a list
     item or a blockquote never floats into the margin (see the component),
     so it stays moved at every width: after its paragraph, or to the end of
     a list item that has none. */
  const nested = (element) => Boolean(element.closest("li, blockquote"));

  function place() {
    if (wide.matches) {
      for (const aside of document.querySelectorAll(".margin-note-moved")) {
        const home = homes.get(aside);
        if (!home || !home.isConnected || nested(home)) continue;
        home.append(aside);
        aside.classList.remove("margin-note-moved");
      }
    }
    const after = new Map();
    for (const aside of document.querySelectorAll(".margin-note-aside:not(.margin-note-moved)")) {
      if (wide.matches && !nested(aside)) continue;
      const paragraph = aside.closest("p");
      const item = paragraph ? null : aside.closest("li");
      if (!paragraph && !item) continue;
      homes.set(aside, aside.parentElement);
      if (item) {
        /* The end of the item's own child that holds the note: a post's
           <li> is a flex row of a bullet and the content, and appended to
           the <li> itself the note became a third column. */
        let content = aside;
        while (content.parentElement !== item) content = content.parentElement;
        /* A plain <li> holds the note's own wrapper directly. */
        (content === aside.parentElement ? item : content).append(aside);
      } else {
        (after.get(paragraph) || paragraph).after(aside);
        after.set(paragraph, aside);
      }
      aside.classList.add("margin-note-moved");
    }
  }

  /* 60% in view, Daryl's threshold: far enough in that the reader sees the
     draw start, not its tail. One shot: a drawn note stays drawn. */
  function onIntersect(entries) {
    for (const entry of entries) {
      if (entry.intersectionRatio < 0.6) continue;
      entry.target.classList.add("margin-note-in");
      observer.unobserve(entry.target);
    }
  }

  function arm() {
    if (observer) observer.disconnect();
    observer = null;
    if (reduceMotion.matches || !("IntersectionObserver" in window)) return;

    const notes = document.querySelectorAll(".margin-note-aside:not(.margin-note-in)");
    if (notes.length === 0) return;
    observer = new IntersectionObserver(onIntersect, { threshold: [0, 0.6, 1] });

    for (const note of notes) {
      /* A note on screen when the script arrives has already been seen drawn.
         Arming it would flash it out and back, so it stays as it is. */
      if (!note.classList.contains("margin-note-armed")) {
        const rect = note.getBoundingClientRect();
        if (rect.bottom > 0 && rect.top < window.innerHeight) continue;
        note.classList.add("margin-note-armed");
      }
      observer.observe(note);
    }
  }

  function init() {
    place();
    arm();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }

  document.addEventListener("astro:page-load", init);
  wide.addEventListener("change", place);
})();
