import { useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};

/**
 * False during SSR and the hydration render, true after — without the
 * setState-in-effect pattern that react-hooks/set-state-in-effect flags.
 * Used to gate createPortal calls that need a browser document.
 */
export function useMounted() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
}
