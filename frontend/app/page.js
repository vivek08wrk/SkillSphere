import Link from 'next/link';

export default function Home() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-16">
      <div className="text-center mb-16">
        <h1 className="text-5xl font-bold text-gray-800 mb-6">
          Learn Without Limits
        </h1>
        <p className="text-xl text-gray-500 mb-8">
          Expert-led courses. Learn at your own pace.
        </p>
        <Link href="/courses"
          className="bg-blue-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-blue-700">
          Browse Courses
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { icon: '📚', title: 'Expert Courses', desc: 'Learn from industry professionals' },
          { icon: '🚀', title: 'Learn Fast', desc: 'Structured learning paths' },
          { icon: '🏆', title: 'Get Certified', desc: 'Earn certificates on completion' },
        ].map((feature) => (
          <div key={feature.title}
            className="bg-white p-8 rounded-xl shadow-sm text-center">
            <div className="text-4xl mb-4">{feature.icon}</div>
            <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
            <p className="text-gray-500">{feature.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}