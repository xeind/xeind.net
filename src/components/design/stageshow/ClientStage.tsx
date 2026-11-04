import type { ReactNode } from "react";
import { useMounted } from "@/lib/hooks/useMounted";
import "./look.css";

interface Props {
  /** The stage's design width and height; the reserved box takes their ratio. */
  width: number;
  height: number;
  children: ReactNode;
  className?: string;
}

/**
 * Mounts a Stageshow demo in the browser only, holding its box in the server
 * HTML.
 *
 * The kit's Stage reads the viewport, reduced motion and its own placing pass
 * during render, so a server render never matches the client's and React
 * leaves the stale attributes in place (a hydration mismatch, seen on the
 * first build). Rendering nothing on the server avoids that; reserving the
 * stage's aspect ratio keeps the page from shifting when it mounts. Every
 * demo here is a client:visible island, so this runs before it scrolls in.
 */
export default function ClientStage({ width, height, children, className = "" }: Props) {
  const mounted = useMounted();
  return (
    <div
      data-look="xeind"
      className={className}
      style={mounted ? undefined : { aspectRatio: `${width} / ${height}` }}
    >
      {mounted ? children : null}
    </div>
  );
}
