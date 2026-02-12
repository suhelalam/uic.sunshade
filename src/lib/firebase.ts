/**
 * Firebase client initialization and simple event helpers.
 * Requires the following env vars in .env.local:
 * NEXT_PUBLIC_FIREBASE_API_KEY, NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
 * NEXT_PUBLIC_FIREBASE_PROJECT_ID, NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
 * NEXT_PUBLIC_FIREBASE_APP_ID
= * Optional for Storage (event images): NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
 * (defaults to {projectId}.appspot.com if not set)
 */
import { initializeApp, getApps } from "firebase/app";
import type { FirebaseApp, FirebaseOptions } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, type User } from "firebase/auth";
import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  getDoc,
  runTransaction,
  increment,
} from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import type {
  Unsubscribe,
  QueryDocumentSnapshot,
  DocumentData,
} from "firebase/firestore";

import type { MapEvent } from "./types";

const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  storageBucket:
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
    (projectId ? `${projectId}.appspot.com` : undefined),
};

let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
const googleProvider = new GoogleAuthProvider();

/** Check if email is from UIC domain */
export function isUicEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return email.toLowerCase().endsWith("@uic.edu");
}

/** Sign in with Google, but only allow @uic.edu emails */
export async function signInWithGoogle(): Promise<void> {
  const result = await signInWithPopup(auth, googleProvider);
  const email = result.user.email;
  if (!isUicEmail(email)) {
    await signOut(auth);
    throw new Error("Only @uic.edu email addresses are allowed.");
  }
}

/** Sign out current user */
export async function signOutUser(): Promise<void> {
  await signOut(auth);
}

export type FirestoreEvent = {
  title: string;
  dateISO: string;
  location: { lng: number; lat: number };
  address?: string;
  roomNumber?: string;
  imageUrl?: string;
  creatorPhotoUrl?: string;
  details?: string;
  extraInfo?: string;
  organizer?: string;
  createdBy: string; // User UID
  createdByName?: string; // User display name or email
  createdAt?: any; // serverTimestamp()
  attendCount?: number;
  attendees?: Record<string, unknown>;
};

type MapEventWithId = MapEvent & { id: string };

export function subscribeToEvents(callback: (rows: MapEventWithId[]) => void): Unsubscribe {
  // Firestore path: campuses / uic / events
  const q = query(collection(db, "campuses", "uic", "events"), orderBy("dateISO", "desc"));
  return onSnapshot(q, (snap) => {
    const items = snap.docs.map((d: QueryDocumentSnapshot<DocumentData>) => {
      const data = d.data() as FirestoreEvent;
      return {
        id: d.id,
        title: data.title,
        dateISO: data.dateISO,
        location: data.location,
        address: data.address,
        roomNumber: data.roomNumber,
        imageUrl: data.imageUrl,
        creatorPhotoUrl: data.creatorPhotoUrl,
        details: data.details,
        extraInfo: data.extraInfo,
        organizer: data.organizer,
        createdBy: data.createdBy,
        createdByName: data.createdByName,
        attendCount: data.attendCount ?? 0,
        attendees: data.attendees ?? {},
      };
    });
    callback(items as MapEventWithId[]);
  });
}

/** Remove undefined values so Firestore doesn't reject the payload */
function withoutUndefined<T extends Record<string, unknown>>(obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined)
  ) as Partial<T>;
}

export async function createEvent(ev: Omit<FirestoreEvent, "createdBy" | "createdByName" | "createdAt">) {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("You must be signed in to create events.");
  }
  if (!isUicEmail(user.email)) {
    throw new Error("Only @uic.edu email addresses can create events.");
  }

  const payload = withoutUndefined({
    ...ev,
    createdBy: user.uid,
    createdByName: user.displayName || user.email || "Anonymous",
    creatorPhotoUrl: user.photoURL || undefined,
    createdAt: serverTimestamp(),
  });
  return addDoc(collection(db, "campuses", "uic", "events"), payload as Record<string, unknown>);
}

/** Upload an event image to Firebase Storage and return its download URL. */
export async function uploadEventImage(file: File): Promise<string> {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("You must be signed in to upload images.");
  }

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const objectPath = `events/${user.uid}/${Date.now()}-${safeName}`;
  const storageRef = ref(storage, objectPath);

  const snapshot = await uploadBytes(storageRef, file);
  return getDownloadURL(snapshot.ref);
}

export async function updateEvent(id: string, ev: Partial<Omit<FirestoreEvent, "createdBy" | "createdByName" | "createdAt">>) {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("You must be signed in to update events.");
  }
  
  // Check ownership
  const eventDoc = await getDoc(doc(db, "campuses", "uic", "events", id));
  if (!eventDoc.exists()) {
    throw new Error("Event not found.");
  }
  const eventData = eventDoc.data() as FirestoreEvent;
  if (eventData.createdBy !== user.uid) {
    throw new Error("You can only update events you created.");
  }
  
  const payload = withoutUndefined(ev as Record<string, unknown>);
  return updateDoc(doc(db, "campuses", "uic", "events", id), payload as Partial<DocumentData>);
}

export async function deleteEvent(id: string) {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("You must be signed in to delete events.");
  }
  
  // Check ownership
  const eventDoc = await getDoc(doc(db, "campuses", "uic", "events", id));
  if (!eventDoc.exists()) {
    throw new Error("Event not found.");
  }
  const eventData = eventDoc.data() as FirestoreEvent;
  if (eventData.createdBy !== user.uid) {
    throw new Error("You can only delete events you created.");
  }
  
  return deleteDoc(doc(db, "campuses", "uic", "events", id));
}

/** Attend an event (one per anonymous ID per event). No login required. */
export async function attendEvent(eventId: string, anonymousId: string): Promise<void> {
  const eventRef = doc(db, "campuses", "uic", "events", eventId);
  await runTransaction(db, async (tx) => {
    const snap = await tx.get(eventRef);
    if (!snap.exists()) throw new Error("Event not found.");
    const data = snap.data() as FirestoreEvent;
    const attendees = (data.attendees ?? {}) as Record<string, unknown>;
    if (attendees[anonymousId]) return; // already attending
    tx.update(eventRef, {
      attendees: { ...attendees, [anonymousId]: serverTimestamp() },
      attendCount: increment(1),
    });
  });
}

/** Remove your attendance from an event. */
export async function unattendEvent(eventId: string, anonymousId: string): Promise<void> {
  const eventRef = doc(db, "campuses", "uic", "events", eventId);
  await runTransaction(db, async (tx) => {
    const snap = await tx.get(eventRef);
    if (!snap.exists()) throw new Error("Event not found.");
    const data = snap.data() as FirestoreEvent;
    const attendees = (data.attendees ?? {}) as Record<string, unknown>;
    if (!attendees[anonymousId]) return; // not attending
    const next = { ...attendees };
    delete next[anonymousId];
    tx.update(eventRef, {
      attendees: next,
      attendCount: increment(-1),
    });
  });
}
