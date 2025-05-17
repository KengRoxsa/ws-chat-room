import { getAdminAuth } from '@/lib/firebaseAdmin'; // ต้อง import มาจากไฟล์ firebaseAdmin.js
import clientPromise from '@/lib/mongodb';
import { NextResponse } from 'next/server';

// ฟังก์ชั่นตรวจสอบ Firebase Token
async function verifyToken(token) {
  try {
    console.log("🧪 Verifying token:", token);
    const decodedToken = await getAdminAuth().verifyIdToken(token); // ใช้ชื่อใหม่ที่ import มา
    console.log("✅ Decoded token:", decodedToken);
    return decodedToken;
  } catch (error) {
    console.error("❌ Token verify error:", error);
    return null;
  }
}

export async function DELETE(req, { params }) {
  try {
    const { roomId } = params;
    console.log("🧪 Room ID:", roomId);

    // ดึง token จาก header ของ request
    const token = req.headers.get('Authorization')?.split('Bearer ')[1];
    console.log("🧪 Received token:", token); 

    if (!token) {
      console.log("❌ No token provided in request");
      return NextResponse.json({ message: 'Authorization token is required' }, { status: 401 });
    }

    // ตรวจสอบ token จาก Firebase
    const decodedToken = await verifyToken(token); // ใช้ฟังก์ชัน verifyToken ที่สร้างขึ้นมา

    if (!decodedToken) {
      console.log("❌ Token is invalid or could not be decoded");
      return NextResponse.json({ message: 'Invalid token' }, { status: 403 });
    }

    const userId = decodedToken.uid;
    console.log("🧪 User ID from token:", userId);

    // เชื่อมต่อ MongoDB
    const client = await clientPromise;
    const db = client.db('chatnest');
    const rooms = db.collection('rooms');

    // ค้นหาห้องในฐานข้อมูล
    const room = await rooms.findOne({ roomId });
    console.log("🧪 Found room:", room);

    if (!room) {
      console.log("❌ Room not found in database");
      return NextResponse.json({ message: 'Room not found' }, { status: 404 });
    }

    // ตรวจสอบว่าเป็นเจ้าของห้องหรือไม่
    if (room.createdBy !== userId) {
      console.log("❌ Unauthorized attempt to delete room");
      return NextResponse.json({ message: 'You are not authorized to delete this room' }, { status: 403 });
    }

    // ลบห้องจากฐานข้อมูล
    await rooms.deleteOne({ roomId });
    console.log("🧪 Room deleted successfully");

    return NextResponse.json({ message: 'Room deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error("❌ Error occurred during DELETE operation:", error);
    return NextResponse.json({ message: 'Error verifying token' }, { status: 500 });
  }
}
