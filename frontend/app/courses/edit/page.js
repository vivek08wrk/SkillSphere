'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { courseAPI } from '../../../../lib/api';
import { useAuth } from '../../../../context/AuthContext';

export default function EditCoursePage() {
  const { id } = useParams();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    isPublished: false
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/login');
      return;
    }
    if (user.role !== 'INSTRUCTOR' && user.role !== 'ADMIN') {
      router.push('/dashboard');
      return;
    }
    fetchCourse();
  }, [user, authLoading]);

  const fetchCourse = async () => {
    try {
      const response = await courseAPI.getById(id);
      const course = response.data;

      // Check — sirf apna course edit kar sakta hai
      if (user.role !== 'ADMIN' && course.instructorId !== user.id) {
        router.push('/dashboard');
        return;
      }

      setFormData({
        title: course.title,
        description: course.description || '',
        price: course.price,
        isPublished: course.isPublished
      });
    } catch (err) {
      setError('Course not found');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      await courseAPI.update(id, {
        title: formData.title,
        description: formData.description,
        price: Number(formData.price),
        isPublished: formData.isPublished
      });
      router.push(`/courses/${id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await courseAPI.remove(id);
      router.push('/dashboard');
    } catch (err) {
      setError(err.message);
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  if (authLoading || loading) return (
    <div className="flex justify-center items-center min-h-64">
      <div className="text-gray-500">Loading...</div>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">

      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Edit Course ✏️</h1>
          <p className="text-gray-500 mt-1">Update your course details</p>
        </div>
        <button
          onClick={() => router.back()}
          className="text-gray-500 hover:text-gray-700">
          ← Back
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Edit Form */}
      <div className="bg-white rounded-xl shadow-sm p-8 mb-6">
        <form onSubmit={handleUpdate} className="space-y-6">

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Course Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
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

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50">
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50">
              {saving ? 'Saving...' : 'Save Changes ✅'}
            </button>
          </div>

        </form>
      </div>

      {/* Delete Section */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-red-100">
        <h2 className="text-lg font-semibold text-red-600 mb-2">
          Danger Zone 🚨
        </h2>
        <p className="text-gray-500 text-sm mb-4">
          Once deleted, this course and all enrollments will be permanently removed.
        </p>

        {!showDeleteConfirm ? (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="bg-red-50 text-red-600 border border-red-200 px-6 py-2 rounded-lg hover:bg-red-100">
            Delete Course 🗑️
          </button>
        ) : (
          <div className="bg-red-50 p-4 rounded-lg">
            <p className="text-red-700 font-medium mb-4">
              Are you sure? This action cannot be undone!
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50">
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 disabled:opacity-50">
                {deleting ? 'Deleting...' : 'Yes, Delete Course'}
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}