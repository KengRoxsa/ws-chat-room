"use client";
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

  const goToEditRoom = (roomId) => {
    router.push(`/room/${roomId}`); // ไปหน้าแก้ไขชื่อห้อง
  };

  const handleDeleteRoom = async (roomId) => {
    try {
      const res = await fetch(`/api/rooms/${roomId}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (res.ok) {
        alert(data.message);
        setRooms(rooms.filter((room) => room.roomId !== roomId));  // ลบห้องออกจากหน้าจอ
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

      <div className="grid grid-cols-5 gap-4">
        {rooms.map((room) => (
          <div
            key={room.roomId}
            className="p-4 bg-white rounded-lg shadow hover:bg-gray-100 relative"
          >
            <div
              className="cursor-pointer"
              onClick={() => goToChatRoom(room.roomId)}
            >
              <h2 className="text-lg text-black font-semibold">{room.name}</h2>
            </div>

            <button
              onClick={() => goToEditRoom(room.roomId)}
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
