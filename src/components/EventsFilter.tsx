/**
 * Event filter UI: date range (All, Today, This week, etc.) and distance slider.
 * Supports inline (accordion) and dropdown variants. Used in dropdown next to map search.
 */

import type { FilterMode, PickScope } from "@/lib/types";
import { getFilterModeLabel } from "@/lib/filters";

/** Props for the filter options panel (shared between inline and dropdown). */
type FilterContentProps = {
  filterMode: FilterMode;
  onFilterModeChange: (mode: FilterMode) => void;
  pickScope: PickScope;
  onPickScopeChange: (scope: PickScope) => void;
  pickYear: number;
  onPickYearChange: (year: number) => void;
  pickMonth: number;
  onPickMonthChange: (month: number) => void;
  pickDate: string;
  onPickDateChange: (date: string) => void;
  onPickDateApply: () => void;
  enableDistanceFilter: boolean;
  onEnableDistanceFilterChange: (next: boolean) => void;
  maxDistanceMiles: number;
  onMaxDistanceMilesChange: (miles: number) => void;
  totalShown: number;
};

function FilterContent({
  filterMode,
  onFilterModeChange,
  pickScope,
  onPickScopeChange,
  pickYear,
  onPickYearChange,
  pickMonth,
  onPickMonthChange,
  pickDate,
  onPickDateChange,
  onPickDateApply,
  enableDistanceFilter,
  onEnableDistanceFilterChange,
  maxDistanceMiles,
  onMaxDistanceMilesChange,
  totalShown,
}: FilterContentProps) {
  return (
    <div className="space-y-3 text-xs text-zinc-700">
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => onFilterModeChange("all")}
          className={`rounded-lg border px-2.5 py-2 text-left transition-colors ${
            filterMode === "all"
              ? "border-[#D50032] bg-[#D50032] text-white shadow-sm"
              : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50"
          }`}
        >
          All
        </button>
        <button
          type="button"
          onClick={() => onFilterModeChange("today")}
          className={`rounded-lg border px-2.5 py-2 text-left transition-colors ${
            filterMode === "today"
              ? "border-[#D50032] bg-[#D50032] text-white shadow-sm"
              : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50"
          }`}
        >
          Today
        </button>
        <button
          type="button"
          onClick={() => onFilterModeChange("this-week")}
          className={`rounded-lg border px-2.5 py-2 text-left transition-colors ${
            filterMode === "this-week"
              ? "border-[#D50032] bg-[#D50032] text-white shadow-sm"
              : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50"
          }`}
        >
          This week
        </button>
        <button
          type="button"
          onClick={() => onFilterModeChange("next-week")}
          className={`rounded-lg border px-2.5 py-2 text-left transition-colors ${
            filterMode === "next-week"
              ? "border-[#D50032] bg-[#D50032] text-white shadow-sm"
              : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50"
          }`}
        >
          Next week
        </button>
        <button
          type="button"
          onClick={() => onFilterModeChange("this-month")}
          className={`rounded-lg border px-2.5 py-2 text-left transition-colors ${
            filterMode === "this-month"
              ? "border-[#D50032] bg-[#D50032] text-white shadow-sm"
              : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50"
          }`}
        >
          This month
        </button>
        <button
          type="button"
          onClick={() => onFilterModeChange("pick")}
          className={`col-span-2 rounded-lg border px-2.5 py-2 text-left transition-colors ${
            filterMode === "pick"
              ? "border-[#D50032] bg-[#D50032] text-white shadow-sm"
              : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50"
          }`}
        >
          Pick a date
        </button>
      </div>

      {filterMode === "pick" ? (
        <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3">
          <div className="text-[11px] font-medium text-zinc-600">Pick a date</div>
          <div className="mt-2 flex items-center gap-2">
            <label className="flex items-center gap-1 text-xs">
              <input
                type="radio"
                name="pickScope"
                value="year"
                checked={pickScope === "year"}
                onChange={() => onPickScopeChange("year")}
              />
              Year
            </label>
            <label className="flex items-center gap-1 text-xs">
              <input
                type="radio"
                name="pickScope"
                value="month"
                checked={pickScope === "month"}
                onChange={() => onPickScopeChange("month")}
              />
              Month
            </label>
            <label className="flex items-center gap-1 text-xs">
              <input
                type="radio"
                name="pickScope"
                value="date"
                checked={pickScope === "date"}
                onChange={() => onPickScopeChange("date")}
              />
              Date
            </label>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] text-zinc-600">Year</label>
              <select
                value={pickYear}
                onChange={(e) => onPickYearChange(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-2 py-1 text-xs"
              >
                {Array.from({ length: 7 }).map((_, i) => {
                  const year = new Date().getFullYear() - 2 + i;
                  return (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  );
                })}
              </select>
            </div>
            <div>
              <label className="text-[11px] text-zinc-600">Month</label>
              <select
                value={pickMonth}
                onChange={(e) => onPickMonthChange(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-2 py-1 text-xs"
                disabled={pickScope === "year"}
              >
                {[
                  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
                  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
                ].map((m, idx) => (
                  <option key={m} value={idx + 1}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-3">
            <label className="text-[11px] text-zinc-600">Specific date</label>
            <input
              type="date"
              value={pickDate}
              onChange={(e) => onPickDateChange(e.target.value)}
              className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-2 py-1 text-xs"
              disabled={pickScope !== "date"}
            />
          </div>
          <div className="mt-3 flex items-center justify-between gap-2">
            <div className="text-[11px] text-zinc-500">
              For date search, click Search to apply.
            </div>
            <button
              type="button"
              onClick={onPickDateApply}
              className="rounded-lg bg-[#D50032] px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#b00028] disabled:opacity-50 disabled:shadow-none"
              disabled={pickScope !== "date"}
            >
              Search
            </button>
          </div>
        </div>
      ) : null}

      <div className="rounded-lg border border-zinc-200 bg-white p-3">
        <div className="flex items-center justify-between gap-3">
          <label className="text-xs font-medium text-zinc-700">Distance</label>
          <label className="flex items-center gap-2 text-xs text-zinc-600">
            <input
              type="checkbox"
              checked={enableDistanceFilter}
              onChange={(e) => onEnableDistanceFilterChange(e.target.checked)}
              className="h-4 w-4 rounded border-zinc-300"
            />
            Enable
          </label>
        </div>
        <div className="mt-3 flex items-center gap-3">
          <input
            type="range"
            min={1}
            max={50}
            value={maxDistanceMiles}
            onChange={(e) => onMaxDistanceMilesChange(Number(e.target.value))}
            className="w-full accent-[#D50032] transition-opacity"
            disabled={!enableDistanceFilter}
          />
          <div className="w-20 text-right text-xs font-medium tabular-nums text-zinc-800">
            {maxDistanceMiles} mi
          </div>
        </div>
        <div className="mt-2 text-xs text-zinc-500">
          Distance is measured from the current pin.
        </div>
      </div>

      <div className="rounded-lg bg-zinc-100/80 px-3 py-2.5 text-xs text-zinc-700">
        Showing <span className="font-semibold tabular-nums">{totalShown}</span> event(s)
      </div>
    </div>
  );
}

type Props = {
  variant?: "inline" | "dropdown";
  /** When dropdown: optional class for the trigger button (e.g. to match a control strip) */
  dropdownButtonClassName?: string;
  filterOpen: boolean;
  onToggle: () => void;
  filterMode: FilterMode;
  onFilterModeChange: (mode: FilterMode) => void;
  pickScope: PickScope;
  onPickScopeChange: (scope: PickScope) => void;
  pickYear: number;
  onPickYearChange: (year: number) => void;
  pickMonth: number;
  onPickMonthChange: (month: number) => void;
  pickDate: string;
  onPickDateChange: (date: string) => void;
  onPickDateApply: () => void;
  enableDistanceFilter: boolean;
  onEnableDistanceFilterChange: (next: boolean) => void;
  maxDistanceMiles: number;
  onMaxDistanceMilesChange: (miles: number) => void;
  totalShown: number;
};

export function EventsFilter({
  variant = "inline",
  dropdownButtonClassName,
  filterOpen,
  onToggle,
  filterMode,
  onFilterModeChange,
  pickScope,
  onPickScopeChange,
  pickYear,
  onPickYearChange,
  pickMonth,
  onPickMonthChange,
  pickDate,
  onPickDateChange,
  onPickDateApply,
  enableDistanceFilter,
  onEnableDistanceFilterChange,
  maxDistanceMiles,
  onMaxDistanceMilesChange,
  totalShown,
}: Props) {
  const filterIcon = (size: "sm" | "md" = "md") => (
    <svg
      className={size === "md" ? "h-5 w-5" : "h-4 w-4"}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <line x1="4" y1="6" x2="20" y2="6" />
      <line x1="4" y1="12" x2="20" y2="12" />
      <line x1="4" y1="18" x2="20" y2="18" />
      <circle cx="17" cy="6" r="1.5" fill="none" stroke="currentColor" />
      <circle cx="12" cy="12" r="1.5" fill="none" stroke="currentColor" />
      <circle cx="17" cy="18" r="1.5" fill="none" stroke="currentColor" />
    </svg>
  );

  if (variant === "dropdown") {
    const triggerClass =
      dropdownButtonClassName ??
      "flex min-h-[44px] items-center justify-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 py-3 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-colors hover:bg-zinc-50 hover:border-zinc-300 sm:min-h-0 sm:px-3 sm:py-2";
    return (
      <div className="relative">
        <button
          type="button"
          onClick={onToggle}
          className={triggerClass}
          title={`Filter: ${getFilterModeLabel(filterMode)}`}
          aria-label={`Filter: ${getFilterModeLabel(filterMode)}`}
        >
          <span className="text-[#D50032]">{filterIcon("md")}</span>
          <span className="text-xs font-medium text-[#333333]">Filters</span>
        </button>
        {filterOpen ? (
          <>
            <div
              className="fixed inset-0 z-10"
              aria-hidden
              onClick={onToggle}
            />
            <div className="absolute right-0 top-full z-20 mt-2 w-[min(280px,calc(100vw-1.5rem))] min-w-0 max-w-[calc(100vw-1.5rem)] rounded-xl border border-zinc-200/80 bg-white p-3 shadow-[0_8px_24px_rgba(0,0,0,0.12)]">
              <FilterContent
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
            </div>
          </>
        ) : null}
      </div>
    );
  }

  return (
    <div className="mt-3 rounded-xl border border-zinc-200/60 bg-white p-2 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-50/80"
      >
        <span className="flex items-center gap-2">
          <span className="text-[#D50032]">{filterIcon("sm")}</span>
          Filter
        </span>
        <span className="text-xs text-zinc-500">{getFilterModeLabel(filterMode)}</span>
      </button>

      {filterOpen ? (
        <div className="mt-2 rounded-lg border border-zinc-200/80 bg-zinc-50/50 p-3">
          <FilterContent
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
        </div>
      ) : null}
    </div>
  );
}
