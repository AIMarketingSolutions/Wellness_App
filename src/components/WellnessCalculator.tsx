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

    // Calculate REE using Harris-Benedict equation
    let ree: number;
    if (profileData.gender === 'male') {
      ree = 66.437 + (13.752 * profileData.weight_kg) + (5.003 * profileData.height_cm) - (6.755 * profileData.age);
    } else {
      ree = 655.096 + (9.563 * profileData.weight_kg) + (1.85 * profileData.height_cm) - (4.676 * profileData.age);
    }

    // Calculate TEE based on activity level
    const activityFactors = {
      sedentary: 1.2,
      lightly_active: 1.375,
      moderately_active: 1.55,
      very_active: 1.725,
      extremely_active: 1.9
    };
    const tee = ree * activityFactors[profileData.activity_level];

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
      ree: Math.round(ree),
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
      ree_calories: calculations.ree,
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

  const tabs = [
    { id: 'profile', label: 'Profile Setup', icon: User },
    { id: 'calculations', label: 'Calculations', icon: Calculator },
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
              className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
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
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Total Energy Expenditure (TEE)</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-blue-50 p-6 rounded-xl">
                <h3 className="text-lg font-semibold text-blue-800 mb-2">Resting Energy Expenditure (REE)</h3>
                <p className="text-3xl font-bold text-blue-600">{results.ree}</p>
                <p className="text-sm text-blue-700">calories/day at rest</p>
              </div>
              
              <div className="bg-emerald-50 p-6 rounded-xl">
                <h3 className="text-lg font-semibold text-emerald-800 mb-2">Activity Factor</h3>
                <p className="text-3xl font-bold text-emerald-600">{getActivityFactor(profile.activity_level)}</p>
                <p className="text-sm text-emerald-700">{profile.activity_level.replace('_', ' ')}</p>
              </div>
              
              <div className="bg-purple-50 p-6 rounded-xl">
                <h3 className="text-lg font-semibold text-purple-800 mb-2">Total Daily Energy</h3>
                <p className="text-3xl font-bold text-purple-600">{results.tee}</p>
                <p className="text-sm text-purple-700">calories/day total</p>
              </div>
            </div>

            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-gray-800 mb-2">Formula Used:</h4>
              <p className="text-sm text-gray-600">
                {profile.gender === 'male' 
                  ? 'Men: REE = 66.437 + (13.752 × weight[kg]) + (5.003 × height[cm]) - (6.755 × age)'
                  : 'Women: REE = 655.096 + (9.563 × weight[kg]) + (1.85 × height[cm]) - (4.676 × age)'
                }
              </p>
              <p className="text-sm text-gray-600 mt-1">
                TEE = REE × Activity Factor ({getActivityFactor(profile.activity_level)})
              </p>
            </div>
          </div>

          {/* Body Fat Calculation */}
          <div className="bg-white rounded-2xl shadow-sm p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Body Fat Analysis</h2>
            
            <div className="flex justify-center">
              <div className="bg-red-50 p-6 rounded-xl">
                <h3 className="text-lg font-semibold text-red-800 mb-2">Body Fat Percentage</h3>
                <p className="text-3xl font-bold text-red-600">{results.bodyFatPercentage}%</p>
                <p className="text-sm text-red-700">estimated body fat</p>
                <p className="text-xs text-red-600 mt-2">Based on your personal profile</p>
              </div>
            </div>
          </div>

          {/* Metabolic Profile */}
          <div className="bg-white rounded-2xl shadow-sm p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Metabolic Profile & Macronutrients</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-green-50 p-6 rounded-xl">
                <h3 className="text-lg font-semibold text-green-800 mb-2">Protein</h3>
                <p className="text-3xl font-bold text-green-600">{results.proteinPercentage}%</p>
                <p className="text-sm text-green-700">{Math.round(results.tee * results.proteinPercentage / 100 / 4)}g daily</p>
              </div>
              
              <div className="bg-yellow-50 p-6 rounded-xl">
                <h3 className="text-lg font-semibold text-yellow-800 mb-2">Carbohydrates</h3>
                <p className="text-3xl font-bold text-yellow-600">{results.carbPercentage}%</p>
                <p className="text-sm text-yellow-700">{Math.round(results.tee * results.carbPercentage / 100 / 4)}g daily</p>
              </div>
              
              <div className="bg-indigo-50 p-6 rounded-xl">
                <h3 className="text-lg font-semibold text-indigo-800 mb-2">Fats</h3>
                <p className="text-3xl font-bold text-indigo-600">{results.fatPercentage}%</p>
                <p className="text-sm text-indigo-700">{Math.round(results.tee * results.fatPercentage / 100 / 9)}g daily</p>
              </div>
            </div>

            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-gray-800 mb-2">Your Metabolic Profile: {profile.metabolic_profile.replace('_', ' ').toUpperCase()}</h4>
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
                className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors duration-200"
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