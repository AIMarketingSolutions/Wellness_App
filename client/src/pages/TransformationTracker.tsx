import { useAuth } from "@/lib/auth";
import { Link } from "wouter";
import { ArrowLeft, TrendingUp, User, Scale, Activity, Target, Apple, TrendingDown, Ruler, ChefHat, Dumbbell } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface ExerciseType {
  id: string;
  name: string;
  category: string;
  caloriesPerMinute: string;
  description: string | null;
}

interface DailyExercise {
  id: string;
  userId: string;
  exerciseTypeId: string;
  exerciseDate: string;
  durationMinutes: number;
  caloriesBurned: string;
  isCompleted: boolean;
}

export default function TransformationTracker() {
  const { user } = useAuth();

  // Fetch profile data
  const { data: profile, isLoading } = useQuery({
    queryKey: ["/api/profile"],
  });

  // Fetch exercise types
  const { data: exerciseTypes = [] } = useQuery<ExerciseType[]>({
    queryKey: ["/api/exercise-types"],
  });

  // Fetch today's exercise
  const { data: todayExercise } = useQuery<DailyExercise | null>({
    queryKey: ["/api/daily-exercise/today"],
  });

  // Calculate calories burned from today's exercise
  const exerciseCalories = (() => {
    if (!todayExercise) return 0;
    return parseInt(todayExercise.caloriesBurned) || 0;
  })();

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

  // Calculate TEE first so it's available for macro calculations
  const tee = calculateTEE();

  // Calculate Daily Calorie Target and Macros
  const calculateMacros = () => {
    if (!profile?.weightLossGoal || !profile?.metabolicProfile || !profile?.mealPlanType) {
      return null;
    }

    // Guard: TEE must be calculated before proceeding
    if (!tee || tee === 0) {
      return null;
    }

    // Get deficit from weight loss goal
    const deficits: Record<string, number> = {
      maintain: 0,
      lose_0_5: 250,
      lose_1: 500,
      lose_1_5: 750,
      lose_2: 1000,
    };

    const deficit = deficits[profile.weightLossGoal] || 0;
    
    // Calculate DCT with safety minimums and add exercise calories
    const minimumCalories = profile.gender === 'male' ? 1500 : 1200;
    const baseDct = Math.max(tee - deficit, minimumCalories);
    const dct = baseDct + exerciseCalories;

    // Get macro percentages
    let proteinPercent = 30;
    let carbPercent = 30;
    let fatPercent = 40;

    if (profile.metabolicProfile === 'fast_oxidizer') {
      proteinPercent = 25;
      carbPercent = 35;
      fatPercent = 40;
    } else if (profile.metabolicProfile === 'slow_oxidizer') {
      proteinPercent = 35;
      carbPercent = 25;
      fatPercent = 40;
    } else if (profile.metabolicProfile === 'medium_oxidizer') {
      proteinPercent = 30;
      carbPercent = 30;
      fatPercent = 40;
    } else if (profile.customProteinPercentage && profile.customCarbPercentage && profile.customFatPercentage) {
      proteinPercent = parseFloat(profile.customProteinPercentage);
      carbPercent = parseFloat(profile.customCarbPercentage);
      fatPercent = parseFloat(profile.customFatPercentage);
    }

    // Calculate total daily macros in grams
    const dailyProteinGrams = Math.round((dct * (proteinPercent / 100)) / 4);
    const dailyCarbGrams = Math.round((dct * (carbPercent / 100)) / 4);
    const dailyFatGrams = Math.round((dct * (fatPercent / 100)) / 9);

    // Get meal distribution percentages
    const mealDistributions: Record<string, { breakfast: number; lunch: number; dinner: number; snack1?: number; snack2?: number }> = {
      three_meals: {
        breakfast: 33.33,
        lunch: 33.33,
        dinner: 33.34,
      },
      three_meals_one_snack: {
        breakfast: 30,
        lunch: 30,
        dinner: 30,
        snack1: 10,
      },
      three_meals_two_snacks: {
        breakfast: 26.67,
        lunch: 26.67,
        dinner: 26.66,
        snack1: 10,
        snack2: 10,
      },
    };

    const distribution = mealDistributions[profile.mealPlanType];

    // Calculate macros per meal
    const meals = {
      breakfast: {
        calories: Math.round(dct * (distribution.breakfast / 100)),
        protein: Math.round(dailyProteinGrams * (distribution.breakfast / 100)),
        carbs: Math.round(dailyCarbGrams * (distribution.breakfast / 100)),
        fat: Math.round(dailyFatGrams * (distribution.breakfast / 100)),
      },
      lunch: {
        calories: Math.round(dct * (distribution.lunch / 100)),
        protein: Math.round(dailyProteinGrams * (distribution.lunch / 100)),
        carbs: Math.round(dailyCarbGrams * (distribution.lunch / 100)),
        fat: Math.round(dailyFatGrams * (distribution.lunch / 100)),
      },
      dinner: {
        calories: Math.round(dct * (distribution.dinner / 100)),
        protein: Math.round(dailyProteinGrams * (distribution.dinner / 100)),
        carbs: Math.round(dailyCarbGrams * (distribution.dinner / 100)),
        fat: Math.round(dailyFatGrams * (distribution.dinner / 100)),
      },
      snack1: distribution.snack1 ? {
        calories: Math.round(dct * (distribution.snack1 / 100)),
        protein: Math.round(dailyProteinGrams * (distribution.snack1 / 100)),
        carbs: Math.round(dailyCarbGrams * (distribution.snack1 / 100)),
        fat: Math.round(dailyFatGrams * (distribution.snack1 / 100)),
      } : undefined,
      snack2: distribution.snack2 ? {
        calories: Math.round(dct * (distribution.snack2 / 100)),
        protein: Math.round(dailyProteinGrams * (distribution.snack2 / 100)),
        carbs: Math.round(dailyCarbGrams * (distribution.snack2 / 100)),
        fat: Math.round(dailyFatGrams * (distribution.snack2 / 100)),
      } : undefined,
    };

    return {
      dct,
      dailyProteinGrams,
      dailyCarbGrams,
      dailyFatGrams,
      proteinPercent,
      carbPercent,
      fatPercent,
      meals,
    };
  };

  const macros = calculateMacros();

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

              <div className="space-y-6">
                {/* Waist Measurements */}
                <div>
                  <h3 className="text-lg font-semibold text-[#2C3E50] mb-3">Waist Measurement</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-6 bg-gradient-to-br from-orange-50 to-orange-100/50 rounded-xl border border-orange-200">
                      <p className="text-sm font-semibold text-orange-700 mb-2">Current</p>
                      <p className="text-2xl font-bold text-orange-900" data-testid="text-waist">
                        {profile.waistCm ? `${profile.waistCm} cm` : "Not set"}
                      </p>
                    </div>
                    <div className="p-6 bg-gradient-to-br from-orange-100 to-orange-200/50 rounded-xl border border-orange-300">
                      <p className="text-sm font-semibold text-orange-800 mb-2">Goal</p>
                      <p className="text-2xl font-bold text-orange-950" data-testid="text-goal-waist">
                        {profile.goalWaistCm ? `${profile.goalWaistCm} cm` : "Not set"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Neck Measurements */}
                <div>
                  <h3 className="text-lg font-semibold text-[#2C3E50] mb-3">Neck Measurement</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-6 bg-gradient-to-br from-teal-50 to-teal-100/50 rounded-xl border border-teal-200">
                      <p className="text-sm font-semibold text-teal-700 mb-2">Current</p>
                      <p className="text-2xl font-bold text-teal-900" data-testid="text-neck">
                        {profile.neckCm ? `${profile.neckCm} cm` : "Not set"}
                      </p>
                    </div>
                    <div className="p-6 bg-gradient-to-br from-teal-100 to-teal-200/50 rounded-xl border border-teal-300">
                      <p className="text-sm font-semibold text-teal-800 mb-2">Goal</p>
                      <p className="text-2xl font-bold text-teal-950" data-testid="text-goal-neck">
                        {profile.goalNeckCm ? `${profile.goalNeckCm} cm` : "Not set"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Hip Measurements (if available) */}
                {(profile.hipCm || profile.goalHipCm) && (
                  <div>
                    <h3 className="text-lg font-semibold text-[#2C3E50] mb-3">Hip Measurement</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-6 bg-gradient-to-br from-pink-50 to-pink-100/50 rounded-xl border border-pink-200">
                        <p className="text-sm font-semibold text-pink-700 mb-2">Current</p>
                        <p className="text-2xl font-bold text-pink-900" data-testid="text-hip">
                          {profile.hipCm ? `${profile.hipCm} cm` : "Not set"}
                        </p>
                      </div>
                      <div className="p-6 bg-gradient-to-br from-pink-100 to-pink-200/50 rounded-xl border border-pink-300">
                        <p className="text-sm font-semibold text-pink-800 mb-2">Goal</p>
                        <p className="text-2xl font-bold text-pink-950" data-testid="text-goal-hip">
                          {profile.goalHipCm ? `${profile.goalHipCm} cm` : "Not set"}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
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

            {/* Recommended Macros Per Meal Section */}
            {macros && (
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-xl p-8">
                <h2 className="text-2xl font-bold text-[#2C3E50] flex items-center gap-2 mb-6">
                  <ChefHat className="w-6 h-6 text-[#52C878]" />
                  Recommended Macros Per Meal
                </h2>

                {/* Calorie Breakdown with Exercise */}
                <div className="mb-8 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200">
                  <div className="flex items-center gap-3 mb-4">
                    <Dumbbell className="w-6 h-6 text-blue-600" />
                    <h3 className="text-lg font-bold text-[#2C3E50]">Calorie Breakdown</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="p-4 bg-white rounded-lg">
                      <p className="text-xs text-gray-600 mb-1">Total Daily Calories (TEE)</p>
                      <p className="text-2xl font-bold text-[#2C3E50]" data-testid="text-tee">
                        {tee}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">Base metabolism + activity</p>
                    </div>
                    <div className="p-4 bg-white rounded-lg">
                      <p className="text-xs text-gray-600 mb-1">Weight Loss Goal</p>
                      <p className="text-lg font-bold text-orange-600" data-testid="text-weight-loss-goal">
                        {profile.weightLossGoal ? weightLossGoalLabels[profile.weightLossGoal] : "Not set"}
                      </p>
                    </div>
                    <div className="p-4 bg-white rounded-lg">
                      <p className="text-xs text-gray-600 mb-1">Daily Fitness Routine</p>
                      {todayExercise ? (
                        <>
                          <p className="text-sm font-bold text-[#52C878]" data-testid="text-today-exercise">
                            {exerciseTypes.find(e => e.id === todayExercise.exerciseTypeId)?.name || "Exercise"}
                          </p>
                          <p className="text-xs text-gray-600">
                            {todayExercise.durationMinutes} min • <span className="text-[#52C878] font-semibold">{exerciseCalories} cal</span>
                          </p>
                        </>
                      ) : (
                        <p className="text-sm text-gray-500">No workout selected</p>
                      )}
                    </div>
                    <div className="p-4 bg-gradient-to-br from-[#52C878]/20 to-[#4A90E2]/20 rounded-lg border-2 border-[#52C878]/50">
                      <p className="text-xs text-gray-700 mb-1 font-semibold">Daily Calorie Target</p>
                      <p className="text-2xl font-bold text-[#52C878]" data-testid="text-dct-with-exercise">
                        {macros.dct}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        {exerciseCalories > 0 ? `Base ${macros.dct - exerciseCalories} + Exercise ${exerciseCalories}` : 'No exercise added'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Daily Summary */}
                <div className="mb-8 p-6 bg-gradient-to-br from-[#52C878]/10 to-[#4A90E2]/10 rounded-xl border-2 border-[#52C878]/30">
                  <h3 className="text-lg font-bold text-[#2C3E50] mb-4">Daily Macro Targets</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <p className="text-sm text-gray-600 mb-1">Calories</p>
                      <p className="text-2xl font-bold text-[#2C3E50]" data-testid="text-dct">
                        {macros.dct}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600 mb-1">Protein</p>
                      <p className="text-2xl font-bold text-[#52C878]" data-testid="text-daily-protein">
                        {macros.dailyProteinGrams}g
                      </p>
                      <p className="text-xs text-gray-500">{macros.proteinPercent}%</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600 mb-1">Carbs</p>
                      <p className="text-2xl font-bold text-[#4A90E2]" data-testid="text-daily-carbs">
                        {macros.dailyCarbGrams}g
                      </p>
                      <p className="text-xs text-gray-500">{macros.carbPercent}%</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600 mb-1">Fat</p>
                      <p className="text-2xl font-bold text-[#2C3E50]" data-testid="text-daily-fat">
                        {macros.dailyFatGrams}g
                      </p>
                      <p className="text-xs text-gray-500">{macros.fatPercent}%</p>
                    </div>
                  </div>
                </div>

                {/* Per-Meal Breakdown */}
                <div className="space-y-4">
                  {/* Breakfast */}
                  <div className="p-6 bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl border border-amber-200">
                    <h4 className="text-lg font-bold text-amber-900 mb-4">Breakfast</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-xs text-amber-700 mb-1">Calories</p>
                        <p className="text-xl font-bold text-amber-900" data-testid="text-breakfast-calories">
                          {macros.meals.breakfast.calories}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-amber-700 mb-1">Protein</p>
                        <p className="text-xl font-bold text-[#52C878]" data-testid="text-breakfast-protein">
                          {macros.meals.breakfast.protein}g
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-amber-700 mb-1">Carbs</p>
                        <p className="text-xl font-bold text-[#4A90E2]" data-testid="text-breakfast-carbs">
                          {macros.meals.breakfast.carbs}g
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-amber-700 mb-1">Fat</p>
                        <p className="text-xl font-bold text-amber-900" data-testid="text-breakfast-fat">
                          {macros.meals.breakfast.fat}g
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Lunch */}
                  <div className="p-6 bg-gradient-to-br from-sky-50 to-blue-50 rounded-xl border border-sky-200">
                    <h4 className="text-lg font-bold text-sky-900 mb-4">Lunch</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-xs text-sky-700 mb-1">Calories</p>
                        <p className="text-xl font-bold text-sky-900" data-testid="text-lunch-calories">
                          {macros.meals.lunch.calories}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-sky-700 mb-1">Protein</p>
                        <p className="text-xl font-bold text-[#52C878]" data-testid="text-lunch-protein">
                          {macros.meals.lunch.protein}g
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-sky-700 mb-1">Carbs</p>
                        <p className="text-xl font-bold text-[#4A90E2]" data-testid="text-lunch-carbs">
                          {macros.meals.lunch.carbs}g
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-sky-700 mb-1">Fat</p>
                        <p className="text-xl font-bold text-sky-900" data-testid="text-lunch-fat">
                          {macros.meals.lunch.fat}g
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Dinner */}
                  <div className="p-6 bg-gradient-to-br from-rose-50 to-pink-50 rounded-xl border border-rose-200">
                    <h4 className="text-lg font-bold text-rose-900 mb-4">Dinner</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-xs text-rose-700 mb-1">Calories</p>
                        <p className="text-xl font-bold text-rose-900" data-testid="text-dinner-calories">
                          {macros.meals.dinner.calories}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-rose-700 mb-1">Protein</p>
                        <p className="text-xl font-bold text-[#52C878]" data-testid="text-dinner-protein">
                          {macros.meals.dinner.protein}g
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-rose-700 mb-1">Carbs</p>
                        <p className="text-xl font-bold text-[#4A90E2]" data-testid="text-dinner-carbs">
                          {macros.meals.dinner.carbs}g
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-rose-700 mb-1">Fat</p>
                        <p className="text-xl font-bold text-rose-900" data-testid="text-dinner-fat">
                          {macros.meals.dinner.fat}g
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Snack 1 (if applicable) */}
                  {macros.meals.snack1 && (
                    <div className="p-6 bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl border border-emerald-200">
                      <h4 className="text-lg font-bold text-emerald-900 mb-4">Snack 1</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-xs text-emerald-700 mb-1">Calories</p>
                          <p className="text-xl font-bold text-emerald-900" data-testid="text-snack1-calories">
                            {macros.meals.snack1.calories}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-emerald-700 mb-1">Protein</p>
                          <p className="text-xl font-bold text-[#52C878]" data-testid="text-snack1-protein">
                            {macros.meals.snack1.protein}g
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-emerald-700 mb-1">Carbs</p>
                          <p className="text-xl font-bold text-[#4A90E2]" data-testid="text-snack1-carbs">
                            {macros.meals.snack1.carbs}g
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-emerald-700 mb-1">Fat</p>
                          <p className="text-xl font-bold text-emerald-900" data-testid="text-snack1-fat">
                            {macros.meals.snack1.fat}g
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Snack 2 (if applicable) */}
                  {macros.meals.snack2 && (
                    <div className="p-6 bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl border border-purple-200">
                      <h4 className="text-lg font-bold text-purple-900 mb-4">Snack 2</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-xs text-purple-700 mb-1">Calories</p>
                          <p className="text-xl font-bold text-purple-900" data-testid="text-snack2-calories">
                            {macros.meals.snack2.calories}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-purple-700 mb-1">Protein</p>
                          <p className="text-xl font-bold text-[#52C878]" data-testid="text-snack2-protein">
                            {macros.meals.snack2.protein}g
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-purple-700 mb-1">Carbs</p>
                          <p className="text-xl font-bold text-[#4A90E2]" data-testid="text-snack2-carbs">
                            {macros.meals.snack2.carbs}g
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-purple-700 mb-1">Fat</p>
                          <p className="text-xl font-bold text-purple-900" data-testid="text-snack2-fat">
                            {macros.meals.snack2.fat}g
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <p className="text-sm text-blue-800 text-center">
                    💡 Use these macro targets in the Daily Meal Calculator to plan your meals
                  </p>
                </div>
              </div>
            )}

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
