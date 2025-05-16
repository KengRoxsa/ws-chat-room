// app/api/rooms/route.js
import clientPromise from '@/lib/mongodb';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db('chatnest');
    const rooms = db.collection('rooms');

    const allRooms = await rooms.find({}).toArray();

    return NextResponse.json({ rooms: allRooms }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: 'Error fetching rooms' }, { status: 500 });
  }
}
