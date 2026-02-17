"use client";

import * as React from "react";
import type { FeedUser } from "@/lib/feedTypes";

type Props = {
  postId: string;
  postUrl: string;
  onClose: () => void;
  onShareWithUser: (toUserId: string) => Promise<void>;
  getUsers: (search?: string) => Promise<FeedUser[]>;
  currentUserId: string;
};

export function ShareModal({
  postId,
  postUrl,
  onClose,
  onShareWithUser,
  getUsers,
  currentUserId,
}: Props) {
  const [copied, setCopied] = React.useState(false);
  const [shareTab, setShareTab] = React.useState<"link" | "friend">("link");
  const [users, setUsers] = React.useState<FeedUser[]>([]);
  const [search, setSearch] = React.useState("");
  const [sharingTo, setSharingTo] = React.useState<string | null>(null);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(postUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  const webShare = async () => {
    if (typeof navigator.share === "undefined") {
      copyLink();
      return;
    }
    try {
      await navigator.share({
        title: "Sunshade post",
        url: postUrl,
        text: "Check out this post on Sunshade",
      });
      onClose();
    } catch {
      copyLink();
    }
  };

  React.useEffect(() => {
    let cancelled = false;
    getUsers(search || undefined).then((list) => {
      if (!cancelled) setUsers(list.filter((u) => u.uid !== currentUserId));
    });
    return () => { cancelled = true; };
  }, [search, currentUserId, getUsers]);

  const handleShareToUser = async (toUserId: string) => {
    setSharingTo(toUserId);
    try {
      await onShareWithUser(toUserId);
      onClose();
    } finally {
      setSharingTo(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4">
      <div
        className="bg-white w-full max-h-[85vh] overflow-hidden rounded-t-2xl sm:rounded-2xl shadow-xl flex flex-col max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#001E62]/12">
          <h2 className="text-lg font-bold text-[#001E62]">Share</h2>
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
        <div className="flex border-b border-[#001E62]/10">
          <button
            type="button"
            onClick={() => setShareTab("link")}
            className={`flex-1 py-3 text-sm font-semibold ${shareTab === "link" ? "text-[#D50032] border-b-2 border-[#D50032]" : "text-[#001E62]/70"}`}
          >
            Link
          </button>
          <button
            type="button"
            onClick={() => setShareTab("friend")}
            className={`flex-1 py-3 text-sm font-semibold ${shareTab === "friend" ? "text-[#D50032] border-b-2 border-[#D50032]" : "text-[#001E62]/70"}`}
          >
            Share with friend
          </button>
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto touch-scroll p-4">
          {shareTab === "link" ? (
            <div className="space-y-3">
              <p className="text-sm text-[#333333]">Anyone with this link can view the post.</p>
              <div className="flex gap-2">
                <input
                  readOnly
                  value={postUrl}
                  className="flex-1 rounded-lg border border-[#001E62]/20 px-3 py-2 text-sm text-[#333333] bg-[#F2F7EB]/50"
                />
                <button
                  type="button"
                  onClick={copyLink}
                  className="rounded-lg bg-[#001E62] text-white px-4 py-2 text-sm font-semibold hover:bg-[#00154a]"
                >
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
              <button
                type="button"
                onClick={webShare}
                className="w-full rounded-xl border-2 border-[#D50032] text-[#D50032] py-2.5 text-sm font-semibold hover:bg-[#D50032]/10"
              >
                Share via…
              </button>
            </div>
          ) : (
            <div>
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or email..."
                className="w-full rounded-xl border border-[#001E62]/20 px-3 py-2 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-[#D50032]/30"
              />
              <ul className="space-y-1">
                {users.slice(0, 20).map((u) => (
                  <li key={u.uid}>
                    <button
                      type="button"
                      onClick={() => handleShareToUser(u.uid)}
                      disabled={sharingTo !== null}
                      className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-[#F2F7EB]/80 disabled:opacity-50"
                    >
                      <div className="h-10 w-10 rounded-full bg-[#001E62]/10 overflow-hidden shrink-0">
                        {u.photoURL ? (
                          <img src={u.photoURL} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-[#001E62] font-semibold">
                            {(u.displayName || u.email || "?")[0].toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="text-left min-w-0 flex-1">
                        <p className="font-medium text-[#001E62] truncate">{u.displayName || "No name"}</p>
                        {u.email ? (
                          <p className="text-xs text-[#001E62]/60 truncate">{u.email}</p>
                        ) : null}
                      </div>
                      {sharingTo === u.uid ? (
                        <span className="text-sm text-[#001E62]/60">Sending…</span>
                      ) : (
                        <span className="text-sm text-[#D50032] font-medium">Send</span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
              {users.length === 0 && search.trim() ? (
                <p className="text-sm text-[#001E62]/60 py-4">No users found.</p>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
