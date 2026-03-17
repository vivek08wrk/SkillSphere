'use client';

import { useState, useEffect } from 'react';
import CourseCard from '../../components/CourseCard';
import { courseAPI } from '../../lib/api';

export default function CoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Har baar page pe aao → Fresh fetch karo
  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const response = await courseAPI.getAll();
      setCourses(response.data.courses);
    } catch (err) {
      setError('Courses load nahi hue');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-64">
      <div className="text-gray-500 text-lg">Loading courses...</div>
    </div>
  );

  if (error) return (
    <div className="text-center text-red-500 mt-10">{error}</div>
  );

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">
        All Courses
      </h1>

      {courses.length === 0 ? (
        <div className="text-center text-gray-500 py-16">
          No courses available
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      )}
    </div>
  );
}