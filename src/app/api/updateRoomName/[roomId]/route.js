// app/api/updateRoomName/[roomId]/route.js
import clientPromise from '@/lib/mongodb';
import { NextResponse } from 'next/server';

export async function PATCH(req, { params }) {
  const { roomId } = params;
  const { name } = await req.json();

  try {
    const client = await clientPromise;
    const db = client.db('chatnest');
    const rooms = db.collection('rooms');

    const updatedRoom = await rooms.updateOne(
      { roomId },
      { $set: { name } }
    );

    if (updatedRoom.matchedCount === 0) {
      return NextResponse.json({ message: 'Room not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Room name updated' }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: 'Error updating room name' }, { status: 500 });
  }
}
