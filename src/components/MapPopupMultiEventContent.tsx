/**
 * React component for Mapbox marker popup content when multiple events share the same location.
 * Shows a list of events sorted by earliest date first.
 */

import type { MapEvent } from "@/lib/types";

type Props = {
  events: MapEvent[];
  onViewDetails: (event: MapEvent) => void;
};

/** Check if two locations are the same (within a small threshold) */
function areLocationsSame(loc1: { lng: number; lat: number }, loc2: { lng: number; lat: number }): boolean {
  const threshold = 0.0001; // ~10 meters
  return Math.abs(loc1.lng - loc2.lng) < threshold && Math.abs(loc1.lat - loc2.lat) < threshold;
}

export function MapPopupMultiEventContent({ events, onViewDetails }: Props) {
  // Sort events by earliest date first
  const sortedEvents = [...events].sort((a, b) => {
    const dateA = new Date(a.dateISO).getTime();
    const dateB = new Date(b.dateISO).getTime();
    return dateA - dateB;
  });

  return (
    <div className="relative min-w-[220px] max-w-[280px] rounded-xl bg-white shadow-[0_8px_24px_rgba(0,0,0,0.14)]">
      <div
        className="absolute bottom-0 left-1/2 h-2.5 w-2.5 -translate-x-1/2 translate-y-1/2 rotate-45 rounded-sm bg-white shadow-md"
        aria-hidden
      />
      <div className="relative max-h-[320px] overflow-y-auto px-3 py-2.5">
        <div className="mb-2 text-[11px] font-semibold text-zinc-500 uppercase tracking-wide">
          {sortedEvents.length} event{sortedEvents.length !== 1 ? 's' : ''} at this location
        </div>
        <div className="space-y-2">
          {sortedEvents.map((event, idx) => {
            const dateStr = new Date(event.dateISO).toLocaleString();
            const locationDisplay = event.roomNumber 
              ? `${event.address || 'Location'}${event.address ? ', ' : ''}${event.roomNumber}`
              : (event.address || 'Location');

            return (
              <button
                key={event.id}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onViewDetails(event);
                }}
                className="w-full text-left rounded-lg border border-zinc-100 bg-zinc-50/50 p-2.5 transition-colors hover:bg-zinc-100 hover:border-zinc-200 active:bg-zinc-200"
              >
                <div className="flex items-start gap-2">
                  {event.imageUrl || event.creatorPhotoUrl ? (
                    <div className="flex-shrink-0 h-10 w-10 rounded-lg overflow-hidden bg-zinc-200">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={event.imageUrl || event.creatorPhotoUrl}
                        alt={event.title}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ) : null}
                  <div className="min-w-0 flex-1">
                    <div className="text-[12px] font-semibold text-zinc-900 truncate">
                      {event.title}
                    </div>
                    <div className="mt-0.5 text-[11px] text-zinc-600">
                      {dateStr}
                    </div>
                    <div className="mt-0.5 text-[10px] text-zinc-500 truncate">
                      {locationDisplay}
                    </div>
                    <div className="mt-0.5 flex items-center gap-1 text-[10px] text-zinc-500">
                      <svg className="h-2.5 w-2.5 shrink-0 text-zinc-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                      {(event.attendCount ?? 0)} attending
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/** Helper function to group events by location */
export function groupEventsByLocation(events: MapEvent[]): Map<string, MapEvent[]> {
  const groups = new Map<string, MapEvent[]>();
  
  for (const event of events) {
    let foundGroup = false;
    for (const [key, groupEvents] of groups.entries()) {
      const [lng, lat] = key.split(',').map(Number);
      if (areLocationsSame({ lng, lat }, event.location)) {
        groupEvents.push(event);
        foundGroup = true;
        break;
      }
    }
    if (!foundGroup) {
      const key = `${event.location.lng},${event.location.lat}`;
      groups.set(key, [event]);
    }
  }
  
  return groups;
}
