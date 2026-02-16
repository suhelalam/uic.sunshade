/**
 * Main home page for Sunshade.
 * Wires together: add-event form, map with filters, events list, past events, and event modal.
 * All state lives here; components are presentational with callback props.
 */
"use client";

import * as React from "react";
import { EventsMap } from "@/components/EventsMap";
import { EventsFilter } from "@/components/EventsFilter";
import { EventModal } from "@/components/EventModal";
import { EventsPanel, type PanelTab } from "@/components/EventsPanel";
import { HeaderBar } from "@/components/HeaderBar";
import { Footer } from "@/components/Footer";
import { Toast } from "@/components/Toast";
import { filterEvents } from "@/lib/filters";
import { geocodeBuilding } from "@/lib/geocode";
import {
  isUicBuilding,
  searchUicBuildings,
  type UicBuildingSuggestion,
} from "@/lib/uicBuildings";
import type { FilterMode, LngLat, MapEvent, PickScope } from "@/lib/types";
import { subscribeToEvents, createEvent, updateEvent, deleteEvent, uploadEventImage, attendEvent, unattendEvent } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import { useAnonymousId } from "@/hooks/useAnonymousId";

function applyAttend(event: MapEvent, anonymousId: string): MapEvent {
  return {
    ...event,
    attendCount: (event.attendCount ?? 0) + 1,
    attendees: { ...(event.attendees ?? {}), [anonymousId]: Date.now() },
  };
}
function applyUnattend(event: MapEvent, anonymousId: string): MapEvent {
  const attendees = { ...(event.attendees ?? {}) };
  delete attendees[anonymousId];
  return {
    ...event,
    attendCount: Math.max(0, (event.attendCount ?? 0) - 1),
    attendees,
  };
}

/** Default reference location (UIC campus) for distance calculations. */
const DEFAULT_SELECTED: LngLat = { lng: -87.6477, lat: 41.8719 };

export default function Home() {
  const { user, isUicUser } = useAuth();
  const anonymousId = useAnonymousId();
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

  const [events, setEvents] = React.useState<MapEvent[]>([]);

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
  const [newRoomNumber, setNewRoomNumber] = React.useState<string>("");
  const [newEventLocation, setNewEventLocation] = React.useState<LngLat | null>(
    null
  );
  const [newImageFile, setNewImageFile] = React.useState<File | null>(null);
  const [newDetails, setNewDetails] = React.useState<string>("");
  const [newExtraInfo, setNewExtraInfo] = React.useState<string>("");
  const [newOrganizer, setNewOrganizer] = React.useState<string>("");
  const [formError, setFormError] = React.useState<string>("");
  const [activeEvent, setActiveEvent] = React.useState<MapEvent | null>(null);
  const [isEditingEvent, setIsEditingEvent] = React.useState(false);
  const [editTitle, setEditTitle] = React.useState("");
  const [editDateTime, setEditDateTime] = React.useState("");
  const [editAddress, setEditAddress] = React.useState("");
  const [editRoomNumber, setEditRoomNumber] = React.useState("");
  const [editImageFile, setEditImageFile] = React.useState<File | null>(null);
  const [editDetails, setEditDetails] = React.useState("");
  const [editExtraInfo, setEditExtraInfo] = React.useState("");
  const [editOrganizer, setEditOrganizer] = React.useState("");
  const [editError, setEditError] = React.useState("");
  const [expandedListEventId, setExpandedListEventId] = React.useState<string | null>(null);
  const [showDeleteConfirmForId, setShowDeleteConfirmForId] = React.useState<string | null>(null);
  const [panelTab, setPanelTab] = React.useState<PanelTab>("upcoming");
  const [panelCollapsed, setPanelCollapsed] = React.useState(false);
  const [toastMessage, setToastMessage] = React.useState<string | null>(null);

  const [isResolvingLocation, setIsResolvingLocation] = React.useState(false);

  const buildingSuggestions = React.useMemo(
    () => searchUicBuildings(newAddress),
    [newAddress]
  );

  React.useEffect(() => {
    setPickDateApplied(null);
  }, [pickDate, pickScope]);

  // Subscribe to Firestore events collection
  React.useEffect(() => {
    const unsub = subscribeToEvents((rows) => {
      setEvents(
        rows.map((r: any) => ({
          id: r.id,
          title: r.title,
          dateISO: r.dateISO,
          location: r.location,
          address: r.address,
          roomNumber: r.roomNumber,
          imageUrl: r.imageUrl,
          creatorPhotoUrl: r.creatorPhotoUrl,
          details: r.details,
          extraInfo: r.extraInfo,
          organizer: r.organizer,
          createdBy: r.createdBy,
          createdByName: r.createdByName,
          attendCount: r.attendCount,
          attendees: r.attendees,
        })) as MapEvent[]
      );
    });
    return () => unsub();
  }, []);

  // Keep activeEvent in sync with events so modal shows fresh attend count/status when Firestore updates
  React.useEffect(() => {
    if (!activeEvent) return;
    const updated = events.find((e) => e.id === activeEvent.id);
    if (updated && updated !== activeEvent) setActiveEvent(updated);
  }, [events, activeEvent]);

  React.useEffect(() => {
    if (!activeEvent) {
      setIsEditingEvent(false);
      return;
    }
    setEditTitle(activeEvent.title);
    setEditDateTime(activeEvent.dateISO.slice(0, 16));
    setEditAddress(activeEvent.address ?? "");
    setEditRoomNumber(activeEvent.roomNumber ?? "");
    setEditDetails(activeEvent.details ?? "");
    setEditExtraInfo(activeEvent.extraInfo ?? "");
    setEditOrganizer(activeEvent.organizer ?? "");
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

  const upcomingEvents = React.useMemo(() => {
    const now = new Date();
    return filteredEvents.filter((e) => new Date(e.dateISO) >= now);
  }, [filteredEvents]);

  const pastEvents = React.useMemo(() => {
    const now = new Date();
    return events
      .filter((e) => new Date(e.dateISO) < now)
      .sort((a, b) => new Date(b.dateISO).getTime() - new Date(a.dateISO).getTime());
  }, [events]);

  const eventsTodayCount = React.useMemo(() => {
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
    const todayEnd = todayStart + 24 * 60 * 60 * 1000;
    return filteredEvents.filter((e) => {
      const t = new Date(e.dateISO).getTime();
      return t >= todayStart && t < todayEnd;
    }).length;
  }, [filteredEvents]);

  const handleAddEvent = async (ev: React.FormEvent) => {
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

    try {
      let imageUrl: string | undefined;
      if (newImageFile) {
        imageUrl = await uploadEventImage(newImageFile);
      }

      await createEvent({
        title,
        dateISO: date.toISOString(),
        location: newEventLocation,
        address,
        roomNumber: newRoomNumber.trim() || undefined,
        imageUrl,
        details: newDetails.trim() || undefined,
        extraInfo: newExtraInfo.trim() || undefined,
        organizer: newOrganizer.trim() || undefined,
      });

      setNewTitle("");
      setNewDateTime("");
      setNewAddress("");
      setNewRoomNumber("");
      setNewEventLocation(null);
      setNewImageFile(null);
      setNewDetails("");
      setNewExtraInfo("");
      setNewOrganizer("");
      setPanelTab("upcoming");
      setToastMessage("Event added");
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Could not save event. Try again.");
    }
  };

  const handleAttend = React.useCallback(
    async (eventId: string) => {
      if (!anonymousId) return;
      setEvents((prev) => prev.map((e) => (e.id !== eventId ? e : applyAttend(e, anonymousId))));
      setActiveEvent((prev) => (prev?.id !== eventId ? prev : prev ? applyAttend(prev, anonymousId) : null));
      try {
        await attendEvent(eventId, anonymousId);
      } catch {
        setEvents((prev) => prev.map((e) => (e.id !== eventId ? e : applyUnattend(e, anonymousId))));
        setActiveEvent((prev) => (prev?.id !== eventId ? prev : prev ? applyUnattend(prev, anonymousId) : null));
      }
    },
    [anonymousId]
  );

  const handleUnattend = React.useCallback(
    async (eventId: string) => {
      if (!anonymousId) return;
      setEvents((prev) => prev.map((e) => (e.id !== eventId ? e : applyUnattend(e, anonymousId))));
      setActiveEvent((prev) => (prev?.id !== eventId ? prev : prev ? applyUnattend(prev, anonymousId) : null));
      try {
        await unattendEvent(eventId, anonymousId);
      } catch {
        setEvents((prev) => prev.map((e) => (e.id !== eventId ? e : applyAttend(e, anonymousId))));
        setActiveEvent((prev) => (prev?.id !== eventId ? prev : prev ? applyAttend(prev, anonymousId) : null));
      }
    },
    [anonymousId]
  );

  const handleSaveEdit = async (ev: React.FormEvent) => {
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

    try {
      let imageUrl: string | undefined = activeEvent.imageUrl;
      if (editImageFile) {
        imageUrl = await uploadEventImage(editImageFile);
      }

      await updateEvent(activeEvent.id, {
        title,
        dateISO: date.toISOString(),
        address,
        roomNumber: editRoomNumber.trim() || undefined,
        imageUrl,
        details: editDetails.trim() || undefined,
        extraInfo: editExtraInfo.trim() || undefined,
        organizer: editOrganizer.trim() || undefined,
      });

      setIsEditingEvent(false);
      setEditImageFile(null);
    } catch (err) {
      setEditError(err instanceof Error ? err.message : "Could not save changes. Try again.");
    }
  };

  return (
    <div className="min-h-screen max-h-screen bg-[#F2F7EB] overflow-hidden flex flex-col">
      <header className="shrink-0">
        <HeaderBar accessToken={accessToken} />
      </header>
      <main className="flex-1 min-h-0 flex flex-col overflow-hidden" aria-label="Campus map and events">
        <section className="relative flex-1 min-h-[300px] overflow-hidden" aria-label="Map and events panel">
          <div className="absolute inset-0 overflow-hidden">
            <EventsMap
              heroMode
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
                setIsEditingEvent(false);
              }}
              onMapClick={() => setActiveEvent(null)}
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
              eventsTodayCount={eventsTodayCount}
            />
          </div>
          {!panelCollapsed ? (
            <aside className="absolute z-10 left-0 right-0 bottom-0 top-auto h-[50vh] max-h-[50vh] rounded-t-2xl shadow-[0_8px_32px_rgba(0,30,98,0.12)] pb-[env(safe-area-inset-bottom)] md:h-full md:max-h-none md:rounded-none md:left-2 md:right-auto md:top-2 md:bottom-2 md:w-[min(340px,calc(100vw-2rem))] md:pb-0 lg:left-4 lg:top-4 lg:bottom-4 lg:w-[380px]">
              <div className="h-full min-h-0 max-h-[50vh] md:max-h-[calc(100vh-5rem)] overflow-hidden shadow-[0_8px_32px_rgba(0,30,98,0.12)]">
                <EventsPanel
                  activeTab={panelTab}
                  onTabChange={setPanelTab}
                  onCollapse={() => setPanelCollapsed(true)}
                upcomingEvents={upcomingEvents}
                pastEvents={pastEvents}
                selectedLocation={selectedLocation}
                expandedListEventId={expandedListEventId}
                onExpandToggle={(e) => setExpandedListEventId((id) => (id === e.id ? null : e.id))}
                onSelectEvent={(e) => {
                  setActiveEvent(e);
                  setSelectedLocation(e.location);
                  setFocusLocation(e.location);
                  setIsEditingEvent(false);
                }}
                onEditEvent={(e, source) => {
                  setActiveEvent(e);
                  setSelectedLocation(e.location);
                  setFocusLocation(e.location);
                  setIsEditingEvent(source === "upcoming" ? true : new Date(e.dateISO) >= new Date());
                }}
                onDeleteEvent={(e) => {
                  setActiveEvent(e);
                  setSelectedLocation(e.location);
                  setFocusLocation(e.location);
                  setIsEditingEvent(false);
                  setShowDeleteConfirmForId(e.id);
                }}
                currentUserId={user?.uid ?? null}
                newTitle={newTitle}
                newDateTime={newDateTime}
                newAddress={newAddress}
                newRoomNumber={newRoomNumber}
                newDetails={newDetails}
                newExtraInfo={newExtraInfo}
                newOrganizer={newOrganizer}
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
                onRoomNumberChange={setNewRoomNumber}
                onImageChange={setNewImageFile}
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
                onOrganizerChange={setNewOrganizer}
                onSubmit={handleAddEvent}
                />
              </div>
            </aside>
          ) : (
            <button
              type="button"
              onClick={() => setPanelCollapsed(false)}
              className="absolute left-3 bottom-20 z-10 flex items-center gap-2 rounded-xl border border-[#001E62]/15 bg-white/95 px-3 py-2.5 text-sm font-semibold text-[#001E62] shadow-[0_4px_20px_rgba(0,30,98,0.12)] backdrop-blur-sm transition hover:bg-[#F2F7EB]/90 hover:border-[#001E62]/25 md:bottom-auto md:top-3 md:left-3 lg:left-4 lg:top-4"
              aria-label="Show events panel"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
              </svg>
              Events {upcomingEvents.length > 0 ? `(${upcomingEvents.length})` : ""}
            </button>
          )}
        </section>
      </main>
      {toastMessage ? (
        <Toast message={toastMessage} onDismiss={() => setToastMessage(null)} />
      ) : null}

        {activeEvent ? (
          <EventModal
            event={activeEvent}
            isEditing={isEditingEvent}
            editTitle={editTitle}
            editDateTime={editDateTime}
            editAddress={editAddress}
            editRoomNumber={editRoomNumber}
            editDetails={editDetails}
            editExtraInfo={editExtraInfo}
            editOrganizer={editOrganizer}
            editError={editError}
            onEditTitleChange={setEditTitle}
            onEditDateTimeChange={setEditDateTime}
            onEditAddressChange={setEditAddress}
            onEditRoomNumberChange={setEditRoomNumber}
            onEditDetailsChange={setEditDetails}
            onEditExtraInfoChange={setEditExtraInfo}
            onEditOrganizerChange={setEditOrganizer}
            onEditImageChange={setEditImageFile}
            anonymousId={anonymousId}
            onAttend={handleAttend}
            onUnattend={handleUnattend}
            onClose={() => {
              setActiveEvent(null);
              setShowDeleteConfirmForId(null);
            }}
            onStartEdit={() => setIsEditingEvent(true)}
            onCancelEdit={() => setIsEditingEvent(false)}
            onSaveEdit={handleSaveEdit}
            onDelete={() => {
              void deleteEvent(activeEvent!.id)
                .then(() => {
                  setActiveEvent(null);
                  setShowDeleteConfirmForId(null);
                })
                .catch((err) => {
                  setEditError(err instanceof Error ? err.message : "Could not delete event. Try again.");
                });
            }}
            showDeleteConfirmInitially={activeEvent?.id === showDeleteConfirmForId}
          />
        ) : null}
      <Footer />
    </div>
  );
}
