interface InlineIconProps {
  src: string;
  className?: string;
}

export default function InlineIcon({ src, className = "" }: InlineIconProps) {
  return (
    <span
      aria-hidden="true"
      className={`inline-block h-[0.95em] w-[0.78em] align-[-0.08em] bg-current ${className}`}
      style={{
        maskImage: `url('${src}')`,
        WebkitMaskImage: `url('${src}')`,
        maskRepeat: "no-repeat",
        WebkitMaskRepeat: "no-repeat",
        maskSize: "contain",
        WebkitMaskSize: "contain",
        maskPosition: "center",
        WebkitMaskPosition: "center",
      }}
    />
  );
}
