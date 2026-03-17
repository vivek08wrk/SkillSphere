'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { courseAPI } from '../../../lib/api';
import { useAuth } from '../../../context/AuthContext';

export default function CreateCoursePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    isPublished: false
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/login');
      return;
    }
    if (user.role !== 'INSTRUCTOR') {
      router.push('/dashboard');
    }
  }, [user, authLoading]);

  const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');
  setLoading(true);

  try {
    // Step 1: Course banao
    const response = await courseAPI.create({
      title: formData.title,
      description: formData.description,
      price: Number(formData.price)
    });

    const courseId = response.data.id;

    // Step 2: Agar publish checkbox tick tha → Publish karo
    if (formData.isPublished) {
      await courseAPI.update(courseId, { isPublished: true });
    }

    router.push('/courses');
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};

  if (authLoading) return (
    <div className="flex justify-center items-center min-h-64">
      <div className="text-gray-500">Loading...</div>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">

      <h1 className="text-3xl font-bold text-gray-800 mb-2">
        Create New Course 🎓
      </h1>
      <p className="text-gray-500 mb-8">
        Share your knowledge with students
      </p>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm p-8">
        <form onSubmit={handleSubmit} className="space-y-6">

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Course Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. React Masterclass"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Describe your course..."
              rows={4}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Price (₹) *
            </label>
            <input
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({...formData, price: e.target.value})}
              className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. 999"
              min="0"
              required
            />
          </div>

          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
            <input
              type="checkbox"
              id="isPublished"
              checked={formData.isPublished}
              onChange={(e) => setFormData({...formData, isPublished: e.target.checked})}
              className="w-4 h-4 text-blue-600"
            />
            <label htmlFor="isPublished" className="text-sm text-gray-700">
              Publish course (visible to students)
            </label>
          </div>

          <div className="flex gap-4 pt-2">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50">
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50">
              {loading ? 'Creating...' : 'Create Course 🚀'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}