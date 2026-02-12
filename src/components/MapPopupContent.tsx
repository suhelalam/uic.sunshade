/**
 * React component for Mapbox marker popup content.
 * Renders event details with JSX/Tailwind instead of raw HTML.
 */

import type { MapEvent } from "@/lib/types";

type Props = {
  event: MapEvent;
  onViewDetails: () => void;
};

export function MapPopupContent({ event, onViewDetails }: Props) {
  const dateStr = new Date(event.dateISO).toLocaleString();
  const address =
    event.address ?? `${event.location.lat.toFixed(5)}, ${event.location.lng.toFixed(5)}`;
  const locationDisplay = event.roomNumber 
    ? `${address}${event.address ? ', ' : ''}${event.roomNumber}`
    : address;

  return (
    <div className="relative min-w-[180px] rounded-xl bg-white px-3 py-2 text-[12px] leading-snug shadow-[0_8px_24px_rgba(0,0,0,0.14)]">
      <div
        className="absolute bottom-0 left-1/2 h-2.5 w-2.5 -translate-x-1/2 translate-y-1/2 rotate-45 rounded-sm bg-white shadow-md"
        aria-hidden
      />
      <div className="relative">
        <div className="mb-1 font-semibold text-zinc-900">{event.title}</div>
        <div className="text-zinc-600">{dateStr}</div>
        <div className="mt-1.5 text-zinc-500">{locationDisplay}</div>
        {event.details ? (
          <div className="mt-1.5 text-zinc-500">{event.details}</div>
        ) : null}
        {event.organizer ? (
          <div className="mt-1.5 text-zinc-600 font-medium text-[11px]">
            by {event.organizer}
          </div>
        ) : null}
        <div className="mt-1 flex items-center gap-1 text-[11px] text-zinc-500">
          <svg className="h-3 w-3 shrink-0 text-zinc-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          {(event.attendCount ?? 0)} attending
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onViewDetails();
          }}
          className="mt-2 block text-[11px] font-semibold text-[#FF385C] hover:underline"
        >
          View details
        </button>
      </div>
    </div>
  );
}
