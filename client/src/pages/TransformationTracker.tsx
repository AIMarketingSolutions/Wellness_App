import { useAuth } from "@/lib/auth";
import { Link } from "wouter";
import { ArrowLeft, TrendingUp, User, Scale, Activity, Target, Apple, TrendingDown, Ruler } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

export default function TransformationTracker() {
  const { user } = useAuth();

  // Fetch profile data
  const { data: profile, isLoading } = useQuery({
    queryKey: ["/api/profile"],
  });

  // Calculate TEE
  const calculateTEE = () => {
    if (!profile?.age || !profile?.weightKg || !profile?.heightCm) return 0;

    let bmr = 0;
    if (profile.gender === "male") {
      bmr = 66.5 + (13.75 * parseFloat(profile.weightKg)) + (5.003 * parseFloat(profile.heightCm)) - (6.755 * profile.age);
    } else {
      bmr = 655.1 + (9.563 * parseFloat(profile.weightKg)) + (1.850 * parseFloat(profile.heightCm)) - (4.676 * profile.age);
    }

    const activityMultipliers: Record<string, number> = {
      sedentary: 1.2,
      lightly_active: 1.375,
      moderately_active: 1.55,
      very_active: 1.725,
    };

    const multiplier = activityMultipliers[profile.activityLevel || 'moderately_active'];
    return Math.round(bmr * multiplier);
  };

  const activityLevelLabels: Record<string, string> = {
    sedentary: "Sedentary",
    lightly_active: "Lightly Active",
    moderately_active: "Moderately Active",
    very_active: "Very Active",
  };

  const metabolicProfileLabels: Record<string, string> = {
    fast_oxidizer: "Fast Oxidizer (25% Protein, 35% Carbs, 40% Fat)",
    slow_oxidizer: "Slow Oxidizer (35% Protein, 25% Carbs, 40% Fat)",
    medium_oxidizer: "Medium Oxidizer (30% Protein, 30% Carbs, 40% Fat)",
  };

  const mealPlanTypeLabels: Record<string, string> = {
    three_meals: "Three Meals (33.33% each)",
    three_meals_one_snack: "Three Meals + One Snack (30% each + 10% snack)",
    three_meals_two_snacks: "Three Meals + Two Snacks (26.67% each + 10% snacks)",
  };

  const weightLossGoalLabels: Record<string, string> = {
    maintain: "Maintain Weight (0 lbs/week)",
    lose_0_5: "Lose 0.5 lbs/week (-250 cal/day)",
    lose_1: "Lose 1 lb/week (-500 cal/day)",
    lose_1_5: "Lose 1.5 lbs/week (-750 cal/day)",
    lose_2: "Lose 2 lbs/week (-1,000 cal/day)",
  };

  const getMetabolicProfileDisplay = () => {
    if (!profile?.metabolicProfile) return "Not set";
    
    if (profile.metabolicProfile === "custom" || 
        (profile.customProteinPercentage && profile.customCarbPercentage && profile.customFatPercentage)) {
      return `Custom Ratio (${profile.customProteinPercentage}% Protein, ${profile.customCarbPercentage}% Carbs, ${profile.customFatPercentage}% Fat)`;
    }
    
    return metabolicProfileLabels[profile.metabolicProfile] || "Not set";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#52C878]/5 via-[#4A90E2]/5 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#52C878] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your tracker...</p>
        </div>
      </div>
    );
  }

  const tee = calculateTEE();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#52C878]/5 via-[#4A90E2]/5 to-white">
      {/* Header */}
      <header className="bg-gradient-to-r from-[#4A90E2] to-[#52C878] text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/dashboard" data-testid="link-dashboard" className="flex items-center gap-2 text-white/90 hover:text-white transition-colors group">
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
            Track your progress and view your personalized health profile
          </p>
        </div>

        {!profile ? (
          /* No Profile State */
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-12 shadow-xl border border-gray-100 text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-[#4A90E2]/10 p-6 rounded-full">
                <User className="w-12 h-12 text-[#4A90E2]" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-[#2C3E50] mb-3">Complete Your Profile First</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Before you can track your transformation, please complete your Personal Profile Assessment.
            </p>
            <Link href="/profile-assessment">
              <button
                data-testid="button-complete-profile"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#4A90E2] to-[#52C878] hover:from-[#4A90E2]/90 hover:to-[#52C878]/90 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
              >
                <User className="w-5 h-5" />
                Complete Profile Assessment
              </button>
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Weight Tracking Section */}
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-bold text-[#2C3E50] flex items-center gap-2 mb-6">
                <Scale className="w-6 h-6 text-[#52C878]" />
                Weight Tracking
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl border border-blue-200">
                  <p className="text-sm font-semibold text-blue-700 mb-2">Starting Weight</p>
                  <p className="text-3xl font-bold text-blue-900" data-testid="text-starting-weight">
                    {profile.startingWeightKg ? `${profile.startingWeightKg} kg` : "Not set"}
                  </p>
                </div>

                <div className="p-6 bg-gradient-to-br from-[#52C878]/10 to-[#52C878]/20 rounded-xl border border-[#52C878]/30">
                  <p className="text-sm font-semibold text-[#52C878] mb-2">Current Weight</p>
                  <p className="text-3xl font-bold text-[#2C3E50]" data-testid="text-current-weight">
                    {profile.currentWeightKg ? `${profile.currentWeightKg} kg` : "Not set"}
                  </p>
                </div>

                <div className="p-6 bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-xl border border-purple-200">
                  <p className="text-sm font-semibold text-purple-700 mb-2">Goal Weight</p>
                  <p className="text-3xl font-bold text-purple-900" data-testid="text-goal-weight">
                    {profile.goalWeightKg ? `${profile.goalWeightKg} kg` : "Not set"}
                  </p>
                </div>
              </div>
            </div>

            {/* Body Measurements Section */}
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-bold text-[#2C3E50] flex items-center gap-2 mb-6">
                <Ruler className="w-6 h-6 text-[#52C878]" />
                Body Measurements
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-gradient-to-br from-orange-50 to-orange-100/50 rounded-xl border border-orange-200">
                  <p className="text-sm font-semibold text-orange-700 mb-2">Waist Measurement</p>
                  <p className="text-2xl font-bold text-orange-900" data-testid="text-waist">
                    {profile.waistCm ? `${profile.waistCm} cm` : "Not set"}
                  </p>
                </div>

                <div className="p-6 bg-gradient-to-br from-teal-50 to-teal-100/50 rounded-xl border border-teal-200">
                  <p className="text-sm font-semibold text-teal-700 mb-2">Neck Measurement</p>
                  <p className="text-2xl font-bold text-teal-900" data-testid="text-neck">
                    {profile.neckCm ? `${profile.neckCm} cm` : "Not set"}
                  </p>
                </div>
              </div>
            </div>

            {/* Daily Calories & Activity Section */}
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-bold text-[#2C3E50] flex items-center gap-2 mb-6">
                <Activity className="w-6 h-6 text-[#52C878]" />
                Energy & Activity Profile
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-gradient-to-br from-[#52C878]/10 to-[#4A90E2]/10 rounded-xl border border-[#52C878]/30">
                  <p className="text-sm font-semibold text-[#52C878] mb-2">Total Daily Calories</p>
                  <p className="text-3xl font-bold text-[#2C3E50]" data-testid="text-total-daily-calories">
                    {tee > 0 ? `${tee} calories/day` : "Not calculated"}
                  </p>
                </div>

                <div className="p-6 bg-gradient-to-br from-indigo-50 to-indigo-100/50 rounded-xl border border-indigo-200">
                  <p className="text-sm font-semibold text-indigo-700 mb-2">Activity Level</p>
                  <p className="text-xl font-bold text-indigo-900" data-testid="text-activity-level">
                    {profile.activityLevel ? activityLevelLabels[profile.activityLevel] : "Not set"}
                  </p>
                </div>
              </div>
            </div>

            {/* Weight Loss Goal Section */}
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-bold text-[#2C3E50] flex items-center gap-2 mb-6">
                <TrendingDown className="w-6 h-6 text-[#52C878]" />
                Weight Loss Goal
              </h2>

              <div className="p-6 bg-gradient-to-br from-red-50 to-orange-50 rounded-xl border border-red-200">
                <p className="text-sm font-semibold text-red-700 mb-2">Weekly Target</p>
                <p className="text-xl font-bold text-red-900" data-testid="text-weight-loss-goal">
                  {profile.weightLossGoal ? weightLossGoalLabels[profile.weightLossGoal] : "Not set"}
                </p>
              </div>
            </div>

            {/* Meal Plan Type Section */}
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-bold text-[#2C3E50] flex items-center gap-2 mb-6">
                <Apple className="w-6 h-6 text-[#52C878]" />
                Meal Plan Configuration
              </h2>

              <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200">
                <p className="text-sm font-semibold text-green-700 mb-2">Meal Plan Type</p>
                <p className="text-xl font-bold text-green-900" data-testid="text-meal-plan-type">
                  {profile.mealPlanType ? mealPlanTypeLabels[profile.mealPlanType] : "Not set"}
                </p>
              </div>
            </div>

            {/* Metabolic Profile Section */}
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-bold text-[#2C3E50] flex items-center gap-2 mb-6">
                <Target className="w-6 h-6 text-[#52C878]" />
                Metabolic Profile
              </h2>

              <div className="p-6 bg-gradient-to-br from-violet-50 to-purple-50 rounded-xl border border-violet-200">
                <p className="text-sm font-semibold text-violet-700 mb-2">Macronutrient Distribution</p>
                <p className="text-lg font-bold text-violet-900" data-testid="text-metabolic-profile">
                  {getMetabolicProfileDisplay()}
                </p>
              </div>
            </div>

            {/* Update Profile Button */}
            <div className="text-center mt-8">
              <Link href="/profile-assessment">
                <button
                  data-testid="button-update-profile"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#52C878] to-[#4A90E2] hover:from-[#52C878]/90 hover:to-[#4A90E2]/90 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
                >
                  <User className="w-5 h-5" />
                  Update Profile Assessment
                </button>
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
