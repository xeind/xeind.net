import { useCallback, useEffect, useState } from "react";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";
import { CSS_TRANSITIONS } from "@/lib/config/animation";

/**
 * Text arriving a word at a time, with a block caret at the head.
 *
 * Word by word, not character by character: a character stream makes the eye
 * chase the caret, and the reader ends up watching the animation instead of
 * reading. Whole words let a reader start reading the first line while the
 * third is still arriving, which is the only reason to stream text at all.
 *
 * The caret is a filled block, not a bar — it inherits the page's ink and
 * reads as a typesetting mark rather than a terminal cursor.
 *
 * Reduced motion prints the whole passage at once with no caret. There is
 * nothing to convey once the text is already there.
 */

// A rate, not a transition: ~18 words/second, close to a fast model's output.
// Slow enough to read as arriving, fast enough not to test patience.
const WORD_MS = 55;

interface StreamingTextProps {
  text: string;
  className?: string;
}

export default function StreamingText({ text, className = "" }: StreamingTextProps) {
  const prefersReducedMotion = useReducedMotion();
  const words = text.split(" ");

  // `run` restarts the interval; `shown` counts words within a run. Reduced
  // motion is derived rather than stored — writing the full count into state
  // from an effect would cascade a render for a value already known here.
  const [run, setRun] = useState(0);
  const [shown, setShown] = useState(0);
  const visible = prefersReducedMotion ? words.length : shown;

  useEffect(() => {
    if (prefersReducedMotion) return;

    const id = window.setInterval(() => {
      setShown((n) => {
        if (n >= words.length) {
          window.clearInterval(id);
          return n;
        }
        return n + 1;
      });
    }, WORD_MS);

    return () => window.clearInterval(id);
  }, [run, prefersReducedMotion, words.length]);

  const replay = useCallback(() => {
    setShown(0);
    setRun((n) => n + 1);
  }, []);

  return (
    <div className={className}>
      {/* The full text is in the DOM for assistive tech and for anyone reading
          the source — only the tail is visually hidden while it arrives. */}
      <p className="text-foreground/80 text-sm leading-relaxed">
        <span className="sr-only">{text}</span>
        <span aria-hidden="true">
          {words.slice(0, visible).join(" ")}
          {/* Sized like a vim block: a full character cell sitting on the
              baseline, not the thin bar a browser draws. The em units keep it
              a cell if the paragraph's size ever changes.

              It does not blink. A blinking caret is invisible for half of
              every cycle, which loses the one thing it is there to show, and
              the motion on this page belongs to the text arriving. The block
              moves because the text grows under it — that is enough. */}
          {!prefersReducedMotion && (
            <span className="bg-accent ml-1 inline-block h-[1.05em] w-[0.55em] translate-y-[0.15em]" />
          )}
        </span>
      </p>

      <button
        type="button"
        onClick={replay}
        className="border-accent/30 text-foreground/60 hover:border-accent/50 hover:bg-muted hover:text-tertiary focus-visible:ring-accent mt-4 border border-dashed px-2 py-1 font-mono text-[0.6875rem] transition-[background-color,border-color,color] hover:border-solid focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
        style={CSS_TRANSITIONS.border}
      >
        Replay
      </button>
    </div>
  );
}
