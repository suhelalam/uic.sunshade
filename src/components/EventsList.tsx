/**
 * List of event cards with title, date, address, distance from reference point, and edit button.
 * Used for both filtered (upcoming) events and past events sections.
 */

import type { MapEvent } from "@/lib/types";
import type { LngLat } from "@/lib/types";
import { dayIndexToLabel } from "@/lib/filters";
import { haversineMiles } from "@/lib/geo";

type Props = {
  events: MapEvent[];
  selectedLocation: LngLat;
  onSelect: (event: MapEvent) => void;
  onEdit: (event: MapEvent) => void;
};

export function EventsList({ events, selectedLocation, onSelect, onEdit }: Props) {
  if (events.length === 0) {
    return <div className="py-6 text-center text-sm text-zinc-500">No events match.</div>;
  }

  return (
    <div className="space-y-2">
      {events.slice(0, 8).map((e) => {
        const d = new Date(e.dateISO);
        const dist = haversineMiles(selectedLocation, e.location);
        return (
          <div
            key={e.id}
            className="w-full rounded-xl border border-zinc-200/80 bg-white px-4 py-3 text-left shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-all hover:border-zinc-300 hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)]"
          >
            <div className="flex items-start justify-between gap-3">
              <button
                type="button"
                onClick={() => onSelect(e)}
                className="min-w-0 flex-1 text-left"
              >
                <div className="truncate text-sm font-medium text-zinc-900">
                  {e.title}
                </div>
                <div className="mt-0.5 text-xs text-zinc-500">
                  {dayIndexToLabel(d.getDay())} • {d.toLocaleString()}
                </div>
                {e.address ? (
                  <div className="mt-1 truncate text-xs text-zinc-500">
                    {e.address}
                  </div>
                ) : null}
              </button>
              <div className="flex flex-col items-end gap-2">
                <div className="text-xs font-medium tabular-nums text-zinc-700">
                  {dist.toFixed(1)} mi
                </div>
                <button
                  type="button"
                  onClick={() => onEdit(e)}
                  className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full border border-zinc-200 p-2.5 text-zinc-600 transition-colors hover:bg-zinc-50 hover:border-zinc-300"
                  aria-label={`Edit ${e.title}`}
                  title="Edit event"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 20h9" />
                    <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
