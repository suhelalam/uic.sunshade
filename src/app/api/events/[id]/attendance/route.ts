/**
 * POST /api/events/[id]/attend - Mark as attending an event (no auth required, uses anonymous ID)
 * POST /api/events/[id]/unattend - Unmark as attending an event
 */

import { NextRequest, NextResponse } from "next/server";
import {
  doc,
  runTransaction,
  increment,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { FirestoreEvent } from "@/lib/firebase";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string; action: string } }
) {
  try {
    const { id } = await Promise.resolve(params);
    const body = await request.json();
    const { anonymousId, action } = body;

    if (!anonymousId || !action) {
      return NextResponse.json(
        { error: "Missing anonymousId or action" },
        { status: 400 }
      );
    }

    const eventRef = doc(db, "campuses", "uic", "events", id);

    if (action === "attend") {
      await runTransaction(db, async (tx) => {
        const snap = await tx.get(eventRef);
        if (!snap.exists()) throw new Error("Event not found");
        const data = snap.data() as FirestoreEvent;
        const attendees = (data.attendees ?? {}) as Record<string, unknown>;
        if (attendees[anonymousId]) return; // already attending
        tx.update(eventRef, {
          attendees: { ...attendees, [anonymousId]: serverTimestamp() },
          attendCount: increment(1),
        });
      });

      return NextResponse.json(
        { message: "Marked as attending" },
        { status: 200 }
      );
    } else if (action === "unattend") {
      await runTransaction(db, async (tx) => {
        const snap = await tx.get(eventRef);
        if (!snap.exists()) throw new Error("Event not found");
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

      return NextResponse.json(
        { message: "Unmarked as attending" },
        { status: 200 }
      );
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Error updating attendance:", error);
    return NextResponse.json(
      { error: "Failed to update attendance" },
      { status: 500 }
    );
  }
}
