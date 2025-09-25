import React, { useState, useEffect } from 'react';
import { User, Target, TrendingUp, Calendar, Activity, Dumbbell, Scale, Clock, Award, ChevronRight } from 'lucide-react';
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#52C878]/10 to-[#4A90E2]/10 rounded-2xl p-6 border border-[#52C878]/20">
        <h1 className="text-3xl font-bold text-[#2C3E50] mb-2">Transformation Tracker</h1>
        <p className="text-gray-600">
          Your personalized fitness journey with integrated TEE calculations and progress monitoring
        </p>
      </div>

      {/* Member Information Card */}
      <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
        <div className="border-b border-gray-200 pb-6 mb-6">
          <h2 className="text-2xl font-bold text-[#2C3E50] mb-4 flex items-center gap-3">
            <Award className="w-6 h-6 text-[#52C878]" />
            TRANSFORMATION TRACKER
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Member Info */}
          <div className="space-y-6">
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

          {/* Right Column - TEE Breakdown */}
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-[#52C878]/10 to-[#4A90E2]/10 p-6 rounded-xl border border-[#52C878]/30">
              <h3 className="text-lg font-semibold text-[#2C3E50] mb-4 flex items-center gap-2">
                <Target className="w-5 h-5" />
                Total Daily Calories
              </h3>
              
              <div className="text-center mb-6">
                <div className="text-4xl font-bold text-[#52C878] mb-2">
                  {tee.total_daily_calories}
                </div>
                <p className="text-gray-600">calories per day</p>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center p-3 bg-white/50 rounded-lg">
                  <span className="text-gray-600">Base Metabolic Rate (BMR):</span>
                  <span className="font-semibold text-[#2C3E50]">{tee.bmr} cal</span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-white/50 rounded-lg">
                  <span className="text-gray-600">Activity Multiplier:</span>
                  <span className="font-semibold text-[#2C3E50]">{tee.activity_multiplier}x</span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-white/50 rounded-lg">
                  <span className="text-gray-600">Base TEE:</span>
                  <span className="font-semibold text-[#2C3E50]">{tee.base_tee} cal</span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-white/50 rounded-lg">
                  <span className="text-gray-600">Exercise Calories:</span>
                  <span className="font-semibold text-[#52C878]">+{tee.exercise_calories} cal</span>
                </div>
                
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between items-center p-3 bg-[#52C878]/10 rounded-lg">
                    <span className="font-semibold text-[#2C3E50]">Total Daily Calories:</span>
                    <span className="text-xl font-bold text-[#52C878]">{tee.total_daily_calories} cal</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Macro Breakdown */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-200">
              <h3 className="text-lg font-semibold text-[#2C3E50] mb-4 flex items-center gap-2">
                <Dumbbell className="w-5 h-5" />
                Macro Distribution
              </h3>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600 mb-1">{tee.protein_percentage}%</div>
                  <p className="text-xs text-gray-600 mb-1">Protein</p>
                  <p className="text-xs text-gray-500">
                    {Math.round((tee.base_tee * tee.protein_percentage / 100) / 4)}g
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600 mb-1">{tee.carb_percentage}%</div>
                  <p className="text-xs text-gray-600 mb-1">Carbs</p>
                  <p className="text-xs text-gray-500">
                    {Math.round((tee.base_tee * tee.carb_percentage / 100) / 4)}g
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600 mb-1">{tee.fat_percentage}%</div>
                  <p className="text-xs text-gray-600 mb-1">Fat</p>
                  <p className="text-xs text-gray-500">
                    {Math.round((tee.base_tee * tee.fat_percentage / 100) / 9)}g
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-[#2C3E50]">Time Elapsed</h3>
            <Clock className="w-5 h-5 text-[#52C878]" />
          </div>
          <div className="text-3xl font-bold text-[#52C878] mb-2">{progress.weeks_elapsed}</div>
          <p className="text-gray-600">weeks on program</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-[#2C3E50]">Weight Change</h3>
            <Scale className="w-5 h-5 text-[#4A90E2]" />
          </div>
          <div className={`text-3xl font-bold mb-2 ${progress.weight_change < 0 ? 'text-green-600' : 'text-red-600'}`}>
            {progress.weight_change > 0 ? '+' : ''}{progress.weight_change}
          </div>
          <p className="text-gray-600">lbs from start</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-[#2C3E50]">Goal Progress</h3>
            <TrendingUp className="w-5 h-5 text-purple-600" />
          </div>
          <div className="text-3xl font-bold text-purple-600 mb-2">{Math.round(progress.goal_progress)}%</div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-purple-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(progress.goal_progress, 100)}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Action Items */}
      <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
        <h3 className="text-xl font-bold text-[#2C3E50] mb-6">Next Steps</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button className="flex items-center justify-between p-4 bg-[#52C878]/5 rounded-xl border border-[#52C878]/20 hover:bg-[#52C878]/10 transition-colors duration-200">
            <div className="flex items-center gap-3">
              <div className="bg-[#52C878] p-2 rounded-lg">
                <Target className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-[#2C3E50]">Update Meal Plan</p>
                <p className="text-sm text-gray-600">Based on your {tee.total_daily_calories} daily calories</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>

          <button className="flex items-center justify-between p-4 bg-[#4A90E2]/5 rounded-xl border border-[#4A90E2]/20 hover:bg-[#4A90E2]/10 transition-colors duration-200">
            <div className="flex items-center gap-3">
              <div className="bg-[#4A90E2] p-2 rounded-lg">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-[#2C3E50]">Plan Workouts</p>
                <p className="text-sm text-gray-600">Optimize your exercise routine</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default TransformationTracker;