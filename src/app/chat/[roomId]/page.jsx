"use client";
import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { auth } from "@/app/services/firebase";
import { onAuthStateChanged } from "firebase/auth";


export default function ChatRoomPage() {
  const { roomId } = useParams(); // ดึง roomId จาก URL
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [roomName, setRoomName] = useState(""); // สถานะสำหรับเก็บชื่อห้อง
  const ws = useRef(null);

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

  // 🎯 โหลดชื่อห้องจาก API
useEffect(() => {
  const fetchRoom = async () => {
    console.log("Fetching room data...");
    try {
      const res = await fetch(`/api/room/${roomId}`);
      console.log("API Response:", res);
      const data = await res.json();
      console.log("Fetched room data:", data);

      // ใช้ room.roomId แทน room.id
      const room = data.rooms.find(room => room.roomId === roomId);
      if (room) {
        setRoomName(room.name || "Unnamed Room"); // กำหนดชื่อห้อง
      } else {
        setRoomName("Room not found");
      }
    } catch (error) {
      console.error("Failed to fetch room info:", error);
      setRoomName("Unknown Room");
    }
  };

  if (roomId) fetchRoom();
}, [roomId]);




  // 📡 เชื่อมต่อ WebSocket
  useEffect(() => {
    
    if (!roomId) return;
    const socketUrl = `${process.env.NEXT_PUBLIC_WS_URL}?roomId=${roomId}`;
    ws.current = new WebSocket(socketUrl);

    ws.current.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      setMessages((prev) => [...prev, msg]);
    };

    return () => {
      ws.current?.close();
    };
  }, [roomId]);

  const sendMessage = () => {
    if (input.trim()) {
      const msg = { text: input, roomId };
      ws.current.send(JSON.stringify(msg));
      setInput("");
    }
  };

  return (
    <div className="p-6">
      {/* แสดงชื่อห้องที่ดึงมาจาก API */}
      
      <h1 className="text-xl font-bold mb-4">Room: {roomName}</h1>

      <div className="bg-white p-4 rounded shadow h-64 overflow-y-auto text-black">
        {messages.map((msg, i) => (
          <div key={i}>{msg.text}</div>
        ))}
      </div>

      <div className="mt-4 flex gap-2">
        <input
          className="border p-2 rounded flex-1"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={sendMessage}>
          Send
        </button>
      </div>
    </div>
  );
}
