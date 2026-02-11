/**
 * Mapbox Geocoding API integration.
 * Converts building names/addresses to coordinates for the map.
 */

"use client";
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";


import type { AddressSuggestion } from "@/lib/types";
import type { LngLat } from "@/lib/types";

/**
 * Geocode a UIC building name or address to get coordinates.
 * Returns null if the token is missing or geocoding fails.
 */
export async function geocodeBuilding(
  buildingName: string,
  token: string | undefined
): Promise<LngLat | null> {
  if (!token) return null;
  const query = encodeURIComponent(
    `${buildingName}, University of Illinois Chicago, Chicago IL`
  );
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${query}.json?access_token=${encodeURIComponent(token)}&limit=1`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const data = await res.json();
  const center = data?.features?.[0]?.center;
  if (!Array.isArray(center) || center.length < 2) return null;
  return { lng: center[0], lat: center[1] };
}

/**
 * Fetch Mapbox address suggestions for autocomplete.
 * Biases results toward the UIC campus area via bbox.
 * Not used for event locations (we use UIC building list instead).
 */
export async function fetchAddressSuggestions(
  query: string,
  token: string | undefined
): Promise<AddressSuggestion[]> {
  if (!token || query.trim().length < 3) return [];
  // bbox: UIC campus area (Chicago) - biases suggestions toward campus
  const bbox = "-87.69,41.85,-87.62,41.89";
  const url =
    "https://api.mapbox.com/geocoding/v5/mapbox.places/" +
    encodeURIComponent(query) +
    `.json?access_token=${encodeURIComponent(token)}&limit=5&types=address,poi,place&countries=us&bbox=${bbox}`;
  const res = await fetch(url);
  if (!res.ok) return [];
  const data = await res.json();
  return (data?.features ?? []) as AddressSuggestion[];
}
