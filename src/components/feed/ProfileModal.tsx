"use client";

import * as React from "react";
import type { FeedUser, FeedPost } from "@/lib/feedTypes";

type Props = {
  user: FeedUser | null;
  posts: FeedPost[];
  loading: boolean;
  onClose: () => void;
  onPostSelect?: (post: FeedPost) => void;
  /** When viewing your own profile, show edit/delete per post */
  currentUserId?: string | null;
  onEditPost?: (post: FeedPost) => void;
  onDeletePost?: (post: FeedPost) => void;
};

export function ProfileModal({
  user,
  posts,
  loading,
  onClose,
  onPostSelect,
  currentUserId,
  onEditPost,
  onDeletePost,
}: Props) {
  const isOwnProfile = Boolean(user && currentUserId && user.uid === currentUserId);
  const [menuPostId, setMenuPostId] = React.useState<string | null>(null);
  const menuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!menuPostId) return;
    const close = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuPostId(null);
    };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [menuPostId]);
  if (!user && !loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full text-center">
          <p className="text-[#333333]">User not found.</p>
          <button
            type="button"
            onClick={onClose}
            className="mt-4 rounded-xl bg-[#D50032] text-white px-4 py-2 font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white sm:max-w-md sm:left-auto sm:right-4 sm:top-4 sm:bottom-4 sm:rounded-2xl sm:shadow-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#001E62]/12 shrink-0">
        <h2 className="text-lg font-bold text-[#001E62]">Profile</h2>
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
      <div className="flex-1 min-h-0 overflow-y-auto touch-scroll">
        {loading ? (
          <div className="p-8 text-center text-[#001E62]/60">Loading…</div>
        ) : user ? (
          <>
            <div className="p-6 flex flex-col items-center border-b border-[#001E62]/10">
              <div className="h-20 w-20 rounded-full bg-[#001E62]/10 overflow-hidden mb-3">
                {user.photoURL ? (
                  <img src={user.photoURL} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-[#001E62] text-2xl font-bold">
                    {(user.displayName || user.email || "?")[0].toUpperCase()}
                  </div>
                )}
              </div>
              <p className="font-bold text-[#001E62] text-lg">{user.displayName || "Anonymous"}</p>
              {user.email ? (
                <p className="text-sm text-[#001E62]/60 mt-0.5">{user.email}</p>
              ) : null}
            </div>
            <div className="p-4">
              <h3 className="text-sm font-bold text-[#001E62] uppercase tracking-wider mb-3">
                Posts ({posts.length})
              </h3>
              {posts.length === 0 ? (
                <p className="text-sm text-[#001E62]/60 py-4">No posts yet.</p>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {posts.map((post) => (
                    <div key={post.id} className="relative aspect-square rounded-lg bg-black overflow-hidden group">
                      <button
                        type="button"
                        onClick={() => onPostSelect?.(post)}
                        className="absolute inset-0 w-full h-full"
                      >
                        <video
                          src={post.videoUrl}
                          className="w-full h-full object-cover pointer-events-none"
                          muted
                          playsInline
                          preload="metadata"
                        />
                      </button>
                      {isOwnProfile && (onEditPost || onDeletePost) && (
                        <div className="absolute top-1 right-1" ref={menuPostId === post.id ? menuRef : undefined}>
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); setMenuPostId(menuPostId === post.id ? null : post.id); }}
                            className="p-1.5 rounded-full bg-black/50 text-white hover:bg-black/70"
                            aria-label="Options"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                              <circle cx="12" cy="5" r="1.5" />
                              <circle cx="12" cy="12" r="1.5" />
                              <circle cx="12" cy="19" r="1.5" />
                            </svg>
                          </button>
                          {menuPostId === post.id && (
                            <div className="absolute right-0 top-full mt-1 py-1 min-w-[120px] rounded-lg bg-white border border-[#001E62]/15 shadow-lg z-10">
                              {onEditPost && (
                                <button
                                  type="button"
                                  onClick={() => { setMenuPostId(null); onEditPost(post); }}
                                  className="w-full px-3 py-2 text-left text-sm text-[#001E62] hover:bg-[#F2F7EB]"
                                >
                                  Edit
                                </button>
                              )}
                              {onDeletePost && (
                                <button
                                  type="button"
                                  onClick={() => { setMenuPostId(null); onDeletePost(post); }}
                                  className="w-full px-3 py-2 text-left text-sm text-[#D50032] hover:bg-[#D50032]/10"
                                >
                                  Delete
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
