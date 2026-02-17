"use client";

import * as React from "react";
import type { FeedPost, FeedComment } from "@/lib/feedTypes";

type Props = {
  post: FeedPost;
  comments: FeedComment[];
  onClose: () => void;
  onAddComment: (text: string) => Promise<void>;
  currentUserId: string | null;
};

export function CommentSheet({
  post,
  comments,
  onClose,
  onAddComment,
  currentUserId,
}: Props) {
  const [text, setText] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const bottomRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [comments.length]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const t = text.trim();
    if (!t || !currentUserId) return;
    setSubmitting(true);
    try {
      await onAddComment(t);
      setText("");
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    if (diff < 60000) return "Just now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return d.toLocaleDateString();
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white sm:max-w-md sm:left-auto sm:right-4 sm:top-4 sm:bottom-4 sm:rounded-2xl sm:shadow-xl">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#001E62]/12 shrink-0">
        <h2 className="text-lg font-bold text-[#001E62]">Comments</h2>
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
      <div className="flex-1 min-h-0 overflow-y-auto touch-scroll px-4 py-3">
        {comments.length === 0 ? (
          <p className="text-sm text-[#001E62]/60 py-4">No comments yet. Be the first!</p>
        ) : (
          <ul className="space-y-3">
            {comments.map((c) => (
              <li key={c.id} className="flex gap-3">
                <div className="h-8 w-8 shrink-0 rounded-full bg-[#001E62]/10 overflow-hidden">
                  {c.userPhotoURL ? (
                    <img src={c.userPhotoURL} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-[#001E62] font-semibold text-xs">
                      {(c.userDisplayName || "?")[0].toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm">
                    <span className="font-semibold text-[#001E62]">{c.userDisplayName}</span>
                    <span className="text-[#001E62]/60 text-xs ml-2">{formatTime(c.createdAt)}</span>
                  </p>
                  <p className="text-[#333333] text-sm break-words mt-0.5">{c.text}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
        <div ref={bottomRef} />
      </div>
      {currentUserId ? (
        <form onSubmit={handleSubmit} className="p-3 border-t border-[#001E62]/12 shrink-0">
          <div className="flex gap-2">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 rounded-xl border border-[#001E62]/20 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#D50032]/30 focus:border-[#D50032]"
              disabled={submitting}
            />
            <button
              type="submit"
              disabled={!text.trim() || submitting}
              className="rounded-xl bg-[#D50032] text-white px-4 py-2 text-sm font-semibold hover:bg-[#b00028] disabled:opacity-50"
            >
              Post
            </button>
          </div>
        </form>
      ) : (
        <p className="p-3 text-sm text-[#001E62]/60 border-t border-[#001E62]/12">
          Sign in to comment.
        </p>
      )}
    </div>
  );
}
