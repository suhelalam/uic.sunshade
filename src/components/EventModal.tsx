/**
 * Modal showing event details.
 * Supports view mode (details + Edit/Delete/Open in Google Maps) and edit mode (inline form).
 * Delete requires Yes/No confirmation.
 */

import * as React from "react";
import type { MapEvent } from "@/lib/types";
import { useAuth } from "@/hooks/useAuth";

type Props = {
  event: MapEvent;
  isEditing: boolean;
  editTitle: string;
  editDateTime: string;
  editAddress: string;
  editRoomNumber: string;
  editDetails: string;
  editExtraInfo: string;
  editOrganizer: string;
  editError: string;
  onEditTitleChange: (value: string) => void;
  onEditDateTimeChange: (value: string) => void;
  onEditAddressChange: (value: string) => void;
  onEditRoomNumberChange: (value: string) => void;
  onEditDetailsChange: (value: string) => void;
  onEditExtraInfoChange: (value: string) => void;
  onEditOrganizerChange: (value: string) => void;
  onEditImageChange: (file: File | null) => void;
  anonymousId: string | null;
  onAttend: (eventId: string) => void;
  onUnattend: (eventId: string) => void;
  onClose: () => void;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSaveEdit: (ev: React.FormEvent) => void;
  onDelete: () => void;
  showDeleteConfirmInitially?: boolean;
};

export function EventModal({
  event,
  isEditing,
  editTitle,
  editDateTime,
  editAddress,
  editRoomNumber,
  editDetails,
  editExtraInfo,
  editOrganizer,
  editError,
  onEditTitleChange,
  onEditDateTimeChange,
  onEditAddressChange,
  onEditRoomNumberChange,
  onEditDetailsChange,
  onEditExtraInfoChange,
  onEditOrganizerChange,
  onEditImageChange,
  anonymousId,
  onAttend,
  onUnattend,
  onClose,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onDelete,
  showDeleteConfirmInitially = false,
}: Props) {
  const { user } = useAuth();
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);

  React.useEffect(() => {
    if (showDeleteConfirmInitially) setShowDeleteConfirm(true);
  }, [showDeleteConfirmInitially, event.id]);

  const canEdit = user && event.createdBy === user.uid;
  const isAttending = Boolean(anonymousId && event.attendees && event.attendees[anonymousId]);
  const attendCount = event.attendCount ?? 0;
  const isPastEvent = new Date(event.dateISO) < new Date();

  const handleDeleteConfirm = (confirmed: boolean) => {
    if (confirmed) {
      onDelete();
      onClose();
    }
    setShowDeleteConfirm(false);
  };

  return (
    <div 
      className="fixed inset-0 z-30 flex items-end justify-center bg-black/40 p-3 backdrop-blur-md sm:items-center sm:p-4"
      onClick={(e) => {
        // Close modal when clicking on backdrop (not the modal content itself)
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div 
        className="w-full max-w-xl rounded-t-2xl border border-[#001E62]/15/80 bg-white p-4 shadow-[0_24px_48px_rgba(0,0,0,0.15)] sm:rounded-2xl sm:p-6 max-h-[90vh] overflow-y-auto pb-[max(1rem,env(safe-area-inset-bottom))] sm:pb-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="text-xs font-medium text-zinc-500">Event details</div>
            <h2 className="mt-1 truncate text-lg font-semibold text-[#333333]">
              {event.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] rounded-full border border-[#001E62]/15 px-4 py-2 text-sm font-medium text-[#333333]/80 transition-colors hover:bg-[#F2F7EB]/60 hover:border-[#001E62]/25 sm:px-3 sm:py-1.5 sm:text-xs"
            aria-label="Close"
          >
            Close
          </button>
        </div>

        <div className="mt-4 space-y-3 text-sm text-zinc-700">
          <div>
            <div className="text-xs font-medium text-zinc-500">When</div>
            <div>{new Date(event.dateISO).toLocaleString()}</div>
          </div>
          {event.imageUrl || event.creatorPhotoUrl ? (
            <div>
              <div className="text-xs font-medium text-zinc-500">Photo</div>
              <div className="mt-1">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={event.imageUrl || event.creatorPhotoUrl}
                  alt={event.title}
                  className="h-32 w-32 rounded-2xl object-cover shadow-sm"
                />
              </div>
            </div>
          ) : null}
          {event.address ? (
            <div>
              <div className="text-xs font-medium text-zinc-500">Building</div>
              <div>{event.address}</div>
            </div>
          ) : null}
          {event.roomNumber ? (
            <div>
              <div className="text-xs font-medium text-zinc-500">Room</div>
              <div>{event.roomNumber}</div>
            </div>
          ) : null}
          {event.details ? (
            <div>
              <div className="text-xs font-medium text-zinc-500">Description</div>
              <div>{event.details}</div>
            </div>
          ) : null}
          {event.extraInfo ? (
            <div>
              <div className="text-xs font-medium text-zinc-500">Extra info</div>
              <div>{event.extraInfo}</div>
            </div>
          ) : null}
          {event.organizer ? (
            <div>
              <div className="text-xs font-medium text-zinc-500">Organizer</div>
              <div>{event.organizer}</div>
            </div>
          ) : null}
          {event.createdByName ? (
            <div>
              <div className="text-xs font-medium text-zinc-500">Created by</div>
              <div>{event.createdByName}</div>
            </div>
          ) : null}
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-500">
              <svg className="h-3.5 w-3.5 shrink-0 text-zinc-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              {isPastEvent
                ? `${attendCount} ${attendCount === 1 ? "person attended" : "people attended"}`
                : `${attendCount} ${attendCount === 1 ? "person is" : "people are"} attending`}
            </span>
            {!isPastEvent && anonymousId ? (
              <button
                type="button"
                onClick={() => {
                  if (isAttending) onUnattend(event.id);
                  else onAttend(event.id);
                }}
                className={
                  isAttending
                    ? "rounded-lg border border-[#001E62]/15 bg-zinc-100 px-3 py-1.5 text-xs font-medium text-zinc-700"
                    : "rounded-lg border border-[#D50032]/50 bg-[#D50032]/10 px-3 py-1.5 text-xs font-medium text-[#D50032] hover:bg-[#D50032]/20"
                }
              >
                {isAttending ? "Attending" : "Attend"}
              </button>
            ) : null}
          </div>
        </div>

        {isEditing ? (
          <form className="mt-5 space-y-3" onSubmit={onSaveEdit}>
            <div>
              <label className="text-xs font-medium text-zinc-700">Title</label>
              <input
                value={editTitle}
                onChange={(e) => onEditTitleChange(e.target.value)}
                className="mt-1 w-full rounded-xl border border-[#001E62]/15 bg-white px-3 py-2 text-sm text-[#333333] outline-none transition-colors focus:border-[#001E62]/50 focus:ring-2 focus:ring-[#001E62]/15"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-700">
                Date & time
              </label>
              <input
                type="datetime-local"
                value={editDateTime}
                onChange={(e) => onEditDateTimeChange(e.target.value)}
                className="mt-1 w-full rounded-xl border border-[#001E62]/15 bg-white px-3 py-2 text-sm text-[#333333] outline-none transition-colors focus:border-[#001E62]/50 focus:ring-2 focus:ring-[#001E62]/15"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-700">Building</label>
              <input
                value={editAddress}
                onChange={(e) => onEditAddressChange(e.target.value)}
                className="mt-1 w-full rounded-xl border border-[#001E62]/15 bg-white px-3 py-2 text-sm text-[#333333] outline-none transition-colors focus:border-[#001E62]/50 focus:ring-2 focus:ring-[#001E62]/15"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-700">Room number</label>
              <input
                value={editRoomNumber}
                onChange={(e) => onEditRoomNumberChange(e.target.value)}
                placeholder="e.g. 201, 3rd Floor, Room A"
                className="mt-1 w-full rounded-xl border border-[#001E62]/15 bg-white px-3 py-2 text-sm text-[#333333] placeholder:text-[#333333]/50 outline-none transition-colors focus:border-[#001E62]/50 focus:ring-2 focus:ring-[#001E62]/15"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-700">
                Event photo (optional)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0] ?? null;
                  onEditImageChange(file);
                }}
                className="mt-1 block w-full text-xs text-[#333333]/80 file:mr-3 file:rounded-lg file:border-0 file:bg-[#F2F7EB] file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-[#333333] hover:file:bg-[#001E62]/10"
              />
              <p className="mt-1 text-[10px] text-zinc-500">
                If you upload a new photo, it will replace the existing one.
              </p>
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-700">
                Description
              </label>
              <textarea
                value={editDetails}
                onChange={(e) => onEditDetailsChange(e.target.value)}
                rows={3}
                className="mt-1 w-full rounded-xl border border-[#001E62]/15 bg-white px-3 py-2 text-sm text-[#333333] outline-none transition-colors focus:border-[#001E62]/50 focus:ring-2 focus:ring-[#001E62]/15"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-700">
                Extra info
              </label>
              <input
                value={editExtraInfo}
                onChange={(e) => onEditExtraInfoChange(e.target.value)}
                className="mt-1 w-full rounded-xl border border-[#001E62]/15 bg-white px-3 py-2 text-sm text-[#333333] outline-none transition-colors focus:border-[#001E62]/50 focus:ring-2 focus:ring-[#001E62]/15"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-700">
                Organizer
              </label>
              <input
                value={editOrganizer}
                onChange={(e) => onEditOrganizerChange(e.target.value)}
                className="mt-1 w-full rounded-xl border border-[#001E62]/15 bg-white px-3 py-2 text-sm text-[#333333] outline-none transition-colors focus:border-[#001E62]/50 focus:ring-2 focus:ring-[#001E62]/15"
              />
            </div>

            {editError ? (
              <div className="rounded-lg border border-[#D50032]/30 bg-[#D50032]/10 px-3 py-2 text-xs text-[#b00028]">
                {editError}
              </div>
            ) : null}

            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-2">
              <button
                type="submit"
                className="rounded-lg bg-[#D50032] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#b00028] active:scale-[0.98]"
              >
                Save changes
              </button>
              <button
                type="button"
                onClick={onCancelEdit}
                className="rounded-xl border border-[#001E62]/15 px-3 py-2 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : showDeleteConfirm ? (
          <div className="mt-5 rounded-lg border border-[#D50032]/30 bg-[#D50032]/10 p-4">
            <p className="text-sm font-medium text-zinc-800">
              Are you sure you want to delete this event?
            </p>
            <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:gap-2">
              <button
                type="button"
                onClick={() => handleDeleteConfirm(true)}
                className="min-h-[44px] rounded-lg bg-[#D50032] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#b00028] active:scale-[0.98] sm:px-3 sm:py-2 sm:text-xs"
              >
                Yes, delete
              </button>
              <button
                type="button"
                onClick={() => handleDeleteConfirm(false)}
                className="min-h-[44px] rounded-xl border border-[#001E62]/15 bg-white px-4 py-3 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 sm:px-3 sm:py-2 sm:text-xs"
              >
                No, keep
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-2">
            {canEdit && !isPastEvent && (
              <button
                type="button"
                onClick={onStartEdit}
                className="min-h-[44px] rounded-xl border border-[#001E62]/15 px-4 py-3 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 sm:px-3 sm:py-2 sm:text-xs"
              >
                Edit event
              </button>
            )}
            {canEdit && (
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="min-h-[44px] rounded-lg border border-[#D50032]/50 px-4 py-3 text-sm font-medium text-[#D50032] transition-colors hover:bg-[#D50032]/10 sm:px-3 sm:py-2 sm:text-xs"
              >
                Delete event
              </button>
            )}
            <a
              className="min-h-[44px] inline-flex items-center justify-center rounded-xl border border-[#001E62]/15 px-4 py-3 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 sm:px-3 sm:py-2 sm:text-xs"
              href={`https://www.google.com/maps/dir/?api=1&destination=${event.location.lat},${event.location.lng}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Open in Google Maps
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
