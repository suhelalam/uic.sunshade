/**
 * Add-event form with UIC building search.
 * Location field searches by building name or address; only UIC campus locations are allowed.
 */

import * as React from "react";
import type { UicBuildingSuggestion } from "@/lib/uicBuildings";
import { useAuth } from "@/hooks/useAuth";

type Props = {
  title: string;
  dateTime: string;
  address: string;
  roomNumber: string;
  details: string;
  extraInfo: string;
  organizer: string;
  formError: string;
  buildingSuggestions: UicBuildingSuggestion[];
  isResolvingLocation: boolean;
  onTitleChange: (value: string) => void;
  onDateTimeChange: (value: string) => void;
  onAddressChange: (value: string) => void;
  onRoomNumberChange: (value: string) => void;
  onBuildingSelect: (suggestion: UicBuildingSuggestion) => void;
  onDetailsChange: (value: string) => void;
  onExtraInfoChange: (value: string) => void;
  onOrganizerChange: (value: string) => void;
  onImageChange: (file: File | null) => void;
  onSubmit: (ev: React.FormEvent) => void;
};

export function EventForm({
  title,
  dateTime,
  address,
  roomNumber,
  details,
  extraInfo,
  organizer,
  formError,
  buildingSuggestions,
  isResolvingLocation,
  onTitleChange,
  onDateTimeChange,
  onAddressChange,
  onRoomNumberChange,
  onBuildingSelect,
  onDetailsChange,
  onExtraInfoChange,
  onOrganizerChange,
   onImageChange,
  onSubmit,
}: Props) {
  const { user, isUicUser, loading: authLoading } = useAuth();
  const dateInputRef = React.useRef<HTMLInputElement | null>(null);
  const locationBlockRef = React.useRef<HTMLDivElement | null>(null);
  const formErrorRef = React.useRef<HTMLDivElement | null>(null);
  const [dateFocused, setDateFocused] = React.useState(false);
  const [showSuggestions, setShowSuggestions] = React.useState(true);

  React.useEffect(() => {
    // If parent clears suggestions, hide locally
    if (buildingSuggestions.length === 0) setShowSuggestions(false);
  }, [buildingSuggestions.length]);

  // Close suggestions when clicking outside (e.g. "Add event" button) so the submit isn't blocked
  React.useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      if (!showSuggestions) return;
      const el = locationBlockRef.current;
      if (el && !el.contains(e.target as Node)) setShowSuggestions(false);
    };
    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, [showSuggestions]);

  React.useEffect(() => {
    if (formError && formErrorRef.current) formErrorRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [formError]);

  const handleConfirmDate = () => {
    dateInputRef.current?.blur();
    setDateFocused(false);
  };

  if (authLoading) {
    return (
      <div className="rounded-xl border border-zinc-200/60 bg-white p-4 shadow-[0_4px_24px_rgba(0,0,0,0.06)] sm:rounded-2xl sm:p-6">
        <div className="text-base font-semibold text-zinc-900">Add event</div>
        <div className="mt-4 text-sm text-zinc-500">Loading...</div>
      </div>
    );
  }

  if (!user || !isUicUser) {
    return (
      <div className="rounded-xl border border-zinc-200/60 bg-white p-4 shadow-[0_4px_24px_rgba(0,0,0,0.06)] sm:rounded-2xl sm:p-6">
        <div className="text-base font-semibold text-zinc-900">Add event</div>
        <div className="mt-4 rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-6 text-center">
          <div className="text-sm font-medium text-zinc-700">
            Sign in to add events
          </div>
          <div className="mt-2 text-xs text-zinc-500">
            You must sign in with a @uic.edu email address to create events.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-zinc-200/60 bg-white p-4 shadow-[0_4px_24px_rgba(0,0,0,0.06)] transition-shadow hover:shadow-[0_8px_32px_rgba(0,0,0,0.08)] sm:rounded-2xl sm:p-6">
      <div className="text-base font-semibold text-zinc-900">Add event</div>
      <div className="mt-1 text-xs leading-relaxed text-zinc-500">
        Search for a UIC building—only campus locations are allowed.
      </div>

      <form
        className="mt-5 space-y-4"
        onSubmit={(ev) => {
          setShowSuggestions(false);
          onSubmit(ev);
        }}
      >
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
              className="flex-1 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-900 outline-none transition-colors focus:border-[#FF385C]/50 focus:ring-2 focus:ring-[#FF385C]/15"
            />
            {dateFocused && (
              <button
                type="button"
                onClick={handleConfirmDate}
                className="rounded-md bg-zinc-50 px-3 py-1 text-sm text-zinc-700 shadow-sm hover:bg-zinc-100"
              >
                Set
              </button>
            )}
          </div>
        </div>

        <div className="relative" ref={locationBlockRef}>
          <label className="text-xs font-medium text-zinc-600">
            Location (building)
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
            Room number
          </label>
          <input
            value={roomNumber}
            onChange={(e) => onRoomNumberChange(e.target.value)}
            placeholder="e.g. 201, 3rd Floor, Room A"
            className="mt-1.5 w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none transition-colors focus:border-[#FF385C]/50 focus:ring-2 focus:ring-[#FF385C]/15"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-zinc-600">
            Event photo <span className="font-normal text-zinc-400">(optional – skip if you like)</span>
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0] ?? null;
              onImageChange(file);
            }}
            className="mt-1.5 block w-full text-xs text-zinc-600 file:mr-3 file:rounded-lg file:border-0 file:bg-zinc-100 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-zinc-700 hover:file:bg-zinc-200"
          />
          <p className="mt-1 text-[10px] text-zinc-500">
            Square-ish photos work best for the round map marker. Leave empty to use your profile picture on the pin.
          </p>
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

        <div>
          <label className="text-xs font-medium text-zinc-600">Organizer</label>
          <input
            value={organizer}
            onChange={(e) => onOrganizerChange(e.target.value)}
            placeholder="e.g. Student Org Name"
            className="mt-1.5 w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none transition-colors focus:border-[#FF385C]/50 focus:ring-2 focus:ring-[#FF385C]/15"
          />
        </div>

        {formError ? (
          <div ref={formErrorRef} className="rounded-xl border border-rose-200/80 bg-rose-50/90 px-3 py-2.5 text-xs text-rose-700" role="alert">
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
