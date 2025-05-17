"use client";
import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { auth } from "@/app/services/firebase";
import { onAuthStateChanged } from "firebase/auth";

export default function ChatRoomPage() {
  const { roomId } = useParams();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [roomName, setRoomName] = useState("");
  const ws = useRef(null);

  const router = useRouter();

  // 🔐 ตรวจสอบสถานะการล็อกอิน
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.replace("/");
      }
    });

    return () => unsubscribe();
  }, [router]);

  // 📦 โหลดข้อมูลห้อง
  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const res = await fetch(`/api/room/${roomId}`);
        const data = await res.json();
        const room = data.rooms.find((room) => room.roomId === roomId);
        setRoomName(room ? room.name || "Unnamed Room" : "Room not found");
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

    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:3001";
    const socket = new WebSocket(`${wsUrl}?roomId=${roomId}`);
    ws.current = socket;

    socket.onopen = () => {
      console.log("✅ WebSocket connected");
    };

    socket.onerror = (err) => {
      console.error("❌ WebSocket error", err);
    };

    socket.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      setMessages((prev) => [...prev, msg]);
    };

    return () => {
      socket.close();
    };
  }, [roomId]);

  // ✉️ ฟังก์ชันส่งข้อความ
  const sendMessage = () => {
    if (input.trim() && ws.current && ws.current.readyState === WebSocket.OPEN) {
      const msg = { text: input, roomId };
      ws.current.send(JSON.stringify(msg));
      setInput("");
    }
  };

  

  return (
    <div className="p-6">

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
