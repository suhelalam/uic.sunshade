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
  /** Empty state: title and optional CTA (e.g. "Add the first event") */
  emptyTitle?: string;
  emptyActionLabel?: string;
  onEmptyAction?: () => void;
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
  emptyTitle = "No events",
  emptyActionLabel,
  onEmptyAction,
}: Props) {
  if (events.length === 0) {
    return (
      <div className="py-6 px-4 text-center">
        <div className="rounded-xl border border-[#001E62]/10 bg-[#F2F7EB]/50 p-6">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#001E62]/10 text-[#001E62]">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <path d="M16 2v4M8 2v4M3 10h18" />
            </svg>
          </div>
          <p className="text-sm font-medium text-[#333333]">{emptyTitle}</p>
          {onEmptyAction && emptyActionLabel ? (
            <button
              type="button"
              onClick={onEmptyAction}
              className="mt-3 rounded-lg bg-[#D50032] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#b00028]"
            >
              {emptyActionLabel}
            </button>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {events.map((e) => {
        const d = new Date(e.dateISO);
        const dist = haversineMiles(selectedLocation, e.location);
        const isPast = d < new Date();
        const isExpanded = expandedId === e.id;
        const canEdit = Boolean(currentUserId && e.createdBy === currentUserId);

        return (
          <div
            key={e.id}
            className="rounded-lg border border-[#001E62]/12 bg-white overflow-hidden transition-all hover:border-[#001E62]/25"
          >
            <button
              type="button"
              onClick={() => onExpandToggle(e)}
              className="w-full flex items-center gap-2 px-3 py-2 text-left"
            >
              <span className="truncate text-sm font-medium text-[#333333] min-w-0 flex-1">
                {e.title}
              </span>
              <span className="shrink-0 w-12 text-right text-xs tabular-nums text-[#333333]/70">
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
              <div className="border-t border-[#001E62]/10 px-3 py-2.5 text-xs text-[#333333] space-y-1.5 bg-[#F2F7EB]/40">
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
                    className="rounded-md bg-[#D50032]/10 px-2.5 py-1.5 text-xs font-medium text-[#D50032] hover:bg-[#D50032]/20"
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
                      className="inline-flex items-center gap-1 rounded-md border border-[#001E62]/30 px-2.5 py-1.5 text-xs font-medium text-[#001E62] hover:bg-[#001E62]/10"
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
                      className="inline-flex items-center gap-1 rounded-md border border-[#D50032]/50 px-2.5 py-1.5 text-xs font-medium text-[#D50032] hover:bg-[#D50032]/10"
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
