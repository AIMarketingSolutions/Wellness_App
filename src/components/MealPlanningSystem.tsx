import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Search, Clock, Target, Utensils, Droplets, ChefHat, BookOpen, ShoppingCart, AlertTriangle, Check, Star, Coffee, Sun, Moon, Apple, Calculator, Database, Scale } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface USDAFoodItem {
  fdcId: number;
  description: string;
  dataType: string;
  foodCategory?: string;
  foodNutrients: {
    nutrientId: number;
    nutrientName: string;
    nutrientNumber: string;
    unitName: string;
    value: number;
  }[];
}

interface FoodItem {
  id: string;
  name: string;
  category: string;
  protein_per_100g: number;
  carbs_per_100g: number;
  fat_per_100g: number;
  calories_per_100g: number;
  serving_size_g: number;
  usda_fdc_id?: number;
}

interface MealFood {
  id?: string;
  food_item_id: string;
  food_item?: FoodItem;
  quantity_g: number;
  quantity_oz: number;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
}

interface Meal {
  id?: string;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack_1' | 'snack_2';
  target_calories: number;
  target_protein_g: number;
  target_carbs_g: number;
  target_fat_g: number;
  actual_calories: number;
  actual_protein_g: number;
  actual_carbs_g: number;
  actual_fat_g: number;
  foods: MealFood[];
  time_slot?: string;
}

interface UserProfile {
  tee_calories: number;
  protein_percentage: number;
  carb_percentage: number;
  fat_percentage: number;
  metabolic_profile: string;
  gender: 'male' | 'female';
}

interface WaterIntake {
  glasses_consumed: number;
  target_glasses: number;
}

interface MealPlanningSystemProps {
  userProfile: UserProfile;
}

function MealPlanningSystem({ userProfile }: MealPlanningSystemProps) {
  const [planType, setPlanType] = useState<'three_meals' | 'four_meals' | 'five_meals'>('three_meals');
  const [meals, setMeals] = useState<Meal[]>([]);
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [selectedMeal, setSelectedMeal] = useState<number | null>(null);
  const [showFoodSelector, setShowFoodSelector] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [waterIntake, setWaterIntake] = useState<WaterIntake>({ glasses_consumed: 0, target_glasses: 8 });
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [usdaSearchResults, setUsdaSearchResults] = useState<USDAFoodItem[]>([]);
  const [showUSDASearch, setShowUSDASearch] = useState(false);
  const [usdaLoading, setUsdaLoading] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
    loadFoodItems();
    loadWaterIntake();
  }, []);

  useEffect(() => {
    if (userProfile.tee_calories > 0) {
      generateMealPlan();
    }
  }, [planType, userProfile]);

  const loadFoodItems = async () => {
    const { data, error } = await supabase
      .from('food_items')
      .select('*')
      .order('category', { ascending: true })
      .order('name', { ascending: true });

    if (data && !error) {
      setFoodItems(data);
    }
  };

  const loadWaterIntake = async () => {
    if (!user?.id) return;
    
    const { data, error } = await supabase
      .from('water_intake')
      .select('*')
      .eq('user_id', user.id)
      .eq('intake_date', new Date().toISOString().split('T')[0])
      .single();

    if (data && !error) {
      setWaterIntake({
        glasses_consumed: data.glasses_consumed,
        target_glasses: data.target_glasses
      });
    }
  };

  // USDA Food Data Central Integration
  const searchUSDAFoods = async (query: string) => {
    if (!query.trim()) return;
    
    setUsdaLoading(true);
    try {
      // Note: In production, you would use a real USDA API key
      // For demo purposes, we'll simulate the API response
      const mockUSDAResults: USDAFoodItem[] = [
        {
          fdcId: 171688,
          description: "Chicken, broilers or fryers, breast, meat only, cooked, roasted",
          dataType: "SR Legacy",
          foodCategory: "Poultry Products",
          foodNutrients: [
            { nutrientId: 1008, nutrientName: "Energy", nutrientNumber: "208", unitName: "kcal", value: 165 },
            { nutrientId: 1003, nutrientName: "Protein", nutrientNumber: "203", unitName: "g", value: 31.02 },
            { nutrientId: 1005, nutrientName: "Carbohydrate, by difference", nutrientNumber: "205", unitName: "g", value: 0 },
            { nutrientId: 1004, nutrientName: "Total lipid (fat)", nutrientNumber: "204", unitName: "g", value: 3.57 }
          ]
        },
        {
          fdcId: 168874,
          description: "Rice, white, long-grain, regular, cooked",
          dataType: "SR Legacy",
          foodCategory: "Cereal Grains and Pasta",
          foodNutrients: [
            { nutrientId: 1008, nutrientName: "Energy", nutrientNumber: "208", unitName: "kcal", value: 130 },
            { nutrientId: 1003, nutrientName: "Protein", nutrientNumber: "203", unitName: "g", value: 2.69 },
            { nutrientId: 1005, nutrientName: "Carbohydrate, by difference", nutrientNumber: "205", unitName: "g", value: 28.17 },
            { nutrientId: 1004, nutrientName: "Total lipid (fat)", nutrientNumber: "204", unitName: "g", value: 0.28 }
          ]
        },
        {
          fdcId: 170379,
          description: "Broccoli, cooked, boiled, drained, without salt",
          dataType: "SR Legacy",
          foodCategory: "Vegetables and Vegetable Products",
          foodNutrients: [
            { nutrientId: 1008, nutrientName: "Energy", nutrientNumber: "208", unitName: "kcal", value: 35 },
            { nutrientId: 1003, nutrientName: "Protein", nutrientNumber: "203", unitName: "g", value: 2.38 },
            { nutrientId: 1005, nutrientName: "Carbohydrate, by difference", nutrientNumber: "205", unitName: "g", value: 7.18 },
            { nutrientId: 1004, nutrientName: "Total lipid (fat)", nutrientNumber: "204", unitName: "g", value: 0.41 }
          ]
        }
      ];

      // Filter results based on search query
      const filteredResults = mockUSDAResults.filter(item =>
        item.description.toLowerCase().includes(query.toLowerCase())
      );

      setUsdaSearchResults(filteredResults);
    } catch (error) {
      console.error('Error searching USDA foods:', error);
    } finally {
      setUsdaLoading(false);
    }
  };

  const addUSDAFoodToDatabase = async (usdaFood: USDAFoodItem) => {
    const calories = usdaFood.foodNutrients.find(n => n.nutrientName === "Energy")?.value || 0;
    const protein = usdaFood.foodNutrients.find(n => n.nutrientName === "Protein")?.value || 0;
    const carbs = usdaFood.foodNutrients.find(n => n.nutrientName === "Carbohydrate, by difference")?.value || 0;
    const fat = usdaFood.foodNutrients.find(n => n.nutrientName === "Total lipid (fat)")?.value || 0;

    const newFoodItem: FoodItem = {
      id: `usda_${usdaFood.fdcId}`,
      name: usdaFood.description,
      category: usdaFood.foodCategory || 'Other',
      protein_per_100g: protein,
      carbs_per_100g: carbs,
      fat_per_100g: fat,
      calories_per_100g: calories,
      serving_size_g: 100,
      usda_fdc_id: usdaFood.fdcId
    };

    // Add to local state
    setFoodItems(prev => [...prev, newFoodItem]);
    
    // Save to database if user is logged in
    if (user?.id) {
      await supabase.from('food_items').insert({
        ...newFoodItem,
        created_by: user.id,
        is_custom: true
      });
    }

    return newFoodItem;
  };

  const generateMealPlan = () => {
    const minCalories = userProfile.gender === 'male' ? 1500 : 1200;
    const dailyCalories = Math.max(userProfile.tee_calories, minCalories);
    
    let mealDistribution: { [key: string]: number } = {};
    
    switch (planType) {
      case 'three_meals':
        mealDistribution = {
          breakfast: 0.3333,
          lunch: 0.3333,
          dinner: 0.3334
        };
        break;
      case 'four_meals':
        mealDistribution = {
          breakfast: 0.25,
          lunch: 0.30,
          dinner: 0.35,
          snack_1: 0.10
        };
        break;
      case 'five_meals':
        mealDistribution = {
          breakfast: 0.20,
          lunch: 0.25,
          dinner: 0.30,
          snack_1: 0.125,
          snack_2: 0.125
        };
        break;
    }

    const newMeals: Meal[] = [];
    
    Object.entries(mealDistribution).forEach(([mealType, percentage]) => {
      const calories = Math.round(dailyCalories * percentage);
      const protein = Math.round((calories * userProfile.protein_percentage / 100) / 4);
      const carbs = Math.round((calories * userProfile.carb_percentage / 100) / 4);
      const fat = Math.round((calories * userProfile.fat_percentage / 100) / 9);

      const timeSlot = getTimeSlot(mealType);

      newMeals.push({
        meal_type: mealType as any,
        target_calories: calories,
        target_protein_g: protein,
        target_carbs_g: carbs,
        target_fat_g: fat,
        actual_calories: 0,
        actual_protein_g: 0,
        actual_carbs_g: 0,
        actual_fat_g: 0,
        foods: [],
        time_slot: timeSlot
      });
    });

    setMeals(newMeals);
  };

  const getTimeSlot = (mealType: string) => {
    const timeSlots = {
      breakfast: '7:00 AM - 9:00 AM',
      lunch: '12:00 PM - 2:00 PM',
      dinner: '6:00 PM - 8:00 PM',
      snack_1: '10:00 AM - 11:00 AM',
      snack_2: '3:00 PM - 4:00 PM'
    };
    return timeSlots[mealType as keyof typeof timeSlots] || '';
  };

  const getMealIcon = (mealType: string) => {
    switch (mealType) {
      case 'breakfast': return <Coffee className="w-5 h-5" />;
      case 'lunch': return <Sun className="w-5 h-5" />;
      case 'dinner': return <Moon className="w-5 h-5" />;
      case 'snack_1':
      case 'snack_2': return <Apple className="w-5 h-5" />;
      default: return <Utensils className="w-5 h-5" />;
    }
  };

  const addFoodToMeal = (mealIndex: number, foodItem: FoodItem, quantity_g: number) => {
    // Calculate optimal quantity based on meal's remaining macro needs
    const meal = meals[mealIndex];
    const remainingCalories = meal.target_calories - meal.actual_calories;
    const remainingProtein = meal.target_protein_g - meal.actual_protein_g;
    const remainingCarbs = meal.target_carbs_g - meal.actual_carbs_g;
    const remainingFat = meal.target_fat_g - meal.actual_fat_g;

    // Calculate quantity needed based on the most limiting macro
    let optimalQuantity_g = 100; // Default starting point
    
    // Calculate based on calories if significant remaining
    if (remainingCalories > 50 && foodItem.calories_per_100g > 0) {
      const calorieBasedQuantity = (remainingCalories * 100) / foodItem.calories_per_100g;
      optimalQuantity_g = Math.min(optimalQuantity_g, calorieBasedQuantity);
    }
    
    // Calculate based on protein if significant remaining
    if (remainingProtein > 5 && foodItem.protein_per_100g > 0) {
      const proteinBasedQuantity = (remainingProtein * 100) / foodItem.protein_per_100g;
      optimalQuantity_g = Math.min(optimalQuantity_g, proteinBasedQuantity);
    }
    
    // Calculate based on carbs if significant remaining
    if (remainingCarbs > 5 && foodItem.carbs_per_100g > 0) {
      const carbBasedQuantity = (remainingCarbs * 100) / foodItem.carbs_per_100g;
      optimalQuantity_g = Math.min(optimalQuantity_g, carbBasedQuantity);
    }
    
    // Calculate based on fat if significant remaining
    if (remainingFat > 2 && foodItem.fat_per_100g > 0) {
      const fatBasedQuantity = (remainingFat * 100) / foodItem.fat_per_100g;
      optimalQuantity_g = Math.min(optimalQuantity_g, fatBasedQuantity);
    }
    
    // Ensure reasonable portion size (minimum 10g, maximum 500g)
    optimalQuantity_g = Math.max(10, Math.min(500, optimalQuantity_g));
    
    // Convert to ounces first, then back to grams for consistency
    const quantity_oz = optimalQuantity_g / 28.35;
    const finalQuantity_g = Math.round(quantity_oz * 28.35);
    
    // Calculate nutritional values
    const calories = (foodItem.calories_per_100g * finalQuantity_g) / 100;
    const protein = (foodItem.protein_per_100g * finalQuantity_g) / 100;
    const carbs = (foodItem.carbs_per_100g * finalQuantity_g) / 100;
    const fat = (foodItem.fat_per_100g * finalQuantity_g) / 100;

    const newFood: MealFood = {
      food_item_id: foodItem.id,
      food_item: foodItem,
      quantity_g: finalQuantity_g,
      quantity_oz: Math.round(quantity_oz * 10) / 10,
      calories: Math.round(calories * 100) / 100,
      protein_g: Math.round(protein * 100) / 100,
      carbs_g: Math.round(carbs * 100) / 100,
      fat_g: Math.round(fat * 100) / 100
    };

    const updatedMeals = [...meals];
    updatedMeals[mealIndex].foods.push(newFood);
    
    // Update actual totals
    updatedMeals[mealIndex].actual_calories += newFood.calories;
    updatedMeals[mealIndex].actual_protein_g += newFood.protein_g;
    updatedMeals[mealIndex].actual_carbs_g += newFood.carbs_g;
    updatedMeals[mealIndex].actual_fat_g += newFood.fat_g;

    setMeals(updatedMeals);
    setShowFoodSelector(false);
    setSelectedMeal(null);
  };

  const removeFoodFromMeal = (mealIndex: number, foodIndex: number) => {
    const updatedMeals = [...meals];
    const removedFood = updatedMeals[mealIndex].foods[foodIndex];
    
    // Update actual totals
    updatedMeals[mealIndex].actual_calories -= removedFood.calories;
    updatedMeals[mealIndex].actual_protein_g -= removedFood.protein_g;
    updatedMeals[mealIndex].actual_carbs_g -= removedFood.carbs_g;
    updatedMeals[mealIndex].actual_fat_g -= removedFood.fat_g;
    
    updatedMeals[mealIndex].foods.splice(foodIndex, 1);
    setMeals(updatedMeals);
  };

  const updateWaterIntake = async (glasses: number) => {
    if (!user?.id) return;

    const newIntake = Math.min(Math.max(glasses, 0), 20);
    setWaterIntake(prev => ({ ...prev, glasses_consumed: newIntake }));

    await supabase
      .from('water_intake')
      .upsert({
        user_id: user.id,
        glasses_consumed: newIntake,
        target_glasses: waterIntake.target_glasses,
        intake_date: new Date().toISOString().split('T')[0]
      }, { onConflict: 'user_id,intake_date' });
  };

  const getTotalActuals = () => {
    return meals.reduce((totals, meal) => ({
      calories: totals.calories + meal.actual_calories,
      protein: totals.protein + meal.actual_protein_g,
      carbs: totals.carbs + meal.actual_carbs_g,
      fat: totals.fat + meal.actual_fat_g
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
  };

  const getProgressPercentage = (actual: number, target: number) => {
    return Math.min((actual / target) * 100, 100);
  };

  const getProgressColor = (actual: number, target: number) => {
    const percentage = (actual / target) * 100;
    if (percentage < 50) return 'bg-red-500';
    if (percentage < 80) return 'bg-yellow-500';
    if (percentage <= 100) return 'bg-green-500';
    return 'bg-blue-500';
  };

  const getMealTypeLabel = (mealType: string, index: number) => {
    const labels = {
      breakfast: 'Breakfast',
      lunch: 'Lunch',
      dinner: 'Dinner',
      snack_1: 'Morning Snack',
      snack_2: 'Afternoon Snack'
    };
    return labels[mealType as keyof typeof labels] || `Meal ${index + 1}`;
  };

  const totals = getTotalActuals();
  const dailyTargets = {
    calories: userProfile.tee_calories,
    protein: Math.round((userProfile.tee_calories * userProfile.protein_percentage / 100) / 4),
    carbs: Math.round((userProfile.tee_calories * userProfile.carb_percentage / 100) / 4),
    fat: Math.round((userProfile.tee_calories * userProfile.fat_percentage / 100) / 9)
  };

  // Safety check for minimum calories
  const isUnderMinimum = userProfile.tee_calories < (userProfile.gender === 'male' ? 1500 : 1200);

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header with TEE Integration */}
      <div className="bg-gradient-to-r from-[#52C878]/10 to-[#4A90E2]/10 rounded-2xl p-6 border border-[#52C878]/20">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-[#2C3E50] flex items-center gap-3">
            <ChefHat className="w-8 h-8 text-[#52C878]" />
            Comprehensive Meal Planning System
          </h1>
          <div className="text-right">
            <div className="bg-white/50 p-3 rounded-lg">
              <p className="text-sm text-gray-600">Total Energy Expenditure (TEE)</p>
              <p className="text-2xl font-bold text-[#52C878]">{userProfile.tee_calories}</p>
              <p className="text-xs text-gray-500">
                P:{userProfile.protein_percentage}% C:{userProfile.carb_percentage}% F:{userProfile.fat_percentage}%
              </p>
            </div>
          </div>
        </div>

        <p className="text-gray-600">
          Build a nutritional meal planning application that allows members to select up to 5 meals per 
          day that collectively equal their Total Energy Expenditure (TEE) based on their individual metabolic profile.
        </p>

        {/* Safety Warning */}
        {isUnderMinimum && (
          <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl mt-4">
            <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-red-800">
                Calorie Intake Below Recommended Minimum
              </p>
              <p className="text-xs text-red-600">
                Your TEE ({userProfile.tee_calories} cal) is below the minimum recommended daily intake 
                ({userProfile.gender === 'male' ? '1500' : '1200'} cal). Please consult with a nutritionist.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Running Total Dashboard */}
      <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
        <h2 className="text-xl font-bold text-[#2C3E50] mb-6 flex items-center gap-2">
          <Target className="w-5 h-5" />
          Daily Progress Dashboard
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Calories */}
          <div className="text-center">
            <div className="relative w-24 h-24 mx-auto mb-3">
              <svg className="w-24 h-24 transform -rotate-90">
                <circle cx="48" cy="48" r="40" stroke="#E5E7EB" strokeWidth="8" fill="none" />
                <circle 
                  cx="48" cy="48" r="40" 
                  stroke="#52C878" 
                  strokeWidth="8" 
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 40}`}
                  strokeDashoffset={`${2 * Math.PI * 40 * (1 - getProgressPercentage(totals.calories, dailyTargets.calories) / 100)}`}
                  className="transition-all duration-500"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-bold text-[#2C3E50]">
                  {Math.round(getProgressPercentage(totals.calories, dailyTargets.calories))}%
                </span>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-1">Calories</p>
            <p className="text-2xl font-bold text-[#2C3E50]">{Math.round(totals.calories)}</p>
            <p className="text-sm text-gray-500">/ {dailyTargets.calories}</p>
          </div>

          {/* Protein */}
          <div className="text-center">
            <div className="w-full bg-gray-200 rounded-full h-4 mb-3">
              <div 
                className={`h-4 rounded-full transition-all duration-500 ${getProgressColor(totals.protein, dailyTargets.protein)}`}
                style={{ width: `${getProgressPercentage(totals.protein, dailyTargets.protein)}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600 mb-1">Protein</p>
            <p className="text-2xl font-bold text-green-600">{Math.round(totals.protein)}g</p>
            <p className="text-sm text-gray-500">/ {dailyTargets.protein}g</p>
          </div>

          {/* Carbs */}
          <div className="text-center">
            <div className="w-full bg-gray-200 rounded-full h-4 mb-3">
              <div 
                className={`h-4 rounded-full transition-all duration-500 ${getProgressColor(totals.carbs, dailyTargets.carbs)}`}
                style={{ width: `${getProgressPercentage(totals.carbs, dailyTargets.carbs)}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600 mb-1">Carbohydrates</p>
            <p className="text-2xl font-bold text-yellow-600">{Math.round(totals.carbs)}g</p>
            <p className="text-sm text-gray-500">/ {dailyTargets.carbs}g</p>
          </div>

          {/* Fat */}
          <div className="text-center">
            <div className="w-full bg-gray-200 rounded-full h-4 mb-3">
              <div 
                className={`h-4 rounded-full transition-all duration-500 ${getProgressColor(totals.fat, dailyTargets.fat)}`}
                style={{ width: `${getProgressPercentage(totals.fat, dailyTargets.fat)}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600 mb-1">Fat</p>
            <p className="text-2xl font-bold text-purple-600">{Math.round(totals.fat)}g</p>
            <p className="text-sm text-gray-500">/ {dailyTargets.fat}g</p>
          </div>
        </div>
      </div>

      {/* Water Tracking */}
      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-6 border border-blue-200">
        <h3 className="text-lg font-bold text-[#2C3E50] mb-4 flex items-center gap-2">
          <Droplets className="w-5 h-5 text-blue-500" />
          Daily Hydration Tracker
        </h3>
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="flex gap-1">
              {Array.from({ length: waterIntake.target_glasses }, (_, i) => (
                <button
                  key={i}
                  onClick={() => updateWaterIntake(i + 1)}
                  className={`w-8 h-10 rounded-lg border-2 transition-all duration-200 ${
                    i < waterIntake.glasses_consumed
                      ? 'bg-blue-500 border-blue-500 text-white'
                      : 'bg-white border-blue-200 hover:border-blue-400'
                  }`}
                >
                  <Droplets className="w-4 h-4 mx-auto" />
                </button>
              ))}
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{waterIntake.glasses_consumed}</p>
              <p className="text-sm text-gray-600">/ {waterIntake.target_glasses} glasses</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => updateWaterIntake(waterIntake.glasses_consumed - 1)}
              className="px-3 py-1 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
            >
              -1
            </button>
            <button
              onClick={() => updateWaterIntake(waterIntake.glasses_consumed + 1)}
              className="px-3 py-1 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
            >
              +1
            </button>
          </div>
        </div>
        
        {waterIntake.glasses_consumed >= waterIntake.target_glasses && (
          <div className="flex items-center gap-2 text-green-600">
            <Check className="w-4 h-4" />
            <span className="text-sm font-medium">Great job! You've reached your daily hydration goal!</span>
          </div>
        )}
      </div>

      {/* Meal Plan Structure Selection */}
      <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
        <h3 className="text-xl font-bold text-[#2C3E50] mb-4">Meal Plan Structure (Up to 5 Meals Per Day)</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { 
              value: 'three_meals', 
              label: 'Three Meals', 
              description: 'Breakfast, Lunch, Dinner',
              distribution: '33.33% each meal'
            },
            { 
              value: 'four_meals', 
              label: 'Four Meals', 
              description: '3 meals + 1 snack',
              distribution: '25%, 30%, 35%, 10%'
            },
            { 
              value: 'five_meals', 
              label: 'Five Meals', 
              description: '3 meals + 2 snacks',
              distribution: '20%, 25%, 30%, 12.5%, 12.5%'
            }
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => setPlanType(option.value as any)}
              className={`p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                planType === option.value
                  ? 'border-[#52C878] bg-[#52C878]/10'
                  : 'border-gray-200 hover:border-[#52C878]/50'
              }`}
            >
              <h4 className="font-semibold text-[#2C3E50] mb-2">{option.label}</h4>
              <p className="text-sm text-gray-600 mb-1">{option.description}</p>
              <p className="text-xs text-[#52C878] font-medium">{option.distribution}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Meals Section */}
      <div className="space-y-6">
        {meals.map((meal, mealIndex) => (
          <div key={mealIndex} className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="bg-[#52C878]/10 p-3 rounded-full">
                  {getMealIcon(meal.meal_type)}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#2C3E50]">
                    {getMealTypeLabel(meal.meal_type, mealIndex)}
                  </h3>
                  {meal.time_slot && (
                    <p className="text-sm text-gray-600 flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {meal.time_slot}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-2xl font-bold text-[#2C3E50]">{meal.target_calories}</p>
                  <p className="text-sm text-gray-600">target calories</p>
                </div>
                <button
                  onClick={() => {
                    setSelectedMeal(mealIndex);
                    setShowFoodSelector(true);
                  }}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#52C878] to-[#4A90E2] text-white rounded-xl hover:from-[#52C878]/90 hover:to-[#4A90E2]/90 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <Plus className="w-4 h-4" />
                  Select Food
                </button>
              </div>
            </div>

            {/* Meal Targets */}
            <div className="grid grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 rounded-xl">
              <div className="text-center">
                <p className="text-xs text-gray-600 mb-1">Target Calories</p>
                <p className="font-bold text-[#2C3E50]">{meal.target_calories}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-600 mb-1">Protein (g)</p>
                <p className="font-bold text-green-600">{meal.target_protein_g}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-600 mb-1">Carbs (g)</p>
                <p className="font-bold text-yellow-600">{meal.target_carbs_g}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-600 mb-1">Fat (g)</p>
                <p className="font-bold text-purple-600">{meal.target_fat_g}</p>
              </div>
            </div>

            {/* Foods in Meal */}
            <div className="space-y-3 mb-6">
              {meal.foods.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Utensils className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No foods added yet. Click "Add Food" to start building your meal.</p>
                </div>
              ) : (
                meal.foods.map((food, foodIndex) => (
                  <div key={foodIndex} className="flex items-center justify-between p-4 bg-[#52C878]/5 rounded-xl border border-[#52C878]/10">
                    <div className="flex-1">
                      <p className="font-semibold text-[#2C3E50]">{food.food_item?.name}</p>
                      <p className="text-sm text-gray-600">
                        {food.quantity_g}g ({food.quantity_oz} oz)
                      </p>
                    </div>
                    <div className="flex items-center gap-6 text-sm">
                      <span className="font-medium">{Math.round(food.calories)} cal</span>
                      <span className="text-green-600 font-medium">{Math.round(food.protein_g)}p</span>
                      <span className="text-yellow-600 font-medium">{Math.round(food.carbs_g)}c</span>
                      <span className="text-purple-600 font-medium">{Math.round(food.fat_g)}f</span>
                      <button
                        onClick={() => removeFoodFromMeal(mealIndex, foodIndex)}
                        className="text-red-500 hover:text-red-700 p-1 rounded-lg hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Meal Progress */}
            <div className="grid grid-cols-4 gap-4 p-4 bg-[#4A90E2]/5 rounded-xl">
              <div className="text-center">
                <p className="text-xs text-gray-600 mb-1">Actual Calories</p>
                <p className="font-bold text-[#2C3E50]">{Math.round(meal.actual_calories)}</p>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                  <div 
                    className="bg-[#2C3E50] h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min((meal.actual_calories / meal.target_calories) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-600 mb-1">Protein (g)</p>
                <p className="font-bold text-green-600">{Math.round(meal.actual_protein_g)}</p>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min((meal.actual_protein_g / meal.target_protein_g) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-600 mb-1">Carbs (g)</p>
                <p className="font-bold text-yellow-600">{Math.round(meal.actual_carbs_g)}</p>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                  <div 
                    className="bg-yellow-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min((meal.actual_carbs_g / meal.target_carbs_g) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-600 mb-1">Fat (g)</p>
                <p className="font-bold text-purple-600">{Math.round(meal.actual_fat_g)}</p>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                  <div 
                    className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min((meal.actual_fat_g / meal.target_fat_g) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Food Selector Modal with USDA Integration */}
      {showFoodSelector && selectedMeal !== null && (
        <FoodSelectorModal
          foodItems={foodItems}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          onAddFood={(foodItem) => addFoodToMeal(selectedMeal, foodItem, 0)}
          onClose={() => {
            setShowFoodSelector(false);
            setSelectedMeal(null);
          }}
          onUSDASearch={searchUSDAFoods}
          usdaSearchResults={usdaSearchResults}
          usdaLoading={usdaLoading}
          onAddUSDAFood={addUSDAFoodToDatabase}
        />
      )}

    </div>
  );
}

// Enhanced Food Selector Modal with USDA Integration
interface FoodSelectorModalProps {
  foodItems: FoodItem[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  onAddFood: (foodItem: FoodItem) => void;
  onClose: () => void;
  onUSDASearch: (query: string) => void;
  usdaSearchResults: USDAFoodItem[];
  usdaLoading: boolean;
  onAddUSDAFood: (usdaFood: USDAFoodItem) => Promise<FoodItem>;
}

function FoodSelectorModal({ 
  foodItems, 
  searchTerm, 
  setSearchTerm, 
  onAddFood, 
  onClose,
  onUSDASearch,
  usdaSearchResults,
  usdaLoading,
  onAddUSDAFood
}: FoodSelectorModalProps) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showUSDAResults, setShowUSDAResults] = useState(false);

  const categories = ['all', ...Array.from(new Set(foodItems.map(item => item.category)))];
  
  const filteredFoods = foodItems.filter(food => {
    const matchesCategory = selectedCategory === 'all' || food.category === selectedCategory;
    const matchesSearch = food.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });


  const handleUSDASearch = () => {
    if (searchTerm.trim()) {
      onUSDASearch(searchTerm);
      setShowUSDAResults(true);
    }
  };

  const handleAddUSDAFood = async (usdaFood: USDAFoodItem) => {
    const newFoodItem = await onAddUSDAFood(usdaFood);
    onAddFood(newFoodItem);
    setShowUSDAResults(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold text-[#2C3E50] flex items-center gap-2">
              <Database className="w-6 h-6" />
              Food Selection & Database Integration
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Search and Filter with USDA Integration */}
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search foods (e.g., chicken breast, rice, broccoli)..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#52C878] focus:border-[#52C878]"
                />
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#52C878] focus:border-[#52C878]"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* USDA Search Integration */}
            <div className="flex gap-4">
              <button
                onClick={handleUSDASearch}
                disabled={!searchTerm.trim() || usdaLoading}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                <Database className="w-4 h-4" />
                {usdaLoading ? 'Searching USDA...' : 'Search USDA Database'}
              </button>
              <button
                onClick={() => setShowUSDAResults(!showUSDAResults)}
                className="px-4 py-3 text-blue-600 border border-blue-300 rounded-xl hover:bg-blue-50 transition-colors"
              >
                {showUSDAResults ? 'Show Local Foods' : 'Show USDA Results'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Food List */}
            <div className="space-y-2 max-h-96 overflow-y-auto">
              <h4 className="font-semibold text-[#2C3E50] mb-3 flex items-center gap-2">
                {showUSDAResults ? (
                  <>
                    <Database className="w-4 h-4" />
                    USDA Food Database ({usdaSearchResults.length} results)
                  </>
                ) : (
                  <>
                    <BookOpen className="w-4 h-4" />
                    Local Food Database ({filteredFoods.length} items)
                  </>
                )}
              </h4>

              {showUSDAResults ? (
                // USDA Search Results
                usdaSearchResults.map(food => (
                  <button
                    key={food.fdcId}
                    onClick={() => handleAddUSDAFood(food)}
                    className="w-full text-left p-4 rounded-xl border border-blue-200 hover:border-blue-400 hover:bg-blue-50 transition-all duration-200"
                  >
                    <p className="font-semibold text-[#2C3E50]">{food.description}</p>
                    <p className="text-sm text-gray-600 capitalize mb-1">{food.foodCategory}</p>
                    <div className="flex gap-4 text-xs text-gray-500">
                      <span>{food.foodNutrients.find(n => n.nutrientName === "Energy")?.value || 0} cal/100g</span>
                      <span className="text-green-600">P:{food.foodNutrients.find(n => n.nutrientName === "Protein")?.value || 0}g</span>
                      <span className="text-yellow-600">C:{food.foodNutrients.find(n => n.nutrientName === "Carbohydrate, by difference")?.value || 0}g</span>
                      <span className="text-purple-600">F:{food.foodNutrients.find(n => n.nutrientName === "Total lipid (fat)")?.value || 0}g</span>
                    </div>
                    <p className="text-xs text-blue-600 mt-1">Click to add to meal (auto-calculated portion)</p>
                  </button>
                ))
              ) : (
                // Local Food Database
                filteredFoods.map(food => (
                  <button
                    key={food.id}
                    onClick={() => onAddFood(food)}
                    className="w-full text-left p-4 rounded-xl border border-gray-200 hover:border-[#52C878]/50 hover:bg-[#52C878]/5 transition-all duration-200"
                  >
                    <p className="font-semibold text-[#2C3E50]">{food.name}</p>
                    <p className="text-sm text-gray-600 capitalize mb-1">{food.category}</p>
                    <div className="flex gap-4 text-xs text-gray-500">
                      <span>{food.calories_per_100g} cal/100g</span>
                      <span className="text-green-600">P:{food.protein_per_100g}g</span>
                      <span className="text-yellow-600">C:{food.carbs_per_100g}g</span>
                      <span className="text-purple-600">F:{food.fat_per_100g}g</span>
                    </div>
                    {food.usda_fdc_id && (
                      <p className="text-xs text-blue-600 mt-1">USDA Verified</p>
                    )}
                    <p className="text-xs text-[#52C878] mt-1 font-medium">Click to add to meal (auto-calculated portion)</p>
                  </button>
                ))
              )}
            </div>

            {/* Automatic Calculation Info */}
            <div className="space-y-4">
              <div className="p-6 bg-gradient-to-r from-[#52C878]/5 to-[#4A90E2]/5 rounded-xl border border-[#52C878]/20">
                <h4 className="font-bold text-[#2C3E50] text-lg mb-3 flex items-center gap-2">
                  <Calculator className="w-5 h-5" />
                  Automatic Portion Calculation
                </h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>• The system automatically calculates the optimal portion size</p>
                  <p>• Quantities are calculated in ounces, then converted to grams</p>
                  <p>• Portions are based on your meal's remaining macro targets</p>
                  <p>• Simply click on any food to add it to your meal</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-6 py-3 text-gray-600 hover:text-gray-800 font-medium transition-colors duration-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default MealPlanningSystem;