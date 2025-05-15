"use client";
import React from 'react';
import { signInWithGoogle } from '../services/firebase';
import { useRouter } from 'next/navigation';

function Login() {
  const router = useRouter();

  const handleSignIn = async () => {
    try {
      await signInWithGoogle();
      console.log('User signed in successfully!');
      router.push('/chat'); // ✅ Redirect ไปหน้านี้หลัง Login
    } catch (error) {
      console.error('Error signing in:', error);
    }
  };

  return (
    <div>
      <button
        onClick={handleSignIn}
        className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
      >
        Sign in with Google
      </button>
    </div>
  );
}

export default Login;
