/**
 * Firebase client initialization and simple event helpers.
 * Requires the following env vars in .env.local:
 * NEXT_PUBLIC_FIREBASE_API_KEY, NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
 * NEXT_PUBLIC_FIREBASE_PROJECT_ID, NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
 * NEXT_PUBLIC_FIREBASE_APP_ID
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
} from "firebase/firestore";
import type {
  Unsubscribe,
  QueryDocumentSnapshot,
  DocumentData,
} from "firebase/firestore";

import type { MapEvent } from "./types";

const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

export const db = getFirestore(app);
export const auth = getAuth(app);
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
  details?: string;
  extraInfo?: string;
  organizer?: string;
  createdBy: string; // User UID
  createdByName?: string; // User display name or email
  createdAt?: any; // serverTimestamp()
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
        details: data.details,
        extraInfo: data.extraInfo,
        organizer: data.organizer,
        createdBy: data.createdBy,
        createdByName: data.createdByName,
      };
    });
    callback(items as MapEventWithId[]);
  });
}

export async function createEvent(ev: Omit<FirestoreEvent, "createdBy" | "createdByName" | "createdAt">) {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("You must be signed in to create events.");
  }
  if (!isUicEmail(user.email)) {
    throw new Error("Only @uic.edu email addresses can create events.");
  }
  
  // Add under campuses/uic/events with creator info
  return addDoc(collection(db, "campuses", "uic", "events"), {
    ...ev,
    createdBy: user.uid,
    createdByName: user.displayName || user.email || "Anonymous",
    createdAt: serverTimestamp(),
  });
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
  
  return updateDoc(doc(db, "campuses", "uic", "events", id), ev as Partial<DocumentData>);
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
