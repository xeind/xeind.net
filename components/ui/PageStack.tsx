import React from "react";
import SectionDivider from "./SectionDivider";

interface PageStackProps {
  children: React.ReactNode;
  className?: string;
  lead?: React.ReactNode;
}

export default function PageStack({
  children,
  className = "",
  lead,
}: PageStackProps) {
  const items = React.Children.toArray(children);

  return (
    <div className={`flex flex-col ${className}`}>
      {lead}
      {items.map((child, index) => (
        <div key={index}>
          {child}
          {index < items.length - 1 && <SectionDivider />}
        </div>
      ))}
    </div>
  );
}
