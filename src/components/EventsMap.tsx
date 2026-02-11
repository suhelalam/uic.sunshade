/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as React from "react";

export type LngLat = { lng: number; lat: number };

export type MapEvent = {
  id: string;
  title: string;
  dateISO: string; // ISO string
  location: LngLat;
  address?: string;
  details?: string;
  extraInfo?: string;
};

type Props = {
  accessToken?: string;
  selectedLocation: LngLat;
  onSelectedLocationChange: (loc: LngLat) => void;
  onSelectedAddressChange?: (address: string) => void;
  focusLocation?: LngLat | null;
  events: MapEvent[];
};

const DEFAULT_CENTER: LngLat = { lng: -87.6298, lat: 41.8781 }; // Chicago

export function EventsMap({
  accessToken,
  selectedLocation,
  onSelectedLocationChange,
  onSelectedAddressChange,
  focusLocation,
  events,
}: Props) {
  const mapElRef = React.useRef<HTMLDivElement | null>(null);
  const geocoderElRef = React.useRef<HTMLDivElement | null>(null);

  const mapRef = React.useRef<any>(null);
  const mapboxglRef = React.useRef<any>(null);
  const selectionMarkerRef = React.useRef<any>(null);
  const eventMarkersRef = React.useRef<Map<string, any>>(new Map());
  const geocoderRef = React.useRef<any>(null);

  const token = accessToken?.trim();
  const hasToken = Boolean(token);

  const upsertSelectionMarker = React.useCallback(
    (loc: LngLat) => {
      if (!mapRef.current || !mapboxglRef.current) return;
      if (!selectionMarkerRef.current) {
        const marker = new mapboxglRef.current.Marker({
          color: "#2563eb",
          draggable: true,
        })
          .setLngLat([loc.lng, loc.lat])
          .addTo(mapRef.current);
        marker.on("dragend", () => {
          const ll = marker.getLngLat();
          const next = { lng: ll.lng, lat: ll.lat };
          onSelectedLocationChange(next);
          if (hasToken) {
            reverseGeocode(next, token, onSelectedAddressChange);
          }
        });
        selectionMarkerRef.current = marker;
      } else {
        selectionMarkerRef.current.setLngLat([loc.lng, loc.lat]);
      }
    },
    [hasToken, onSelectedAddressChange, onSelectedLocationChange, token]
  );

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
      el.className =
        "h-3.5 w-3.5 rounded-full border-2 border-white bg-rose-500 shadow-sm ring-1 ring-black/10";
      el.title = `${e.title} • ${new Date(e.dateISO).toLocaleString()}`;

      const popup = new mapboxgl.Popup({ offset: 18 }).setHTML(
        `<div style="font-size: 12px; line-height: 1.3;">
          <div style="font-weight: 600; margin-bottom: 4px;">${escapeHtml(
            e.title
          )}</div>
          <div style="color: rgba(0,0,0,0.72);">${escapeHtml(
            new Date(e.dateISO).toLocaleString()
          )}</div>
          ${
            e.address
              ? `<div style="color: rgba(0,0,0,0.6); margin-top: 6px;">${escapeHtml(
                  e.address
                )}</div>`
              : ""
          }
        </div>`
      );

      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([e.location.lng, e.location.lat])
        .setPopup(popup)
        .addTo(map);

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

      map.on("click", (ev: any) => {
        const next = { lng: ev.lngLat.lng, lat: ev.lngLat.lat };
        onSelectedLocationChange(next);
        if (hasToken) {
          reverseGeocode(next, token, onSelectedAddressChange);
        }
      });

      map.on("load", () => {
        upsertSelectionMarker(selectedLocation);
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
          const placeName = res?.result?.place_name;
          if (placeName && onSelectedAddressChange) {
            onSelectedAddressChange(placeName);
          }
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
      selectionMarkerRef.current = null;
      for (const marker of eventMarkers.values()) {
        try {
          marker.remove();
        } catch {}
      }
      eventMarkers.clear();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasToken]);

  // Keep selection marker in sync
  React.useEffect(() => {
    if (!hasToken) return;
    upsertSelectionMarker(selectedLocation);
  }, [hasToken, selectedLocation, upsertSelectionMarker]);

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
      <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
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
    <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="text-sm font-semibold text-zinc-900">Map</div>
          <div className="truncate text-xs text-zinc-500">
            Click to drop pin • Drag pin to adjust • Search to auto-place
          </div>
        </div>
        <div className="w-full sm:w-[420px]">
          <div ref={geocoderElRef} />
        </div>
      </div>

      <div className="mt-4">
        <div
          ref={mapElRef}
          className="h-[520px] w-full overflow-hidden rounded-xl bg-zinc-100"
        />
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-600">
        <div className="tabular-nums">
          Selected: {selectedLocation.lat.toFixed(5)},{" "}
          {selectedLocation.lng.toFixed(5)}
        </div>
        <div className="tabular-nums">{events.length} event(s) shown</div>
      </div>
    </div>
  );
}

function escapeHtml(s: string) {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

async function reverseGeocode(
  loc: LngLat,
  token: string | undefined,
  onAddressChange?: (address: string) => void
) {
  if (!token || !onAddressChange) return;
  try {
    const url =
      "https://api.mapbox.com/geocoding/v5/mapbox.places/" +
      encodeURIComponent(`${loc.lng},${loc.lat}`) +
      `.json?access_token=${encodeURIComponent(token)}&limit=1`;
    const res = await fetch(url);
    if (!res.ok) return;
    const data = await res.json();
    const place = data?.features?.[0]?.place_name;
    if (place) onAddressChange(place);
  } catch {}
}
