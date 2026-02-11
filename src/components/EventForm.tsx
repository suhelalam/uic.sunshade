/**
 * Add-event form with UIC building search.
 * Location field searches by building name or address; only UIC campus locations are allowed.
 */

import * as React from "react";
import type { UicBuildingSuggestion } from "@/lib/uicBuildings";

type Props = {
  title: string;
  dateTime: string;
  address: string;
  details: string;
  extraInfo: string;
  formError: string;
  buildingSuggestions: UicBuildingSuggestion[];
  isResolvingLocation: boolean;
  onTitleChange: (value: string) => void;
  onDateTimeChange: (value: string) => void;
  onAddressChange: (value: string) => void;
  onBuildingSelect: (suggestion: UicBuildingSuggestion) => void;
  onDetailsChange: (value: string) => void;
  onExtraInfoChange: (value: string) => void;
  onSubmit: (ev: React.FormEvent) => void;
};

export function EventForm({
  title,
  dateTime,
  address,
  details,
  extraInfo,
  formError,
  buildingSuggestions,
  isResolvingLocation,
  onTitleChange,
  onDateTimeChange,
  onAddressChange,
  onBuildingSelect,
  onDetailsChange,
  onExtraInfoChange,
  onSubmit,
}: Props) {
  const dateInputRef = React.useRef<HTMLInputElement | null>(null);
  const [dateFocused, setDateFocused] = React.useState(false);
  const [showSuggestions, setShowSuggestions] = React.useState(true);

  React.useEffect(() => {
    // If parent clears suggestions, hide locally
    if (buildingSuggestions.length === 0) setShowSuggestions(false);
  }, [buildingSuggestions.length]);

  const handleConfirmDate = () => {
    dateInputRef.current?.blur();
    setDateFocused(false);
  };
  return (
    <div className="rounded-xl border border-zinc-200/60 bg-white p-4 shadow-[0_4px_24px_rgba(0,0,0,0.06)] transition-shadow hover:shadow-[0_8px_32px_rgba(0,0,0,0.08)] sm:rounded-2xl sm:p-6">
      <div className="text-base font-semibold text-zinc-900">Add event</div>
      <div className="mt-1 text-xs leading-relaxed text-zinc-500">
        Search for a UIC building—only campus locations are allowed.
      </div>

      <form className="mt-5 space-y-4" onSubmit={onSubmit}>
        <div>
          <label className="text-xs font-medium text-zinc-600">Title</label>
          <input
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="e.g. Food truck meetup"
            className="mt-1.5 w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none transition-colors focus:border-[#FF385C]/50 focus:ring-2 focus:ring-[#FF385C]/15"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-zinc-600">
            Date & time
          </label>
          <div className="mt-1.5 flex items-center gap-2">
            <input
              ref={dateInputRef}
              type="datetime-local"
              value={dateTime}
              onChange={(e) => onDateTimeChange(e.target.value)}
              onFocus={() => setDateFocused(true)}
              onBlur={() => setDateFocused(false)}
              className="flex-1 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-900 outline-none transition-colors focus:border-[#FF385C]/50 focus:ring-2 focus:ring-[#FF385C]/15"
            />
            {(dateFocused || dateTime) && (
              <button
                type="button"
                onClick={handleConfirmDate}
                className="rounded-md bg-zinc-50 px-3 py-1 text-sm text-zinc-700 shadow-sm"
              >
                Set
              </button>
            )}
          </div>
        </div>

        <div className="relative">
          <label className="text-xs font-medium text-zinc-600">
            Location (address)
          </label>
          <input
            value={address}
            onChange={(e) => {
              onAddressChange(e.target.value);
              setShowSuggestions(true);
            }}
            placeholder="Search for a UIC building"
            className="mt-1.5 w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none transition-colors focus:border-[#FF385C]/50 focus:ring-2 focus:ring-[#FF385C]/15"
          />
          {isResolvingLocation ? (
            <div className="mt-1 text-xs text-zinc-500">
              Getting location...
            </div>
          ) : null}

          {buildingSuggestions.length > 0 && showSuggestions ? (
            <div className="absolute z-20 mt-1.5 max-h-60 w-full overflow-auto rounded-xl border border-zinc-200 bg-white py-1 shadow-[0_8px_24px_rgba(0,0,0,0.12)]">
              {buildingSuggestions.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => {
                    onBuildingSelect(s);
                    setShowSuggestions(false);
                  }}
                  className="min-h-[44px] w-full px-4 py-3 text-left text-sm text-zinc-700 transition-colors hover:bg-zinc-50 active:bg-zinc-100 sm:py-2.5 sm:text-xs"
                >
                  <span className="font-medium">{s.name}</span>
                  {s.address ? (
                    <span className="block mt-0.5 text-zinc-500 truncate">{s.address}</span>
                  ) : null}
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <div>
          <label className="text-xs font-medium text-zinc-600">
            Description
          </label>
          <textarea
            value={details}
            onChange={(e) => onDetailsChange(e.target.value)}
            placeholder="Short description about the event"
            rows={3}
            className="mt-1.5 w-full resize-none rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none transition-colors focus:border-[#FF385C]/50 focus:ring-2 focus:ring-[#FF385C]/15"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-zinc-600">Extra info</label>
          <input
            value={extraInfo}
            onChange={(e) => onExtraInfoChange(e.target.value)}
            placeholder="Dress code, parking, RSVP, etc."
            className="mt-1.5 w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none transition-colors focus:border-[#FF385C]/50 focus:ring-2 focus:ring-[#FF385C]/15"
          />
        </div>

        {formError ? (
          <div className="rounded-xl border border-rose-200/80 bg-rose-50/90 px-3 py-2.5 text-xs text-rose-700">
            {formError}
          </div>
        ) : null}

        <button
          type="submit"
          className="inline-flex w-full items-center justify-center rounded-xl bg-[#FF385C] px-4 py-3 text-sm font-semibold text-white shadow-[0_2px_8px_rgba(255,56,92,0.3)] transition hover:bg-[#E31C5F] hover:shadow-[0_4px_12px_rgba(255,56,92,0.35)] active:scale-[0.99]"
        >
          Add event
        </button>
      </form>
    </div>
  );
}
