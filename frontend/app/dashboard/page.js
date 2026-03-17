'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { courseAPI } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/login');
      return;
    }
    fetchData();
  }, [user, authLoading]);

  const fetchData = async () => {
  try {
    if (user.role === 'INSTRUCTOR') {
      const response = await courseAPI.getAll();
      const myCourses = response.data.courses.filter(
        (course) => course.instructorId === user.id
      );
      setData(myCourses);
    } else {
      const response = await courseAPI.getMyEnrollments();
      const seen = new Set();
      const unique = response.data.filter((enrollment) => {
        if (seen.has(enrollment.courseId)) return false;
        seen.add(enrollment.courseId);
        return true;
      });
      setData(unique);
    }
  } catch (err) {
    console.error(err);
  } finally {
    setLoading(false);
  }
};

  if (authLoading || loading) return (
    <div className="flex justify-center items-center min-h-64">
      <div className="text-gray-500">Loading...</div>
    </div>
  );

  // ── INSTRUCTOR DASHBOARD ──────────────────────────────
  if (user?.role === 'INSTRUCTOR') {
    return (
      <div className="max-w-6xl mx-auto px-6 py-10">

        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Instructor Dashboard 🎓
            </h1>
            <p className="text-gray-500 mt-1">
             Welcome back, {user?.name || user?.email}
            </p>
          </div>
          <Link href="/courses/create"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold">
            + Create Course
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="text-3xl mb-2">📚</div>
            <div className="text-2xl font-bold">{data.length}</div>
            <div className="text-gray-500">Total Courses</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="text-3xl mb-2">👥</div>
            <div className="text-2xl font-bold">
              {data.reduce((acc, course) => acc + (course._count?.enrollments || 0), 0)}
            </div>
            <div className="text-gray-500">Total Students</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="text-3xl mb-2">💰</div>
            <div className="text-2xl font-bold">
              ₹{data.reduce((acc, course) => 
                acc + (course.price * (course._count?.enrollments || 0)), 0
              )}
            </div>
            <div className="text-gray-500">Total Earnings</div>
          </div>
        </div>

        {/* My Courses */}
        <h2 className="text-xl font-semibold mb-4 text-gray-800">My Courses</h2>

        {data.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center shadow-sm">
            <div className="text-4xl mb-4">📭</div>
            <p className="text-gray-500 mb-4">No courses yet</p>
            <Link href="/courses/create"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
              Create Your First Course
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.map((course) => (
              <div key={course.id}
                className="bg-white rounded-xl shadow-sm p-5">
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-32 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-white text-3xl">📚</span>
                </div>
                <h3 className="font-semibold text-gray-800 mb-1">
                  {course.title}
                </h3>
                <p className="text-gray-500 text-sm mb-3">
                  {course.description}
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-blue-600 font-semibold">
                    ₹{course.price}
                  </span>
                  <span className="text-gray-500 text-sm">
                    👥 {course._count?.enrollments || 0} students
                  </span>
                </div>
                <div className="mt-3 flex justify-between items-center">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    course.isPublished 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {course.isPublished ? '✅ Published' : '⏳ Draft'}
                  </span>
                  <Link href={`/courses/${course.id}`}
                    className="text-blue-600 text-sm hover:underline">
                    View →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ── STUDENT DASHBOARD ─────────────────────────────────
  return (
    <div className="max-w-6xl mx-auto px-6 py-10">

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          My Dashboard 👋
        </h1>
        <p className="text-gray-500 mt-1">
         Welcome back, {user?.name || user?.email}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="text-3xl mb-2">📚</div>
          <div className="text-2xl font-bold text-gray-800">{data.length}</div>
          <div className="text-gray-500">Enrolled Courses</div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="text-3xl mb-2">🎯</div>
          <div className="text-2xl font-bold text-gray-800">{user?.role}</div>
          <div className="text-gray-500">Account Type</div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="text-3xl mb-2">🏆</div>
          <div className="text-2xl font-bold text-gray-800">0</div>
          <div className="text-gray-500">Completed</div>
        </div>
      </div>

      {/* Enrolled Courses */}
      <h2 className="text-xl font-semibold mb-4 text-gray-800">My Courses</h2>

      {data.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center shadow-sm">
          <div className="text-4xl mb-4">📭</div>
          <p className="text-gray-500 mb-4">No courses enrolled yet</p>
          <Link href="/courses"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
            Browse Courses
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.map((enrollment) => (
            <div key={enrollment.id}
              className="bg-white rounded-xl shadow-sm p-5">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-32 rounded-lg flex items-center justify-center mb-4">
                <span className="text-white text-3xl">📚</span>
              </div>
              <h3 className="font-semibold text-gray-800 mb-1">
                {enrollment.course.title}
              </h3>
              <p className="text-gray-500 text-sm mb-3">
                {enrollment.course.description}
              </p>
              <span className="text-green-600 text-sm font-medium">
                ✅ Enrolled
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
