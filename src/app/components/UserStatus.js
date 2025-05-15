"use client";
import React, { useEffect, useState } from 'react';
import { auth, signOutUser } from '../services/firebase';
import { onAuthStateChanged } from 'firebase/auth';

function UserStatus() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  const handleSignOut = async () => {
    try {
      await signOutUser();
      console.log('User signed out successfully');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (!user) return null;

  return (
    <div className="bg-white p-4 rounded-xl shadow flex items-center justify-between mt-4">
      <div className="flex items-center space-x-3">
        <img src={user.photoURL || ''} alt="User avatar" className="w-8 h-8 rounded-full" />
        <span className="text-sm text-gray-700 font-medium">{user.displayName || 'User'}</span>
      </div>
      <button
        onClick={handleSignOut}
        className="text-sm text-red-600 hover:underline"
      >
        Sign out
      </button>
    </div>
  );
}

export default UserStatus;
