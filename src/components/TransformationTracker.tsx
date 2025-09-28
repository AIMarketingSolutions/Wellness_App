import React, { useState, useEffect } from 'react';
import { User, Target, TrendingUp, Calendar, Activity, Dumbbell, Scale, Clock, Award, ChevronRight, Home, Plus, Minus, Zap } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface UserProfile {
  id?: string;
  user_id: string;
  full_name: string;
  gender: 'male' | 'female';
  age: number;
  weight_lbs: number;
  height_inches: number;
  activity_level: string;
  metabolic_profile: string;
  weight_loss_goal?: string;
  target_weight?: number;
  custom_protein_percentage?: number;
  custom_carb_percentage?: number;
  custom_fat_percentage?: number;
}

interface TEECalculation {
  bmr: number;
  activity_multiplier: number;
  base_tee: number;
  exercise_calories: number;
  total_daily_calories: number;
  protein_percentage: number;
  carb_percentage: number;
  fat_percentage: number;
}

interface TransformationData {
  profile: UserProfile | null;
  tee: TEECalculation | null;
  progress: {
    weeks_elapsed: number;
    weight_change: number;
    goal_progress: number;
    estimated_completion: string;
  };
}

function TransformationTracker() {
  const [transformationData, setTransformationData] = useState<TransformationData>({
    profile: null,
    tee: null,
    progress: {
      weeks_elapsed: 0,
      weight_change: 0,
      goal_progress: 0,
      estimated_completion: ''
    }
  });
  const [activeTab, setActiveTab] = useState<'overview' | 'calories'>('overview');
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        await loadTransformationData(user.id);
      }
      setLoading(false);
    };
    getUser();
  }, []);

  const loadTransformationData = async (userId: string) => {
    try {
      // Load user profile
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (profileError) {
        console.error('Error loading profile:', profileError);
        return;
      }

      // Calculate TEE with all components
      const teeCalculation = calculateTEE(profile);
      
      // Calculate progress metrics
      const progress = calculateProgress(profile);

      setTransformationData({
        profile,
        tee: teeCalculation,
        progress
      });
    } catch (error) {
      console.error('Error loading transformation data:', error);
    }
  };

  const calculateTEE = (profile: UserProfile): TEECalculation => {
    if (!profile) return null;

    // Component 1: BMR Calculation (Mifflin-St Jeor Equation)
    const weightInKg = profile.weight_lbs / 2.20462;
    const heightInCm = profile.height_inches * 2.54;
    
    let bmr: number;
    if (profile.gender === 'male') {
      bmr = (10 * weightInKg) + (6.25 * heightInCm) - (5 * profile.age) + 5;
    } else {
      bmr = (10 * weightInKg) + (6.25 * heightInCm) - (5 * profile.age) - 161;
    }

    // Component 2: Activity Level Multiplier
    const activityMultipliers = {
      sedentary: 1.2,
      lightly_active: 1.375,
      moderately_active: 1.55,
      very_active: 1.725,
      extremely_active: 1.9
    };
    
    const activityMultiplier = activityMultipliers[profile.activity_level as keyof typeof activityMultipliers] || 1.55;
    const baseTEE = bmr * activityMultiplier;

    // Component 3: Exercise Calories (placeholder - would integrate with workout system)
    const exerciseCalories = 200; // This would come from daily workout integration

    // Total Daily Calories (TEE)
    const totalDailyCalories = Math.round(baseTEE + exerciseCalories);

    // Metabolic profile macros
    const metabolicMacros = {
      fast_oxidizer: { protein: 25, carb: 35, fat: 40 },
      slow_oxidizer: { protein: 35, carb: 25, fat: 40 },
      medium_oxidizer: { protein: 30, carb: 30, fat: 40 }
    };

    let macros;
    if (profile.metabolic_profile === 'custom' && 
        profile.custom_protein_percentage && 
        profile.custom_carb_percentage && 
        profile.custom_fat_percentage) {
      macros = {
        protein: profile.custom_protein_percentage,
        carb: profile.custom_carb_percentage,
        fat: profile.custom_fat_percentage
      };
    } else {
      macros = metabolicMacros[profile.metabolic_profile as keyof typeof metabolicMacros] || metabolicMacros.medium_oxidizer;
    }

    return {
      bmr: Math.round(bmr),
      activity_multiplier: activityMultiplier,
      base_tee: Math.round(baseTEE),
      exercise_calories: exerciseCalories,
      total_daily_calories: totalDailyCalories,
      protein_percentage: macros.protein,
      carb_percentage: macros.carb,
      fat_percentage: macros.fat
    };
  };

  const calculateProgress = (profile: UserProfile) => {
    // Mock progress calculation - in real app this would use historical data
    const startDate = new Date('2024-01-01'); // Would come from profile creation date
    const currentDate = new Date();
    const weeksElapsed = Math.floor((currentDate.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
    
    const weightChange = -8.5; // Mock data - would calculate from weight history
    const targetWeightLoss = profile.target_weight ? profile.weight_lbs - profile.target_weight : 0;
    const goalProgress = targetWeightLoss > 0 ? Math.min((Math.abs(weightChange) / targetWeightLoss) * 100, 100) : 0;
    
    const remainingWeeks = targetWeightLoss > 0 ? Math.ceil((targetWeightLoss - Math.abs(weightChange)) / 1.5) : 0;
    const estimatedCompletion = new Date(currentDate.getTime() + (remainingWeeks * 7 * 24 * 60 * 60 * 1000)).toLocaleDateString();

    return {
      weeks_elapsed: weeksElapsed,
      weight_change: weightChange,
      goal_progress: goalProgress,
      estimated_completion: estimatedCompletion
    };
  };

  const getActivityLevelDisplay = (level: string) => {
    const levels = {
      sedentary: 'Sedentary (Desk Job)',
      lightly_active: 'Lightly Active',
      moderately_active: 'Moderately Active',
      very_active: 'Very Active',
      extremely_active: 'Extremely Active'
    };
    return levels[level as keyof typeof levels] || level;
  };

  const getMetabolicProfileDisplay = (profile: string) => {
    const profiles = {
      fast_oxidizer: 'Fast Oxidizer',
      slow_oxidizer: 'Slow Oxidizer',
      medium_oxidizer: 'Medium Oxidizer',
      custom: 'Custom Profile'
    };
    return profiles[profile as keyof typeof profiles] || profile;
  };

  const getWeightLossGoalDisplay = (goal?: string) => {
    const goals = {
      maintain: 'Maintain Weight',
      lose_0_5: 'Lose 0.5 lbs/week',
      lose_1: 'Lose 1 lb/week',
      lose_1_5: 'Lose 1.5 lbs/week',
      lose_2: 'Lose 2 lbs/week'
    };
    return goal ? goals[goal as keyof typeof goals] || goal : 'Not Set';
  };

  const calculateWeightLossDeficit = (goal?: string) => {
    const deficits = {
      maintain: 0,
      lose_0_5: 250,  // 0.5 lbs/week = 1,750 cal/week ÷ 7 = 250 cal/day
      lose_1: 500,    // 1 lb/week = 3,500 cal/week ÷ 7 = 500 cal/day
      lose_1_5: 750,  // 1.5 lbs/week = 5,250 cal/week ÷ 7 = 750 cal/day
      lose_2: 1000    // 2 lbs/week = 7,000 cal/week ÷ 7 = 1,000 cal/day
    };
    return goal ? deficits[goal as keyof typeof deficits] || 0 : 0;
  };

  const getWeightLossGoalText = (goal?: string) => {
    const goalTexts = {
      maintain: 'maintenance',
      lose_0_5: '0.5 lb/week goal',
      lose_1: '1 lb/week goal',
      lose_1_5: '1.5 lbs/week goal',
      lose_2: '2 lbs/week goal'
    };
    return goal ? goalTexts[goal as keyof typeof goalTexts] || 'custom goal' : 'no goal set';
  };
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-sm p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#52C878] mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your transformation data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!transformationData.profile || !transformationData.tee) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-sm p-8">
          <div className="text-center">
            <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Complete Your Profile</h2>
            <p className="text-gray-600 mb-6">
              Please complete your profile assessment to view your transformation tracker.
            </p>
            <button
              onClick={() => window.location.href = '#profile-assessment'}
              className="px-6 py-3 bg-gradient-to-r from-[#52C878] to-[#4A90E2] text-white font-semibold rounded-xl hover:from-[#52C878]/90 hover:to-[#4A90E2]/90 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Complete Profile Assessment
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { profile, tee, progress } = transformationData;

  // Calculate calorie breakdown
  const maintenanceCalories = tee ? Math.round(tee.base_tee / 10) * 10 : 0; // Round to nearest 10
  const exerciseCalories = tee ? Math.round(tee.exercise_calories / 10) * 10 : 0;
  const totalDailyCalories = maintenanceCalories + exerciseCalories;
  const weightLossReduction = calculateWeightLossDeficit(profile?.weight_loss_goal);
  const dailyCalorieTarget = Math.max(totalDailyCalories - weightLossReduction, profile?.gender === 'male' ? 1500 : 1200);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#52C878]/10 to-[#4A90E2]/10 rounded-2xl p-6 border border-[#52C878]/20">
        <h1 className="text-3xl font-bold text-[#2C3E50] mb-2">Transformation Tracker</h1>
        <p className="text-gray-600">
          Your personalized nutritional journey with customized total daily calories.
        </p>
      </div>

      {/* Top Section - Side by Side Layout */}
      <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Side - Member Information */}
          <div className="bg-gradient-to-r from-[#52C878]/5 to-[#4A90E2]/5 p-6 rounded-xl border border-[#52C878]/20">
            <h3 className="text-lg font-semibold text-[#2C3E50] mb-4 flex items-center gap-2">
              <User className="w-5 h-5" />
              Member Information
            </h3>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Member Name:</span>
                <span className="font-semibold text-[#2C3E50]">{profile.full_name}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Current Weight:</span>
                <span className="font-semibold text-[#2C3E50]">{profile.weight_lbs} lbs</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Target Weight:</span>
                <span className="font-semibold text-[#2C3E50]">
                  {profile.target_weight ? `${profile.target_weight} lbs` : 'Not Set'}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Goal Timeline:</span>
                <span className="font-semibold text-[#2C3E50]">
                  {progress.estimated_completion !== 'Invalid Date' ? progress.estimated_completion : 'Calculating...'}
                </span>
              </div>
            </div>
          </div>

          {/* Right Side - Profile Settings */}
          <div className="bg-gradient-to-r from-[#4A90E2]/5 to-[#52C878]/5 p-6 rounded-xl border border-[#4A90E2]/20">
            <h3 className="text-lg font-semibold text-[#2C3E50] mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Profile Settings
            </h3>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Activity Level:</span>
                <span className="font-semibold text-[#2C3E50]">
                  {getActivityLevelDisplay(profile.activity_level)}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Metabolic Profile:</span>
                <span className="font-semibold text-[#2C3E50]">
                  {getMetabolicProfileDisplay(profile.metabolic_profile)}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Weight Loss Goal:</span>
                <span className="font-semibold text-[#2C3E50]">
                  {getWeightLossGoalDisplay(profile.weight_loss_goal)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section - Total Daily Calories (Full Width) */}
      <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
        <div className="border-b border-gray-200 pb-6 mb-8">
          <h2 className="text-2xl font-bold text-[#2C3E50] mb-2">TOTAL DAILY CALORIES BREAKDOWN</h2>
          <p className="text-gray-600">Your complete calorie calculation from maintenance to weight loss target</p>
        </div>

        <div className="space-y-8">
          {/* 1. Maintenance Calories */}
          <div className="flex items-center justify-between p-6 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border border-blue-200">
            <div className="flex items-center gap-4">
              <div className="bg-blue-500 p-3 rounded-full">
                <Home className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#2C3E50] mb-1">Maintenance Calories</h3>
                <p className="text-gray-600">Your body's baseline calorie needs for daily activities</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-blue-600 mb-1">{maintenanceCalories.toLocaleString()}</div>
              <p className="text-sm text-gray-600">calories</p>
            </div>
          </div>

          {/* 2. Daily Exercise Calories */}
          <div className="flex items-center justify-between p-6 bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl border border-orange-200">
            <div className="flex items-center gap-4">
              <div className="bg-orange-500 p-3 rounded-full">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#2C3E50] mb-1">Daily Exercise Calories</h3>
                <p className="text-gray-600">Additional calories burned from planned workouts</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-orange-600 mb-1">{exerciseCalories.toLocaleString()}</div>
              <p className="text-sm text-gray-600">calories</p>
            </div>
          </div>

          {/* 3. Total Daily Calories */}
          <div className="flex items-center justify-between p-6 bg-gradient-to-r from-[#52C878]/10 to-[#52C878]/20 rounded-xl border border-[#52C878]/30">
            <div className="flex items-center gap-4">
              <div className="bg-[#52C878] p-3 rounded-full">
                <Plus className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#2C3E50] mb-1">Total Daily Calories</h3>
                <p className="text-gray-600">Complete calorie expenditure for the day</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold text-[#52C878] mb-1">{totalDailyCalories.toLocaleString()}</div>
              <p className="text-sm text-gray-600">calories</p>
            </div>
          </div>

          {/* 4. Weight Loss Reduction */}
          {profile?.weight_loss_goal && profile.weight_loss_goal !== 'maintain' && (
            <div className="flex items-center justify-between p-6 bg-gradient-to-r from-red-50 to-red-100 rounded-xl border border-red-200">
              <div className="flex items-center gap-4">
                <div className="bg-red-500 p-3 rounded-full">
                  <Minus className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#2C3E50] mb-1">Weight Loss Reduction</h3>
                  <p className="text-gray-600">Calorie deficit needed to reach weight loss goal</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-red-600 mb-1">-{weightLossReduction.toLocaleString()}</div>
                <p className="text-sm text-gray-600">calories ({getWeightLossGoalText(profile.weight_loss_goal)})</p>
              </div>
            </div>
          )}

          {/* 5. Daily Calorie Target */}
          <div className="flex items-center justify-between p-6 bg-gradient-to-r from-[#4A90E2]/10 to-[#4A90E2]/20 rounded-xl border border-[#4A90E2]/30">
            <div className="flex items-center gap-4">
              <div className="bg-[#4A90E2] p-3 rounded-full">
                <Target className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#2C3E50] mb-1">Daily Calorie Target</h3>
                <p className="text-gray-600">Your personalized eating goal</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold text-[#4A90E2] mb-1">{dailyCalorieTarget.toLocaleString()}</div>
              <p className="text-sm text-gray-600">calories</p>
            </div>
          </div>

          {/* Safety Notice */}
          {dailyCalorieTarget <= (profile?.gender === 'male' ? 1500 : 1200) && weightLossReduction > 0 && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs font-bold">!</span>
                </div>
                <div>
                  <p className="font-medium text-yellow-800">Minimum Calorie Safety Limit</p>
                  <p className="text-sm text-yellow-700 mt-1">
                    Your target has been set to the minimum safe level ({profile?.gender === 'male' ? '1,500' : '1,200'} calories). 
                    Consider adding more exercise to create additional deficit safely.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Educational Component */}
          <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
            <h4 className="font-semibold text-[#2C3E50] mb-4">Understanding Your Calorie Breakdown</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium text-gray-800 mb-1">Maintenance Calories</p>
                <p className="text-gray-600">This represents the calories your body naturally burns through basic functions and daily activities</p>
              </div>
              <div>
                <p className="font-medium text-gray-800 mb-1">Exercise Addition</p>
                <p className="text-gray-600">Planned workouts add extra calorie burn on top of your maintenance level</p>
              </div>
              {weightLossReduction > 0 && (
                <div className="md:col-span-2">
                  <p className="font-medium text-gray-800 mb-1">Weight Loss Science</p>
                  <p className="text-gray-600">A deficit of 3,500 calories typically equals 1 pound of weight loss</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TransformationTracker;