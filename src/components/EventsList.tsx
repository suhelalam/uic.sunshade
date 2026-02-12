/**
 * Compact list: one row per event (name + distance). Click to expand inline and show full details.
 */

import type { MapEvent } from "@/lib/types";
import type { LngLat } from "@/lib/types";
import { dayIndexToLabel } from "@/lib/filters";
import { haversineMiles } from "@/lib/geo";

type Props = {
  events: MapEvent[];
  selectedLocation: LngLat;
  expandedId: string | null;
  onExpandToggle: (event: MapEvent) => void;
  onSelect: (event: MapEvent) => void;
  onEdit: (event: MapEvent) => void;
  onDelete?: (event: MapEvent) => void;
  currentUserId?: string | null;
};

export function EventsList({
  events,
  selectedLocation,
  expandedId,
  onExpandToggle,
  onSelect,
  onEdit,
  onDelete,
  currentUserId,
}: Props) {
  if (events.length === 0) {
    return <div className="py-3 text-center text-xs text-zinc-500">No events</div>;
  }

  return (
    <div className="space-y-1">
      {events.slice(0, 20).map((e) => {
        const d = new Date(e.dateISO);
        const dist = haversineMiles(selectedLocation, e.location);
        const isPast = d < new Date();
        const isExpanded = expandedId === e.id;
        const canEdit = Boolean(currentUserId && e.createdBy === currentUserId);

        return (
          <div
            key={e.id}
            className="rounded-lg border border-zinc-200/80 bg-white overflow-hidden transition-all hover:border-zinc-300"
          >
            <button
              type="button"
              onClick={() => onExpandToggle(e)}
              className="w-full flex items-center justify-between gap-2 px-3 py-2 text-left"
            >
              <span className="truncate text-sm font-medium text-zinc-900 min-w-0">
                {e.title}
              </span>
              <span className="shrink-0 text-xs tabular-nums text-zinc-500">
                {dist.toFixed(1)} mi
              </span>
              <svg
                className={`h-4 w-4 shrink-0 text-zinc-400 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>

            {isExpanded && (
              <div className="border-t border-zinc-100 px-3 py-2.5 text-xs text-zinc-600 space-y-1.5 bg-zinc-50/50">
                <div>
                  {dayIndexToLabel(d.getDay())} • {d.toLocaleString()}
                </div>
                {e.address || e.roomNumber ? (
                  <div className="truncate">
                    {e.address}
                    {e.address && e.roomNumber ? ", " : ""}
                    {e.roomNumber}
                  </div>
                ) : null}
                {e.organizer ? (
                  <div className="font-medium text-zinc-700">by {e.organizer}</div>
                ) : null}
                <div className="inline-flex items-center gap-1 text-zinc-500">
                  <svg className="h-3 w-3 shrink-0 text-zinc-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  {(e.attendCount ?? 0)} {isPast ? "attended" : "attending"}
                </div>
                <div className="flex flex-wrap gap-2 pt-1.5">
                  <button
                    type="button"
                    onClick={(ev) => {
                      ev.stopPropagation();
                      onSelect(e);
                    }}
                    className="rounded-md bg-[#FF385C]/10 px-2.5 py-1.5 text-xs font-medium text-[#FF385C] hover:bg-[#FF385C]/20"
                  >
                    View details
                  </button>
                  {canEdit && !isPast && (
                    <button
                      type="button"
                      onClick={(ev) => {
                        ev.stopPropagation();
                        onEdit(e);
                      }}
                      className="inline-flex items-center gap-1 rounded-md border border-zinc-200 px-2.5 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-50"
                      aria-label={`Edit ${e.title}`}
                    >
                      Edit
                    </button>
                  )}
                  {canEdit && onDelete && (
                    <button
                      type="button"
                      onClick={(ev) => {
                        ev.stopPropagation();
                        onDelete(e);
                      }}
                      className="inline-flex items-center gap-1 rounded-md border border-rose-200 px-2.5 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-50"
                      aria-label={`Delete ${e.title}`}
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
