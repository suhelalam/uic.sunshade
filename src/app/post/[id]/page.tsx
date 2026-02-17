"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getFeedPost } from "@/lib/feedFirebase";
import type { FeedPost } from "@/lib/feedTypes";
import { useAuth } from "@/hooks/useAuth";

export default function PostPage() {
  const params = useParams();
  const id = typeof params?.id === "string" ? params.id : null;
  const { user } = useAuth();
  const [post, setPost] = React.useState<FeedPost | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!id) {
      setLoading(false);
      setError("Invalid post");
      return;
    }
    getFeedPost(id)
      .then((p) => {
        setPost(p);
        setError(p ? null : "Post not found");
      })
      .catch(() => setError("Could not load post"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F2F7EB] flex items-center justify-center">
        <p className="text-[#001E62]/70">Loading…</p>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-[#F2F7EB] flex flex-col items-center justify-center p-4">
        <p className="text-[#333333] mb-4">{error || "Post not found"}</p>
        <Link
          href="/"
          className="rounded-xl bg-[#D50032] text-white px-5 py-2.5 font-semibold hover:bg-[#b00028]"
        >
          Open Sunshade
        </Link>
      </div>
    );
  }

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-[#F2F7EB] flex flex-col">
      <header className="shrink-0 bg-[#001E62] border-b-2 border-[#D50032] px-4 py-3">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="text-white/90 hover:text-white font-semibold text-sm flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Sunshade
          </Link>
          {!user && (
            <Link
              href="/"
              className="rounded-lg bg-white text-[#001E62] px-3 py-1.5 text-sm font-semibold hover:bg-white/90"
            >
              Sign in
            </Link>
          )}
        </div>
      </header>
      <main className="flex-1 max-w-lg mx-auto w-full p-4">
        <article className="rounded-xl border border-[#001E62]/12 bg-white shadow-sm overflow-hidden">
          <div className="flex items-center gap-3 px-3 py-2.5 border-b border-[#001E62]/10">
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
            <div>
              <p className="font-semibold text-[#001E62]">{post.createdByName || "Anonymous"}</p>
              <p className="text-xs text-[#001E62]/60">{formatTime(post.createdAt)}</p>
            </div>
          </div>
          <div className="aspect-[4/5] max-h-[70vh] bg-black">
            <video
              src={post.videoUrl}
              poster={post.thumbnailUrl}
              className="w-full h-full object-contain"
              controls
              playsInline
              loop
            />
          </div>
          <div className="px-3 py-2">
            <p className="text-sm text-[#001E62]/70">
              {post.likeCount} {post.likeCount === 1 ? "like" : "likes"} · {post.commentCount}{" "}
              {post.commentCount === 1 ? "comment" : "comments"}
            </p>
            {post.caption ? (
              <p className="text-sm text-[#333333] mt-1 break-words">
                <span className="font-semibold text-[#001E62]">{post.createdByName}</span>{" "}
                {post.caption}
              </p>
            ) : null}
          </div>
        </article>
        <p className="text-center text-sm text-[#001E62]/60 mt-4">
          Open the app to like, comment, and share.
        </p>
        <div className="flex justify-center mt-4">
          <Link
            href="/"
            className="rounded-xl bg-[#D50032] text-white px-5 py-2.5 font-semibold hover:bg-[#b00028]"
          >
            Open Sunshade
          </Link>
        </div>
      </main>
    </div>
  );
}
