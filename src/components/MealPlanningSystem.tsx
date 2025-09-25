import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Search, Clock, Target, Utensils, Droplets, ChefHat, BookOpen, ShoppingCart, AlertTriangle, Check, Star, Coffee, Sun, Moon, Apple } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface FoodItem {
  id: string;
  name: string;
  category: string;
  protein_per_100g: number;
  carbs_per_100g: number;
  fat_per_100g: number;
  calories_per_100g: number;
  serving_size_g: number;
}

interface MealFood {
  id?: string;
  food_item_id: string;
  food_item?: FoodItem;
  quantity_g: number;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
}

interface Meal {
  id?: string;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
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
  const [planType, setPlanType] = useState<'three_meals' | 'three_meals_one_snack' | 'three_meals_two_snacks'>('three_meals');
  const [meals, setMeals] = useState<Meal[]>([]);
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [selectedMeal, setSelectedMeal] = useState<number | null>(null);
  const [showFoodSelector, setShowFoodSelector] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [waterIntake, setWaterIntake] = useState<WaterIntake>({ glasses_consumed: 0, target_glasses: 8 });
  const [favoriteMeals, setFavoriteMeals] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [currentMealIndex, setCurrentMealIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingFood, setPendingFood] = useState<{
    mealIndex: number;
    foodItem: FoodItem;
    quantity: number;
    calories: number;
    protein_g: number;
    carbs_g: number;
    fat_g: number;
  } | null>(null);

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
      case 'three_meals_one_snack':
        mealDistribution = {
          breakfast: 0.3,
          lunch: 0.3,
          dinner: 0.3,
          snack: 0.1
        };
        break;
      case 'three_meals_two_snacks':
        mealDistribution = {
          breakfast: 0.2667,
          lunch: 0.2667,
          dinner: 0.2666,
          snack1: 0.1,
          snack2: 0.1
        };
        break;
    }

    const newMeals: Meal[] = [];
    
    Object.entries(mealDistribution).forEach(([mealType, percentage]) => {
      const calories = Math.round(dailyCalories * percentage);
      const protein = Math.round((calories * userProfile.protein_percentage / 100) / 4);
      const carbs = Math.round((calories * userProfile.carb_percentage / 100) / 4);
      const fat = Math.round((calories * userProfile.fat_percentage / 100) / 9);

      const actualMealType = mealType.includes('snack') ? 'snack' : mealType;
      const timeSlot = getTimeSlot(mealType);

      newMeals.push({
        meal_type: actualMealType as any,
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
      snack: '3:00 PM - 4:00 PM',
      snack1: '10:00 AM - 11:00 AM',
      snack2: '3:00 PM - 4:00 PM'
    };
    return timeSlots[mealType as keyof typeof timeSlots] || '';
  };

  const getMealIcon = (mealType: string) => {
    switch (mealType) {
      case 'breakfast': return <Coffee className="w-5 h-5" />;
      case 'lunch': return <Sun className="w-5 h-5" />;
      case 'dinner': return <Moon className="w-5 h-5" />;
      case 'snack': return <Apple className="w-5 h-5" />;
      default: return <Utensils className="w-5 h-5" />;
    }
  };

  const addFoodToMeal = (mealIndex: number, foodItem: FoodItem, quantity: number) => {
    const calories = (foodItem.calories_per_100g * quantity) / 100;
    const protein = (foodItem.protein_per_100g * quantity) / 100;
    const carbs = (foodItem.carbs_per_100g * quantity) / 100;
    const fat = (foodItem.fat_per_100g * quantity) / 100;

    // Set pending food for confirmation
    setPendingFood({
      mealIndex,
      foodItem,
      quantity,
      calories: Math.round(calories * 100) / 100,
      protein_g: Math.round(protein * 100) / 100,
      carbs_g: Math.round(carbs * 100) / 100,
      fat_g: Math.round(fat * 100) / 100
    });
    setShowConfirmDialog(true);
  };

  const confirmAddFood = () => {
    if (!pendingFood) return;

    const newFood: MealFood = {
      food_item_id: pendingFood.foodItem.id,
      food_item: pendingFood.foodItem,
      quantity_g: pendingFood.quantity,
      calories: pendingFood.calories,
      protein_g: pendingFood.protein_g,
      carbs_g: pendingFood.carbs_g,
      fat_g: pendingFood.fat_g
    };

    const updatedMeals = [...meals];
    updatedMeals[pendingFood.mealIndex].foods.push(newFood);
    
    // Update actual totals
    updatedMeals[pendingFood.mealIndex].actual_calories += newFood.calories;
    updatedMeals[pendingFood.mealIndex].actual_protein_g += newFood.protein_g;
    updatedMeals[pendingFood.mealIndex].actual_carbs_g += newFood.carbs_g;
    updatedMeals[pendingFood.mealIndex].actual_fat_g += newFood.fat_g;

    setMeals(updatedMeals);
    setShowFoodSelector(false);
    setSelectedMeal(null);
    setShowConfirmDialog(false);
    setPendingFood(null);
    
    // Check for macro balance and show suggestions
    checkMacroBalance(pendingFood.mealIndex, updatedMeals[pendingFood.mealIndex]);
  };

  const cancelAddFood = () => {
    setShowConfirmDialog(false);
    setPendingFood(null);
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

  const checkMacroBalance = (mealIndex: number, meal: Meal) => {
    const proteinDeficit = meal.target_protein_g - meal.actual_protein_g;
    const carbDeficit = meal.target_carbs_g - meal.actual_carbs_g;
    const fatDeficit = meal.target_fat_g - meal.actual_fat_g;

    if (proteinDeficit > 5 || carbDeficit > 10 || fatDeficit > 3) {
      setCurrentMealIndex(mealIndex);
      setShowSuggestions(true);
    }
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
    if (mealType === 'snack' && planType === 'three_meals_two_snacks') {
      const snackCount = meals.slice(0, index + 1).filter(m => m.meal_type === 'snack').length;
      return `Snack ${snackCount}`;
    }
    return mealType.charAt(0).toUpperCase() + mealType.slice(1);
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
      {/* Header with Metabolic Profile Info */}
      <div className="bg-gradient-to-r from-[#52C878]/10 to-[#4A90E2]/10 rounded-2xl p-6 border border-[#52C878]/20">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-[#2C3E50] flex items-center gap-3">
            <ChefHat className="w-8 h-8 text-[#52C878]" />
            Personalized Meal Planning System
          </h1>
          <div className="text-right">
            <div className="bg-white/50 p-3 rounded-lg">
              <p className="text-sm text-gray-600">Total Daily Calories</p>
              <p className="text-2xl font-bold text-[#52C878]">{userProfile.tee_calories}</p>
              <p className="text-xs text-gray-500">
                P:{userProfile.protein_percentage}% C:{userProfile.carb_percentage}% F:{userProfile.fat_percentage}%
              </p>
            </div>
          </div>
        </div>

        {/* Safety Warning */}
        {isUnderMinimum && (
          <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl mb-4">
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
        <h3 className="text-xl font-bold text-[#2C3E50] mb-4">Meal Plan Structure</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { 
              value: 'three_meals', 
              label: 'Three Meals', 
              description: 'Breakfast, Lunch, Dinner',
              distribution: '33.33% each meal'
            },
            { 
              value: 'three_meals_one_snack', 
              label: 'Three Meals + One Snack', 
              description: '3 meals + 1 snack',
              distribution: '30% meals, 10% snack'
            },
            { 
              value: 'three_meals_two_snacks', 
              label: 'Three Meals + Two Snacks', 
              description: '3 meals + 2 snacks',
              distribution: '26.67% meals, 10% each snack'
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
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#52C878] to-[#4A90E2] text-white rounded-xl hover:from-[#52C878]/90 hover:to-[#4A90E2]/90 transition-all duration-200 shadow-lg hover:shadow-xl cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Add Food
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
                      <p className="text-sm text-gray-600">{food.quantity_g}g ({(food.quantity_g / 28.35).toFixed(1)} oz)</p>
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

      {/* Food Selector Modal */}
      {showFoodSelector && selectedMeal !== null && (
        <FoodSelectorModal
          foodItems={foodItems}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          onAddFood={(foodItem, quantity) => addFoodToMeal(selectedMeal, foodItem, quantity)}
          onClose={() => {
            setShowFoodSelector(false);
            setSelectedMeal(null);
          }}
        />
      )}

      {/* Macro Balance Suggestions Modal */}
      {showSuggestions && currentMealIndex !== null && (
        <MacroSuggestionsModal
          meal={meals[currentMealIndex]}
          foodItems={foodItems}
          onClose={() => setShowSuggestions(false)}
          onAddSuggestion={(foodItem, quantity) => {
            addFoodToMeal(currentMealIndex, foodItem, quantity);
            setShowSuggestions(false);
          }}
        />
      )}

      {/* Food Confirmation Dialog */}
      {showConfirmDialog && pendingFood && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-[#2C3E50]">Confirm Food Addition</h3>
            </div>
            
            <div className="p-6">
              <div className="text-center mb-6">
                <div className="bg-[#52C878]/10 p-4 rounded-xl mb-4">
                  <h4 className="font-semibold text-[#2C3E50] mb-2">{pendingFood.foodItem.name}</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    {pendingFood.quantity}g ({(pendingFood.quantity / 28.35).toFixed(1)} oz)
                  </p>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-gray-600">Calories</p>
                      <p className="font-bold text-[#2C3E50]">{Math.round(pendingFood.calories)}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Protein</p>
                      <p className="font-bold text-green-600">{Math.round(pendingFood.protein_g)}g</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Carbs</p>
                      <p className="font-bold text-yellow-600">{Math.round(pendingFood.carbs_g)}g</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Fat</p>
                      <p className="font-bold text-purple-600">{Math.round(pendingFood.fat_g)}g</p>
                    </div>
                  </div>
                </div>
                <p className="text-gray-600">
                  Add this food to your {getMealTypeLabel(meals[pendingFood.mealIndex]?.meal_type || 'meal', pendingFood.mealIndex)}?
                </p>
              </div>
              
              <div className="flex gap-4">
                <button
                  onClick={cancelAddFood}
                  className="flex-1 px-4 py-3 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmAddFood}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-[#52C878] to-[#4A90E2] text-white font-semibold rounded-xl hover:from-[#52C878]/90 hover:to-[#4A90E2]/90 transition-all duration-200 shadow-lg hover:shadow-xl cursor-pointer"
                >
                  Confirm & Add
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Food Selector Modal Component
interface FoodSelectorModalProps {
  foodItems: FoodItem[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  onAddFood: (foodItem: FoodItem, quantity: number) => void;
  onClose: () => void;
}

function FoodSelectorModal({ foodItems, searchTerm, setSearchTerm, onAddFood, onClose }: FoodSelectorModalProps) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [quantity, setQuantity] = useState(100);

  const categories = ['all', ...Array.from(new Set(foodItems.map(item => item.category)))];
  
  const filteredFoods = foodItems.filter(food => {
    const matchesCategory = selectedCategory === 'all' || food.category === selectedCategory;
    const matchesSearch = food.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleAddFood = () => {
    if (selectedFood && quantity > 0) {
      onAddFood(selectedFood, quantity);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold text-[#2C3E50]">Add Food to Meal</h3>
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
          {/* Search and Filter */}
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Food List */}
            <div className="space-y-2 max-h-96 overflow-y-auto">
              <h4 className="font-semibold text-[#2C3E50] mb-3">Select Food ({filteredFoods.length} items)</h4>
              {filteredFoods.map(food => (
                <button
                  key={food.id}
                  onClick={() => setSelectedFood(food)}
                  className={`w-full text-left p-4 rounded-xl border transition-all duration-200 ${
                    selectedFood?.id === food.id
                      ? 'border-[#52C878] bg-[#52C878]/10'
                      : 'border-gray-200 hover:border-[#52C878]/50 hover:bg-[#52C878]/5'
                  }`}
                >
                  <p className="font-semibold text-[#2C3E50]">{food.name}</p>
                  <p className="text-sm text-gray-600 capitalize mb-1">{food.category}</p>
                  <div className="flex gap-4 text-xs text-gray-500">
                    <span>{food.calories_per_100g} cal/100g</span>
                    <span className="text-green-600">P:{food.protein_per_100g}g</span>
                    <span className="text-yellow-600">C:{food.carbs_per_100g}g</span>
                    <span className="text-purple-600">F:{food.fat_per_100g}g</span>
                  </div>
                </button>
              ))}
            </div>

            {/* Food Details and Quantity */}
            {selectedFood && (
              <div className="space-y-6">
                <div className="p-6 bg-gradient-to-r from-[#52C878]/5 to-[#4A90E2]/5 rounded-xl border border-[#52C878]/20">
                  <h4 className="font-bold text-[#2C3E50] text-lg mb-4">{selectedFood.name}</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="bg-white p-3 rounded-lg">
                      <p className="text-gray-600">Calories</p>
                      <p className="font-bold text-[#2C3E50]">{selectedFood.calories_per_100g}/100g</p>
                    </div>
                    <div className="bg-white p-3 rounded-lg">
                      <p className="text-gray-600">Protein</p>
                      <p className="font-bold text-green-600">{selectedFood.protein_per_100g}g/100g</p>
                    </div>
                    <div className="bg-white p-3 rounded-lg">
                      <p className="text-gray-600">Carbs</p>
                      <p className="font-bold text-yellow-600">{selectedFood.carbs_per_100g}g/100g</p>
                    </div>
                    <div className="bg-white p-3 rounded-lg">
                      <p className="text-gray-600">Fat</p>
                      <p className="font-bold text-purple-600">{selectedFood.fat_per_100g}g/100g</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Quantity
                    </label>
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <input
                          type="number"
                          value={quantity}
                          onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#52C878] focus:border-[#52C878]"
                          min="1"
                          placeholder="100"
                        />
                        <p className="text-xs text-gray-500 mt-1">grams</p>
                      </div>
                      <div className="flex-1">
                        <input
                          type="number"
                          value={Math.round((quantity / 28.35) * 10) / 10}
                          onChange={(e) => setQuantity(Math.round((parseFloat(e.target.value) || 0) * 28.35))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#52C878] focus:border-[#52C878]"
                          min="0.1"
                          step="0.1"
                          placeholder="3.5"
                        />
                        <p className="text-xs text-gray-500 mt-1">ounces</p>
                      </div>
                    </div>
                  </div>

                  {quantity > 0 && (
                    <div className="p-4 bg-[#4A90E2]/10 rounded-xl border border-[#4A90E2]/20">
                      <h5 className="font-semibold text-[#2C3E50] mb-3">
                        Nutrition for {quantity}g ({(quantity / 28.35).toFixed(1)} oz):
                      </h5>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="flex justify-between">
                          <span>Calories:</span>
                          <span className="font-bold">{Math.round((selectedFood.calories_per_100g * quantity) / 100)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-green-600">Protein:</span>
                          <span className="font-bold text-green-600">{Math.round((selectedFood.protein_per_100g * quantity) / 100 * 10) / 10}g</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-yellow-600">Carbs:</span>
                          <span className="font-bold text-yellow-600">{Math.round((selectedFood.carbs_per_100g * quantity) / 100 * 10) / 10}g</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-purple-600">Fat:</span>
                          <span className="font-bold text-purple-600">{Math.round((selectedFood.fat_per_100g * quantity) / 100 * 10) / 10}g</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-6 py-3 text-gray-600 hover:text-gray-800 font-medium transition-colors duration-200"
          >
            Cancel
          </button>
          {selectedFood && (
            <button
              onClick={handleAddFood}
              disabled={quantity <= 0}
              className="px-8 py-3 bg-gradient-to-r from-[#52C878] to-[#4A90E2] text-white font-semibold rounded-xl hover:from-[#52C878]/90 hover:to-[#4A90E2]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Review & Add Food
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Macro Suggestions Modal Component
interface MacroSuggestionsModalProps {
  meal: Meal;
  foodItems: FoodItem[];
  onClose: () => void;
  onAddSuggestion: (foodItem: FoodItem, quantity: number) => void;
}

function MacroSuggestionsModal({ meal, foodItems, onClose, onAddSuggestion }: MacroSuggestionsModalProps) {
  const proteinDeficit = Math.max(0, meal.target_protein_g - meal.actual_protein_g);
  const carbDeficit = Math.max(0, meal.target_carbs_g - meal.actual_carbs_g);
  const fatDeficit = Math.max(0, meal.target_fat_g - meal.actual_fat_g);

  const getProteinSuggestions = () => {
    return foodItems
      .filter(food => food.protein_per_100g > 15)
      .sort((a, b) => b.protein_per_100g - a.protein_per_100g)
      .slice(0, 3);
  };

  const getCarbSuggestions = () => {
    return foodItems
      .filter(food => food.carbs_per_100g > 20)
      .sort((a, b) => b.carbs_per_100g - a.carbs_per_100g)
      .slice(0, 3);
  };

  const getFatSuggestions = () => {
    return foodItems
      .filter(food => food.fat_per_100g > 10)
      .sort((a, b) => b.fat_per_100g - a.fat_per_100g)
      .slice(0, 3);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold text-[#2C3E50]">Smart Macro Balance Suggestions</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-gray-600 mt-2">
            Your meal needs balancing. Here are smart suggestions to meet your macro targets.
          </p>
        </div>
        
        <div className="p-6 space-y-8">
          {/* Protein Suggestions */}
          {proteinDeficit > 5 && (
            <div>
              <h4 className="text-lg font-bold text-green-600 mb-4 flex items-center gap-2">
                <Target className="w-5 h-5" />
                Protein Deficit: {Math.round(proteinDeficit)}g
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {getProteinSuggestions().map(food => {
                  const suggestedQuantity = Math.round((proteinDeficit / food.protein_per_100g) * 100);
                  return (
                    <div key={food.id} className="p-4 border border-green-200 rounded-xl bg-green-50">
                      <h5 className="font-semibold text-[#2C3E50] mb-2">{food.name}</h5>
                      <p className="text-sm text-gray-600 mb-3">
                        Add {suggestedQuantity}g ({(suggestedQuantity / 28.35).toFixed(1)} oz)
                      </p>
                      <div className="text-xs text-gray-500 mb-3">
                        <p>+{Math.round((food.protein_per_100g * suggestedQuantity) / 100)}g protein</p>
                        <p>+{Math.round((food.calories_per_100g * suggestedQuantity) / 100)} calories</p>
                      </div>
                      <button
                        onClick={() => onAddSuggestion(food, suggestedQuantity)}
                        className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                      >
                        Add to Meal
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Carb Suggestions */}
          {carbDeficit > 10 && (
            <div>
              <h4 className="text-lg font-bold text-yellow-600 mb-4 flex items-center gap-2">
                <Target className="w-5 h-5" />
                Carbohydrate Deficit: {Math.round(carbDeficit)}g
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {getCarbSuggestions().map(food => {
                  const suggestedQuantity = Math.round((carbDeficit / food.carbs_per_100g) * 100);
                  return (
                    <div key={food.id} className="p-4 border border-yellow-200 rounded-xl bg-yellow-50">
                      <h5 className="font-semibold text-[#2C3E50] mb-2">{food.name}</h5>
                      <p className="text-sm text-gray-600 mb-3">
                        Add {suggestedQuantity}g ({(suggestedQuantity / 28.35).toFixed(1)} oz)
                      </p>
                      <div className="text-xs text-gray-500 mb-3">
                        <p>+{Math.round((food.carbs_per_100g * suggestedQuantity) / 100)}g carbs</p>
                        <p>+{Math.round((food.calories_per_100g * suggestedQuantity) / 100)} calories</p>
                      </div>
                      <button
                        onClick={() => onAddSuggestion(food, suggestedQuantity)}
                        className="w-full px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm font-medium"
                      >
                        Add to Meal
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Fat Suggestions */}
          {fatDeficit > 3 && (
            <div>
              <h4 className="text-lg font-bold text-purple-600 mb-4 flex items-center gap-2">
                <Target className="w-5 h-5" />
                Fat Deficit: {Math.round(fatDeficit)}g
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {getFatSuggestions().map(food => {
                  const suggestedQuantity = Math.round((fatDeficit / food.fat_per_100g) * 100);
                  return (
                    <div key={food.id} className="p-4 border border-purple-200 rounded-xl bg-purple-50">
                      <h5 className="font-semibold text-[#2C3E50] mb-2">{food.name}</h5>
                      <p className="text-sm text-gray-600 mb-3">
                        Add {suggestedQuantity}g ({(suggestedQuantity / 28.35).toFixed(1)} oz)
                      </p>
                      <div className="text-xs text-gray-500 mb-3">
                        <p>+{Math.round((food.fat_per_100g * suggestedQuantity) / 100)}g fat</p>
                        <p>+{Math.round((food.calories_per_100g * suggestedQuantity) / 100)} calories</p>
                      </div>
                      <button
                        onClick={() => onAddSuggestion(food, suggestedQuantity)}
                        className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                      >
                        Add to Meal
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-3 text-gray-600 hover:text-gray-800 font-medium transition-colors duration-200"
          >
            Close Suggestions
          </button>
        </div>
      </div>
    </div>
  );
}

export default MealPlanningSystem;