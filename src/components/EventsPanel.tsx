"use client";

import * as React from "react";
import { EventsList } from "@/components/EventsList";
import { EventForm } from "@/components/EventForm";
import type { MapEvent, LngLat } from "@/lib/types";
import type { UicBuildingSuggestion } from "@/lib/uicBuildings";

export type PanelTab = "upcoming" | "past" | "add";

type EventsPanelProps = {
  activeTab: PanelTab;
  onTabChange: (tab: PanelTab) => void;
  onCollapse?: () => void;
  upcomingEvents: MapEvent[];
  pastEvents: MapEvent[];
  selectedLocation: LngLat;
  expandedListEventId: string | null;
  onExpandToggle: (event: MapEvent) => void;
  onSelectEvent: (event: MapEvent) => void;
  onEditEvent: (event: MapEvent, source: "upcoming" | "past") => void;
  onDeleteEvent: (event: MapEvent) => void;
  currentUserId: string | null;
  // Add event form state
  newTitle: string;
  newDateTime: string;
  newAddress: string;
  newRoomNumber: string;
  newDetails: string;
  newExtraInfo: string;
  newOrganizer: string;
  formError: string;
  buildingSuggestions: UicBuildingSuggestion[];
  isResolvingLocation: boolean;
  onTitleChange: (v: string) => void;
  onDateTimeChange: (v: string) => void;
  onAddressChange: (v: string) => void;
  onRoomNumberChange: (v: string) => void;
  onImageChange: (f: File | null) => void;
  onBuildingSelect: (s: UicBuildingSuggestion) => void;
  onDetailsChange: (v: string) => void;
  onExtraInfoChange: (v: string) => void;
  onOrganizerChange: (v: string) => void;
  onSubmit: (ev: React.FormEvent) => void;
};

const TABS: { id: PanelTab; label: string }[] = [
  { id: "upcoming", label: "Upcoming" },
  { id: "past", label: "Past" },
  { id: "add", label: "Add Event" },
];

export function EventsPanel({
  activeTab,
  onTabChange,
  onCollapse,
  upcomingEvents,
  pastEvents,
  selectedLocation,
  expandedListEventId,
  onExpandToggle,
  onSelectEvent,
  onEditEvent,
  onDeleteEvent,
  currentUserId,
  newTitle,
  newDateTime,
  newAddress,
  newRoomNumber,
  newDetails,
  newExtraInfo,
  newOrganizer,
  formError,
  buildingSuggestions,
  isResolvingLocation,
  onTitleChange,
  onDateTimeChange,
  onAddressChange,
  onRoomNumberChange,
  onImageChange,
  onBuildingSelect,
  onDetailsChange,
  onExtraInfoChange,
  onOrganizerChange,
  onSubmit,
}: EventsPanelProps) {
  const getTabLabel = (id: PanelTab) => {
    if (id === "upcoming") return `Upcoming (${upcomingEvents.length})`;
    if (id === "past") return `Past (${pastEvents.length})`;
    return "Add Event";
  };

  return (
    <div className="flex h-full flex-col rounded-xl border border-[#001E62]/12 bg-white shadow-[0_4px_24px_rgba(0,30,98,0.08)] overflow-hidden">
      <div className="relative flex shrink-0 border-b border-[#001E62]/12 bg-[#F2F7EB]/60">
        <div className="flex flex-1 min-w-0 pr-10">
          {TABS.map(({ id }) => (
            <button
              key={id}
              type="button"
              onClick={() => onTabChange(id)}
              className={`flex-1 min-w-0 px-2 py-3 text-sm font-semibold transition-colors truncate ${
                activeTab === id
                  ? "bg-white text-[#D50032] shadow-sm border-b-2 border-[#D50032]"
                  : "text-[#001E62]/80 hover:bg-white/50 hover:text-[#001E62]"
              }`}
            >
              {getTabLabel(id)}
            </button>
          ))}
        </div>
        {onCollapse ? (
          <button
            type="button"
            onClick={onCollapse}
            className="absolute right-2 top-2.5 p-1.5 rounded-lg text-[#001E62]/70 hover:bg-[#001E62]/10 hover:text-[#001E62] transition-colors"
            title="Expand map"
            aria-label="Expand map"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        ) : null}
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden touch-scroll">
        {activeTab === "upcoming" && (
          <div className="p-3 flex flex-col h-full">
            <h2 className="text-xs font-bold text-[#001E62] uppercase tracking-wider mb-2 pb-1.5 border-b border-[#001E62]/15">
              Upcoming events
            </h2>
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain touch-scroll">
              <EventsList
                events={upcomingEvents}
                selectedLocation={selectedLocation}
                expandedId={expandedListEventId}
                onExpandToggle={(e) => onExpandToggle(e)}
                onSelect={onSelectEvent}
                onEdit={(e) => onEditEvent(e, "upcoming")}
                onDelete={onDeleteEvent}
                currentUserId={currentUserId}
                emptyTitle="No upcoming events"
                emptyActionLabel="Add event"
                onEmptyAction={() => onTabChange("add")}
              />
            </div>
          </div>
        )}
        {activeTab === "past" && (
          <div className="p-3 flex flex-col h-full">
            <h2 className="text-xs font-bold text-[#001E62] uppercase tracking-wider mb-2 pb-1.5 border-b border-[#001E62]/15">
              Past events
            </h2>
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain touch-scroll">
              <EventsList
                events={pastEvents}
                selectedLocation={selectedLocation}
                expandedId={expandedListEventId}
                onExpandToggle={(e) => onExpandToggle(e)}
                onSelect={onSelectEvent}
                onEdit={(e) => onEditEvent(e, "past")}
                onDelete={onDeleteEvent}
                currentUserId={currentUserId}
                emptyTitle="No past events yet"
              />
            </div>
          </div>
        )}
        {activeTab === "add" && (
          <div className="p-3">
            <EventForm
              title={newTitle}
              dateTime={newDateTime}
              address={newAddress}
              roomNumber={newRoomNumber}
              details={newDetails}
              extraInfo={newExtraInfo}
              organizer={newOrganizer}
              formError={formError}
              buildingSuggestions={buildingSuggestions}
              isResolvingLocation={isResolvingLocation}
              onTitleChange={onTitleChange}
              onDateTimeChange={onDateTimeChange}
              onAddressChange={onAddressChange}
              onRoomNumberChange={onRoomNumberChange}
              onImageChange={onImageChange}
              onBuildingSelect={onBuildingSelect}
              onDetailsChange={onDetailsChange}
              onExtraInfoChange={onExtraInfoChange}
              onOrganizerChange={onOrganizerChange}
              onSubmit={onSubmit}
            />
          </div>
        )}
      </div>
    </div>
  );
}
