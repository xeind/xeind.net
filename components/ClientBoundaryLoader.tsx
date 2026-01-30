"use client";

import dynamic from "next/dynamic";

const ClientErrorBoundary = dynamic(() => import("./ClientErrorBoundary"), {
  ssr: false,
});

export default function ClientBoundaryLoader({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ClientErrorBoundary>{children}</ClientErrorBoundary>;
}
