import { Link } from "wouter";
import { ArrowLeft, Pill, CheckCircle2, Clock, Star } from "lucide-react";

export default function Supplement() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#52C878]/5 via-[#4A90E2]/5 to-white">
      <header className="bg-gradient-to-r from-[#52C878] to-[#4A90E2] text-white shadow-lg">
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
            <div className="bg-gradient-to-r from-[#52C878] to-[#4A90E2] p-4 rounded-full">
              <Pill className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-[#2C3E50] mb-3">Supplement Guide</h1>
          <p className="text-lg text-gray-600">
            Personalized supplement recommendations based on your health profile
          </p>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {[
            { title: "Essential Supplements", icon: Star, color: "bg-[#52C878]/10", textColor: "text-[#52C878]", desc: "Core supplements for your goals" },
            { title: "Daily Reminders", icon: Clock, color: "bg-[#4A90E2]/10", textColor: "text-[#4A90E2]", desc: "Never miss a dose" },
            { title: "Track Progress", icon: CheckCircle2, color: "bg-[#52C878]/10", textColor: "text-[#52C878]", desc: "Monitor your consistency" },
          ].map((card) => (
            <div key={card.title} className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className={`${card.color} p-3 rounded-xl inline-block mb-4`}>
                <card.icon className={`w-6 h-6 ${card.textColor}`} />
              </div>
              <h3 className="text-xl font-bold text-[#2C3E50] mb-2">{card.title}</h3>
              <p className="text-gray-600">{card.desc}</p>
            </div>
          ))}
        </div>

        {/* Empty State */}
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-12 shadow-sm border border-gray-100 text-center">
          <div className="flex justify-center mb-6">
            <div className="bg-[#52C878]/10 p-6 rounded-full">
              <Pill className="w-12 h-12 text-[#52C878]" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-[#2C3E50] mb-3">Get Personalized Recommendations</h3>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            Based on your profile and goals, we'll recommend supplements that can support your wellness journey. 
            Complete your Profile Assessment to get started.
          </p>
        </div>
      </main>
    </div>
  );
}
