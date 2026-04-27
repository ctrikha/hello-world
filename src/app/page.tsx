import Link from "next/link";

export default function LandingPage() {
  const appName = process.env.NEXT_PUBLIC_APP_NAME ?? "College Advisory";

  const features = [
    {
      icon: "🎓",
      title: "College Search & Matching",
      desc: "Explore thousands of colleges and get personalized fit scores based on your academic profile, preferences, and goals.",
    },
    {
      icon: "📋",
      title: "Application Tracker",
      desc: "Drag-and-drop Kanban board to manage all your applications from initial research through enrollment decision.",
    },
    {
      icon: "💬",
      title: "Advisor Messaging",
      desc: "Real-time messaging with your college advisor, plus easy scheduling for one-on-one consultations.",
    },
    {
      icon: "⭐",
      title: "AI-Powered Fit Scores",
      desc: "Our algorithm analyzes academic match, financial fit, location, size, and major availability to rank colleges for you.",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="border-b px-6 py-4 flex items-center justify-between max-w-6xl mx-auto">
        <span className="font-bold text-indigo-600 text-lg">{appName}</span>
        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            Sign in
          </Link>
          <Link
            href="/register"
            className="bg-indigo-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
          >
            Get started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 py-24 text-center">
        <h1 className="text-5xl font-bold text-gray-900 leading-tight">
          Find your perfect college
          <br />
          <span className="text-indigo-600">with expert guidance</span>
        </h1>
        <p className="text-xl text-gray-500 mt-6 max-w-2xl mx-auto leading-relaxed">
          A platform for students and college advisors to research, match, track
          applications, and communicate — all in one place.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
          <Link
            href="/register"
            className="bg-indigo-600 text-white px-8 py-3.5 rounded-xl font-medium hover:bg-indigo-700 transition text-lg"
          >
            Start for free
          </Link>
          <Link
            href="/login"
            className="border border-gray-200 text-gray-700 px-8 py-3.5 rounded-xl font-medium hover:bg-gray-50 transition text-lg"
          >
            Sign in
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Everything you need, in one platform
          </h2>
          <div className="grid sm:grid-cols-2 gap-6">
            {features.map((f) => (
              <div key={f.title} className="bg-white border rounded-2xl p-6">
                <div className="text-3xl mb-3">{f.icon}</div>
                <h3 className="font-semibold text-gray-900 text-lg mb-2">
                  {f.title}
                </h3>
                <p className="text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Ready to get started?
        </h2>
        <p className="text-gray-500 mb-8">
          Join students and advisors building better college journeys.
        </p>
        <Link
          href="/register"
          className="bg-indigo-600 text-white px-8 py-3.5 rounded-xl font-medium hover:bg-indigo-700 transition text-lg"
        >
          Create your account
        </Link>
      </section>

      <footer className="border-t py-6 text-center text-sm text-gray-400">
        © {new Date().getFullYear()} {appName}
      </footer>
    </div>
  );
}
