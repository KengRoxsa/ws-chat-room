"use client";
import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
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
      } else {
        console.log("✅ User logged in:", user.email);
      }
    });
    return () => unsubscribe();
  }, [router]);

  // 📦 โหลดชื่อห้อง
  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const res = await fetch(`/api/room/${roomId}`);
        const data = await res.json();
        const room = data.rooms.find((room) => room.roomId === roomId);
        setRoomName(room ? room.name || "Unnamed Room" : "Room not found");
      } catch (error) {
        console.error("❌ Failed to fetch room info:", error);
        setRoomName("Unknown Room");
      }
    };
    if (roomId) fetchRoom();
  }, [roomId]);

  // 📡 WebSocket
  useEffect(() => {
    if (!roomId) return;

    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:3001";
    const socket = new WebSocket(`${wsUrl}?roomId=${roomId}`);
    ws.current = socket;

    socket.onopen = () => {
      console.log("✅ WebSocket connected");
    };

    socket.onerror = (err) => {
      console.error("❌ WebSocket error:", err);
    };

    socket.onmessage = async (event) => {
      try {
        const text = await event.data.text(); // 👈 สำคัญ: อ่านเป็นข้อความ
        const msg = JSON.parse(text);
        console.log("📩 Received:", msg);
        setMessages((prev) => [...prev, msg]);
      } catch (err) {
        console.error("❌ Failed to parse message:", err);
      }
    };

    return () => socket.close();
  }, [roomId]);

  // ✉️ ส่งข้อความ
  const sendMessage = () => {
    const currentUser = auth.currentUser;
    if (
      input.trim() &&
      currentUser &&
      ws.current &&
      ws.current.readyState === WebSocket.OPEN
    ) {
      const msg = {
        text: input,
        sender: currentUser.email,
        time: new Date().toISOString(),
        photoURL: currentUser.photoURL || "/default-avatar.png",
      };
      console.log("📤 Sending:", msg);
      ws.current.send(JSON.stringify(msg));
      setMessages((prev) => [...prev, msg]);
      setInput("");
    } else {
      console.warn("⚠️ Cannot send message:", {
        input,
        currentUser,
        wsReady: ws.current?.readyState,
      });
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Room: {roomName}</h1>

      <div className="bg-white p-4 rounded shadow h-64 overflow-y-auto text-black flex flex-col gap-3 leading-relaxed">
        {messages.map((msg, i) => {
          const isMine = msg.sender === auth.currentUser?.email;
          const bubbleClasses = isMine
            ? "bg-blue-600 text-white"
            : "bg-gray-100 text-black";
          const time = new Date(msg.time).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          });

          return (
            <div
              key={i}
              className={`flex items-end ${isMine ? "justify-end" : "justify-start"}`}
            >
              {!isMine && msg.photoURL && (
                <img
                  src={msg.photoURL}
                  alt="avatar"
                  className="w-8 h-8 rounded-full mr-2"
                />
              )}
              <div
                className={`max-w-xs px-4 py-2 rounded-2xl shadow ${bubbleClasses}`}
              >
                <div className="text-sm break-words">{msg.text}</div>
                <div className="text-xs text-right opacity-70 mt-1">{time}</div>
              </div>
              {isMine && msg.photoURL && (
                <img
                  src={msg.photoURL}
                  alt="my-avatar"
                  className="w-8 h-8 rounded-full ml-2"
                />
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex gap-2">
        <input
          className="border p-2 rounded flex-1"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded"
          onClick={sendMessage}
        >
          Send
        </button>
      </div>
    </div>
  );
}
