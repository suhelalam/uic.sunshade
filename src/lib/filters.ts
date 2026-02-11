/**
 * Event filtering logic.
 * Filters events by date range and optional distance from a reference point.
 */

import type { FilterMode, LngLat, MapEvent, PickScope } from "@/lib/types";
import { haversineMiles } from "@/lib/geo";

/** Options passed to filterEvents. */
type FilterOptions = {
  filterMode: FilterMode;
  pickScope: PickScope;
  pickYear: number;
  pickMonth: number;
  pickDateApplied: string | null;
  enableDistanceFilter: boolean;
  maxDistanceMiles: number;
  selectedLocation: LngLat;
};

/**
 * Filter events by date range and/or distance.
 * - filterMode: "all" | "today" | "this-week" | "next-week" | "this-month" | "pick"
 * - enableDistanceFilter: when true, excludes events beyond maxDistanceMiles from selectedLocation
 */
export function filterEvents(events: MapEvent[], opts: FilterOptions) {
  const now = new Date();
  const startOfDay = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    0,
    0,
    0,
    0
  );
  const endOfDay = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    23,
    59,
    59,
    999
  );

  const weekStart = new Date(startOfDay);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  const nextWeekStart = new Date(weekStart);
  nextWeekStart.setDate(weekStart.getDate() + 7);
  const nextWeekEnd = new Date(nextWeekStart);
  nextWeekEnd.setDate(nextWeekStart.getDate() + 7);

  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  return events.filter((e) => {
    const d = new Date(e.dateISO);

    if (opts.filterMode === "all") {
      // No date filter; show all events (distance filter still applies if enabled)
    } else if (opts.filterMode === "today") {
      if (d < startOfDay || d > endOfDay) return false;
    } else if (opts.filterMode === "this-week") {
      if (d < weekStart || d >= nextWeekStart) return false;
    } else if (opts.filterMode === "next-week") {
      if (d < nextWeekStart || d >= nextWeekEnd) return false;
    } else if (opts.filterMode === "this-month") {
      if (d < monthStart || d >= monthEnd) return false;
    } else if (opts.filterMode === "pick") {
      if (opts.pickScope === "year") {
        if (d.getFullYear() !== opts.pickYear) return false;
      } else if (opts.pickScope === "month") {
        if (d.getFullYear() !== opts.pickYear) return false;
        if (d.getMonth() + 1 !== opts.pickMonth) return false;
      } else if (opts.pickScope === "date") {
        if (!opts.pickDateApplied) return true;
        if (d.toISOString().slice(0, 10) !== opts.pickDateApplied) return false;
      }
    }

    if (opts.enableDistanceFilter) {
      const dist = haversineMiles(opts.selectedLocation, e.location);
      if (dist > opts.maxDistanceMiles) return false;
    }
    return true;
  });
}

/** Convert day index (0–6) to short label (Sun, Mon, …). */
export function dayIndexToLabel(i: number) {
  return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][i] ?? "—";
}

/** Human-readable label for the current filter mode. */
export function getFilterModeLabel(filterMode: FilterMode) {
  return filterMode === "all"
    ? "All"
    : filterMode === "today"
    ? "Today"
    : filterMode === "this-week"
    ? "This week"
    : filterMode === "next-week"
    ? "Next week"
    : filterMode === "this-month"
    ? "This month"
    : "Pick a date";
}
