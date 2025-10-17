import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { Link } from "wouter";
import { ArrowLeft, Dumbbell, User, Scale, Ruler, Calendar, Activity, Target } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function ProfileAssessment() {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  
  // Form state
  const [formData, setFormData] = useState({
    age: "",
    gender: "male",
    weight: "",
    height: "",
    activityLevel: "moderately_active",
    metabolicProfile: "medium_oxidizer",
    weightLossGoal: "maintain"
  });

  // Fetch existing profile
  const { data: profile, isLoading } = useQuery({
    queryKey: ["/api/profile"],
  });

  // Save profile mutation
  const saveMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("/api/profile", {
        method: profile ? "PATCH" : "POST",
        body: JSON.stringify(formData),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveMutation.mutateAsync();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#52C878]/5 via-[#4A90E2]/5 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#52C878] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#52C878]/5 via-[#4A90E2]/5 to-white">
      {/* Header */}
      <header className="bg-gradient-to-r from-[#52C878] to-[#4A90E2] text-white shadow-lg">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/dashboard" className="flex items-center gap-2 text-white/90 hover:text-white transition-colors group">
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Back to Dashboard</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Title Section */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-r from-[#52C878] to-[#4A90E2] p-4 rounded-full">
              <User className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-[#2C3E50] mb-3">Profile Assessment</h1>
          <p className="text-lg text-gray-600">
            Complete your health profile to get personalized recommendations
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-[#2C3E50] flex items-center gap-2">
                <User className="w-6 h-6 text-[#52C878]" />
                Basic Information
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-[#2C3E50] mb-2">
                    Age
                  </label>
                  <input
                    type="number"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#52C878]/20 focus:border-[#52C878]"
                    placeholder="Enter your age"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#2C3E50] mb-2">
                    Gender
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#52C878]/20 focus:border-[#52C878]"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-[#2C3E50] mb-2 flex items-center gap-2">
                    <Scale className="w-4 h-4 text-[#52C878]" />
                    Weight (lbs)
                  </label>
                  <input
                    type="number"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#52C878]/20 focus:border-[#52C878]"
                    placeholder="Enter your weight"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#2C3E50] mb-2 flex items-center gap-2">
                    <Ruler className="w-4 h-4 text-[#52C878]" />
                    Height (inches)
                  </label>
                  <input
                    type="number"
                    value={formData.height}
                    onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#52C878]/20 focus:border-[#52C878]"
                    placeholder="Enter your height"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Activity Level */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-[#2C3E50] flex items-center gap-2">
                <Activity className="w-6 h-6 text-[#4A90E2]" />
                Activity Level
              </h2>
              
              <select
                value={formData.activityLevel}
                onChange={(e) => setFormData({ ...formData, activityLevel: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#4A90E2]/20 focus:border-[#4A90E2]"
              >
                <option value="sedentary">Sedentary (little or no exercise)</option>
                <option value="lightly_active">Lightly Active (1-3 days/week)</option>
                <option value="moderately_active">Moderately Active (3-5 days/week)</option>
                <option value="very_active">Very Active (6-7 days/week)</option>
                <option value="extremely_active">Extremely Active (athlete level)</option>
              </select>
            </div>

            {/* Metabolic Profile */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-[#2C3E50] flex items-center gap-2">
                <Dumbbell className="w-6 h-6 text-[#52C878]" />
                Metabolic Profile
              </h2>
              
              <select
                value={formData.metabolicProfile}
                onChange={(e) => setFormData({ ...formData, metabolicProfile: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#52C878]/20 focus:border-[#52C878]"
              >
                <option value="fast_oxidizer">Fast Oxidizer (High Protein/Fat)</option>
                <option value="medium_oxidizer">Medium Oxidizer (Balanced)</option>
                <option value="slow_oxidizer">Slow Oxidizer (Higher Carbs)</option>
              </select>
            </div>

            {/* Weight Loss Goal */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-[#2C3E50] flex items-center gap-2">
                <Target className="w-6 h-6 text-[#4A90E2]" />
                Weight Loss Goal
              </h2>
              
              <select
                value={formData.weightLossGoal}
                onChange={(e) => setFormData({ ...formData, weightLossGoal: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#4A90E2]/20 focus:border-[#4A90E2]"
              >
                <option value="maintain">Maintain Current Weight</option>
                <option value="lose_0_5">Lose 0.5 lbs/week</option>
                <option value="lose_1">Lose 1 lb/week</option>
                <option value="lose_1_5">Lose 1.5 lbs/week</option>
                <option value="lose_2">Lose 2 lbs/week</option>
              </select>
            </div>

            {/* Submit Button */}
            <div className="pt-6">
              <button
                type="submit"
                disabled={saveMutation.isPending}
                className="w-full py-4 bg-gradient-to-r from-[#52C878] to-[#4A90E2] hover:from-[#52C878]/90 hover:to-[#4A90E2]/90 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold text-lg rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 disabled:transform-none transition-all duration-300"
              >
                {saveMutation.isPending ? "Saving..." : profile ? "Update Profile" : "Save Profile"}
              </button>
            </div>
          </form>

          {saveMutation.isSuccess && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-xl">
              <p className="text-green-700 font-medium text-center">
                ✓ Profile saved successfully!
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
