"use client";

import * as React from "react";
import type { FeedPost } from "@/lib/feedTypes";

type Props = {
  post: FeedPost;
  isLiked: boolean;
  isOwner: boolean;
  onLike: () => void;
  onComment: () => void;
  onShare: () => void;
  onProfile: (userId: string) => void;
  onEdit?: () => void;
  onDelete?: () => void;
};

export function FeedPostCard({
  post,
  isLiked,
  isOwner,
  onLike,
  onComment,
  onShare,
  onProfile,
  onEdit,
  onDelete,
}: Props) {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = React.useState(false);
  const [menuOpen, setMenuOpen] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!menuOpen) return;
    const close = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [menuOpen]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (playing) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setPlaying(!playing);
  };

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    if (diff < 60000) return "Just now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`;
    return d.toLocaleDateString();
  };

  return (
    <article className="rounded-xl border border-[#001E62]/12 bg-white shadow-sm overflow-hidden">
      {/* Author row */}
      <div className="flex items-center gap-3 px-3 py-2.5 border-b border-[#001E62]/10">
        <button
          type="button"
          onClick={() => onProfile(post.createdBy)}
          className="flex items-center gap-3 min-w-0 flex-1 text-left"
        >
          <div className="h-9 w-9 shrink-0 rounded-full bg-[#001E62]/10 overflow-hidden">
            {post.createdByPhotoURL ? (
              <img
                src={post.createdByPhotoURL}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-[#001E62] font-semibold text-sm">
                {(post.createdByName || "?")[0].toUpperCase()}
              </div>
            )}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-[#001E62] truncate">
              {post.createdByName || "Anonymous"}
            </p>
            <p className="text-xs text-[#001E62]/60">{formatTime(post.createdAt)}</p>
          </div>
        </button>
        {isOwner && (onEdit || onDelete) && (
          <div className="relative shrink-0" ref={menuRef}>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setMenuOpen((o) => !o); }}
              className="p-2 rounded-full text-[#001E62]/70 hover:bg-[#001E62]/10"
              aria-label="More options"
              aria-expanded={menuOpen}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="5" r="1.5" />
                <circle cx="12" cy="12" r="1.5" />
                <circle cx="12" cy="19" r="1.5" />
              </svg>
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-full mt-1 py-1 min-w-[140px] rounded-xl bg-white border border-[#001E62]/15 shadow-lg z-10">
                {onEdit && (
                  <button
                    type="button"
                    onClick={() => { setMenuOpen(false); onEdit(); }}
                    className="w-full px-4 py-2.5 text-left text-sm font-medium text-[#001E62] hover:bg-[#F2F7EB]"
                  >
                    Edit
                  </button>
                )}
                {onDelete && (
                  <button
                    type="button"
                    onClick={() => { setMenuOpen(false); onDelete(); }}
                    className="w-full px-4 py-2.5 text-left text-sm font-medium text-[#D50032] hover:bg-[#D50032]/10"
                  >
                    Delete
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Video */}
      <div
        className="relative aspect-[4/5] max-h-[70vh] bg-black cursor-pointer flex items-center justify-center"
        onClick={togglePlay}
      >
        <video
          ref={videoRef}
          src={post.videoUrl}
          poster={post.thumbnailUrl}
          className="w-full h-full object-contain"
          loop
          muted={false}
          playsInline
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
        />
        {!playing && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
            <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center">
              <svg className="w-7 h-7 text-[#001E62] ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
        )}
      </div>

      {/* Actions + caption */}
      <div className="px-3 py-2">
        <div className="flex items-center gap-4 mb-2">
          <button
            type="button"
            onClick={onLike}
            className="flex items-center gap-1.5 text-[#001E62]/80 hover:text-[#D50032] transition-colors"
            aria-label={isLiked ? "Unlike" : "Like"}
          >
            {isLiked ? (
              <svg className="w-6 h-6 text-[#D50032]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            )}
            <span className="text-sm font-medium">{post.likeCount > 0 ? post.likeCount : ""}</span>
          </button>
          <button
            type="button"
            onClick={onComment}
            className="flex items-center gap-1.5 text-[#001E62]/80 hover:text-[#001E62] transition-colors"
            aria-label="Comments"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span className="text-sm font-medium">{post.commentCount > 0 ? post.commentCount : ""}</span>
          </button>
          <button
            type="button"
            onClick={onShare}
            className="flex items-center gap-1.5 text-[#001E62]/80 hover:text-[#001E62] transition-colors"
            aria-label="Share"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
          </button>
        </div>
        {post.caption ? (
          <p className="text-sm text-[#333333] break-words">
            <button
              type="button"
              onClick={() => onProfile(post.createdBy)}
              className="font-semibold text-[#001E62] hover:underline mr-1"
            >
              {post.createdByName || "Anonymous"}
            </button>
            {post.caption}
          </p>
        ) : null}
      </div>
    </article>
  );
}
