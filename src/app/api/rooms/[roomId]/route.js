// app/api/rooms/[roomId]/route.js
import clientPromise from '@/lib/mongodb';
import { NextResponse } from 'next/server';
import { auth } from '@/app/services/firebase'; // ใช้เพื่อดึงข้อมูลผู้ใช้

export async function DELETE(req, { params }) {
  try {
    const { roomId } = params;

    // ตรวจสอบว่าเป็นผู้ใช้ที่ล็อกอินหรือไม่
    const user = auth.currentUser;

    if (!user) {
      return NextResponse.json({ message: 'You must be logged in to delete a room' }, { status: 401 });
    }

    // ตรวจสอบข้อมูลห้องในฐานข้อมูล
    const client = await clientPromise;
    const db = client.db('chatnest');
    const rooms = db.collection('rooms');
    const room = await rooms.findOne({ roomId });

    if (!room) {
      return NextResponse.json({ message: 'Room not found' }, { status: 404 });
    }

    // ตรวจสอบว่าเป็นผู้ที่สร้างห้องหรือไม่
    if (room.createdBy !== user.uid) {
      return NextResponse.json({ message: 'You are not authorized to delete this room' }, { status: 403 });
    }

    // ลบห้องจากฐานข้อมูล
    await rooms.deleteOne({ roomId });

    return NextResponse.json({ message: 'Room deleted successfully' }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: 'Error deleting room' }, { status: 500 });
  }
}
