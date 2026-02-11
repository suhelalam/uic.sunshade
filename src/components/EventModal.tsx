/**
 * Modal showing event details.
 * Supports view mode (details + Edit/Delete/Open in Google Maps) and edit mode (inline form).
 * Delete requires Yes/No confirmation.
 */

import * as React from "react";
import type { MapEvent } from "@/lib/types";

type Props = {
  event: MapEvent;
  isEditing: boolean;
  editTitle: string;
  editDateTime: string;
  editAddress: string;
  editDetails: string;
  editExtraInfo: string;
  editError: string;
  onEditTitleChange: (value: string) => void;
  onEditDateTimeChange: (value: string) => void;
  onEditAddressChange: (value: string) => void;
  onEditDetailsChange: (value: string) => void;
  onEditExtraInfoChange: (value: string) => void;
  onClose: () => void;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSaveEdit: (ev: React.FormEvent) => void;
  onDelete: () => void;
};

export function EventModal({
  event,
  isEditing,
  editTitle,
  editDateTime,
  editAddress,
  editDetails,
  editExtraInfo,
  editError,
  onEditTitleChange,
  onEditDateTimeChange,
  onEditAddressChange,
  onEditDetailsChange,
  onEditExtraInfoChange,
  onClose,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onDelete,
}: Props) {
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);

  const handleDeleteConfirm = (confirmed: boolean) => {
    if (confirmed) {
      onDelete();
      onClose();
    }
    setShowDeleteConfirm(false);
  };

  return (
    <div className="fixed inset-0 z-30 flex items-end justify-center bg-black/40 p-3 backdrop-blur-md sm:items-center sm:p-4">
      <div className="w-full max-w-xl rounded-t-2xl border border-zinc-200/80 bg-white p-4 shadow-[0_24px_48px_rgba(0,0,0,0.15)] sm:rounded-2xl sm:p-6 max-h-[90vh] overflow-y-auto pb-[max(1rem,env(safe-area-inset-bottom))] sm:pb-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="text-xs font-medium text-zinc-500">Event details</div>
            <h2 className="mt-1 truncate text-lg font-semibold text-zinc-900">
              {event.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] rounded-full border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-50 hover:border-zinc-300 sm:px-3 sm:py-1.5 sm:text-xs"
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
          {event.address ? (
            <div>
              <div className="text-xs font-medium text-zinc-500">Address</div>
              <div>{event.address}</div>
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
        </div>

        {isEditing ? (
          <form className="mt-5 space-y-3" onSubmit={onSaveEdit}>
            <div>
              <label className="text-xs font-medium text-zinc-700">Title</label>
              <input
                value={editTitle}
                onChange={(e) => onEditTitleChange(e.target.value)}
                className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition-colors focus:border-[#FF385C]/50 focus:ring-2 focus:ring-[#FF385C]/15"
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
                className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition-colors focus:border-[#FF385C]/50 focus:ring-2 focus:ring-[#FF385C]/15"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-700">Address</label>
              <input
                value={editAddress}
                onChange={(e) => onEditAddressChange(e.target.value)}
                className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition-colors focus:border-[#FF385C]/50 focus:ring-2 focus:ring-[#FF385C]/15"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-700">
                Description
              </label>
              <textarea
                value={editDetails}
                onChange={(e) => onEditDetailsChange(e.target.value)}
                rows={3}
                className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition-colors focus:border-[#FF385C]/50 focus:ring-2 focus:ring-[#FF385C]/15"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-700">
                Extra info
              </label>
              <input
                value={editExtraInfo}
                onChange={(e) => onEditExtraInfoChange(e.target.value)}
                className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition-colors focus:border-[#FF385C]/50 focus:ring-2 focus:ring-[#FF385C]/15"
              />
            </div>

            {editError ? (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
                {editError}
              </div>
            ) : null}

            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-2">
              <button
                type="submit"
                className="rounded-xl bg-[#FF385C] px-3 py-2 text-xs font-semibold text-white shadow-[0_2px_8px_rgba(255,56,92,0.3)] transition hover:bg-[#E31C5F] active:scale-[0.98]"
              >
                Save changes
              </button>
              <button
                type="button"
                onClick={onCancelEdit}
                className="rounded-xl border border-zinc-200 px-3 py-2 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : showDeleteConfirm ? (
          <div className="mt-5 rounded-xl border border-rose-200/80 bg-rose-50/50 p-4">
            <p className="text-sm font-medium text-zinc-800">
              Are you sure you want to delete this event?
            </p>
            <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:gap-2">
              <button
                type="button"
                onClick={() => handleDeleteConfirm(true)}
                className="min-h-[44px] rounded-xl bg-rose-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-rose-700 active:scale-[0.98] sm:px-3 sm:py-2 sm:text-xs"
              >
                Yes, delete
              </button>
              <button
                type="button"
                onClick={() => handleDeleteConfirm(false)}
                className="min-h-[44px] rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 sm:px-3 sm:py-2 sm:text-xs"
              >
                No, keep
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-2">
            <button
              type="button"
              onClick={onStartEdit}
              className="min-h-[44px] rounded-xl border border-zinc-200 px-4 py-3 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 sm:px-3 sm:py-2 sm:text-xs"
            >
              Edit event
            </button>
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="min-h-[44px] rounded-xl border border-rose-200 px-4 py-3 text-sm font-medium text-rose-700 transition-colors hover:bg-rose-50 sm:px-3 sm:py-2 sm:text-xs"
            >
              Delete event
            </button>
            <a
              className="min-h-[44px] inline-flex items-center justify-center rounded-xl border border-zinc-200 px-4 py-3 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 sm:px-3 sm:py-2 sm:text-xs"
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
