export default function SectionDivider() {
  return (
    <div className="bg-card relative -z-10 h-4 overflow-hidden">
      <div
        className="border-accent/20 absolute right-0 left-0 border-b border-dashed"
        style={{
          top: "50%",
          transform: "translateY(-4px)",
        }}
      />
      <div
        className="border-accent/20 absolute right-0 left-0 border-b border-dashed"
        style={{
          top: "50%",
          transform: "translateY(0px)",
        }}
      />
      <div
        className="border-accent/20 absolute right-0 left-0 border-b border-dashed"
        style={{
          top: "50%",
          transform: "translateY(4px)",
        }}
      />
    </div>
  );
}
