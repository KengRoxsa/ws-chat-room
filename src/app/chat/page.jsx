"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "../services/firebase";
import { onAuthStateChanged } from "firebase/auth";


export default function ChatPage() {
  const router = useRouter();
  const [rooms, setRooms] = useState([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.replace("/");
      }
    });

    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await fetch("/api/rooms");
        const data = await res.json();
        setRooms(data.rooms);
      } catch (error) {
        console.error("Failed to load rooms:", error);
      }
    };

    fetchRooms();
  }, []);

  const goToChatRoom = (roomId) => {
    router.push(`/chat/${roomId}`); // ✅ ไปหน้าห้องแชทจริง
  };

  const goToEditRoom = (roomId) => {
    router.push(`/room/${roomId}`); // ✏️ ไปแก้ชื่อห้อง
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
              onClick={() => goToChatRoom(room.roomId,room.name)}
            >
              <h2 className="text-lg text-black font-semibold">{room.name}</h2>
            </div>

            <button
              onClick={() => goToEditRoom(room.roomId)}
              className="absolute top-2 right-2 text-xs text-blue-600 hover:underline"
            >
              Edit
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
