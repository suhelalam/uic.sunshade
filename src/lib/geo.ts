/**
 * Geographic utilities.
 * Computes distance between two points on Earth using the Haversine formula.
 */

import type { LngLat } from "@/lib/types";

/**
 * Returns the distance in miles between two geographic coordinates.
 * Uses the Haversine formula for great-circle distance.
 */
export function haversineMiles(a: LngLat, b: LngLat) {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const R = 3958.7613; // miles
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const s =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLng / 2) *
      Math.sin(dLng / 2) *
      Math.cos(lat1) *
      Math.cos(lat2);
  return 2 * R * Math.asin(Math.sqrt(s));
}
