"use client";
import Link from 'next/link';
import React from 'react';
import Login from './components/Login';
import UserStatus from './components/UserStatus';
import Footer from './components/Footer';

function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-indigo-100 via-white to-purple-100">
      
     

      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center px-4">
        <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-lg text-center space-y-6">
          <h1 className="text-3xl font-bold text-gray-800">Welcome to ChatNest 🐦</h1>
          <p className="text-gray-600 text-sm">
            A simple and secure real-time chat app powered by Firebase. <br />
            Log in to start chatting with friends instantly!
          </p>

          {/* Login Form */}
          <Login />

          
            
          
        </div>
      </main>

      
    </div>
  );
}

export default Home;
