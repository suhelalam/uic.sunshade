/**
 * Firebase client initialization and simple event helpers.
 * Requires the following env vars in .env.local:
 * NEXT_PUBLIC_FIREBASE_API_KEY, NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
 * NEXT_PUBLIC_FIREBASE_PROJECT_ID, NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
 * NEXT_PUBLIC_FIREBASE_APP_ID
 */
import { initializeApp, getApps } from "firebase/app";
import type { FirebaseApp, FirebaseOptions } from "firebase/app";
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

export type FirestoreEvent = {
  title: string;
  dateISO: string;
  location: { lng: number; lat: number };
  address?: string;
  details?: string;
  extraInfo?: string;
};

type MapEventWithId = MapEvent & { id: string };

export function subscribeToEvents(callback: (rows: MapEventWithId[]) => void): Unsubscribe {
  // Firestore path: campuses / uic / events
  const q = query(collection(db, "campuses", "uic", "events"), orderBy("dateISO", "desc"));
  return onSnapshot(q, (snap) => {
    const items = snap.docs.map((d: QueryDocumentSnapshot<DocumentData>) => ({
      id: d.id,
      ...(d.data() as FirestoreEvent),
    }));
    callback(items as MapEventWithId[]);
  });
}

export async function createEvent(ev: FirestoreEvent) {
  // Add under campuses/uic/events
  return addDoc(collection(db, "campuses", "uic", "events"), ev);
}

export async function updateEvent(id: string, ev: Partial<FirestoreEvent>) {
  return updateDoc(doc(db, "campuses", "uic", "events", id), ev as Partial<DocumentData>);
}

export async function deleteEvent(id: string) {
  return deleteDoc(doc(db, "campuses", "uic", "events", id));
}
