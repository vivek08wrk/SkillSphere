'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  // "Vivek Singh" → "VS"
  const getInitials = (name, email) => {
    if (name && name.trim()) {
      const parts = name.trim().split(' ');
      if (parts.length >= 2) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
      }
      return parts[0][0].toUpperCase();
    }
    return email ? email[0].toUpperCase() : 'U';
  };

  return (
    <nav className="bg-white shadow-md px-6 py-4 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto flex justify-between items-center">

        {/* Logo */}
        <Link href="/" className="text-2xl font-bold text-blue-600">
          SkillSphere
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-6">
          <Link href="/courses" className="text-gray-600 hover:text-blue-600">
            Courses
          </Link>

          {user ? (
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="text-gray-600 hover:text-blue-600">
                Dashboard
              </Link>
              {user.role === 'INSTRUCTOR' && (
                <Link href="/courses/create" className="text-gray-600 hover:text-blue-600">
                  Create Course
                </Link>
              )}

              {/* Avatar Circle with Dropdown */}
              <div className="relative group">
                <button className="w-9 h-9 rounded-full bg-blue-600 text-white font-bold text-sm flex items-center justify-center hover:bg-blue-700 transition-colors">
                  {getInitials(user.name, user.email)} {/* ← Fix */}
                </button>
                <div className="absolute right-0 top-11 bg-white shadow-lg rounded-xl p-3 w-48 hidden group-hover:block border border-gray-100">
                  <p className="font-semibold text-gray-800 text-sm truncate">
                    {user.name || user.email}
                  </p>
                  <p className="text-gray-400 text-xs truncate mb-2">
                    {user.email}
                  </p>
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                    {user.role}
                  </span>
                </div>
              </div>

              <button
                onClick={logout}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600">
                Logout
              </button>
            </div>
          ) : (
            <div className="flex gap-3">
              <Link href="/login"
                className="text-blue-600 border border-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50">
                Login
              </Link>
              <Link href="/register"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                Register
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger */}
        <button
          className="md:hidden flex flex-col gap-1.5 p-2"
          onClick={() => setMenuOpen(!menuOpen)}>
          <span className={`block w-6 h-0.5 bg-gray-600 transition-all duration-300 ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
          <span className={`block w-6 h-0.5 bg-gray-600 transition-all duration-300 ${menuOpen ? 'opacity-0' : ''}`} />
          <span className={`block w-6 h-0.5 bg-gray-600 transition-all duration-300 ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden mt-4 pb-4 border-t pt-4 flex flex-col gap-4">
          <Link href="/courses"
            onClick={() => setMenuOpen(false)}
            className="text-gray-600 hover:text-blue-600">
            Courses
          </Link>

          {user ? (
            <>
              <Link href="/dashboard"
                onClick={() => setMenuOpen(false)}
                className="text-gray-600 hover:text-blue-600">
                Dashboard
              </Link>
              {user.role === 'INSTRUCTOR' && (
                <Link href="/courses/create"
                  onClick={() => setMenuOpen(false)}
                  className="text-gray-600 hover:text-blue-600">
                  Create Course
                </Link>
              )}

              {/* Mobile Avatar */}
              <div className="flex items-center gap-3 py-1">
                <div className="w-9 h-9 rounded-full bg-blue-600 text-white font-bold text-sm flex items-center justify-center">
                  {getInitials(user.name, user.email)} {/* ← Fix */}
                </div>
                <div>
                  <p className="font-semibold text-gray-800 text-sm">
                    {user.name || user.email}
                  </p>
                  <p className="text-gray-400 text-xs">{user.email}</p>
                </div>
              </div>

              <button
                onClick={() => { logout(); setMenuOpen(false); }}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 w-full text-left">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login"
                onClick={() => setMenuOpen(false)}
                className="text-blue-600 border border-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 text-center">
                Login
              </Link>
              <Link href="/register"
                onClick={() => setMenuOpen(false)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-center">
                Register
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}