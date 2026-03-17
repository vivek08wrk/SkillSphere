import Link from 'next/link';

export default function CourseCard({ course }) {
  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-40 rounded-t-xl flex items-center justify-center">
        <span className="text-white text-4xl">📚</span>
      </div>

      <div className="p-5">
        <h3 className="font-semibold text-lg mb-2 text-gray-800">
          {course.title}
        </h3>

        <p className="text-gray-500 text-sm mb-4 line-clamp-2">
          {course.description || 'No description available'}
        </p>

        <div className="flex justify-between items-center">
          <span className="text-blue-600 font-bold text-lg">
            ₹{course.price}
          </span>
          <span className="text-gray-400 text-sm">
            {course._count?.enrollments || 0} students
          </span>
        </div>

        <Link href={`/courses/${course.id}`}
          className="mt-4 block text-center bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
          View Course
        </Link>
      </div>
    </div>
  );
}