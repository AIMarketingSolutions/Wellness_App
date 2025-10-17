import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { Link } from "wouter";
import { ArrowLeft, TrendingUp, Scale, Percent, Calendar, Plus } from "lucide-react";

export default function TransformationTracker() {
  const { user } = useAuth();
  const [showAddModal, setShowAddModal] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#52C878]/5 via-[#4A90E2]/5 to-white">
      {/* Header */}
      <header className="bg-gradient-to-r from-[#4A90E2] to-[#52C878] text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/dashboard" className="flex items-center gap-2 text-white/90 hover:text-white transition-colors group">
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Back to Dashboard</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Title Section */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-r from-[#4A90E2] to-[#52C878] p-4 rounded-full">
              <TrendingUp className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-[#2C3E50] mb-3">Transformation Tracker</h1>
          <p className="text-lg text-gray-600">
            Track your body composition and see your amazing progress over time
          </p>
        </div>

        {/* Add Measurement Button */}
        <div className="mb-8 text-center">
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#4A90E2] to-[#52C878] hover:from-[#4A90E2]/90 hover:to-[#52C878]/90 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
          >
            <Plus className="w-5 h-5" />
            Add New Measurement
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-[#4A90E2]/10 p-3 rounded-xl">
                <Scale className="w-6 h-6 text-[#4A90E2]" />
              </div>
              <span className="text-sm text-gray-500">Current</span>
            </div>
            <h3 className="text-3xl font-bold text-[#2C3E50] mb-1">--</h3>
            <p className="text-gray-600">Weight (lbs)</p>
          </div>

          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-[#52C878]/10 p-3 rounded-xl">
                <Percent className="w-6 h-6 text-[#52C878]" />
              </div>
              <span className="text-sm text-gray-500">Current</span>
            </div>
            <h3 className="text-3xl font-bold text-[#2C3E50] mb-1">--</h3>
            <p className="text-gray-600">Body Fat %</p>
          </div>

          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-gradient-to-r from-[#4A90E2]/10 to-[#52C878]/10 p-3 rounded-xl">
                <TrendingUp className="w-6 h-6 text-[#52C878]" />
              </div>
              <span className="text-sm text-gray-500">Total</span>
            </div>
            <h3 className="text-3xl font-bold text-[#2C3E50] mb-1">--</h3>
            <p className="text-gray-600">Progress</p>
          </div>
        </div>

        {/* Empty State */}
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-12 shadow-sm border border-gray-100 text-center">
          <div className="flex justify-center mb-6">
            <div className="bg-[#4A90E2]/10 p-6 rounded-full">
              <Calendar className="w-12 h-12 text-[#4A90E2]" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-[#2C3E50] mb-3">Start Tracking Your Progress</h3>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            Add your first measurement to begin tracking your transformation journey. 
            Regular tracking helps you stay motivated and see real results!
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#4A90E2] to-[#52C878] hover:from-[#4A90E2]/90 hover:to-[#52C878]/90 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
          >
            <Plus className="w-5 h-5" />
            Get Started
          </button>
        </div>
      </main>
    </div>
  );
}
