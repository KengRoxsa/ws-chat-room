'use client';
import React, { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { auth } from "@/app/services/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useRef } from "react";

export default function Room() {
  const { roomId } = useParams(); // ✅ ใช้ useParams ดึงค่าจาก URL
  const [roomName, setRoomName] = useState('');
  const router = useRouter();
  const [rooms, setRooms] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/updateRoomName/${roomId}`, {
        method: 'PATCH',
        body: JSON.stringify({ name: roomName }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (res.ok) {
        alert('Room name updated');
        router.push(`/chat`);
      } else {
        alert('Failed to update room name');
      }
    } catch (err) {
      console.error(err);
      alert('Error updating room name');
    }
  };
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.replace("/");
      }
    });

    return () => unsubscribe();
  }, [router]);

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-indigo-100 via-white to-purple-100">
      <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-lg space-y-6">
        <h1 className="text-3xl font-bold text-gray-800">Set Room Name</h1>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            placeholder="Enter room name"
            className=" p-2 border border-gray-300 rounded-lg"
          />
          <button
            type="submit"
            className=" p-2 mt-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Save Room Name
          </button>
        </form>
      </div>
    </div>
  );
}
