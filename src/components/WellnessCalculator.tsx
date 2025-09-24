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
  weight_kg: number;
  height_cm: number;
  activity_level: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extremely_active';
  blood_type: 'A' | 'B' | 'AB' | 'O';
  metabolic_profile: 'fast_oxidizer' | 'slow_oxidizer' | 'medium_oxidizer';
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
}

function WellnessCalculator() {
  const [activeTab, setActiveTab] = useState('profile');
  const [profile, setProfile] = useState<UserProfile>({
    user_id: '',
    full_name: '',
    gender: 'male',
    age: 25,
    weight_kg: 70,
    height_cm: 170,
    activity_level: 'moderately_active',
    blood_type: 'O',
    metabolic_profile: 'medium_oxidizer'
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
    const heightInMeters = profileData.height_cm / 100;
    const bmi = profileData.weight_kg / (heightInMeters * heightInMeters);

    // Convert weight and height to imperial units for BMR calculation
    const weightInPounds = profileData.weight_kg * 2.20462;
    const heightInInches = profileData.height_cm * 0.393701;

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

    // Get metabolic profile macros
    const metabolicMacros = {
      fast_oxidizer: { protein: 20, carb: 40, fat: 40 },
      slow_oxidizer: { protein: 40, carb: 20, fat: 40 },
      medium_oxidizer: { protein: 30, carb: 30, fat: 40 }
    };
    const macros = metabolicMacros[profileData.metabolic_profile];

    const calculationResults: CalculationResults = {
      ree: Math.round(bmr),
      tee: Math.round(tee),
      bmi: Math.round(bmi * 10) / 10,
      bodyFatPercentage: Math.round(bodyFatPercentage * 10) / 10,
      proteinPercentage: macros.protein,
      carbPercentage: macros.carb,
      fatPercentage: macros.fat
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

  const calculateBodyFat = () => {
    const { gender, height, waist, neck, hip, unit } = bodyFatInputs;
    
    // Convert to inches if metric
    const heightInches = unit === 'metric' ? height * 0.393701 : height;
    const waistInches = unit === 'metric' ? waist * 0.393701 : waist;
    const neckInches = unit === 'metric' ? neck * 0.393701 : neck;
    const hipInches = unit === 'metric' ? hip * 0.393701 : hip;
    
    let bodyFatPercentage: number;
    
    if (gender === 'male') {
      // Men: 86.010 × log₁₀(waist - neck) - 70.041 × log₁₀(height) + 36.76
      bodyFatPercentage = 86.010 * Math.log10(waistInches - neckInches) - 70.041 * Math.log10(heightInches) + 36.76;
    } else {
      // Women: 163.205 × log₁₀(waist + hip - neck) - 97.684 × log₁₀(height) - 78.387
      bodyFatPercentage = 163.205 * Math.log10(waistInches + hipInches - neckInches) - 97.684 * Math.log10(heightInches) - 78.387;
    }
    
    setBodyFatResult(Math.max(0, Math.min(50, bodyFatPercentage))); // Clamp between 0-50%
  };
  
  const getBodyFatCategory = (percentage: number, gender: 'male' | 'female') => {
    if (gender === 'male') {
      if (percentage < 6) return { category: 'Essential Fat', color: 'text-red-600' };
      if (percentage < 14) return { category: 'Athletic', color: 'text-green-600' };
      if (percentage < 18) return { category: 'Fitness', color: 'text-blue-600' };
      if (percentage < 25) return { category: 'Average', color: 'text-yellow-600' };
      return { category: 'Obese', color: 'text-red-600' };
    } else {
      if (percentage < 10) return { category: 'Essential Fat', color: 'text-red-600' };
      if (percentage < 21) return { category: 'Athletic', color: 'text-green-600' };
      if (percentage < 25) return { category: 'Fitness', color: 'text-blue-600' };
      if (percentage < 32) return { category: 'Average', color: 'text-yellow-600' };
      return { category: 'Obese', color: 'text-red-600' };
    }
  };
  const tabs = [
    { id: 'profile', label: 'Profile Setup', icon: User },
    { id: 'calculations', label: 'Calculations', icon: Calculator },
    { id: 'body-fat', label: 'Body Fat Calculator', icon: Target },
    { id: 'meal-planning', label: 'Meal Planning', icon: Utensils },
    { id: 'exercise', label: 'Exercise Plan', icon: Dumbbell },
    { id: 'supplements', label: 'Supplements', icon: Pill },
    { id: 'tracking', label: 'Daily Tracking', icon: Target }
  ];

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Tab Navigation */}
      <div className="mb-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Profile Setup Tab */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-2xl shadow-sm p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Personal Profile</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-700">Basic Information</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <input
                  type="text"
                  value={profile.full_name}
                  onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="male"
                      checked={profile.gender === 'male'}
                      onChange={(e) => setProfile({ ...profile, gender: e.target.value as 'male' | 'female' })}
                      className="mr-2"
                    />
                    Male
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="female"
                      checked={profile.gender === 'female'}
                      onChange={(e) => setProfile({ ...profile, gender: e.target.value as 'male' | 'female' })}
                      className="mr-2"
                    />
                    Female
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Age (years)</label>
                <input
                  type="number"
                  value={profile.age}
                  onChange={(e) => setProfile({ ...profile, age: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Weight (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  value={profile.weight_kg}
                  onChange={(e) => setProfile({ ...profile, weight_kg: parseFloat(e.target.value) })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Height (cm)</label>
                <input
                  type="number"
                  value={profile.height_cm}
                  onChange={(e) => setProfile({ ...profile, height_cm: parseFloat(e.target.value) })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Activity & Metabolic Profile */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-700">Activity & Metabolic Profile</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Activity Level</label>
                <select
                  value={profile.activity_level}
                  onChange={(e) => setProfile({ ...profile, activity_level: e.target.value as any })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="sedentary">Sedentary</option>
                  <option value="lightly_active">Lightly Active</option>
                  <option value="moderately_active">Moderately Active</option>
                  <option value="very_active">Very Active</option>
                  <option value="extremely_active">Extremely Active</option>
                </select>
                <p className="text-sm text-gray-600 mt-1">
                  {getActivityDescription(profile.activity_level)}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Blood Type</label>
                <select
                  value={profile.blood_type}
                  onChange={(e) => setProfile({ ...profile, blood_type: e.target.value as any })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="A">Type A</option>
                  <option value="B">Type B</option>
                  <option value="AB">Type AB</option>
                  <option value="O">Type O</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Metabolic Profile</label>
                <select
                  value={profile.metabolic_profile}
                  onChange={(e) => setProfile({ ...profile, metabolic_profile: e.target.value as any })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="fast_oxidizer">Fast Oxidizer (20% Protein, 40% Carbs, 40% Fat)</option>
                  <option value="slow_oxidizer">Slow Oxidizer (40% Protein, 20% Carbs, 40% Fat)</option>
                  <option value="medium_oxidizer">Medium Oxidizer (30% Protein, 30% Carbs, 40% Fat)</option>
                </select>
                <p className="text-sm text-gray-600 mt-1">
                  {getMetabolicDescription(profile.metabolic_profile)}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <button
              onClick={saveProfile}
              disabled={loading || !user?.id}
              className="px-8 py-3 bg-gradient-to-r from-[#52C878] to-[#4A90E2] text-white font-semibold rounded-lg hover:from-[#52C878]/90 hover:to-[#4A90E2]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {loading ? 'Saving...' : !user?.id ? 'Please log in to save profile' : 'Save Profile & Calculate'}
            </button>
          </div>
        </div>
      )}

      {/* Calculations Tab */}
      {activeTab === 'calculations' && results && (
        <div className="space-y-6">
          {/* TEE Calculation */}
          <div className="bg-white rounded-2xl shadow-sm p-8">
            <h2 className="text-2xl font-bold text-[#2C3E50] mb-6">Total Energy Expenditure (TEE) Calculator</h2>
            
            {/* Step-by-step calculation display */}
            <div className="mb-6 p-4 bg-[#F8F9FA] rounded-lg border border-gray-100">
              <h4 className="font-semibold text-[#2C3E50] mb-2">Calculation Steps:</h4>
              <div className="text-sm text-gray-700 space-y-1">
                <p><strong>Step 1:</strong> BMR = {results.ree} calories/day (using gender-specific formula)</p>
                <p><strong>Step 2:</strong> TEE = BMR × {getActivityFactor(profile.activity_level)} (activity multiplier) = <strong>{results.tee} calories/day</strong></p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-[#52C878]/5 p-6 rounded-xl border border-[#52C878]/20">
                <h3 className="text-lg font-semibold text-[#2C3E50] mb-2">Basal Metabolic Rate (BMR)</h3>
                <p className="text-3xl font-bold text-[#52C878]">{results.ree}</p>
                <p className="text-sm text-gray-600">calories/day (gender-specific)</p>
              </div>
              
              <div className="bg-[#4A90E2]/5 p-6 rounded-xl border border-[#4A90E2]/20">
                <h3 className="text-lg font-semibold text-[#2C3E50] mb-2">Activity Factor</h3>
                <p className="text-3xl font-bold text-[#4A90E2]">{getActivityFactor(profile.activity_level)}</p>
                <p className="text-sm text-gray-600">{profile.activity_level.replace('_', ' ')}</p>
              </div>
              
              <div className="bg-gradient-to-br from-[#52C878]/5 to-[#4A90E2]/5 p-6 rounded-xl border border-[#52C878]/20">
                <h3 className="text-lg font-semibold text-[#2C3E50] mb-2">Total Daily Energy</h3>
                <p className="text-3xl font-bold bg-gradient-to-r from-[#52C878] to-[#4A90E2] bg-clip-text text-transparent">{results.tee}</p>
                <p className="text-sm text-gray-600">calories/day total</p>
              </div>
            </div>
            
            {/* Formula explanation */}
            <div className="mt-6 p-4 bg-[#52C878]/5 rounded-lg border border-[#52C878]/20">
              <h4 className="font-semibold text-[#2C3E50] mb-2">Gender-Specific BMR Formula Used:</h4>
              <p className="text-sm text-gray-600">
                {profile.gender === 'male' 
                  ? 'Men: 66.47 + (6.24 × weight in lbs) + (12.7 × height in inches) - (6.76 × age)'
                  : 'Women: 65.51 + (4.34 × weight in lbs) + (4.7 × height in inches) - (4.7 × age)'
                }
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Your measurements: {(profile.weight_kg * 2.20462).toFixed(1)} lbs, {(profile.height_cm * 0.393701).toFixed(1)} inches, {profile.age} years
              </p>
            </div>
          </div>

          {/* Body Fat Calculation */}
          <div className="bg-white rounded-2xl shadow-sm p-8">
            <h2 className="text-2xl font-bold text-[#2C3E50] mb-6">Body Fat Analysis</h2>
            
            <div className="flex justify-center">
              <div className="bg-gradient-to-br from-[#4A90E2]/5 to-[#52C878]/5 p-6 rounded-xl border border-[#4A90E2]/20">
                <h3 className="text-lg font-semibold text-[#2C3E50] mb-2">Body Fat Percentage</h3>
                <p className="text-3xl font-bold text-[#4A90E2]">{results.bodyFatPercentage}%</p>
                <p className="text-sm text-gray-600">estimated body fat</p>
                <p className="text-xs text-gray-500 mt-2">Based on your personal profile</p>
              </div>
            </div>
          </div>

          {/* Metabolic Profile */}
          <div className="bg-white rounded-2xl shadow-sm p-8">
            <h2 className="text-2xl font-bold text-[#2C3E50] mb-6">Metabolic Profile & Macronutrients</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-[#52C878]/5 p-6 rounded-xl border border-[#52C878]/20">
                <h3 className="text-lg font-semibold text-[#2C3E50] mb-2">Protein</h3>
                <p className="text-3xl font-bold text-[#52C878]">{results.proteinPercentage}%</p>
                <p className="text-sm text-gray-600">{Math.round(results.tee * results.proteinPercentage / 100 / 4)}g daily</p>
              </div>
              
              <div className="bg-[#4A90E2]/5 p-6 rounded-xl border border-[#4A90E2]/20">
                <h3 className="text-lg font-semibold text-[#2C3E50] mb-2">Carbohydrates</h3>
                <p className="text-3xl font-bold text-[#4A90E2]">{results.carbPercentage}%</p>
                <p className="text-sm text-gray-600">{Math.round(results.tee * results.carbPercentage / 100 / 4)}g daily</p>
              </div>
              
              <div className="bg-gradient-to-br from-[#52C878]/5 to-[#4A90E2]/5 p-6 rounded-xl border border-[#52C878]/20">
                <h3 className="text-lg font-semibold text-[#2C3E50] mb-2">Fats</h3>
                <p className="text-3xl font-bold bg-gradient-to-r from-[#52C878] to-[#4A90E2] bg-clip-text text-transparent">{results.fatPercentage}%</p>
                <p className="text-sm text-gray-600">{Math.round(results.tee * results.fatPercentage / 100 / 9)}g daily</p>
              </div>
            </div>

            <div className="mt-6 p-4 bg-[#F8F9FA] rounded-lg border border-gray-100">
              <h4 className="font-semibold text-[#2C3E50] mb-2">Your Metabolic Profile: {profile.metabolic_profile.replace('_', ' ').toUpperCase()}</h4>
              <p className="text-sm text-gray-600">
                {getMetabolicDescription(profile.metabolic_profile)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Placeholder tabs */}
      {activeTab === 'meal-planning' && (
        <div className="bg-white rounded-2xl shadow-sm p-8">
          {results ? (
            <MealPlanning
              userProfile={profile}
              teeCalories={results.tee}
              proteinPercentage={results.proteinPercentage}
              carbPercentage={results.carbPercentage}
              fatPercentage={results.fatPercentage}
            />
          ) : (
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Complete Your Profile First</h2>
              <p className="text-gray-600 mb-6">
                Please complete your profile setup and calculations before accessing meal planning.
              </p>
              <button
                onClick={() => setActiveTab('profile')}
                className="px-6 py-3 bg-gradient-to-r from-[#52C878] to-[#4A90E2] text-white font-semibold rounded-lg hover:from-[#52C878]/90 hover:to-[#4A90E2]/90 transition-colors duration-200"
              >
                Go to Profile Setup
              </button>
            </div>
          )}
        </div>
      )}

      {activeTab === 'exercise' && (
        <div className="bg-white rounded-2xl shadow-sm p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Exercise Planning</h2>
          <p className="text-gray-600">Exercise planning functionality will be implemented here.</p>
        </div>
      )}

      {activeTab === 'supplements' && (
        <div className="bg-white rounded-2xl shadow-sm p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Supplement Recommendations</h2>
          <p className="text-gray-600">Supplement recommendations will be implemented here.</p>
        </div>
      )}

      {activeTab === 'tracking' && (
        <div className="bg-white rounded-2xl shadow-sm p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Daily Tracking</h2>
          <p className="text-gray-600">Daily tracking functionality will be implemented here.</p>
        </div>
      )}
    </div>
  );
}

export default WellnessCalculator;