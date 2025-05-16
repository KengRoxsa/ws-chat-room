"use client";
import React from "react";
import { signInWithGoogle, auth } from "../services/firebase";
import { useRouter } from "next/navigation";

function Login() {
  const router = useRouter();

  const handleSignIn = async () => {
    try {
      const result = await signInWithGoogle();
      const user = result.user;

      // ส่งข้อมูล user ไปยัง API
      await fetch("/api/saveUser", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          uid: user.uid,
          name: user.displayName,
          email: user.email,
          photoURL: user.photoURL,
        }),
      });

      console.log("User saved to DB!");
      router.push("/chat"); // ไปหน้าหลังล็อกอิน เช่น /chat
    } catch (error) {
      console.error("Error signing in:", error);
    }
  };

  return (
    <button 
    className="text-green-600 border border-green-600 px-4 py-2 rounded-lg hover:bg-green-600 hover:text-white transition duration-300"
    onClick={handleSignIn}>
      Sign in with Google
    </button>
  );
}

export default Login;
