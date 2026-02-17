/**
 * Types for the campus Feed (Instagram-like): posts, comments, likes, shares, users.
 */

export type FeedUser = {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  updatedAt: number;
};

export type FeedPost = {
  id: string;
  videoUrl: string;
  thumbnailUrl?: string;
  caption: string;
  createdBy: string;
  createdByName: string;
  createdByPhotoURL: string | null;
  createdAt: number;
  likeCount: number;
  commentCount: number;
};

export type FeedComment = {
  id: string;
  postId: string;
  userId: string;
  userDisplayName: string;
  userPhotoURL: string | null;
  text: string;
  createdAt: number;
};

export type FeedLike = {
  postId: string;
  userId: string;
};

export type FeedShare = {
  id: string;
  postId: string;
  fromUserId: string;
  toUserId: string;
  createdAt: number;
};
