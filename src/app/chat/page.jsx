"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth } from "../services/firebase";
import { onAuthStateChanged } from "firebase/auth";

export default function ChatPage() {
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.replace("/"); // 🔁 Redirect ถ้าไม่ได้ login
      }
    });

    return () => unsubscribe(); // ✅ cleanup listener
  }, [router]);

  return (
    <div className="p-6 text-center">
      <h1 className="text-2xl font-bold">Welcome to the Chat Page</h1>
      {/* เพิ่ม component แชทได้ที่นี่ */}
    </div>
  );
}
