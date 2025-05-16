import clientPromise from '@/lib/mongodb';
import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req) {
  try {
    const body = await req.json(); // ✅ อ่าน JSON body ที่ส่งมาจาก client

    const roomId = uuidv4();

    const newRoom = {
      roomId,
      name: `Room-${roomId.slice(0, 4)}`,
      createdAt: new Date(),
      createdBy: body.createdBy || null, // ✅ ป้องกัน fallback เผื่อไม่มี
    };

    const client = await clientPromise;
    const db = client.db('chatnest');
    const rooms = db.collection('rooms');
    await rooms.insertOne(newRoom);

    return NextResponse.json({ message: 'Room created', roomId }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: 'Error creating room' }, { status: 500 });
  }
}
