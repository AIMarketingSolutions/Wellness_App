import { Link } from "wouter";
import { ArrowLeft, Activity, Plus, Dumbbell, Timer, Flame } from "lucide-react";

export default function Fitness() {
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
              <Activity className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-[#2C3E50] mb-3">Fitness System</h1>
          <p className="text-lg text-gray-600">
            Custom workout plans and exercise tracking for optimal results
          </p>
        </div>

        <div className="mb-8 text-center">
          <button className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#4A90E2] to-[#52C878] hover:from-[#4A90E2]/90 hover:to-[#52C878]/90 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300">
            <Plus className="w-5 h-5" />
            Log Today's Workout
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {[
            { name: "Workouts This Week", value: "--", icon: Dumbbell, color: "bg-[#4A90E2]/10", textColor: "text-[#4A90E2]" },
            { name: "Total Time", value: "-- min", icon: Timer, color: "bg-[#52C878]/10", textColor: "text-[#52C878]" },
            { name: "Calories Burned", value: "--", icon: Flame, color: "bg-[#4A90E2]/10", textColor: "text-[#4A90E2]" },
          ].map((stat) => (
            <div key={stat.name} className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className={`${stat.color} p-3 rounded-xl inline-block mb-4`}>
                <stat.icon className={`w-6 h-6 ${stat.textColor}`} />
              </div>
              <h3 className="text-sm font-medium text-gray-600 mb-1">{stat.name}</h3>
              <p className={`text-3xl font-bold ${stat.textColor}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Empty State */}
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-12 shadow-sm border border-gray-100 text-center">
          <div className="flex justify-center mb-6">
            <div className="bg-[#4A90E2]/10 p-6 rounded-full">
              <Dumbbell className="w-12 h-12 text-[#4A90E2]" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-[#2C3E50] mb-3">Start Your Fitness Journey</h3>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            Track your workouts, monitor your progress, and achieve your fitness goals. 
            Log your first workout to get started!
          </p>
        </div>
      </main>
    </div>
  );
}
