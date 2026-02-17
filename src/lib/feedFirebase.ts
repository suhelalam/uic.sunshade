/**
 * Firebase helpers for the campus Feed: posts, likes, comments, shares, users.
 * Uses db, auth, storage from firebase.ts. UIC-only (isUicEmail).
 *
 * Feed behavior (Instagram-style):
 * - All users see the same feed; newest first. Only the post owner can edit (caption) or delete their post.
 */
import {
  collection,
  addDoc,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  runTransaction,
  increment,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import type { Unsubscribe } from "firebase/firestore";
import { db, auth, storage, isUicEmail } from "./firebase";
import type { FeedPost, FeedComment, FeedUser } from "./feedTypes";

const FEED_COLLECTION = "feedPosts";
const LIKES_COLLECTION = "feedLikes";
const COMMENTS_COLLECTION = "feedComments";
const SHARES_COLLECTION = "feedShares";
const USERS_COLLECTION = "feedUsers";
const CAMPUS_PATH = "campuses/uic";

function feedPostsCol() {
  return collection(db, CAMPUS_PATH, FEED_COLLECTION);
}
function feedPostRef(postId: string) {
  return doc(db, CAMPUS_PATH, FEED_COLLECTION, postId);
}
function feedLikesCol() {
  return collection(db, CAMPUS_PATH, LIKES_COLLECTION);
}
function feedCommentsCol() {
  return collection(db, CAMPUS_PATH, COMMENTS_COLLECTION);
}
function feedSharesCol() {
  return collection(db, CAMPUS_PATH, SHARES_COLLECTION);
}
function feedUsersCol() {
  return collection(db, CAMPUS_PATH, USERS_COLLECTION);
}
function feedUserRef(uid: string) {
  return doc(db, CAMPUS_PATH, USERS_COLLECTION, uid);
}

/** Ensure current user exists in feedUsers (create/update). Call after login or before posting. */
export async function ensureFeedUser(): Promise<void> {
  const user = auth.currentUser;
  if (!user || !isUicEmail(user.email)) return;
  const userRef = feedUserRef(user.uid);
  await setDoc(userRef, {
    uid: user.uid,
    email: user.email ?? null,
    displayName: user.displayName ?? null,
    photoURL: user.photoURL ?? null,
    updatedAt: Date.now(),
  }, { merge: true });
}

/** Upload a video file to Storage and return its download URL. */
export async function uploadFeedVideo(file: File): Promise<string> {
  const user = auth.currentUser;
  if (!user) throw new Error("You must be signed in to upload videos.");
  if (!isUicEmail(user.email)) throw new Error("Only @uic.edu users can post to the feed.");
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = `feed/${user.uid}/${Date.now()}-${safeName}`;
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
}

/** Create a new feed post. Call ensureFeedUser() before if needed. */
export async function createFeedPost(payload: {
  videoUrl: string;
  caption: string;
}): Promise<string> {
  const user = auth.currentUser;
  if (!user) throw new Error("You must be signed in to post.");
  if (!isUicEmail(user.email)) throw new Error("Only @uic.edu users can post.");
  const ref = await addDoc(feedPostsCol(), {
    videoUrl: payload.videoUrl,
    caption: payload.caption.trim(),
    createdBy: user.uid,
    createdByName: user.displayName || user.email || "Anonymous",
    createdByPhotoURL: user.photoURL ?? null,
    createdAt: serverTimestamp(),
    likeCount: 0,
    commentCount: 0,
  });
  return ref.id;
}

/** Update a feed post (caption only). Only the post owner can update. */
export async function updateFeedPost(
  postId: string,
  payload: { caption: string }
): Promise<void> {
  const user = auth.currentUser;
  if (!user) throw new Error("You must be signed in to edit.");
  const postRef = feedPostRef(postId);
  const snap = await getDoc(postRef);
  if (!snap.exists()) throw new Error("Post not found.");
  const data = snap.data() as { createdBy: string };
  if (data.createdBy !== user.uid) throw new Error("You can only edit your own posts.");
  await updateDoc(postRef, { caption: payload.caption.trim() });
}

/** Delete a feed post. Only the post owner can delete. */
export async function deleteFeedPost(postId: string): Promise<void> {
  const user = auth.currentUser;
  if (!user) throw new Error("You must be signed in to delete.");
  const postRef = feedPostRef(postId);
  const snap = await getDoc(postRef);
  if (!snap.exists()) throw new Error("Post not found.");
  const data = snap.data() as { createdBy: string };
  if (data.createdBy !== user.uid) throw new Error("You can only delete your own posts.");
  await deleteDoc(postRef);
}

/** Map Firestore doc to FeedPost (createdAt may be Timestamp). */
function toFeedPost(id: string, data: Record<string, unknown>): FeedPost {
  const createdAt = data.createdAt;
  const ts =
    typeof createdAt?.toMillis === "function"
      ? (createdAt as Timestamp).toMillis()
      : typeof createdAt === "number"
        ? createdAt
        : Date.now();
  return {
    id,
    videoUrl: (data.videoUrl as string) ?? "",
    thumbnailUrl: data.thumbnailUrl as string | undefined,
    caption: (data.caption as string) ?? "",
    createdBy: (data.createdBy as string) ?? "",
    createdByName: (data.createdByName as string) ?? "",
    createdByPhotoURL: (data.createdByPhotoURL as string | null) ?? null,
    createdAt: ts,
    likeCount: (data.likeCount as number) ?? 0,
    commentCount: (data.commentCount as number) ?? 0,
  };
}

/** Subscribe to all feed posts. Every user sees the same feed; newest first. Owner can edit/delete their own. */
export function subscribeToFeedPosts(callback: (posts: FeedPost[]) => void): Unsubscribe {
  const q = query(
    feedPostsCol(),
    orderBy("createdAt", "desc"),
    limit(500)
  );
  return onSnapshot(q, (snap) => {
    const posts = snap.docs.map((d) => toFeedPost(d.id, d.data() as Record<string, unknown>));
    callback(posts);
  });
}

/** Subscribe to posts shared with the current user (for feed merge). */
export function subscribeToSharedWithMe(
  userId: string,
  callback: (postIds: string[]) => void
): Unsubscribe {
  const q = query(
    feedSharesCol(),
    where("toUserId", "==", userId),
    limit(50)
  );
  return onSnapshot(q, (snap) => {
    const postIds = snap.docs.map((d) => (d.data() as { postId: string }).postId);
    callback(postIds);
  });
}

/** Get a single post by ID (for /post/[id] and share link). */
export async function getFeedPost(postId: string): Promise<FeedPost | null> {
  const d = await getDoc(feedPostRef(postId));
  if (!d.exists()) return null;
  return toFeedPost(d.id, d.data() as Record<string, unknown>);
}

const likeDocId = (postId: string, userId: string) => `${postId}_${userId}`;

/** Check if current user has liked a post. */
export async function hasLikedPost(postId: string, userId: string): Promise<boolean> {
  const likeRef = doc(db, CAMPUS_PATH, LIKES_COLLECTION, likeDocId(postId, userId));
  const snap = await getDoc(likeRef);
  return snap.exists();
}

/** Subscribe to "liked by current user" for a set of post IDs. Returns map postId -> liked. */
export function subscribeToMyLikes(
  userId: string,
  callback: (liked: Record<string, boolean>) => void
): Unsubscribe {
  const q = query(
    feedLikesCol(),
    where("userId", "==", userId),
    limit(200)
  );
  return onSnapshot(q, (snap) => {
    const liked: Record<string, boolean> = {};
    snap.docs.forEach((d) => {
      const data = d.data() as { postId: string };
      liked[data.postId] = true;
    });
    callback(liked);
  });
}

/** Like a post (idempotent). */
export async function likeFeedPost(postId: string): Promise<void> {
  const user = auth.currentUser;
  if (!user) throw new Error("You must be signed in to like.");
  const postRef = feedPostRef(postId);
  const likeRef = doc(db, CAMPUS_PATH, LIKES_COLLECTION, likeDocId(postId, user.uid));
  await runTransaction(db, async (tx) => {
    const snap = await tx.get(likeRef);
    if (snap.exists()) return;
    tx.set(likeRef, { postId, userId: user.uid });
    tx.update(postRef, { likeCount: increment(1) });
  });
}

/** Unlike a post. */
export async function unlikeFeedPost(postId: string): Promise<void> {
  const user = auth.currentUser;
  if (!user) return;
  const likeRef = doc(db, CAMPUS_PATH, LIKES_COLLECTION, likeDocId(postId, user.uid));
  const snap = await getDoc(likeRef);
  if (!snap.exists()) return;
  const postRef = feedPostRef(postId);
  await runTransaction(db, async (tx) => {
    tx.delete(likeRef);
    tx.update(postRef, { likeCount: increment(-1) });
  });
}

/** Add a comment and increment post commentCount. */
export async function addFeedComment(
  postId: string,
  text: string
): Promise<string> {
  const user = auth.currentUser;
  if (!user) throw new Error("You must be signed in to comment.");
  const postRef = feedPostRef(postId);
  const commentRef = await addDoc(feedCommentsCol(), {
    postId,
    userId: user.uid,
    userDisplayName: user.displayName || user.email || "Anonymous",
    userPhotoURL: user.photoURL ?? null,
    text: text.trim(),
    createdAt: serverTimestamp(),
  });
  await updateDoc(postRef, { commentCount: increment(1) });
  return commentRef.id;
}

/** Subscribe to comments for a post. */
export function subscribeToFeedComments(
  postId: string,
  callback: (comments: FeedComment[]) => void
): Unsubscribe {
  const q = query(
    feedCommentsCol(),
    where("postId", "==", postId),
    limit(100)
  );
  return onSnapshot(q, (snap) => {
    const comments: FeedComment[] = snap.docs.map((d) => {
      const data = d.data() as Record<string, unknown>;
      const createdAt = data.createdAt;
      const ts =
        typeof (createdAt as Timestamp)?.toMillis === "function"
          ? (createdAt as Timestamp).toMillis()
          : typeof createdAt === "number"
            ? createdAt
            : Date.now();
      return {
        id: d.id,
        postId: data.postId as string,
        userId: data.userId as string,
        userDisplayName: (data.userDisplayName as string) ?? "",
        userPhotoURL: (data.userPhotoURL as string | null) ?? null,
        text: (data.text as string) ?? "",
        createdAt: ts,
      };
    });
    comments.sort((a, b) => a.createdAt - b.createdAt);
    callback(comments);
  });
}

/** Share post with another user (by uid). */
export async function shareFeedPostWithUser(postId: string, toUserId: string): Promise<void> {
  const user = auth.currentUser;
  if (!user) throw new Error("You must be signed in to share.");
  await addDoc(feedSharesCol(), {
    postId,
    fromUserId: user.uid,
    toUserId,
    createdAt: serverTimestamp(),
  });
}

/** Get feed users (for share-with-friend picker and profiles). */
export async function getFeedUsers(search?: string): Promise<FeedUser[]> {
  const snap = await getDocs(feedUsersCol());
  let list = snap.docs.map((d) => {
    const data = d.data() as Record<string, unknown>;
    return {
      uid: d.id,
      email: (data.email as string | null) ?? null,
      displayName: (data.displayName as string | null) ?? null,
      photoURL: (data.photoURL as string | null) ?? null,
      updatedAt: (data.updatedAt as number) ?? 0,
    };
  });
  if (search?.trim()) {
    const s = search.trim().toLowerCase();
    list = list.filter(
      (u) =>
        u.displayName?.toLowerCase().includes(s) ||
        u.email?.toLowerCase().includes(s)
    );
  }
  return list;
}

/** Get a single feed user by uid. */
export async function getFeedUser(uid: string): Promise<FeedUser | null> {
  const d = await getDoc(feedUserRef(uid));
  if (!d.exists()) return null;
  const data = d.data() as Record<string, unknown>;
  return {
    uid: d.id,
    email: (data.email as string | null) ?? null,
    displayName: (data.displayName as string | null) ?? null,
    photoURL: (data.photoURL as string | null) ?? null,
    updatedAt: (data.updatedAt as number) ?? 0,
  };
}

/** Get posts by a specific user (for profile). */
export async function getFeedPostsByUser(uid: string): Promise<FeedPost[]> {
  const q = query(
    feedPostsCol(),
    where("createdBy", "==", uid),
    limit(50)
  );
  const snap = await getDocs(q);
  const posts = snap.docs.map((d) => toFeedPost(d.id, d.data() as Record<string, unknown>));
  posts.sort((a, b) => b.createdAt - a.createdAt);
  return posts;
}
