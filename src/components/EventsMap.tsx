/**
 * Mapbox map with event markers, search bar, "Use my location" button, and filter dropdown.
 * Renders Mapbox GL map, event pins with popups, and integrates EventsFilter.
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as React from "react";
import { createRoot } from "react-dom/client";
import type { FilterMode, LngLat, MapEvent, PickScope } from "@/lib/types";
export type { LngLat, MapEvent } from "@/lib/types";
import { CurrentLocationMarker } from "@/components/CurrentLocationMarker";
import { EventsFilter } from "@/components/EventsFilter";
import { MapMarkerPin } from "@/components/MapMarkerPin";
import { MapPopupContent } from "@/components/MapPopupContent";
import { MapPopupMultiEventContent, groupEventsByLocation } from "@/components/MapPopupMultiEventContent";

type Props = {
  heroMode?: boolean;
  accessToken?: string;
  selectedLocation: LngLat;
  onSelectedLocationChange: (loc: LngLat) => void;
  focusLocation?: LngLat | null;
  events: MapEvent[];
  onEventSelect?: (event: MapEvent) => void;
  onMapClick?: () => void; // Callback when map (not marker) is clicked
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
  eventsTodayCount?: number;
  onUseMyLocation?: () => void;
  isLocating?: boolean;
  locationError?: string | null;
  /** When panel is collapsed: show "Events (n)" as first control and call this when clicked */
  showEventsButton?: boolean;
  eventsButtonCount?: number;
  onShowEventsPanel?: () => void;
};

/** Default map center (Chicago) when no location is selected. */
const DEFAULT_CENTER: LngLat = { lng: -87.6298, lat: 41.8781 };

/** Map type options (Google Maps–style). */
const MAP_TYPES = [
  { id: "default" as const, label: "Map", url: "mapbox://styles/mapbox/streets-v12" },
  { id: "satellite" as const, label: "Satellite", url: "mapbox://styles/mapbox/satellite-streets-v12" },
  { id: "terrain" as const, label: "Terrain", url: "mapbox://styles/mapbox/outdoors-v12" },
  { id: "dark" as const, label: "Dark", url: "mapbox://styles/mapbox/dark-v11" },
] as const;
type MapTypeId = (typeof MAP_TYPES)[number]["id"];
const MAP_STYLE_BY_ID: Record<MapTypeId, string> = Object.fromEntries(MAP_TYPES.map((t) => [t.id, t.url])) as Record<MapTypeId, string>;

export function EventsMap({
  heroMode = false,
  accessToken,
  selectedLocation,
  onSelectedLocationChange,
  focusLocation,
  events,
  onEventSelect,
  onMapClick,
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
  eventsTodayCount,
  onUseMyLocation,
  isLocating = false,
  locationError = null,
  showEventsButton = false,
  eventsButtonCount = 0,
  onShowEventsPanel,
}: Props) {
  const mapElRef = React.useRef<HTMLDivElement | null>(null);
  const geocoderElRef = React.useRef<HTMLDivElement | null>(null);

  const mapRef = React.useRef<any>(null);
  const mapboxglRef = React.useRef<any>(null);
  /** Maps event id to { marker, popupRoot, markerRoot } for cleanup. */
  const eventMarkersRef = React.useRef<
    Map<string, { marker: any; popupRoot: ReturnType<typeof createRoot>; markerRoot: ReturnType<typeof createRoot> }>
  >(new Map());
  /** Track which popup is currently open (by event id) */
  const openPopupIdRef = React.useRef<string | null>(null);
  const currentLocationMarkerRef = React.useRef<{ marker: any; markerRoot: ReturnType<typeof createRoot> } | null>(null);
  const geocoderRef = React.useRef<any>(null);

  // Track when the Mapbox map has finished initializing
  const [isMapReady, setIsMapReady] = React.useState(false);
  const [mapType, setMapType] = React.useState<MapTypeId>("default");
  const [mapTypeMenuOpen, setMapTypeMenuOpen] = React.useState(false);

  const token = accessToken?.trim();
  const hasToken = Boolean(token);

  // Keep a ref to the latest events so callbacks registered once (like map 'load')
  // can always access up-to-date event data without stale closures.
  const eventsRef = React.useRef<MapEvent[]>(events);
  React.useEffect(() => {
    eventsRef.current = events;
  }, [events]);

  const syncEventMarkers = React.useCallback(() => {
    const map = mapRef.current;
    const mapboxgl = mapboxglRef.current;
    if (!map || !mapboxgl) return;

    const currentEvents = eventsRef.current;
    const nextIds = new Set(currentEvents.map((e) => e.id));

    // Remove stale
    for (const [id, { marker, popupRoot, markerRoot }] of eventMarkersRef.current.entries()) {
      if (!nextIds.has(id)) {
        try {
          queueMicrotask(() => {
            try {
              popupRoot.unmount();
            } catch {}
          });
        } catch {}
        try {
          queueMicrotask(() => {
            try {
              markerRoot.unmount();
            } catch {}
          });
        } catch {}
        marker.remove();
        eventMarkersRef.current.delete(id);
      }
    }

    // Helper to check if two locations are the same (within threshold)
    const areLocationsSame = (loc1: { lng: number; lat: number }, loc2: { lng: number; lat: number }): boolean => {
      const threshold = 0.0001; // ~10 meters
      return Math.abs(loc1.lng - loc2.lng) < threshold && Math.abs(loc1.lat - loc2.lat) < threshold;
    };

    // Helper to find all events at the same location
    const getEventsAtLocation = (event: MapEvent): MapEvent[] => {
      return currentEvents.filter((e) => areLocationsSame(e.location, event.location));
    };

    // Add/update
    for (const e of currentEvents) {
      // Validate location data before using it (defensive for Firestore shape differences)
      if (!e?.location || typeof e.location.lng !== "number" || typeof e.location.lat !== "number") {
        // eslint-disable-next-line no-console
        console.warn("Skipping event with invalid location:", e);
        continue;
      }
      const existing = eventMarkersRef.current.get(e.id);
      if (existing) {
        existing.marker.setLngLat([e.location.lng, e.location.lat]);
        continue;
      }

      // Marker button element (Mapbox requires DOM element; render React pin into it)
      const markerEl = document.createElement("button");
      markerEl.type = "button";
      markerEl.className = "cursor-pointer border-0 bg-transparent p-0 h-11 w-11";
      markerEl.title = `${e.title} • ${new Date(e.dateISO).toLocaleString()}`;
      const markerRoot = createRoot(markerEl);
      markerRoot.render(
        <MapMarkerPin
          imageUrl={e.imageUrl}
          creatorPhotoUrl={e.creatorPhotoUrl}
          title={e.title}
          creatorName={e.createdByName}
          organizer={e.organizer}
        />
      );

      // Determine if there are multiple events at this location
      const eventsAtLocation = getEventsAtLocation(e);
      const hasMultipleEvents = eventsAtLocation.length > 1;

      // Popup container - will be dynamically updated based on single vs multi
      const popupContainer = document.createElement("div");
      const popupRoot = createRoot(popupContainer);

      // Initial render - will be updated on click
      if (hasMultipleEvents) {
        popupRoot.render(
          <MapPopupMultiEventContent
            events={eventsAtLocation}
            onViewDetails={(event) => onEventSelect?.(event)}
          />
        );
      } else {
        popupRoot.render(
          <MapPopupContent
            event={e}
            onViewDetails={() => onEventSelect?.(e)}
          />
        );
      }

      const popup = new mapboxgl.Popup({
        offset: 14,
        closeButton: false,
        closeOnClick: false,
      }).setDOMContent(popupContainer);

      const marker = new mapboxgl.Marker({ element: markerEl })
        .setLngLat([e.location.lng, e.location.lat])
        .setPopup(popup)
        .addTo(map);
      
      marker.getElement().addEventListener("click", (ev: Event) => {
        ev.stopPropagation();
        
        // Close all other popups first
        const currentOpenId = openPopupIdRef.current;
        if (currentOpenId && currentOpenId !== e.id) {
          const otherMarker = eventMarkersRef.current.get(currentOpenId);
          if (otherMarker && otherMarker.marker.getPopup().isOpen()) {
            otherMarker.marker.getPopup().remove();
          }
        }
        
        // Update popup content based on current events at this location
        const currentEventsAtLocation = getEventsAtLocation(e);
        const currentlyHasMultiple = currentEventsAtLocation.length > 1;
        
        if (currentlyHasMultiple) {
          // Re-render with multi-event content
          popupRoot.render(
            <MapPopupMultiEventContent
              events={currentEventsAtLocation}
              onViewDetails={(event) => onEventSelect?.(event)}
            />
          );
        } else {
          // Re-render with single event content
          popupRoot.render(
            <MapPopupContent
              event={e}
              onViewDetails={() => onEventSelect?.(e)}
            />
          );
        }
        
        // Toggle this popup
        if (popup.isOpen()) {
          popup.remove();
          openPopupIdRef.current = null;
        } else {
          popup.addTo(map);
          openPopupIdRef.current = e.id;
        }
      });
      
      // Track when popup closes (e.g., clicking outside)
      popup.on("close", () => {
        if (openPopupIdRef.current === e.id) {
          openPopupIdRef.current = null;
        }
      });

      eventMarkersRef.current.set(e.id, { marker, popupRoot, markerRoot });
    }
  }, [events, onEventSelect]);

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
        style: MAP_STYLE_BY_ID["default"],
        center: initialCenter,
        zoom: 12,
      });

      map.addControl(new mapboxgl.NavigationControl({ showCompass: true }));
      map.addControl(new mapboxgl.FullscreenControl());

      map.on("load", () => {
        map.resize();
        syncEventMarkers();
      });

      // Handle map clicks (not on markers/popups) to close popups and modal
      map.on("click", (e: any) => {
        // Only trigger if click is directly on the map canvas (not on markers/popups/controls)
        const target = e.originalEvent?.target;
        if (
          target &&
          target.classList.contains("mapboxgl-canvas") &&
          !target.closest(".mapboxgl-popup") &&
          !target.closest(".mapboxgl-marker") &&
          !target.closest(".mapboxgl-ctrl")
        ) {
          // Close all open popups
          const currentOpenId = openPopupIdRef.current;
          if (currentOpenId) {
            const marker = eventMarkersRef.current.get(currentOpenId);
            if (marker && marker.marker.getPopup().isOpen()) {
              marker.marker.getPopup().remove();
            }
            openPopupIdRef.current = null;
          }
          // Close modal if open
          onMapClick?.();
        }
      });

      mapRef.current = map;
      if (!cancelled) setIsMapReady(true);

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
      for (const { marker, popupRoot, markerRoot } of eventMarkers.values()) {
        try {
          queueMicrotask(() => {
            try {
              popupRoot.unmount();
            } catch {}
          });
        } catch {}
        try {
          queueMicrotask(() => {
            try {
              markerRoot.unmount();
            } catch {}
          });
        } catch {}
        try {
          marker.remove();
        } catch {}
      }
      eventMarkers.clear();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasToken]);

  // Resize map when ready and when container size might have changed (so canvas fills full area)
  React.useEffect(() => {
    if (!hasToken || !isMapReady || !mapRef.current) return;
    const map = mapRef.current;
    const resize = () => {
      try {
        map.resize();
      } catch {}
    };
    const t = setTimeout(resize, 100);
    const ro =
      typeof ResizeObserver !== "undefined" && mapElRef.current
        ? new ResizeObserver(resize)
        : null;
    if (ro && mapElRef.current) ro.observe(mapElRef.current);
    window.addEventListener("resize", resize);
    return () => {
      clearTimeout(t);
      ro?.disconnect();
      window.removeEventListener("resize", resize);
    };
  }, [hasToken, isMapReady]);

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

  // Ensure we sync markers once the map is fully ready — helps when events load
  // before the map has finished initializing (e.g., on page refresh).
  React.useEffect(() => {
    if (!hasToken || !isMapReady) return;
    syncEventMarkers();
  }, [hasToken, isMapReady, events, syncEventMarkers]);

  // Current location marker (navy blue) at selectedLocation – create once when map is ready
  React.useEffect(() => {
    if (!mapRef.current || !isMapReady || !hasToken || currentLocationMarkerRef.current) return;
    const map = mapRef.current;
    const mapboxgl = mapboxglRef.current;
    if (!mapboxgl) return;

    const markerEl = document.createElement("div");
    markerEl.className = "cursor-default";
    markerEl.title = "Your location (distance reference)";
    const markerRoot = createRoot(markerEl);
    markerRoot.render(<CurrentLocationMarker />);

    const marker = new mapboxgl.Marker({ element: markerEl })
      .setLngLat([selectedLocation.lng, selectedLocation.lat])
      .addTo(map);

    currentLocationMarkerRef.current = { marker, markerRoot };

    return () => {
      try {
        queueMicrotask(() => {
          try {
            currentLocationMarkerRef.current?.markerRoot.unmount();
          } catch {}
        });
      } catch {}
      try {
        currentLocationMarkerRef.current?.marker.remove();
      } catch {}
      currentLocationMarkerRef.current = null;
    };
  }, [hasToken, isMapReady]);

  // Update current location marker position when selectedLocation changes
  React.useEffect(() => {
    const entry = currentLocationMarkerRef.current;
    if (entry?.marker) {
      entry.marker.setLngLat([selectedLocation.lng, selectedLocation.lat]);
    }
  }, [selectedLocation.lng, selectedLocation.lat]);

  const mapStyleInitializedRef = React.useRef(false);
  // When map style is toggled, set new style and re-sync markers + current location on load
  React.useEffect(() => {
    const map = mapRef.current;
    const mapboxgl = mapboxglRef.current;
    if (!map || !mapboxgl || !isMapReady || !hasToken) return;
    if (!mapStyleInitializedRef.current) {
      mapStyleInitializedRef.current = true;
      return;
    }

    const url = MAP_STYLE_BY_ID[mapType];
    map.setStyle(url);
    map.once("style.load", () => {
      const cur = currentLocationMarkerRef.current;
      if (cur) {
        try {
          cur.marker.remove();
        } catch {}
        try {
          queueMicrotask(() => {
            try {
              cur.markerRoot.unmount();
            } catch {}
          });
        } catch {}
        currentLocationMarkerRef.current = null;
      }
      syncEventMarkers();
      const m = mapRef.current;
      const mb = mapboxglRef.current;
      if (m && mb) {
        const markerEl = document.createElement("div");
        markerEl.className = "cursor-default";
        markerEl.title = "Your location (distance reference)";
        const markerRoot = createRoot(markerEl);
        markerRoot.render(<CurrentLocationMarker />);
        const marker = new mb.Marker({ element: markerEl })
          .setLngLat([selectedLocation.lng, selectedLocation.lat])
          .addTo(m);
        currentLocationMarkerRef.current = { marker, markerRoot };
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only run when user changes map type
  }, [mapType]);

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
      <div className="rounded-2xl border border-[#001E62]/15 bg-white p-5 shadow-[0_4px_24px_rgba(0,30,98,0.08)]">
        <div className="text-sm font-semibold text-[#333333]">
          Missing Mapbox token
        </div>
        <div className="mt-2 text-sm text-[#333333]/80">
          Add{" "}
          <code className="rounded bg-[#F2F7EB] px-1.5 py-0.5 text-[#001E62]">
            NEXT_PUBLIC_MAPBOX_TOKEN
          </code>{" "}
          to your <code className="rounded bg-[#F2F7EB] px-1.5 py-0.5">.env.local</code>,
          then restart <code className="rounded bg-[#F2F7EB] px-1.5 py-0.5">npm run dev</code>.
        </div>
      </div>
    );
  }

  const glassClass = "backdrop-blur-md bg-white/90 border border-[#001E62]/10 shadow-[0_4px_20px_rgba(0,30,98,0.08)]";

  if (heroMode) {
    return (
      <div className="absolute inset-0 overflow-hidden rounded-none">
        <div
          ref={mapElRef}
          className="absolute inset-0 w-full h-full bg-[#333333]/5"
          style={{ minHeight: 200 }}
        />
        {/* Glass search bar — top left */}
        <div className={`absolute left-2 top-2 z-10 min-w-0 max-w-[min(260px,calc(100vw-6rem))] rounded-lg p-1 sm:left-3 sm:top-3 sm:max-w-[320px] sm:rounded-xl sm:p-1.5 ${glassClass}`}>
          <div ref={geocoderElRef} className="min-h-[36px] sm:min-h-[40px]" />
        </div>
        {/* Floating controls — right bottom corner, compact on mobile */}
        <div className={`absolute right-2 bottom-2 z-10 flex flex-col rounded-xl p-1.5 sm:right-5 sm:bottom-5 sm:rounded-2xl sm:p-3 ${glassClass}`}>
          <div className="flex flex-col gap-1.5 sm:gap-3">
            {showEventsButton && onShowEventsPanel ? (
              <button
                type="button"
                onClick={onShowEventsPanel}
                className="flex min-h-[36px] items-center justify-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-semibold text-[#001E62] transition-colors hover:bg-[#001E62]/10 sm:min-h-[44px] sm:rounded-xl sm:px-4 sm:py-2.5 sm:text-sm"
                aria-label="Show events panel"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
                </svg>
                Events{eventsButtonCount > 0 ? ` (${eventsButtonCount})` : ""}
              </button>
            ) : null}
            {/* Map type — Google Maps–style selector */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setMapTypeMenuOpen((o) => !o)}
                className="flex min-h-[36px] w-full items-center justify-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-medium text-[#001E62] transition-colors hover:bg-[#001E62]/10 sm:min-h-[44px] sm:rounded-xl sm:px-4 sm:py-2.5 sm:text-sm"
                title="Map type"
                aria-label="Map type"
                aria-expanded={mapTypeMenuOpen}
                aria-haspopup="listbox"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 6l6-4 6 4 6-4v12l-6 4-6-4-6 4z" />
                  <path d="M8 2v12M16 6v12" />
                </svg>
                <span className="hidden sm:inline">{MAP_TYPES.find((t) => t.id === mapType)?.label ?? "Map"}</span>
                <svg width="12" height="12" className={`shrink-0 transition-transform ${mapTypeMenuOpen ? "rotate-180" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>
              {mapTypeMenuOpen ? (
                <>
                  <div className="fixed inset-0 z-10" aria-hidden onClick={() => setMapTypeMenuOpen(false)} />
                  <ul
                    role="listbox"
                    className="absolute right-0 bottom-full z-20 mb-1.5 min-w-[140px] rounded-xl border border-[#001E62]/12 bg-white py-1 shadow-[0_8px_24px_rgba(0,30,98,0.12)]"
                  >
                    {MAP_TYPES.map((t) => (
                      <li key={t.id} role="option" aria-selected={mapType === t.id}>
                        <button
                          type="button"
                          onClick={() => {
                            setMapType(t.id);
                            setMapTypeMenuOpen(false);
                          }}
                          className={`w-full px-3 py-2.5 text-left text-sm font-medium transition-colors ${
                            mapType === t.id ? "bg-[#001E62]/10 text-[#D50032]" : "text-[#333333] hover:bg-[#F2F7EB]/80"
                          }`}
                        >
                          {t.label}
                        </button>
                      </li>
                    ))}
                  </ul>
                </>
              ) : null}
            </div>
            {onUseMyLocation ? (
              <button
                type="button"
                onClick={onUseMyLocation}
                disabled={isLocating}
                className="flex min-h-[36px] items-center justify-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-medium text-[#001E62] transition-colors hover:bg-[#001E62]/10 disabled:opacity-60 sm:min-h-[44px] sm:rounded-xl sm:px-4 sm:py-2.5 sm:text-sm"
              >
                {isLocating ? (
                  <>
                    <span className="h-3 w-3 animate-spin rounded-full border-2 border-[#001E62]/30 border-t-[#001E62]" />
                    Locating…
                  </>
                ) : (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    <span className="hidden sm:inline">My location</span>
                  </>
                )}
              </button>
            ) : null}
            {onFilterToggle ? (
              <EventsFilter
                variant="dropdown"
                dropdownButtonClassName="flex min-h-[36px] w-full items-center justify-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-medium text-[#001E62] transition-colors hover:bg-[#001E62]/10 sm:min-h-[44px] sm:rounded-xl sm:px-4 sm:py-2.5 sm:text-sm"
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
        </div>
        {/* Bottom pill: coords + error + count + today — compact on mobile */}
        <div className={`absolute bottom-2 left-2 right-2 z-10 flex flex-wrap items-center justify-between gap-1.5 rounded-lg px-2 py-1.5 text-[10px] sm:left-4 sm:bottom-3 sm:right-auto sm:max-w-[420px] sm:rounded-xl sm:px-3 sm:py-2 sm:text-[11px] ${glassClass}`}>
          <span className="truncate tabular-nums text-[#333333]/80">
            {selectedLocation.lat.toFixed(5)}, {selectedLocation.lng.toFixed(5)}
          </span>
          {locationError ? (
            <span className="text-[#D50032]">{locationError}</span>
          ) : null}
          <span className="tabular-nums text-[#333333]/70">
            {events.length} event(s)
            {typeof eventsTodayCount === "number" && eventsTodayCount > 0 ? ` · ${eventsTodayCount} today` : ""}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[#001E62]/12 bg-white p-3 shadow-[0_4px_24px_rgba(0,30,98,0.06)] sm:rounded-2xl sm:p-5">
      <div className="flex flex-wrap items-center gap-2">
        <div className="min-w-0 flex-1 basis-full sm:basis-0 sm:max-w-[420px]">
          <div ref={geocoderElRef} />
        </div>
        {onUseMyLocation ? (
          <button
            type="button"
            onClick={onUseMyLocation}
            disabled={isLocating}
            className="flex min-h-[44px] items-center justify-center gap-2 rounded-lg border border-[#001E62]/15 bg-white px-4 py-3 text-sm font-medium text-[#333333] shadow-sm transition-colors hover:bg-[#F2F7EB]/80 disabled:opacity-60 sm:min-h-0 sm:px-3 sm:py-2 sm:text-xs"
          >
            {isLocating ? (
              <>
                <span className="h-3 w-3 animate-spin rounded-full border-2 border-[#001E62]/30 border-t-[#001E62]" />
                Locating…
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
      <div className="mt-3 sm:mt-4">
        <div
          ref={mapElRef}
          className="h-[260px] w-full overflow-hidden rounded-lg bg-[#F2F7EB]/60 ring-1 ring-[#001E62]/10 sm:h-[380px] md:h-[520px] md:rounded-xl"
        />
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#333333]/80 sm:text-xs">
        <div className="max-w-[50%] truncate tabular-nums sm:max-w-none">
          Selected: {selectedLocation.lat.toFixed(5)}, {selectedLocation.lng.toFixed(5)}
        </div>
        {locationError ? <span className="text-[#D50032]">{locationError}</span> : null}
        <div className="tabular-nums">{events.length} event(s) shown</div>
      </div>
    </div>
  );
}


