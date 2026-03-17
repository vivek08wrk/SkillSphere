'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { courseAPI, paymentAPI } from '../../../lib/api';
import { useAuth } from '../../../context/AuthContext';
import toast from 'react-hot-toast';

export default function CourseDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const router = useRouter();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false); // ← Add karo

  useEffect(() => {
    fetchCourse();
    if (user) checkEnrollment(); // ← Add karo
  }, [id, user]);

  const fetchCourse = async () => {
    try {
      const response = await courseAPI.getById(id);
      setCourse(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Check karo — student already enrolled hai?
  const checkEnrollment = async () => {
    try {
      const response = await courseAPI.getMyEnrollments();
      const enrolled = response.data.some(
        (enrollment) => enrollment.courseId === id
      );
      setIsEnrolled(enrolled);
    } catch (err) {
      console.error(err);
    }
  };

  const handlePayment = () => {
  if (!user) {
    router.push('/login');
    return;
  }
  // Payment page pe bhejo with course details
  router.push(
    `/payment?courseId=${id}&amount=${course.price}&title=${encodeURIComponent(course.title)}`
  );
};

  if (loading) return (
    <div className="flex justify-center items-center min-h-64">
      <div className="text-gray-500">Loading...</div>
    </div>
  );

  if (!course) return (
    <div className="text-center text-red-500 mt-10">Course not found</div>
  );

  const isOwner = user && user.role === 'INSTRUCTOR' && course.instructorId === user.id;
  const isAdmin = user && user.role === 'ADMIN';

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">

      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-white mb-8">
        <h1 className="text-3xl font-bold mb-3">{course.title}</h1>
        <p className="text-blue-100">{course.description}</p>
        <div className="mt-4 flex gap-6">
          <span>👥 {course._count?.enrollments || 0} students</span>
          <span>💰 ₹{course.price}</span>
          {!course.isPublished && (
            <span className="bg-yellow-500 text-white px-2 py-1 rounded text-sm">
              ⏳ Draft
            </span>
          )}
        </div>
      </div>

      {/* Action Section */}
      <div className="bg-white rounded-xl shadow-sm p-6">

        {/* Instructor — apna course */}
        {isOwner || isAdmin ? (
          <div className="flex justify-between items-center">
            <div>
              <span className="text-2xl font-bold text-blue-600">
                ₹{course.price}
              </span>
              <p className="text-gray-500 text-sm mt-1">
                Your course — {course._count?.enrollments || 0} students enrolled
              </p>
            </div>
            <div className="flex gap-3">
              {!course.isPublished && (
                <button
                  onClick={async () => {
                    await courseAPI.update(id, { isPublished: true });
                    toast.success('Course published successfully!');
                    fetchCourse();
                  }}
                  className="bg-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-700">
                  Publish Course ✅
                </button>
              )}
              <button
                onClick={() => router.push(`/courses/${id}/edit`)}
                className="bg-gray-100 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-200">
                Edit Course ✏️
              </button>
            </div>
          </div>

        ) : (
          /* Student section */
          <div className="flex justify-between items-center">
            <div>
              <span className="text-3xl font-bold text-blue-600">
                ₹{course.price}
              </span>
              <p className="text-gray-500 text-sm mt-1">
                One time payment
              </p>
            </div>

            {/* 3 cases */}
            {!user ? (
              // Case 1 — Login nahi hai
              <button
                onClick={() => router.push('/login')}
                className="bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-700">
                Login to Enroll 🔐
              </button>

            ) : isEnrolled ? (
              // Case 2 — Already enrolled
              <div className="text-right">
                <div className="bg-green-100 text-green-700 px-6 py-3 rounded-xl font-semibold mb-2">
                  ✅ Already Enrolled
                </div>
                <button
                  onClick={() => router.push('/dashboard')}
                  className="text-blue-600 text-sm hover:underline">
                  Go to Dashboard →
                </button>
              </div>

            ) : (
              // Case 3 — Buy karo
              <button
                onClick={handlePayment}
                disabled={paying}
                className="bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50">
                {paying ? 'Processing...' : 'Buy Now 🚀'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
