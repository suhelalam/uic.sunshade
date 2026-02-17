"use client";

import * as React from "react";
import type { FeedPost, FeedComment, FeedUser } from "@/lib/feedTypes";
import {
  subscribeToFeedPosts,
  subscribeToMyLikes,
  subscribeToFeedComments,
  likeFeedPost,
  unlikeFeedPost,
  addFeedComment,
  shareFeedPostWithUser,
  getFeedUsers,
  getFeedUser,
  getFeedPostsByUser,
  ensureFeedUser,
  createFeedPost,
  updateFeedPost,
  deleteFeedPost,
  uploadFeedVideo,
} from "@/lib/feedFirebase";
import { useAuth } from "@/hooks/useAuth";
import { FeedPostCard } from "./FeedPostCard";
import { AddPostModal } from "./AddPostModal";
import { EditPostModal } from "./EditPostModal";
import { CommentSheet } from "./CommentSheet";
import { ShareModal } from "./ShareModal";
import { ProfileModal } from "./ProfileModal";

export function FeedView() {
  const { user, isUicUser } = useAuth();
  const [posts, setPosts] = React.useState<FeedPost[]>([]);
  const [liked, setLiked] = React.useState<Record<string, boolean>>({});
  const [commentPost, setCommentPost] = React.useState<FeedPost | null>(null);
  const [comments, setComments] = React.useState<FeedComment[]>([]);
  const [sharePost, setSharePost] = React.useState<FeedPost | null>(null);
  const [profileUserId, setProfileUserId] = React.useState<string | null>(null);
  const [profileUser, setProfileUser] = React.useState<FeedUser | null>(null);
  const [profilePosts, setProfilePosts] = React.useState<FeedPost[]>([]);
  const [profileLoading, setProfileLoading] = React.useState(false);
  const [addPostOpen, setAddPostOpen] = React.useState(false);
  const [editPost, setEditPost] = React.useState<FeedPost | null>(null);
  const [deleteConfirmPost, setDeleteConfirmPost] = React.useState<FeedPost | null>(null);
  const [toast, setToast] = React.useState<string | null>(null);
  React.useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(t);
  }, [toast]);

  React.useEffect(() => {
    const unsub = subscribeToFeedPosts(setPosts);
    return () => unsub();
  }, []);

  React.useEffect(() => {
    if (!user?.uid) return;
    const unsub = subscribeToMyLikes(user.uid, setLiked);
    return () => unsub();
  }, [user?.uid]);

  React.useEffect(() => {
    if (!commentPost) return;
    const unsub = subscribeToFeedComments(commentPost.id, setComments);
    return () => unsub();
  }, [commentPost?.id]);

  const openProfile = React.useCallback(async (userId: string) => {
    setProfileUserId(userId);
    setProfileUser(null);
    setProfilePosts([]);
    setProfileLoading(true);
    try {
      const [u, postList] = await Promise.all([
        getFeedUser(userId),
        getFeedPostsByUser(userId),
      ]);
      setProfileUser(u);
      setProfilePosts(postList);
    } finally {
      setProfileLoading(false);
    }
  }, []);

  const getPostUrl = (postId: string) => {
    if (typeof window === "undefined") return "";
    return `${window.location.origin}/post/${postId}`;
  };

  return (
    <div className="h-full flex flex-col bg-[#F2F7EB]">
      <div className="flex-1 min-h-0 overflow-y-auto touch-scroll">
        <div className="max-w-lg mx-auto px-3 py-4 space-y-4">
          {posts.length === 0 ? (
            <div className="rounded-2xl border border-[#001E62]/12 bg-white p-8 text-center">
              <p className="text-[#001E62]/80 font-medium">No posts yet.</p>
              <p className="text-sm text-[#001E62]/60 mt-1">Be the first to share a video!</p>
              {isUicUser && (
                <button
                  type="button"
                  onClick={() => setAddPostOpen(true)}
                  className="mt-4 rounded-xl bg-[#D50032] text-white px-5 py-2.5 font-semibold hover:bg-[#b00028]"
                >
                  Add post
                </button>
              )}
            </div>
          ) : (
            <>
              {isUicUser && (
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setAddPostOpen(true)}
                    className="rounded-xl bg-[#D50032] text-white px-4 py-2 text-sm font-semibold hover:bg-[#b00028] flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                    Add post
                  </button>
                </div>
              )}
              {posts.map((post) => (
                <FeedPostCard
                  key={post.id}
                  post={post}
                  isLiked={Boolean(liked[post.id])}
                  isOwner={user?.uid === post.createdBy}
                  onLike={async () => {
                    if (!user) return;
                    if (liked[post.id]) await unlikeFeedPost(post.id);
                    else await likeFeedPost(post.id);
                  }}
                  onComment={() => setCommentPost(post)}
                  onShare={() => setSharePost(post)}
                  onProfile={openProfile}
                  onEdit={user?.uid === post.createdBy ? () => setEditPost(post) : undefined}
                  onDelete={user?.uid === post.createdBy ? () => setDeleteConfirmPost(post) : undefined}
                />
              ))}
            </>
          )}
        </div>
      </div>

      {addPostOpen && (
        <AddPostModal
          onClose={() => setAddPostOpen(false)}
          uploadVideo={uploadFeedVideo}
          onSubmit={async (payload) => {
            await ensureFeedUser();
            await createFeedPost(payload);
            setAddPostOpen(false);
            setToast("Post shared!");
          }}
        />
      )}

      {editPost && (
        <EditPostModal
          post={editPost}
          onClose={() => setEditPost(null)}
          onSave={async (caption) => {
            await updateFeedPost(editPost.id, { caption });
            setToast("Caption updated");
          }}
        />
      )}

      {deleteConfirmPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-bold text-[#001E62]">Delete post?</h3>
            <p className="text-sm text-[#333333] mt-2">This cannot be undone.</p>
            <div className="flex gap-2 mt-4">
              <button
                type="button"
                onClick={() => setDeleteConfirmPost(null)}
                className="flex-1 py-2.5 rounded-xl border border-[#001E62]/20 text-[#001E62] font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  const post = deleteConfirmPost;
                  setDeleteConfirmPost(null);
                  try {
                    await deleteFeedPost(post.id);
                    setToast("Post deleted");
                  } catch {
                    setToast("Could not delete post");
                  }
                }}
                className="flex-1 py-2.5 rounded-xl bg-[#D50032] text-white font-semibold hover:bg-[#b00028]"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {commentPost && (
        <CommentSheet
          post={commentPost}
          comments={comments}
          onClose={() => setCommentPost(null)}
          onAddComment={(text) => addFeedComment(commentPost.id, text)}
          currentUserId={user?.uid ?? null}
        />
      )}

      {sharePost && user && (
        <ShareModal
          postId={sharePost.id}
          postUrl={getPostUrl(sharePost.id)}
          onClose={() => setSharePost(null)}
          onShareWithUser={(toUserId) => shareFeedPostWithUser(sharePost.id, toUserId)}
          getUsers={getFeedUsers}
          currentUserId={user.uid}
        />
      )}

      {profileUserId !== null && (
        <ProfileModal
          user={profileUser}
          posts={profilePosts}
          loading={profileLoading}
          onClose={() => {
            setProfileUserId(null);
            setProfileUser(null);
            setProfilePosts([]);
          }}
          currentUserId={user?.uid ?? null}
          onEditPost={
            profileUserId === user?.uid
              ? (post) => {
                  setProfileUserId(null);
                  setProfileUser(null);
                  setProfilePosts([]);
                  setEditPost(post);
                }
              : undefined
          }
          onDeletePost={
            profileUserId === user?.uid
              ? (post) => {
                  setProfileUserId(null);
                  setProfileUser(null);
                  setProfilePosts([]);
                  setDeleteConfirmPost(post);
                }
              : undefined
          }
        />
      )}

      {toast && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 rounded-xl bg-[#001E62] text-white px-4 py-2 text-sm font-medium shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}
