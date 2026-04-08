import CalloutLink from "./CalloutLink";

interface CalloutBandProps {
  href: string;
  label: string;
  icon?: React.ReactNode;
  external?: boolean;
  className?: string;
}

export default function CalloutBand({
  href,
  label,
  icon,
  external = false,
  className = "",
}: CalloutBandProps) {
  return (
    <div className={className}>
      <CalloutLink href={href} label={label} icon={icon} external={external} />
    </div>
  );
}
