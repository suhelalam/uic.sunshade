"use client";

import * as React from "react";

type Props = {
  message: string;
  onDismiss: () => void;
  duration?: number;
};

export function Toast({ message, onDismiss, duration = 4000 }: Props) {
  React.useEffect(() => {
    const t = setTimeout(onDismiss, duration);
    return () => clearTimeout(t);
  }, [onDismiss, duration]);

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-sm rounded-xl border border-[#001E62]/15 bg-white px-4 py-3 shadow-[0_8px_24px_rgba(0,30,98,0.12)] sm:left-auto sm:right-4"
    >
      <div className="flex items-center gap-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#D50032]/15 text-[#D50032]">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </span>
        <p className="text-sm font-medium text-[#333333]">{message}</p>
      </div>
    </div>
  );
}
