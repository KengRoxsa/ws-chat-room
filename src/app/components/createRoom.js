"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CreateChatRoomButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleCreateRoom = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/createRoom', {
        method: 'POST',
      });

      const data = await res.json();

      if (res.ok) {
        // ✅ ไปยังหน้าห้องแชทที่สร้างใหม่
        router.push(`/room/${data.roomId}`);
      } else {
        alert('Failed to create room');
      }
    } catch (err) {
      console.error(err);
      alert('Error creating room');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleCreateRoom}
      disabled={loading}
      className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
    >
      {loading ? 'Creating...' : 'Create Chat Room'}
    </button>
  );
}
