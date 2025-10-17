import { Link } from "wouter";
import { ArrowLeft, Utensils, Plus, Coffee, Sun, Moon, Apple } from "lucide-react";

export default function MealPlan() {
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
              <Utensils className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-[#2C3E50] mb-3">Meal Planning</h1>
          <p className="text-lg text-gray-600">
            Personalized meal plans tailored to your macronutrient needs
          </p>
        </div>

        <div className="mb-8 text-center">
          <button className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#52C878] to-[#4A90E2] hover:from-[#52C878]/90 hover:to-[#4A90E2]/90 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300">
            <Plus className="w-5 h-5" />
            Create New Meal Plan
          </button>
        </div>

        {/* Macro Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
          {[
            { name: "Calories", value: "--", color: "bg-[#52C878]/10", textColor: "text-[#52C878]" },
            { name: "Protein", value: "-- g", color: "bg-[#4A90E2]/10", textColor: "text-[#4A90E2]" },
            { name: "Carbs", value: "-- g", color: "bg-[#52C878]/10", textColor: "text-[#52C878]" },
            { name: "Fats", value: "-- g", color: "bg-[#4A90E2]/10", textColor: "text-[#4A90E2]" },
          ].map((macro) => (
            <div key={macro.name} className={`${macro.color} rounded-xl p-6 text-center`}>
              <h3 className="text-sm font-medium text-gray-600 mb-1">{macro.name}</h3>
              <p className={`text-3xl font-bold ${macro.textColor}`}>{macro.value}</p>
            </div>
          ))}
        </div>

        {/* Empty State */}
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-12 shadow-sm border border-gray-100 text-center">
          <div className="flex justify-center mb-6">
            <div className="bg-[#52C878]/10 p-6 rounded-full">
              <Apple className="w-12 h-12 text-[#52C878]" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-[#2C3E50] mb-3">Create Your First Meal Plan</h3>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            Get started with personalized meal plans based on your metabolic profile and goals. 
            Complete your Profile Assessment first for customized recommendations.
          </p>
        </div>
      </main>
    </div>
  );
}
