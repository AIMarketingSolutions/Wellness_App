import React, { useState, useEffect } from 'react';
import { ArrowLeft, Utensils } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import MealPlanningSystem from '../MealPlanningSystem';
import { supabase } from '../../lib/supabase';

// Wrapper component to load user profile data for meal planning
function MealPlanningSystemWrapper() {
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      
      if (user) {
        // Load user profile
        const { data: profile, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (profile && !error) {
          // Calculate TEE based on profile
          const teeCalories = calculateTEE(profile);
          
          // Get metabolic macros
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
            macros = metabolicMacros[profile.metabolic_profile] || metabolicMacros.medium_oxidizer;
          }

          // Apply weight loss deficit
          const weightLossDeficits = {
            maintain: 0,
            lose_0_5: 250,
            lose_1: 500,
            lose_1_5: 750,
            lose_2: 1000
          };
          
          const dailyDeficit = weightLossDeficits[profile.weight_loss_goal] || 0;
          const dailyCalorieTarget = Math.max(
            teeCalories - dailyDeficit,
            profile.gender === 'male' ? 1500 : 1200
          );

          setUserProfile({
            tee_calories: dailyCalorieTarget,
            protein_percentage: macros.protein,
            carb_percentage: macros.carb,
            fat_percentage: macros.fat,
            metabolic_profile: profile.metabolic_profile,
            gender: profile.gender,
            full_profile: profile
          });
        } else {
          // Default profile if no profile exists
          setUserProfile({
            tee_calories: 2000,
            protein_percentage: 30,
            carb_percentage: 30,
            fat_percentage: 40,
            metabolic_profile: 'medium_oxidizer',
            gender: 'male',
            full_profile: null
          });
        }
      }
      setLoading(false);
    };

    loadUserData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading meal planning system...</span>
      </div>
    );
  }

  return <MealPlanningSystem userProfile={userProfile} />;
}

// TEE Calculation function
function calculateTEE(profile) {
  // Mifflin-St Jeor Equation
  let bmr;
  if (profile.gender === 'male') {
    bmr = 10 * profile.weight_kg + 6.25 * profile.height_cm - 5 * profile.age + 5;
  } else {
    bmr = 10 * profile.weight_kg + 6.25 * profile.height_cm - 5 * profile.age - 161;
  }

  // Activity factors
  const activityFactors = {
    sedentary: 1.2,
    lightly_active: 1.375,
    moderately_active: 1.55,
    very_active: 1.725,
    extremely_active: 1.9
  };

  const activityFactor = activityFactors[profile.activity_level] || 1.55;
  return Math.round(bmr * activityFactor);
}

const MealPlan = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50">
      <header className="bg-gradient-to-r from-[#52C878] to-[#4A90E2] text-white sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/main-page')}
                className="flex items-center gap-2 px-4 py-2 text-white/90 hover:text-white hover:bg-white/10 rounded-lg transition-colors duration-200"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Main Page
              </button>
              <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                <Utensils className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-white">Meal Plan</h1>
            </div>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <MealPlanningSystemWrapper />
      </main>
    </div>
  );
};

export default MealPlan;
