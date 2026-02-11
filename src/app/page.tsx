/**
 * Main home page for Sunshade.
 * Wires together: add-event form, map with filters, events list, past events, and event modal.
 * All state lives here; components are presentational with callback props.
 */
"use client";

import * as React from "react";
import { EventsMap } from "@/components/EventsMap";
import { EventForm } from "@/components/EventForm";
import { EventsFilter } from "@/components/EventsFilter";
import { EventsList } from "@/components/EventsList";
import { EventModal } from "@/components/EventModal";
import { HeaderBar } from "@/components/HeaderBar";
import { filterEvents } from "@/lib/filters";
import { geocodeBuilding } from "@/lib/geocode";
import {
  isUicBuilding,
  searchUicBuildings,
  type UicBuildingSuggestion,
} from "@/lib/uicBuildings";
import type { FilterMode, LngLat, MapEvent, PickScope } from "@/lib/types";

/** Default reference location (UIC campus) for distance calculations. */
const DEFAULT_SELECTED: LngLat = { lng: -87.6477, lat: 41.8719 };

export default function Home() {
  const accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  const [selectedLocation, setSelectedLocation] =
    React.useState<LngLat>(DEFAULT_SELECTED);
  const [focusLocation, setFocusLocation] = React.useState<LngLat | null>(null);
  const [isLocating, setIsLocating] = React.useState(false);
  const [locationError, setLocationError] = React.useState<string | null>(null);

  const handleUseMyLocation = React.useCallback(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser.");
      return;
    }
    if (!window.isSecureContext) {
      setLocationError(
        "Location requires HTTPS. Use https:// or run on localhost."
      );
      return;
    }
    setLocationError(null);
    setIsLocating(true);

    const onSuccess = (pos: GeolocationPosition) => {
      const loc: LngLat = {
        lng: pos.coords.longitude,
        lat: pos.coords.latitude,
      };
      setSelectedLocation(loc);
      setFocusLocation(loc);
      setIsLocating(false);
    };

    const onError = (err: GeolocationPositionError) => {
      setIsLocating(false);
      if (err.code === 1) {
        setLocationError("Location access denied. Allow location in browser.");
      } else if (err.code === 2) {
        setLocationError("Location unavailable. Check GPS/Wi‑Fi and try again.");
      } else if (err.code === 3) {
        setLocationError("Location timed out. Retrying with low accuracy…");
        navigator.geolocation.getCurrentPosition(
          onSuccess,
          (retryErr) => {
            setIsLocating(false);
            setLocationError(
              retryErr.code === 1
                ? "Location access denied."
                : "Could not get your location. Try again later."
            );
          },
          { enableHighAccuracy: false, timeout: 15000, maximumAge: 300000 }
        );
      } else {
        setLocationError("Could not get your location. Try again later.");
      }
    };

    navigator.geolocation.getCurrentPosition(
      onSuccess,
      onError,
      {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 60000,
      }
    );
  }, []);

  const [events, setEvents] = React.useState<MapEvent[]>(() => [
    {
      id: "sample-1",
      title: "Campus meetup",
      dateISO: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
      location: { lng: -87.6482, lat: 41.8727 },
      address: "Student Center East, 750 S Halsted St, Chicago, IL",
      details: "Welcome meetup for new members. Snacks + quick icebreakers.",
      extraInfo: "Bring a student ID for entry.",
    },
    {
      id: "sample-2",
      title: "Music night",
      dateISO: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3).toISOString(),
      location: { lng: -87.6243, lat: 41.8796 },
      address: "Millennium Park, Chicago, IL",
      details: "Live performances and local food vendors.",
      extraInfo: "Outdoor event. Dress warm.",
    },
  ]);

  // Filters
  const [filterOpen, setFilterOpen] = React.useState(false);
  const [filterMode, setFilterMode] = React.useState<FilterMode>("all");
  const [pickScope, setPickScope] = React.useState<PickScope>("date");
  const [pickYear, setPickYear] = React.useState<number>(
    new Date().getFullYear()
  );
  const [pickMonth, setPickMonth] = React.useState<number>(
    new Date().getMonth() + 1
  );
  const [pickDate, setPickDate] = React.useState<string>(
    new Date().toISOString().slice(0, 10)
  );
  const [pickDateApplied, setPickDateApplied] = React.useState<string | null>(
    null
  );
  const [maxDistanceMiles, setMaxDistanceMiles] = React.useState<number>(5);
  const [enableDistanceFilter, setEnableDistanceFilter] =
    React.useState<boolean>(true);

  // Add event form
  const [newTitle, setNewTitle] = React.useState("");
  const [newDateTime, setNewDateTime] = React.useState<string>("");
  const [newAddress, setNewAddress] = React.useState<string>("");
  const [newEventLocation, setNewEventLocation] = React.useState<LngLat | null>(
    null
  );
  const [newDetails, setNewDetails] = React.useState<string>("");
  const [newExtraInfo, setNewExtraInfo] = React.useState<string>("");
  const [formError, setFormError] = React.useState<string>("");
  const [activeEvent, setActiveEvent] = React.useState<MapEvent | null>(null);
  const [isEditingEvent, setIsEditingEvent] = React.useState(false);
  const [editTitle, setEditTitle] = React.useState("");
  const [editDateTime, setEditDateTime] = React.useState("");
  const [editAddress, setEditAddress] = React.useState("");
  const [editDetails, setEditDetails] = React.useState("");
  const [editExtraInfo, setEditExtraInfo] = React.useState("");
  const [editError, setEditError] = React.useState("");

  const [isResolvingLocation, setIsResolvingLocation] = React.useState(false);

  const buildingSuggestions = React.useMemo(
    () => searchUicBuildings(newAddress),
    [newAddress]
  );

  React.useEffect(() => {
    setPickDateApplied(null);
  }, [pickDate, pickScope]);

  React.useEffect(() => {
    if (!activeEvent) {
      setIsEditingEvent(false);
      return;
    }
    setIsEditingEvent(false);
    setEditTitle(activeEvent.title);
    setEditDateTime(activeEvent.dateISO.slice(0, 16));
    setEditAddress(activeEvent.address ?? "");
    setEditDetails(activeEvent.details ?? "");
    setEditExtraInfo(activeEvent.extraInfo ?? "");
    setEditError("");
  }, [activeEvent]);

  const filteredEvents = React.useMemo(
    () =>
      filterEvents(events, {
        filterMode,
        pickScope,
        pickYear,
        pickMonth,
        pickDateApplied,
        enableDistanceFilter,
        maxDistanceMiles,
        selectedLocation,
      }),
    [
      enableDistanceFilter,
      events,
      filterMode,
      maxDistanceMiles,
      pickDateApplied,
      pickMonth,
      pickScope,
      pickYear,
      selectedLocation,
    ]
  );

  const pastEvents = React.useMemo(() => {
    const now = new Date();
    return events
      .filter((e) => new Date(e.dateISO) < now)
      .sort((a, b) => new Date(b.dateISO).getTime() - new Date(a.dateISO).getTime())
      .slice(0, 8);
  }, [events]);

  const handleAddEvent = (ev: React.FormEvent) => {
    ev.preventDefault();
    setFormError("");

    const title = newTitle.trim();
    if (!title) {
      setFormError("Please enter a title.");
      return;
    }
    if (!newDateTime) {
      setFormError("Please select a date/time.");
      return;
    }

    const date = new Date(newDateTime);
    if (Number.isNaN(date.getTime())) {
      setFormError("Invalid date/time.");
      return;
    }
    const address = newAddress.trim();
    if (!address) {
      setFormError("Please add the event address.");
      return;
    }
    if (!newEventLocation) {
      setFormError("Please select an address from the suggestions.");
      return;
    }
    if (!isUicBuilding(address)) {
      setFormError("Only UIC buildings are allowed.");
      return;
    }

    setEvents((prev) => [
      {
        id: `evt-${crypto.randomUUID()}`,
        title,
        dateISO: date.toISOString(),
        location: newEventLocation,
        address,
        details: newDetails.trim() || undefined,
        extraInfo: newExtraInfo.trim() || undefined,
      },
      ...prev,
    ]);
    setNewTitle("");
    setNewDateTime("");
    setNewAddress("");
    setNewEventLocation(null);
    setNewDetails("");
    setNewExtraInfo("");
  };

  const handleSaveEdit = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!activeEvent) return;
    setEditError("");

    const title = editTitle.trim();
    if (!title) {
      setEditError("Please enter a title.");
      return;
    }
    if (!editDateTime) {
      setEditError("Please select a date/time.");
      return;
    }
    const date = new Date(editDateTime);
    if (Number.isNaN(date.getTime())) {
      setEditError("Invalid date/time.");
      return;
    }
    const address = editAddress.trim();
    if (!address) {
      setEditError("Please add the event address.");
      return;
    }
    if (!isUicBuilding(address)) {
      setEditError("Only UIC buildings are allowed.");
      return;
    }

    setEvents((prev) =>
      prev.map((e) =>
        e.id === activeEvent.id
          ? {
              ...e,
              title,
              dateISO: date.toISOString(),
              address,
              details: editDetails.trim() || undefined,
              extraInfo: editExtraInfo.trim() || undefined,
            }
          : e
      )
    );
    setIsEditingEvent(false);
  };

  return (
    <div className="min-h-screen bg-[#fafafa] overflow-x-hidden">
      <div className="mx-auto max-w-7xl px-3 py-5 sm:px-6 sm:py-8 lg:px-8 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:pb-[max(2rem,env(safe-area-inset-bottom))]">
        <HeaderBar accessToken={accessToken} />

        <div className="grid gap-4 sm:gap-6 lg:grid-cols-[360px_1fr]">
          <aside className="space-y-6">
            <EventForm
              title={newTitle}
              dateTime={newDateTime}
              address={newAddress}
              details={newDetails}
              extraInfo={newExtraInfo}
              formError={formError}
              buildingSuggestions={buildingSuggestions}
              isResolvingLocation={isResolvingLocation}
              onTitleChange={setNewTitle}
              onDateTimeChange={setNewDateTime}
              onAddressChange={(value) => {
                setNewAddress(value);
                setNewEventLocation(null);
                setFormError("");
              }}
              onBuildingSelect={async (s) => {
                setFormError("");
                setIsResolvingLocation(true);
                try {
                  const geocodeQuery = s.address ?? s.name;
                  const coords = await geocodeBuilding(geocodeQuery, accessToken);
                  if (coords) {
                    setNewEventLocation(coords);
                    setNewAddress(s.name);
                  } else {
                    setFormError("Could not find location for this building.");
                  }
                } catch {
                  setFormError("Could not find location for this building.");
                } finally {
                  setIsResolvingLocation(false);
                }
              }}
              onDetailsChange={setNewDetails}
              onExtraInfoChange={setNewExtraInfo}
              onSubmit={handleAddEvent}
            />
          </aside>

          <main className="min-w-0">
            <div className="rounded-xl border border-zinc-200/60 bg-white p-3 shadow-[0_4px_24px_rgba(0,0,0,0.06)] sm:rounded-2xl sm:p-6">
              <div className="mt-0">
                <EventsMap
                  accessToken={accessToken}
                  selectedLocation={selectedLocation}
                  onSelectedLocationChange={(loc) => {
                    setSelectedLocation(loc);
                    setLocationError(null);
                  }}
                  focusLocation={focusLocation}
                  events={filteredEvents}
                  onUseMyLocation={handleUseMyLocation}
                  isLocating={isLocating}
                  locationError={locationError}
                  onEventSelect={(e) => {
                    setActiveEvent(e);
                    setSelectedLocation(e.location);
                    setFocusLocation(e.location);
                  }}
                  filterOpen={filterOpen}
                  onFilterToggle={() => setFilterOpen((prev) => !prev)}
                  filterMode={filterMode}
                  onFilterModeChange={setFilterMode}
                  pickScope={pickScope}
                  onPickScopeChange={setPickScope}
                  pickYear={pickYear}
                  onPickYearChange={setPickYear}
                  pickMonth={pickMonth}
                  onPickMonthChange={setPickMonth}
                  pickDate={pickDate}
                  onPickDateChange={setPickDate}
                  onPickDateApply={() => {
                    if (pickScope === "date") setPickDateApplied(pickDate);
                  }}
                  enableDistanceFilter={enableDistanceFilter}
                  onEnableDistanceFilterChange={setEnableDistanceFilter}
                  maxDistanceMiles={maxDistanceMiles}
                  onMaxDistanceMilesChange={setMaxDistanceMiles}
                  totalShown={filteredEvents.length}
                />
              </div>
              <div className="mt-3">
                <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">
                  Events
                </div>
                <EventsList
                  events={filteredEvents}
                  selectedLocation={selectedLocation}
                  onSelect={(e) => {
                    setActiveEvent(e);
                    setSelectedLocation(e.location);
                    setFocusLocation(e.location);
                  }}
                  onEdit={(e) => {
                    setActiveEvent(e);
                    setSelectedLocation(e.location);
                    setFocusLocation(e.location);
                    setIsEditingEvent(true);
                  }}
                />
              </div>
              <div className="mt-6">
                <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">
                  Past events
                </div>
                <EventsList
                  events={pastEvents}
                  selectedLocation={selectedLocation}
                  onSelect={(e) => {
                    setActiveEvent(e);
                    setSelectedLocation(e.location);
                    setFocusLocation(e.location);
                  }}
                  onEdit={(e) => {
                    setActiveEvent(e);
                    setSelectedLocation(e.location);
                    setFocusLocation(e.location);
                    setIsEditingEvent(true);
                  }}
                />
              </div>
            </div>
          </main>
        </div>

        {activeEvent ? (
          <EventModal
            event={activeEvent}
            isEditing={isEditingEvent}
            editTitle={editTitle}
            editDateTime={editDateTime}
            editAddress={editAddress}
            editDetails={editDetails}
            editExtraInfo={editExtraInfo}
            editError={editError}
            onEditTitleChange={setEditTitle}
            onEditDateTimeChange={setEditDateTime}
            onEditAddressChange={setEditAddress}
            onEditDetailsChange={setEditDetails}
            onEditExtraInfoChange={setEditExtraInfo}
            onClose={() => setActiveEvent(null)}
            onStartEdit={() => setIsEditingEvent(true)}
            onCancelEdit={() => setIsEditingEvent(false)}
            onSaveEdit={handleSaveEdit}
            onDelete={() => {
              setEvents((prev) => prev.filter((e) => e.id !== activeEvent!.id));
              setActiveEvent(null);
            }}
          />
        ) : null}
      </div>
    </div>
  );
}
