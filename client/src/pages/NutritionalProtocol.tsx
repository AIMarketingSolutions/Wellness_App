import { Link } from "wouter";
import { ArrowLeft, BookOpen, FileText, Lightbulb, TrendingUp } from "lucide-react";

export default function NutritionalProtocol() {
  const topics = [
    { title: "Metabolic Typing", desc: "Understanding your metabolic profile", icon: TrendingUp, color: "from-[#52C878] to-[#4A90E2]" },
    { title: "Macro Balance", desc: "Optimal protein, carbs, and fat ratios", icon: FileText, color: "from-[#4A90E2] to-[#52C878]" },
    { title: "Meal Timing", desc: "When to eat for best results", icon: Lightbulb, color: "from-[#52C878] to-[#4A90E2]" },
    { title: "Food Quality", desc: "Choosing nutrient-dense foods", icon: BookOpen, color: "from-[#4A90E2] to-[#52C878]" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#52C878]/5 via-[#4A90E2]/5 to-white">
      <header className="bg-gradient-to-r from-[#4A90E2] to-[#52C878] text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/dashboard" className="flex items-center gap-2 text-white/90 hover:text-white transition-colors group">
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Back to Dashboard</span>
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-r from-[#4A90E2] to-[#52C878] p-4 rounded-full">
              <BookOpen className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-[#2C3E50] mb-3">Nutritional Protocol</h1>
          <p className="text-lg text-gray-600">
            Evidence-based nutrition strategies from certified professionals
          </p>
        </div>

        {/* Topics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {topics.map((topic) => (
            <div key={topic.title} className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 cursor-pointer group">
              <div className={`bg-gradient-to-r ${topic.color} p-4 rounded-xl inline-block mb-4 group-hover:scale-110 transition-transform`}>
                <topic.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-[#2C3E50] mb-2 group-hover:text-[#52C878] transition-colors">{topic.title}</h3>
              <p className="text-gray-600">{topic.desc}</p>
              <div className="mt-4 text-[#52C878] font-medium flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                Learn More →
              </div>
            </div>
          ))}
        </div>

        {/* Info Section */}
        <div className="bg-gradient-to-r from-[#4A90E2] to-[#52C878] rounded-2xl p-8 text-white shadow-xl">
          <h3 className="text-2xl font-bold mb-4">Professional Guidance</h3>
          <p className="text-white/90 text-lg mb-6">
            Our nutritional protocols are developed by Registered Nutritional Consulting Practitioners (RNCP) 
            and are based on the latest scientific research and proven methodologies.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <p className="text-3xl font-bold mb-1">100%</p>
              <p className="text-white/80 text-sm">Evidence-Based</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <p className="text-3xl font-bold mb-1">RNCP</p>
              <p className="text-white/80 text-sm">Certified</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <p className="text-3xl font-bold mb-1">24/7</p>
              <p className="text-white/80 text-sm">Access</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
