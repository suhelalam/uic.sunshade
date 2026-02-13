/**
 * GET /api/events/[id] - Get a single event
 * PATCH /api/events/[id] - Update an event (requires auth)
 * DELETE /api/events/[id] - Delete an event (requires auth)
 */

import { NextRequest, NextResponse } from "next/server";
import {
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  runTransaction,
  increment,
  serverTimestamp,
} from "firebase/firestore";
import { db, isUicEmail } from "@/lib/firebase";
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

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await Promise.resolve(params);
    const eventDoc = await getDoc(doc(db, "campuses", "uic", "events", id));

    if (!eventDoc.exists()) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const event = firestoreToMapEvent(
      eventDoc.id,
      eventDoc.data() as FirestoreEvent
    );

    return NextResponse.json({ event }, { status: 200 });
  } catch (error) {
    console.error("Error fetching event:", error);
    return NextResponse.json(
      { error: "Failed to fetch event" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify auth
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Missing or invalid Authorization header" },
        { status: 401 }
      );
    }

    const { id } = await Promise.resolve(params);
    const body = await request.json();
    const { uid, email } = body;

    if (!uid || !email) {
      return NextResponse.json(
        { error: "Missing user info" },
        { status: 400 }
      );
    }

    // Check ownership
    const eventDoc = await getDoc(doc(db, "campuses", "uic", "events", id));
    if (!eventDoc.exists()) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const eventData = eventDoc.data() as FirestoreEvent;
    if (eventData.createdBy !== uid) {
      return NextResponse.json(
        { error: "You can only update events you created" },
        { status: 403 }
      );
    }

    // Update event
    const updates = {
      ...(body.title && { title: body.title }),
      ...(body.dateISO && { dateISO: body.dateISO }),
      ...(body.location && { location: body.location }),
      ...(body.address !== undefined && { address: body.address || null }),
      ...(body.roomNumber !== undefined && { roomNumber: body.roomNumber || null }),
      ...(body.imageUrl !== undefined && { imageUrl: body.imageUrl || null }),
      ...(body.details !== undefined && { details: body.details || null }),
      ...(body.extraInfo !== undefined && { extraInfo: body.extraInfo || null }),
      ...(body.organizer !== undefined && { organizer: body.organizer || null }),
    };

    // Remove null values for Firestore
    const cleanUpdates = Object.fromEntries(
      Object.entries(updates).filter(([, v]) => v !== null)
    );

    if (Object.keys(cleanUpdates).length === 0) {
      return NextResponse.json(
        { error: "No fields to update" },
        { status: 400 }
      );
    }

    await updateDoc(doc(db, "campuses", "uic", "events", id), cleanUpdates);

    return NextResponse.json(
      { message: "Event updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating event:", error);
    return NextResponse.json(
      { error: "Failed to update event" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify auth
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Missing or invalid Authorization header" },
        { status: 401 }
      );
    }

    const { id } = await Promise.resolve(params);
    const body = await request.json();
    const { uid } = body;

    if (!uid) {
      return NextResponse.json(
        { error: "Missing user info" },
        { status: 400 }
      );
    }

    // Check ownership
    const eventDoc = await getDoc(doc(db, "campuses", "uic", "events", id));
    if (!eventDoc.exists()) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const eventData = eventDoc.data() as FirestoreEvent;
    if (eventData.createdBy !== uid) {
      return NextResponse.json(
        { error: "You can only delete events you created" },
        { status: 403 }
      );
    }

    await deleteDoc(doc(db, "campuses", "uic", "events", id));

    return NextResponse.json(
      { message: "Event deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting event:", error);
    return NextResponse.json(
      { error: "Failed to delete event" },
      { status: 500 }
    );
  }
}
