/**
 * Hook that provides a stable anonymous ID for this browser/device (used for attend without login).
 */

import * as React from "react";
import { getOrCreateAnonymousId } from "@/lib/anonId";

export function useAnonymousId(): string | null {
  const [id, setId] = React.useState<string | null>(null);
  React.useEffect(() => {
    setId(getOrCreateAnonymousId() || null);
  }, []);
  return id;
}
