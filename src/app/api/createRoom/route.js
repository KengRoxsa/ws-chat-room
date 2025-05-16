// app/api/createRoom/route.js
import clientPromise from '@/lib/mongodb';
import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req) {
  try {
    // * ในกรณีนี้เราจะไม่ Auth ตรวจสอบก่อนสร้าง room
    const client = await clientPromise;
    const db = client.db('chatnest');
    const rooms = db.collection('rooms');

    const roomId = uuidv4(); // สร้าง roomId แบบสุ่ม

    const newRoom = {
      roomId,
      name: `Room-${roomId.slice(0, 4)}`,
      createdAt: new Date(),
      // createdBy: user.uid (ถ้าเชื่อม auth)
    };

    await rooms.insertOne(newRoom);

    return NextResponse.json({ message: 'Room created', roomId }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: 'Error creating room' }, { status: 500 });
  }
}
