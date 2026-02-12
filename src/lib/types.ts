/**
 * Shared TypeScript types for the Sunshade app.
 * Used across components and lib utilities.
 */

/** Geographic coordinates (longitude, latitude). */
export type LngLat = { lng: number; lat: number };

/** Event displayed on the map with location and metadata. */
export type MapEvent = {
  id: string;
  title: string;
  dateISO: string; // ISO string
  location: LngLat;
  address?: string;
  roomNumber?: string;
  imageUrl?: string;
  creatorPhotoUrl?: string;
  details?: string;
  extraInfo?: string;
  organizer?: string;
  createdBy?: string; // User UID who created the event
  createdByName?: string; // Display name of creator
  /** Number of people who tapped "Attend" (one per anonymous ID). */
  attendCount?: number;
  /** Map of anonymous attendee ID -> timestamp (used to enforce one attend per device/browser). */
  attendees?: Record<string, unknown>;
};

/** Mapbox geocoder suggestion result. */
export type AddressSuggestion = {
  id: string;
  place_name: string;
  center: [number, number];
};

/** Date filter mode: all events, today, this week, etc. */
export type FilterMode = "all" | "today" | "this-week" | "next-week" | "this-month" | "pick";

/** Granularity when picking a custom date (year only, month, or exact date). */
export type PickScope = "year" | "month" | "date";
