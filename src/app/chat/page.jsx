'use client';
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "../services/firebase";
import { onAuthStateChanged } from "firebase/auth";

export default function ChatPage() {
  const router = useRouter();
  const [rooms, setRooms] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // เช็คสถานะการล็อกอินของผู้ใช้
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);  // เก็บข้อมูลผู้ใช้ที่ล็อกอิน
      } else {
        router.replace("/");  // ถ้าไม่มีการล็อกอินให้ redirect ไปหน้า login
      }
    });

    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await fetch("/api/rooms");
        const data = await res.json();
        setRooms(data.rooms);  // เก็บข้อมูลห้องทั้งหมด
      } catch (error) {
        console.error("Failed to load rooms:", error);
      }
    };

    fetchRooms();
  }, []);

  const goToChatRoom = (roomId) => {
    router.push(`/chat/${roomId}`); // ไปหน้าห้องแชท
  };

  const goToEditRoom = (roomId, createdBy) => {
    if (user && user.uid === createdBy) {
      router.push(`/room/${roomId}`); // ไปหน้าแก้ไขชื่อห้อง
    } else {
      alert("คุณไม่มีสิทธิ์แก้ไขห้องนี้"); // แจ้งเตือนเมื่อไม่ใช่เจ้าของห้อง
    }
  };

  const handleDeleteRoom = async (roomId) => {
    try {
      const currentUser = auth.currentUser;

      if (!currentUser) {
        alert("คุณต้องล็อกอินก่อนถึงจะลบห้องได้");
        return;
      }

      const idToken = await currentUser.getIdToken(); // ✅ ดึง Firebase ID Token
      console.log("🔑 Firebase ID Token:", idToken); // ตรวจสอบ token

      const res = await fetch(`/api/rooms/${roomId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${idToken}`, // ✅ แนบ token ใน header
          'Content-Type': 'application/json',
        },
      });

      console.log("📝 Response status:", res.status); // ตรวจสอบสถานะของการตอบกลับ
      const data = await res.json();

      console.log("🔍 Response data:", data); // ดูข้อมูลที่ตอบกลับมา

      if (res.ok) {
        alert(data.message);
        setRooms(rooms.filter((room) => room.roomId !== roomId));
      } else {
        alert(data.message || 'Failed to delete room');
      }
    } catch (error) {
      console.error("Error deleting room:", error);
      alert('Error deleting room');
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Available Rooms</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {rooms.map((room) => (
          <div
            key={room.roomId}
            className="p-4 bg-white rounded-lg shadow w-70 hover:bg-gray-100 relative"
          >
            <div
              className="cursor-pointer"
              onClick={() => goToChatRoom(room.roomId)}
            >
              <h2 className="text-lg text-black font-semibold">{room.name}</h2>
            </div>

            <button
              onClick={() => goToEditRoom(room.roomId, room.createdBy)} // ส่งข้อมูล createdBy ไปด้วย
              className="absolute top-2 right-2 text-xs text-blue-600 hover:underline"
            >
              Edit
            </button>

            {/* ปุ่มลบห้องแสดงเฉพาะห้องที่เจ้าของห้องเป็นผู้ใช้งาน */}
            {user && room.createdBy === user.uid && (
              <button
                onClick={() => handleDeleteRoom(room.roomId)}
                className="absolute bottom-2 right-2 text-xs text-red-600 hover:underline"
              >
                Delete
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
