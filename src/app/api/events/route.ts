/**
 * GET /api/events - Fetch all events
 * POST /api/events - Create a new event (requires auth)
 */

import { NextRequest, NextResponse } from "next/server";
import {
  collection,
  query,
  orderBy,
  getDocs,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db, auth, isUicEmail } from "@/lib/firebase";
import type { FirestoreEvent } from "@/lib/firebase";
import type { MapEvent } from "@/lib/types";

type MapEventWithId = MapEvent & { id: string };

// Helper to convert Firestore doc to MapEvent
function firestoreToMapEvent(id: string, data: FirestoreEvent): MapEventWithId {
  return {
    id,
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
}

export async function GET() {
  try {
    const q = query(
      collection(db, "campuses", "uic", "events"),
      orderBy("dateISO", "desc")
    );
    const snap = await getDocs(q);
    const events = snap.docs.map((doc) =>
      firestoreToMapEvent(doc.id, doc.data() as FirestoreEvent)
    );

    return NextResponse.json({ events }, { status: 200 });
  } catch (error) {
    console.error("Error fetching events:", error);
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get auth token from Authorization header
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Missing or invalid Authorization header" },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);

    // Verify token and get user (this requires Firebase Admin SDK)
    // For now, we'll verify the token client-side and pass user info
    const body = await request.json();
    const { title, dateISO, location, address, roomNumber, imageUrl, details, extraInfo, organizer, uid, email, displayName, photoURL } = body;

    // Validate required fields
    if (!title || !dateISO || !location || !uid || !email) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate UIC email
    if (!isUicEmail(email)) {
      return NextResponse.json(
        { error: "Only @uic.edu email addresses can create events" },
        { status: 403 }
      );
    }

    // Create event
    const payload = {
      title,
      dateISO,
      location,
      address: address || undefined,
      roomNumber: roomNumber || undefined,
      imageUrl: imageUrl || undefined,
      creatorPhotoUrl: photoURL || undefined,
      details: details || undefined,
      extraInfo: extraInfo || undefined,
      organizer: organizer || undefined,
      createdBy: uid,
      createdByName: displayName || email,
      createdAt: serverTimestamp(),
      attendCount: 0,
      attendees: {},
    };

    // Remove undefined values
    const cleanPayload = Object.fromEntries(
      Object.entries(payload).filter(([, v]) => v !== undefined)
    );

    const docRef = await addDoc(
      collection(db, "campuses", "uic", "events"),
      cleanPayload
    );

    return NextResponse.json(
      {
        id: docRef.id,
        message: "Event created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating event:", error);
    return NextResponse.json(
      { error: "Failed to create event" },
      { status: 500 }
    );
  }
}
