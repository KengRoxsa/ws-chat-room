// app/api/rooms/[roomId]/route.js
import clientPromise from '@/lib/mongodb';
import { NextResponse } from 'next/server';
import admin from 'firebase-admin';

// ฟังก์ชั่นตรวจสอบ Firebase Token
async function verifyToken(token) {
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    return decodedToken; // คืนค่า decoded token ที่มี uid
  } catch (error) {
    return null; // ถ้า token ไม่ถูกต้อง คืนค่า null
  }
}

export async function DELETE(req, { params }) {
  try {
    const { roomId } = params;

    // ดึง token จาก header ของ request
    const token = req.headers.get('Authorization')?.split('Bearer ')[1];

    if (!token) {
      return NextResponse.json({ message: 'Authorization token is required' }, { status: 401 });
    }

    // ตรวจสอบ token จาก Firebase
    const decodedToken = await verifyToken(token);

    if (!decodedToken) {
      return NextResponse.json({ message: 'Invalid token' }, { status: 403 });
    }

    const userId = decodedToken.uid; // user ที่ล็อกอินอยู่

    // เชื่อมต่อ MongoDB
    const client = await clientPromise;
    const db = client.db('chatnest');
    const rooms = db.collection('rooms');

    // ค้นหาห้องในฐานข้อมูล
    const room = await rooms.findOne({ roomId });

    if (!room) {
      return NextResponse.json({ message: 'Room not found' }, { status: 404 });
    }

    // ตรวจสอบว่าเป็นเจ้าของห้องหรือไม่
    if (room.createdBy !== userId) {
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
