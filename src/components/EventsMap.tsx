/**
 * Mapbox map with event markers, search bar, "Use my location" button, and filter dropdown.
 * Renders Mapbox GL map, event pins with popups, and integrates EventsFilter.
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as React from "react";
import type { FilterMode, LngLat, MapEvent, PickScope } from "@/lib/types";
export type { LngLat, MapEvent } from "@/lib/types";
import { EventsFilter } from "@/components/EventsFilter";

type Props = {
  accessToken?: string;
  selectedLocation: LngLat;
  onSelectedLocationChange: (loc: LngLat) => void;
  focusLocation?: LngLat | null;
  events: MapEvent[];
  onEventSelect?: (event: MapEvent) => void;
  filterOpen?: boolean;
  onFilterToggle?: () => void;
  filterMode?: FilterMode;
  onFilterModeChange?: (mode: FilterMode) => void;
  pickScope?: PickScope;
  onPickScopeChange?: (scope: PickScope) => void;
  pickYear?: number;
  onPickYearChange?: (year: number) => void;
  pickMonth?: number;
  onPickMonthChange?: (month: number) => void;
  pickDate?: string;
  onPickDateChange?: (date: string) => void;
  onPickDateApply?: () => void;
  enableDistanceFilter?: boolean;
  onEnableDistanceFilterChange?: (next: boolean) => void;
  maxDistanceMiles?: number;
  onMaxDistanceMilesChange?: (miles: number) => void;
  totalShown?: number;
  onUseMyLocation?: () => void;
  isLocating?: boolean;
  locationError?: string | null;
};

/** Default map center (Chicago) when no location is selected. */
const DEFAULT_CENTER: LngLat = { lng: -87.6298, lat: 41.8781 };

export function EventsMap({
  accessToken,
  selectedLocation,
  onSelectedLocationChange,
  focusLocation,
  events,
  onEventSelect,
  filterOpen = false,
  onFilterToggle,
  filterMode = "all",
  onFilterModeChange = () => {},
  pickScope = "date",
  onPickScopeChange = () => {},
  pickYear = new Date().getFullYear(),
  onPickYearChange = () => {},
  pickMonth = new Date().getMonth() + 1,
  onPickMonthChange = () => {},
  pickDate = new Date().toISOString().slice(0, 10),
  onPickDateChange = () => {},
  onPickDateApply = () => {},
  enableDistanceFilter = true,
  onEnableDistanceFilterChange = () => {},
  maxDistanceMiles = 5,
  onMaxDistanceMilesChange = () => {},
  totalShown = 0,
  onUseMyLocation,
  isLocating = false,
  locationError = null,
}: Props) {
  const mapElRef = React.useRef<HTMLDivElement | null>(null);
  const geocoderElRef = React.useRef<HTMLDivElement | null>(null);

  const mapRef = React.useRef<any>(null);
  const mapboxglRef = React.useRef<any>(null);
  const eventMarkersRef = React.useRef<Map<string, any>>(new Map());
  const geocoderRef = React.useRef<any>(null);

  const token = accessToken?.trim();
  const hasToken = Boolean(token);

  const syncEventMarkers = React.useCallback(() => {
    const map = mapRef.current;
    const mapboxgl = mapboxglRef.current;
    if (!map || !mapboxgl) return;

    const nextIds = new Set(events.map((e) => e.id));

    // Remove stale
    for (const [id, marker] of eventMarkersRef.current.entries()) {
      if (!nextIds.has(id)) {
        marker.remove();
        eventMarkersRef.current.delete(id);
      }
    }

    // Add/update
    for (const e of events) {
      const existing = eventMarkersRef.current.get(e.id);
      if (existing) {
        existing.setLngLat([e.location.lng, e.location.lat]);
        continue;
      }

      const el = document.createElement("button");
      el.type = "button";
      el.className = "h-9 w-9";
      el.style.cursor = "pointer";
      el.innerHTML = `
        <svg viewBox="0 0 24 24" width="36" height="36" aria-hidden="true">
          <path fill="#FF385C" d="M12 2c-3.87 0-7 3.13-7 7 0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z"/>
          <circle cx="12" cy="9.5" r="2.1" fill="white"/>
        </svg>
      `;
      el.title = `${e.title} • ${new Date(e.dateISO).toLocaleString()}`;

      const popup = new mapboxgl.Popup({
        offset: 14,
        closeButton: false,
        closeOnClick: false,
      }).setHTML(
        `<div style="font-size: 12px; line-height: 1.3; padding: 6px 8px; border-radius: 10px; background: white; box-shadow: 0 8px 24px rgba(0,0,0,0.14);">
          <div style="position: absolute; left: 50%; bottom: -6px; width: 10px; height: 10px; background: white; transform: translateX(-50%) rotate(45deg); box-shadow: 0 8px 24px rgba(0,0,0,0.08);"></div>
          <div style="font-weight: 600; margin-bottom: 4px;">${escapeHtml(
            e.title
          )}</div>
          <div style="color: rgba(0,0,0,0.72);">${escapeHtml(
            new Date(e.dateISO).toLocaleString()
          )}</div>
          <div style="color: rgba(0,0,0,0.6); margin-top: 6px;">
            ${escapeHtml(e.address ?? `${e.location.lat.toFixed(5)}, ${e.location.lng.toFixed(5)}`)}
          </div>
          ${
            e.details
              ? `<div style="color: rgba(0,0,0,0.6); margin-top: 6px;">${escapeHtml(
                  e.details
                )}</div>`
              : ""
          }
          <button data-event-id="${escapeHtml(
            e.id
          )}" style="margin-top: 8px; font-size: 11px; font-weight: 600; color: #FF385C; background: transparent; border: 0; padding: 0; cursor: pointer;">
            View details
          </button>
        </div>`
      );

      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([e.location.lng, e.location.lat])
        .setPopup(popup)
        .addTo(map);
      marker.getElement().addEventListener("click", (ev: Event) => {
        ev.stopPropagation();
        marker.togglePopup();
      });

      if (onEventSelect) {
        popup.on("open", () => {
          const popupEl = popup.getElement() as HTMLElement | null;
          if (!popupEl) return;
          const safeId = e.id.replaceAll('"', '\\"');
          const btn = popupEl.querySelector<HTMLButtonElement>(
            `[data-event-id="${safeId}"]`
          );
          if (!btn) return;
          const handler = (ev: Event) => {
            ev.preventDefault();
            ev.stopPropagation();
            onEventSelect(e);
          };
          // Defer binding to avoid the marker click triggering it immediately.
          setTimeout(() => {
            btn.addEventListener("click", handler, { once: true });
          }, 0);
        });
      }

      eventMarkersRef.current.set(e.id, marker);
    }
  }, [events]);

  // Init map + geocoder once
  React.useEffect(() => {
    if (!hasToken) return;
    if (!mapElRef.current) return;
    if (mapRef.current) return;

    const eventMarkers = eventMarkersRef.current;
    let cancelled = false;

    (async () => {
      const mapboxglMod: any = await import("mapbox-gl");
      const mapboxgl = mapboxglMod.default ?? mapboxglMod;

      const geocoderMod: any = await import("@mapbox/mapbox-gl-geocoder");
      const MapboxGeocoder = geocoderMod.default ?? geocoderMod;

      if (cancelled) return;

      mapboxgl.accessToken = token;
      mapboxglRef.current = mapboxgl;

      const initialCenter: [number, number] = [
        (selectedLocation?.lng ?? DEFAULT_CENTER.lng),
        (selectedLocation?.lat ?? DEFAULT_CENTER.lat),
      ];

      const map = new mapboxgl.Map({
        container: mapElRef.current!,
        style: "mapbox://styles/mapbox/streets-v12",
        center: initialCenter,
        zoom: 12,
      });

      map.addControl(new mapboxgl.NavigationControl({ showCompass: true }));
      map.addControl(new mapboxgl.FullscreenControl());

      map.on("load", () => {
        syncEventMarkers();
      });

      mapRef.current = map;

      if (geocoderElRef.current) {
        const geocoder = new MapboxGeocoder({
          accessToken: token,
          mapboxgl,
          marker: false,
          placeholder: "Search an address…",
          collapsed: false,
          types: "address,poi,place",
          countries: "us",
          proximity: { longitude: initialCenter[0], latitude: initialCenter[1] },
        });

        geocoder.on("result", (res: any) => {
          const center = res?.result?.center;
          if (!Array.isArray(center) || center.length < 2) return;
          const loc = { lng: center[0], lat: center[1] } satisfies LngLat;
          onSelectedLocationChange(loc);
          map.flyTo({ center, zoom: Math.max(map.getZoom(), 14) });
        });

        geocoder.addTo(geocoderElRef.current);
        geocoderRef.current = geocoder;
      }
    })();

    return () => {
      cancelled = true;
      try {
        geocoderRef.current?.clear?.();
      } catch {}
      try {
        mapRef.current?.remove?.();
      } catch {}
      mapRef.current = null;
      for (const marker of eventMarkers.values()) {
        try {
          marker.remove();
        } catch {}
      }
      eventMarkers.clear();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasToken]);

  React.useEffect(() => {
    if (!hasToken) return;
    if (!focusLocation || !mapRef.current) return;
    mapRef.current.flyTo({
      center: [focusLocation.lng, focusLocation.lat],
      zoom: Math.max(mapRef.current.getZoom(), 14),
    });
  }, [focusLocation, hasToken]);

  // Keep event markers in sync
  React.useEffect(() => {
    if (!hasToken) return;
    syncEventMarkers();
  }, [hasToken, events, syncEventMarkers]);

  // Keep geocoder proximity roughly aligned with current selection
  React.useEffect(() => {
    const g = geocoderRef.current;
    if (!g || typeof g.setProximity !== "function") return;
    g.setProximity({
      longitude: selectedLocation.lng,
      latitude: selectedLocation.lat,
    });
  }, [selectedLocation]);

  if (!hasToken) {
    return (
      <div className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
        <div className="text-sm font-semibold text-zinc-900">
          Missing Mapbox token
        </div>
        <div className="mt-2 text-sm text-zinc-600">
          Add{" "}
          <code className="rounded bg-zinc-50 px-1.5 py-0.5">
            NEXT_PUBLIC_MAPBOX_TOKEN
          </code>{" "}
          to your <code className="rounded bg-zinc-50 px-1.5 py-0.5">.env.local</code>,
          then restart <code className="rounded bg-zinc-50 px-1.5 py-0.5">npm run dev</code>.
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-zinc-200/60 bg-white p-5 shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
      <div className="flex flex-wrap items-center gap-2">
        <div className="min-w-0 flex-1 sm:max-w-[420px]">
          <div ref={geocoderElRef} />
        </div>
        {onUseMyLocation ? (
          <button
            type="button"
            onClick={onUseMyLocation}
            disabled={isLocating}
            className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs font-medium text-zinc-700 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-colors hover:bg-zinc-50 disabled:opacity-60"
          >
            {isLocating ? (
              <>
                <span className="h-3 w-3 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-600" />
                Locating…
              </>
            ) : (
              <>
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
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                Use my location
              </>
            )}
          </button>
        ) : null}
        {onFilterToggle ? (
          <EventsFilter
            variant="dropdown"
            filterOpen={filterOpen}
            onToggle={onFilterToggle}
            filterMode={filterMode}
            onFilterModeChange={onFilterModeChange}
            pickScope={pickScope}
            onPickScopeChange={onPickScopeChange}
            pickYear={pickYear}
            onPickYearChange={onPickYearChange}
            pickMonth={pickMonth}
            onPickMonthChange={onPickMonthChange}
            pickDate={pickDate}
            onPickDateChange={onPickDateChange}
            onPickDateApply={onPickDateApply}
            enableDistanceFilter={enableDistanceFilter}
            onEnableDistanceFilterChange={onEnableDistanceFilterChange}
            maxDistanceMiles={maxDistanceMiles}
            onMaxDistanceMilesChange={onMaxDistanceMilesChange}
            totalShown={totalShown}
          />
        ) : null}
      </div>

      <div className="mt-4">
        <div
          ref={mapElRef}
          className="h-[520px] w-full overflow-hidden rounded-xl bg-zinc-100/80 ring-1 ring-zinc-200/50"
        />
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-600">
        <div className="tabular-nums">
          Selected: {selectedLocation.lat.toFixed(5)},{" "}
          {selectedLocation.lng.toFixed(5)}
        </div>
        {locationError ? (
          <span className="text-rose-600">{locationError}</span>
        ) : null}
        <div className="tabular-nums">{events.length} event(s) shown</div>
      </div>
    </div>
  );
}

/** Escape HTML for safe insertion into popup markup. */
function escapeHtml(s: string) {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

