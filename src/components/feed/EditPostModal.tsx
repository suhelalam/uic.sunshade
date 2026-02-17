"use client";

import * as React from "react";
import type { FeedPost } from "@/lib/feedTypes";

type Props = {
  post: FeedPost;
  onClose: () => void;
  onSave: (caption: string) => Promise<void>;
};

export function EditPostModal({ post, onClose, onSave }: Props) {
  const [caption, setCaption] = React.useState(post.caption);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await onSave(caption.trim());
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4">
      <div
        className="bg-white w-full max-w-lg rounded-t-2xl sm:rounded-2xl shadow-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#001E62]/12">
          <h2 className="text-lg font-bold text-[#001E62]">Edit post</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-[#001E62]/70 hover:bg-[#001E62]/10"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4">
          <label className="block text-sm font-medium text-[#001E62] mb-1">Caption</label>
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            rows={3}
            className="w-full rounded-xl border border-[#001E62]/20 px-3 py-2 text-[#333333] focus:outline-none focus:ring-2 focus:ring-[#D50032]/30 focus:border-[#D50032]"
            placeholder="Write a caption..."
          />
          {error ? <p className="mt-2 text-sm text-[#D50032]">{error}</p> : null}
          <div className="flex gap-2 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-[#001E62]/20 text-[#001E62] font-semibold hover:bg-[#001E62]/5"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2.5 rounded-xl bg-[#D50032] text-white font-semibold hover:bg-[#b00028] disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
