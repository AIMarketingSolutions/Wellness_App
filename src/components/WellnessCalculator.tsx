import React, { useState, useEffect } from 'react';
import { Calculator, User, Activity, Target, Utensils, Droplets, Dumbbell, Pill } from 'lucide-react';
import { supabase } from '../lib/supabase';
import MealPlanning from './MealPlanning';

interface UserProfile {
  id?: string;
  user_id: string;
  full_name: string;
  gender: 'male' | 'female';
  age: number;
  weight_lbs: number;
  height_inches: number;
  waist_inches: number;
  neck_inches: number;
  hip_inches?: number;
  activity_level: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extremely_active';
  blood_type: 'A' | 'B' | 'AB' | 'O';
  metabolic_profile: 'fast_oxidizer' | 'slow_oxidizer' | 'medium_oxidizer';
  custom_protein_percentage?: number;
  custom_carb_percentage?: number;
  custom_fat_percentage?: number;
  weight_loss_goal?: 'maintain' | 'lose_0_5' | 'lose_1' | 'lose_1_5' | 'lose_2';
  deficit_method?: 'diet_only' | 'exercise_only' | 'combined';
  target_weight?: number;
}

interface BodyFatInputs {
  gender: 'male' | 'female';
  height: number;
  waist: number;
  neck: number;
  hip: number;
  unit: 'imperial' | 'metric';
}
interface CalculationResults {
  ree: number;
  tee: number;
  bmi: number;
  bodyFatPercentage: number;
  proteinPercentage: number;
  carbPercentage: number;
  fatPercentage: number;
  dailyCalorieTarget: number;
  weeklyDeficit: number;
  dailyDeficit: number;
}

function WellnessCalculator() {
  const [profile, setProfile] = useState<UserProfile>({
    user_id: '',
    full_name: '',
    gender: 'male',
    age: 25,
    weight_lbs: 154,
    height_inches: 67,
    waist_inches: 32,
    neck_inches: 15,
    hip_inches: 36,
    activity_level: 'moderately_active',
    blood_type: 'O',
    metabolic_profile: 'medium_oxidizer',
    weight_loss_goal: 'maintain',
    deficit_method: 'combined',
    target_weight: 154
  });
  const [bodyFatInputs, setBodyFatInputs] = useState<BodyFatInputs>({
    gender: 'male',
    height: 70,
    waist: 32,
    neck: 15,
    hip: 36,
    unit: 'imperial'
  });
  const [bodyFatResult, setBodyFatResult] = useState<number | null>(null);
  const [showBodyFatFormula, setShowBodyFatFormula] = useState(false);
  const [results, setResults] = useState<CalculationResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        setProfile(prev => ({ ...prev, user_id: user.id }));
        await loadUserProfile(user.id);
      }
    };
    getUser();
  }, []);

  const loadUserProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (data && !error) {
      setProfile(data);
      calculateResults(data);
    }
  };

  const saveProfile = async () => {
    if (!user?.id) {
      console.error('No authenticated user found');
      return;
    }

    setLoading(true);
    try {
      // Ensure user_id is set to the authenticated user's ID
      const profileToSave = {
        ...profile,
        user_id: user.id
      };

      const { data, error } = await supabase
        .from('user_profiles')
        .upsert(profileToSave, { onConflict: 'user_id' })
        .select()
        .single();

      if (error) throw error;

      setProfile(data);
      await calculateResults(data);
      
      // Save calculations to database
      if (results) {
        await saveCalculations(data.user_id, results);
      }
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateResults = async (profileData: UserProfile) => {
    // Calculate BMI
    const heightInMeters = (profileData.height_inches * 2.54) / 100;
    const weightInKg = profileData.weight_lbs / 2.20462;
    const bmi = weightInKg / (heightInMeters * heightInMeters);

    // Use imperial units directly for BMR calculation
    const weightInPounds = profileData.weight_lbs;
    const heightInInches = profileData.height_inches;

    // Calculate BMR using gender-specific formulas
    let bmr: number;
    if (profileData.gender === 'male') {
      bmr = 66.47 + (6.24 * weightInPounds) + (12.7 * heightInInches) - (6.76 * profileData.age);
    } else {
      bmr = 65.51 + (4.34 * weightInPounds) + (4.7 * heightInInches) - (4.7 * profileData.age);
    }

    // Calculate TEE based on activity level
    const activityFactors = {
      sedentary: 1.2,
      lightly_active: 1.375,
      moderately_active: 1.55,
      very_active: 1.725,
      extremely_active: 1.9
    };
    const tee = bmr * activityFactors[profileData.activity_level];

    // Calculate body fat percentage
    let bodyFatPercentage: number;
    if (profileData.gender === 'male') {
      bodyFatPercentage = 1.20 * bmi + 0.23 * profileData.age - 16.2;
    } else {
      bodyFatPercentage = 1.20 * bmi + 0.23 * profileData.age - 5.4;
    }

    // Calculate weight loss targets
    const weightLossDeficits = {
      maintain: 0,
      lose_0_5: 1750, // 0.5 lbs/week = 1,750 cal/week
      lose_1: 3500,   // 1 lb/week = 3,500 cal/week
      lose_1_5: 5250, // 1.5 lbs/week = 5,250 cal/week
      lose_2: 7000    // 2 lbs/week = 7,000 cal/week
    };

    const weeklyDeficit = weightLossDeficits[profileData.weight_loss_goal || 'maintain'];
    const dailyDeficit = weeklyDeficit / 7;
    let dailyCalorieTarget = Math.round(tee - dailyDeficit);

    // Apply minimum calorie safety limits
    const minCalories = profileData.gender === 'male' ? 1500 : 1200;
    if (dailyCalorieTarget < minCalories) {
      dailyCalorieTarget = minCalories;
    }
    // Get metabolic profile macros
    const metabolicMacros = {
      fast_oxidizer: { protein: 25, carb: 35, fat: 40 },
      slow_oxidizer: { protein: 35, carb: 25, fat: 40 },
      medium_oxidizer: { protein: 30, carb: 30, fat: 40 }
    };
    
    let macros;
    if (profileData.metabolic_profile === 'custom' && 
        profileData.custom_protein_percentage && 
        profileData.custom_carb_percentage && 
        profileData.custom_fat_percentage) {
      macros = {
        protein: profileData.custom_protein_percentage,
        carb: profileData.custom_carb_percentage,
        fat: profileData.custom_fat_percentage
      };
    } else {
      macros = metabolicMacros[profileData.metabolic_profile as keyof typeof metabolicMacros];
    }

    const calculationResults: CalculationResults = {
      ree: Math.round(bmr),
      tee: Math.round(tee),
      bmi: Math.round(bmi * 10) / 10,
      bodyFatPercentage: Math.round(bodyFatPercentage * 10) / 10,
      proteinPercentage: macros.protein,
      carbPercentage: macros.carb,
      fatPercentage: macros.fat
      dailyCalorieTarget,
      weeklyDeficit,
      dailyDeficit: Math.round(dailyDeficit)
    };

    setResults(calculationResults);
    return calculationResults;
  };

  const saveCalculations = async (userId: string, calculations: CalculationResults) => {
    // Save TEE calculation
    await supabase.from('tee_calculations').insert({
      user_id: userId,
      ree_calories: calculations.ree, // This now represents BMR
      activity_factor: getActivityFactor(profile.activity_level),
      tee_calories: calculations.tee
    });

    // Save body fat calculation
    await supabase.from('body_fat_calculations').insert({
      user_id: userId,
      bmi: calculations.bmi,
      body_fat_percentage: calculations.bodyFatPercentage
    });
  };

  const getActivityFactor = (level: string) => {
    const factors = {
      sedentary: 1.2,
      lightly_active: 1.375,
      moderately_active: 1.55,
      very_active: 1.725,
      extremely_active: 1.9
    };
    return factors[level as keyof typeof factors];
  };

  const getActivityDescription = (level: string) => {
    const descriptions = {
      sedentary: 'Little or no exercise/desk job',
      lightly_active: 'Light exercise/sports 1-3 days/week',
      moderately_active: 'Moderate exercise, sports 3-5 days/week',
      very_active: 'Heavy exercise/sports 6-7 days/week',
      extremely_active: 'Very heavy exercise/physical job/training 2x/day'
    };
    return descriptions[level as keyof typeof descriptions];
  };

  const getMetabolicDescription = (profile: string) => {
    const descriptions = {
      fast_oxidizer: 'Slender build, narrow shoulders and hips. Tend to be lean with little muscle or fat. Find it challenging to gain weight or muscle. Tendency to be blood type "A".',
      slow_oxidizer: 'Typically muscular and athletic with well-defined physique. Broad shoulders, narrow waist. Can gain muscle and lose fat relatively easily. Tendency to be blood type "O".',
      medium_oxidizer: 'Tend to have rounder body shape with higher proportion of body fat. May find it easier to gain weight. Can struggle with weight loss. Tendency to be blood type "B".'
    };
    return descriptions[profile as keyof typeof descriptions];
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Personal Profile Form - Now the main content */}
      <div className="bg-white rounded-2xl shadow-sm p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Personal Profile</h2>
        
        <div className="space-y-8">
          {/* Section 1: Basic Information */}
          <div className="bg-gradient-to-r from-[#52C878]/5 to-[#4A90E2]/5 p-6 rounded-xl border border-[#52C878]/20">
            <h3 className="text-xl font-semibold text-[#2C3E50] mb-6 flex items-center gap-2">
              <User className="w-5 h-5" />
              Basic Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <input
                  type="text"
                  value={profile.full_name}
                  onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#52C878] focus:border-[#52C878]"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                <div className="flex gap-6">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      value="male"
                      checked={profile.gender === 'male'}
                      onChange={(e) => setProfile({ ...profile, gender: e.target.value as 'male' | 'female' })}
                      className="mr-3 text-[#52C878] focus:ring-[#52C878]"
                    />
                    <span className="font-medium">Male</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      value="female"
                      checked={profile.gender === 'female'}
                      onChange={(e) => setProfile({ ...profile, gender: e.target.value as 'male' | 'female' })}
                      className="mr-3 text-[#52C878] focus:ring-[#52C878]"
                    />
                    <span className="font-medium">Female</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Age (years)</label>
                <input
                  type="number"
                  value={profile.age}
                  onChange={(e) => setProfile({ ...profile, age: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#52C878] focus:border-[#52C878]"
                  placeholder="25"
                  min="18"
                  max="100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Weight (pounds)</label>
                <input
                  type="number"
                  step="0.1"
                  value={profile.weight_lbs}
                  onChange={(e) => setProfile({ ...profile, weight_lbs: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#52C878] focus:border-[#52C878]"
                  placeholder="154"
                  min="80"
                  max="500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Height (inches)</label>
                <input
                  type="number"
                  step="0.1"
                  value={profile.height_inches}
                  onChange={(e) => setProfile({ ...profile, height_inches: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#52C878] focus:border-[#52C878]"
                  placeholder="67"
                  min="48"
                  max="84"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Body Measurements */}
          <div className="bg-gradient-to-r from-[#4A90E2]/5 to-[#52C878]/5 p-6 rounded-xl border border-[#4A90E2]/20">
            <h3 className="text-xl font-semibold text-[#2C3E50] mb-6 flex items-center gap-2">
              <Target className="w-5 h-5" />
              Body Measurements
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Waist Circumference (inches)</label>
                <input
                  type="number"
                  step="0.1"
                  value={profile.waist_inches}
                  onChange={(e) => setProfile({ ...profile, waist_inches: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4A90E2] focus:border-[#4A90E2]"
                  placeholder="32"
                  min="20"
                  max="60"
                />
                <p className="text-xs text-gray-500 mt-1">Measure at the narrowest point, usually just above the navel</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Neck Circumference (inches)</label>
                <input
                  type="number"
                  step="0.1"
                  value={profile.neck_inches}
                  onChange={(e) => setProfile({ ...profile, neck_inches: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4A90E2] focus:border-[#4A90E2]"
                  placeholder="15"
                  min="10"
                  max="25"
                />
                <p className="text-xs text-gray-500 mt-1">Measure just below the larynx (Adam's apple)</p>
              </div>

              {profile.gender === 'female' && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Hip Circumference (inches)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={profile.hip_inches || 0}
                    onChange={(e) => setProfile({ ...profile, hip_inches: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4A90E2] focus:border-[#4A90E2]"
                    placeholder="36"
                    min="25"
                    max="60"
                  />
                  <p className="text-xs text-gray-500 mt-1">Measure at the widest point of the hips</p>
                </div>
              )}
            </div>
          </div>

          {/* Section 3: Activity Level Assessment */}
          <div className="bg-gradient-to-r from-[#52C878]/5 to-[#4A90E2]/5 p-6 rounded-xl border border-[#52C878]/20">
            <h3 className="text-xl font-semibold text-[#2C3E50] mb-6 flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Activity Level Assessment
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {
                  value: 'sedentary',
                  title: 'Sedentary',
                  description: 'Spend most of the day sitting (e.g. bank teller, desk job)',
                  multiplier: '1.2'
                },
                {
                  value: 'lightly_active',
                  title: 'Lightly Active',
                  description: 'Spend a good part of the day on your feet (e.g. teacher, salesperson)',
                  multiplier: '1.375'
                },
                {
                  value: 'moderately_active',
                  title: 'Moderately Active',
                  description: 'Spend a good part of the day doing some physical activity (e.g. food server, postal carrier)',
                  multiplier: '1.55'
                },
                {
                  value: 'very_active',
                  title: 'Very Active',
                  description: 'Spend most of the day doing heavy physical activity (e.g. bike messenger, carpenter)',
                  multiplier: '1.725'
                }
              ].map((activity) => (
                <button
                  key={activity.value}
                  onClick={() => setProfile({ ...profile, activity_level: activity.value as any })}
                  className={`p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                    profile.activity_level === activity.value
                      ? 'border-[#52C878] bg-[#52C878]/10'
                      : 'border-gray-200 hover:border-[#52C878]/50 hover:bg-[#52C878]/5'
                  }`}
                >
                  <h4 className="font-semibold text-[#2C3E50] mb-2">{activity.title}</h4>
                  <p className="text-sm text-gray-600 mb-2">{activity.description}</p>
                  <p className="text-xs font-medium text-[#52C878]">TDEE = {activity.multiplier} × BMR</p>
                </button>
              ))}
            </div>
          </div>

          {/* Section 4: Metabolic Profile Selection */}
          <div className="bg-gradient-to-r from-[#4A90E2]/5 to-[#52C878]/5 p-6 rounded-xl border border-[#4A90E2]/20">
            <h3 className="text-xl font-semibold text-[#2C3E50] mb-6 flex items-center gap-2">
              <Dumbbell className="w-5 h-5" />
              Metabolic Profile Selection
            </h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
              {[
                {
                  value: 'fast_oxidizer',
                  title: 'Fast Oxidizer',
                  macros: '25% Protein, 35% Carbs, 40% Fat',
                  description: 'Slender build with narrow shoulders and hips. Lean with little muscle or fat. Challenging to gain weight or muscle.',
                  bloodType: 'Blood type tendency: A'
                },
                {
                  value: 'slow_oxidizer',
                  title: 'Slow Oxidizer',
                  macros: '35% Protein, 25% Carbs, 40% Fat',
                  description: 'Muscular and athletic with well-defined physique. Broad shoulders, narrow waist. Gains muscle and loses fat easily.',
                  bloodType: 'Blood type tendency: O'
                },
                {
                  value: 'medium_oxidizer',
                  title: 'Medium Oxidizer',
                  macros: '30% Protein, 30% Carbs, 40% Fat',
                  description: 'Rounder body shape with higher body fat proportion. Easier to gain weight, struggles with weight loss.',
                  bloodType: 'Blood type tendency: B'
                }
              ].map((metabolic) => (
                <button
                  key={metabolic.value}
                  onClick={() => setProfile({ ...profile, metabolic_profile: metabolic.value as any })}
                  className={`p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                    profile.metabolic_profile === metabolic.value
                      ? 'border-[#4A90E2] bg-[#4A90E2]/10'
                      : 'border-gray-200 hover:border-[#4A90E2]/50 hover:bg-[#4A90E2]/5'
                  }`}
                >
                  <h4 className="font-semibold text-[#2C3E50] mb-2">{metabolic.title}</h4>
                  <p className="text-sm font-medium text-[#4A90E2] mb-2">{metabolic.macros}</p>
                  <p className="text-xs text-gray-600 mb-2">{metabolic.description}</p>
                  <p className="text-xs text-gray-500">{metabolic.bloodType}</p>
                </button>
              ))}
            </div>

            {/* Custom Ratio Option */}
            <div className="border-t border-gray-200 pt-6">
              <h4 className="font-semibold text-[#2C3E50] mb-4">Custom Ratio Option</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Protein (%)</label>
                  <input
                    type="number"
                    min="10"
                    max="50"
                    value={profile.custom_protein_percentage || ''}
                    onChange={(e) => setProfile({ 
                      ...profile, 
                      custom_protein_percentage: parseInt(e.target.value) || undefined,
                      metabolic_profile: 'custom' as any
                    })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4A90E2] focus:border-[#4A90E2]"
                    placeholder="30"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Carbohydrate (%)</label>
                  <input
                    type="number"
                    min="10"
                    max="60"
                    value={profile.custom_carb_percentage || ''}
                    onChange={(e) => setProfile({ 
                      ...profile, 
                      custom_carb_percentage: parseInt(e.target.value) || undefined,
                      metabolic_profile: 'custom' as any
                    })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4A90E2] focus:border-[#4A90E2]"
                    placeholder="30"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Fat (%)</label>
                  <input
                    type="number"
                    min="20"
                    max="60"
                    value={profile.custom_fat_percentage || ''}
                    onChange={(e) => setProfile({ 
                      ...profile, 
                      custom_fat_percentage: parseInt(e.target.value) || undefined,
                      metabolic_profile: 'custom' as any
                    })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4A90E2] focus:border-[#4A90E2]"
                    placeholder="40"
                  />
                </div>
              </div>
              {profile.custom_protein_percentage && profile.custom_carb_percentage && profile.custom_fat_percentage && (
                <div className="mt-3">
                  {(profile.custom_protein_percentage + profile.custom_carb_percentage + profile.custom_fat_percentage) === 100 ? (
                    <p className="text-sm text-green-600 font-medium">✓ Total equals 100% - Perfect!</p>
                  ) : (
                    <p className="text-sm text-red-600 font-medium">
                      ⚠ Total: {profile.custom_protein_percentage + profile.custom_carb_percentage + profile.custom_fat_percentage}% (must equal 100%)
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-8">
          <button
            onClick={saveProfile}
            disabled={loading || !user?.id}
            className="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-[#52C878] to-[#4A90E2] text-white font-semibold text-lg rounded-xl hover:from-[#52C878]/90 hover:to-[#4A90E2]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            {loading ? 'Saving...' : !user?.id ? 'Please log in to save profile' : 'Save Profile & Calculate'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default WellnessCalculator;