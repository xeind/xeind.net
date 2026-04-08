import Hint from "./Hint";

interface HoverWordProps {
  children: React.ReactNode;
  hintLabel?: string;
  className?: string;
}

export default function HoverWord({
  children,
  hintLabel,
  className = "",
}: HoverWordProps) {
  const word = (
    <span
      className={`text-accent hover:text-tertiary transition-colors ${className}`}
    >
      {children}
    </span>
  );

  if (!hintLabel) return word;

  return <Hint label={hintLabel}>{word}</Hint>;
}
