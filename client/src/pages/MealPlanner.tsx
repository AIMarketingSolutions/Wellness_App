import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/lib/auth";
import { Link } from "wouter";
import { 
  ArrowLeft, Apple, Utensils, Search, Plus, X, 
  Flame, Droplet, TrendingUp
} from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { UserProfile, WaterIntake } from "@shared/schema";

type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'snack2';

interface FoodItem {
  id: string;
  name: string;
  category: string;
  proteinPer100g: string;
  carbsPer100g: string;
  fatPer100g: string;
  caloriesPer100g: string;
}

interface SelectedFood {
  food: FoodItem;
  quantityG: number;
  calculatedCalories: number;
  calculatedProteinG: number;
  calculatedCarbsG: number;
  calculatedFatG: number;
}

interface MealData {
  targetCalories: number;
  targetProteinG: number;
  targetCarbsG: number;
  targetFatG: number;
  selectedFoods: SelectedFood[];
  actualCalories: number;
  actualProteinG: number;
  actualCarbsG: number;
  actualFatG: number;
}

export default function MealPlanner() {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [activeMeal, setActiveMeal] = useState<MealType>('breakfast');
  const [searchQuery, setSearchQuery] = useState("");
  const [waterGlasses, setWaterGlasses] = useState(0);

  // Fetch user profile for DCT calculation
  const { data: profile } = useQuery<UserProfile>({
    queryKey: ["/api/profile"],
  });

  // Fetch today's exercises for calorie calculation
  const { data: exercises = [] } = useQuery<any[]>({
    queryKey: [`/api/daily-exercises/date/${selectedDate}`],
  });

  // Fetch food items for search
  const { data: foodItems = [] } = useQuery<FoodItem[]>({
    queryKey: ["/api/food-items"],
  });

  // Fetch water intake for today
  const { data: waterIntake } = useQuery<WaterIntake | null>({
    queryKey: [`/api/water-intake/${selectedDate}`],
  });

  // Initialize water glasses from API
  useEffect(() => {
    if (waterIntake?.glassesConsumed) {
      setWaterGlasses(waterIntake.glassesConsumed);
    }
  }, [waterIntake]);

  // Meal state management
  const [meals, setMeals] = useState<Record<MealType, MealData>>({
    breakfast: { targetCalories: 0, targetProteinG: 0, targetCarbsG: 0, targetFatG: 0, selectedFoods: [], actualCalories: 0, actualProteinG: 0, actualCarbsG: 0, actualFatG: 0 },
    lunch: { targetCalories: 0, targetProteinG: 0, targetCarbsG: 0, targetFatG: 0, selectedFoods: [], actualCalories: 0, actualProteinG: 0, actualCarbsG: 0, actualFatG: 0 },
    dinner: { targetCalories: 0, targetProteinG: 0, targetCarbsG: 0, targetFatG: 0, selectedFoods: [], actualCalories: 0, actualProteinG: 0, actualCarbsG: 0, actualFatG: 0 },
    snack: { targetCalories: 0, targetProteinG: 0, targetCarbsG: 0, targetFatG: 0, selectedFoods: [], actualCalories: 0, actualProteinG: 0, actualCarbsG: 0, actualFatG: 0 },
    snack2: { targetCalories: 0, targetProteinG: 0, targetCarbsG: 0, targetFatG: 0, selectedFoods: [], actualCalories: 0, actualProteinG: 0, actualCarbsG: 0, actualFatG: 0 },
  });

  // Calculate Daily Calorie Target (DCT)
  const dailyCalorieTarget = useMemo(() => {
    if (!profile) return { dct: 0, tee: 0, exerciseCalories: 0, deficit: 0, minCalories: 0 };

    // Calculate TEE
    const age = profile.age || 0;
    const weight = parseFloat(profile.weightKg || "0");
    const height = parseFloat(profile.heightCm || "0");
    const gender = profile.gender || "male";

    let bmr = 0;
    if (gender === "male") {
      bmr = 66.5 + (13.75 * weight) + (5.003 * height) - (6.755 * age);
    } else {
      bmr = 655.1 + (9.563 * weight) + (1.850 * height) - (4.676 * age);
    }

    const activityMultipliers = {
      sedentary: 1.2,
      lightly_active: 1.375,
      moderately_active: 1.55,
      very_active: 1.725,
      extremely_active: 1.9,
    };

    const activityLevel = profile.activityLevel || "moderately_active";
    const tee = bmr * (activityMultipliers[activityLevel] || 1.55);

    // Add exercise calories for the day
    const exerciseCalories = exercises?.reduce((sum: number, ex: any) => {
      return sum + parseFloat(ex.caloriesBurned || "0");
    }, 0) || 0;

    // Apply weight loss deficit
    const deficits = {
      maintain: 0,
      lose_0_5: 250,
      lose_1: 500,
      lose_1_5: 750,
      lose_2: 1000,
    };

    const deficit = deficits[profile.weightLossGoal as keyof typeof deficits] || 0;

    // Calculate DCT with safety minimums
    const minCalories = gender === "male" ? 1500 : 1200;
    const rawDCT = tee + exerciseCalories - deficit;
    const dct = Math.max(rawDCT, minCalories);

    return { dct, tee, exerciseCalories, deficit, minCalories };
  }, [profile, exercises]);

  // Calculate meal targets based on meal plan type
  useEffect(() => {
    if (!profile || dailyCalorieTarget.dct === 0) return;

    const mealPlanType = profile.mealPlanType || 'three_meals';
    const dct = dailyCalorieTarget.dct;

    // Get macro percentages from metabolic profile
    let proteinPercent = 30;
    let carbPercent = 30;
    let fatPercent = 40;

    const metabolicProfile = profile.metabolicProfile || 'medium_oxidizer';
    
    if (metabolicProfile === 'fast_oxidizer') {
      proteinPercent = 25;
      carbPercent = 35;
      fatPercent = 40;
    } else if (metabolicProfile === 'slow_oxidizer') {
      proteinPercent = 35;
      carbPercent = 25;
      fatPercent = 40;
    }

    // Calculate meal distributions
    let mealDistributions: Record<MealType, number> = {
      breakfast: 0,
      lunch: 0,
      dinner: 0,
      snack: 0,
      snack2: 0,
    };

    if (mealPlanType === 'three_meals') {
      mealDistributions = {
        breakfast: 0.3333,
        lunch: 0.3333,
        dinner: 0.3334,
        snack: 0,
        snack2: 0,
      };
    } else if (mealPlanType === 'three_meals_one_snack') {
      mealDistributions = {
        breakfast: 0.30,
        lunch: 0.30,
        dinner: 0.30,
        snack: 0.10,
        snack2: 0,
      };
    } else if (mealPlanType === 'three_meals_two_snacks') {
      mealDistributions = {
        breakfast: 0.2667,
        lunch: 0.2667,
        dinner: 0.2666,
        snack: 0.10,
        snack2: 0.10,
      };
    }

    // Calculate targets for each meal
    const updatedMeals: Record<MealType, MealData> = {} as Record<MealType, MealData>;

    Object.keys(mealDistributions).forEach((mealType) => {
      const type = mealType as MealType;
      const mealCalories = dct * mealDistributions[type];

      const proteinG = (mealCalories * (proteinPercent / 100)) / 4;
      const carbsG = (mealCalories * (carbPercent / 100)) / 4;
      const fatG = (mealCalories * (fatPercent / 100)) / 9;

      updatedMeals[type] = {
        targetCalories: Math.round(mealCalories),
        targetProteinG: Math.round(proteinG * 10) / 10,
        targetCarbsG: Math.round(carbsG * 10) / 10,
        targetFatG: Math.round(fatG * 10) / 10,
        selectedFoods: meals[type]?.selectedFoods || [],
        actualCalories: meals[type]?.actualCalories || 0,
        actualProteinG: meals[type]?.actualProteinG || 0,
        actualCarbsG: meals[type]?.actualCarbsG || 0,
        actualFatG: meals[type]?.actualFatG || 0,
      };
    });

    setMeals(updatedMeals);
  }, [profile, dailyCalorieTarget.dct]);

  // Add food to meal
  const addFoodToMeal = (food: FoodItem, mealType: MealType) => {
    // Simple auto-quantity logic: start with 100g serving
    const quantityG = 100;
    
    const proteinPer100g = parseFloat(food.proteinPer100g || "0");
    const carbsPer100g = parseFloat(food.carbsPer100g || "0");
    const fatPer100g = parseFloat(food.fatPer100g || "0");
    const caloriesPer100g = parseFloat(food.caloriesPer100g || "0");

    const selectedFood: SelectedFood = {
      food,
      quantityG,
      calculatedCalories: (caloriesPer100g * quantityG) / 100,
      calculatedProteinG: (proteinPer100g * quantityG) / 100,
      calculatedCarbsG: (carbsPer100g * quantityG) / 100,
      calculatedFatG: (fatPer100g * quantityG) / 100,
    };

    setMeals(prev => {
      const updatedMeal = { ...prev[mealType] };
      updatedMeal.selectedFoods = [...updatedMeal.selectedFoods, selectedFood];
      
      // Recalculate actuals
      updatedMeal.actualCalories = updatedMeal.selectedFoods.reduce((sum, f) => sum + f.calculatedCalories, 0);
      updatedMeal.actualProteinG = updatedMeal.selectedFoods.reduce((sum, f) => sum + f.calculatedProteinG, 0);
      updatedMeal.actualCarbsG = updatedMeal.selectedFoods.reduce((sum, f) => sum + f.calculatedCarbsG, 0);
      updatedMeal.actualFatG = updatedMeal.selectedFoods.reduce((sum, f) => sum + f.calculatedFatG, 0);

      return { ...prev, [mealType]: updatedMeal };
    });

    setSearchQuery("");
  };

  // Remove food from meal
  const removeFoodFromMeal = (mealType: MealType, foodIndex: number) => {
    setMeals(prev => {
      const updatedMeal = { ...prev[mealType] };
      updatedMeal.selectedFoods = updatedMeal.selectedFoods.filter((_, idx) => idx !== foodIndex);
      
      // Recalculate actuals
      updatedMeal.actualCalories = updatedMeal.selectedFoods.reduce((sum, f) => sum + f.calculatedCalories, 0);
      updatedMeal.actualProteinG = updatedMeal.selectedFoods.reduce((sum, f) => sum + f.calculatedProteinG, 0);
      updatedMeal.actualCarbsG = updatedMeal.selectedFoods.reduce((sum, f) => sum + f.calculatedCarbsG, 0);
      updatedMeal.actualFatG = updatedMeal.selectedFoods.reduce((sum, f) => sum + f.calculatedFatG, 0);

      return { ...prev, [mealType]: updatedMeal };
    });
  };

  // Update water intake
  const updateWaterMutation = useMutation({
    mutationFn: async (glasses: number) => {
      return apiRequest(`/api/water-intake`, {
        method: "POST",
        body: JSON.stringify({ glassesConsumed: glasses, intakeDate: selectedDate, userId: user?.id }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/water-intake/${selectedDate}`] });
    },
  });

  const handleWaterChange = (newValue: number) => {
    const clamped = Math.max(0, Math.min(20, newValue));
    setWaterGlasses(clamped);
    updateWaterMutation.mutate(clamped);
  };

  // Filter foods based on search
  const filteredFoods = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return foodItems.filter(food => 
      food.name.toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 10);
  }, [searchQuery, foodItems]);

  // Calculate daily totals
  const dailyTotals = useMemo(() => {
    const totals = {
      calories: 0,
      proteinG: 0,
      carbsG: 0,
      fatG: 0,
    };

    Object.values(meals).forEach(meal => {
      totals.calories += meal.actualCalories;
      totals.proteinG += meal.actualProteinG;
      totals.carbsG += meal.actualCarbsG;
      totals.fatG += meal.actualFatG;
    });

    return totals;
  }, [meals]);

  const mealPlanType = profile?.mealPlanType || 'three_meals';
  const showSnack = mealPlanType !== 'three_meals';
  const showSnack2 = mealPlanType === 'three_meals_two_snacks';

  const mealTabs: { type: MealType; label: string; show: boolean }[] = [
    { type: 'breakfast', label: 'Breakfast', show: true },
    { type: 'lunch', label: 'Lunch', show: true },
    { type: 'dinner', label: 'Dinner', show: true },
    { type: 'snack', label: 'Snack 1', show: showSnack },
    { type: 'snack2', label: 'Snack 2', show: showSnack2 },
  ];

  const isAtMinimum = dailyCalorieTarget.dct === dailyCalorieTarget.minCalories;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#4A90E2]/5 via-white to-[#52C878]/5 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <Link href="/dashboard">
          <button className="flex items-center gap-2 text-[#2C3E50] hover:text-[#52C878] mb-6 transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-semibold">Back to Home</span>
          </button>
        </Link>

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#52C878] to-[#4A90E2] rounded-full mb-4 shadow-lg">
            <Apple className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-[#2C3E50] mb-2">
            Daily Meal Planning Calculator
          </h1>
          <p className="text-lg text-gray-600">
            Track your meals, hit your targets, and achieve your goals
          </p>
        </div>

        {/* Date Selector */}
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-xl p-6 mb-6">
          <label className="block text-sm font-semibold text-[#2C3E50] mb-2">
            Select Date
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#52C878]/20 focus:border-[#52C878]"
            data-testid="input-meal-date"
          />
        </div>

        {/* Daily Calorie Target Summary */}
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-xl p-6 mb-6">
          <h2 className="text-2xl font-bold text-[#2C3E50] mb-4 flex items-center gap-2">
            <Flame className="w-6 h-6 text-orange-500" />
            Daily Calorie Target (DCT)
          </h2>
          
          {isAtMinimum && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-4">
              <p className="text-yellow-800 font-semibold">
                ⚠️ Warning: You're at the minimum safe calorie level ({dailyCalorieTarget.minCalories} kcal/day)
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 bg-blue-50 rounded-xl">
              <p className="text-sm text-blue-700 font-semibold">Base TEE</p>
              <p className="text-2xl font-bold text-blue-900">{Math.round(dailyCalorieTarget.tee)}</p>
              <p className="text-xs text-blue-600">calories/day</p>
            </div>
            
            <div className="p-4 bg-green-50 rounded-xl">
              <p className="text-sm text-green-700 font-semibold">Exercise Added</p>
              <p className="text-2xl font-bold text-green-900">+{Math.round(dailyCalorieTarget.exerciseCalories)}</p>
              <p className="text-xs text-green-600">calories burned</p>
            </div>
            
            <div className="p-4 bg-red-50 rounded-xl">
              <p className="text-sm text-red-700 font-semibold">Weight Loss Deficit</p>
              <p className="text-2xl font-bold text-red-900">-{dailyCalorieTarget.deficit}</p>
              <p className="text-xs text-red-600">calories/day</p>
            </div>
            
            <div className="p-4 bg-gradient-to-br from-[#52C878]/20 to-[#4A90E2]/20 rounded-xl border-2 border-[#52C878]">
              <p className="text-sm text-[#2C3E50] font-semibold">Final DCT</p>
              <p className="text-3xl font-bold text-[#2C3E50]">{Math.round(dailyCalorieTarget.dct)}</p>
              <p className="text-xs text-gray-600">calories/day</p>
            </div>
          </div>
        </div>

        {/* Daily Progress */}
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-xl p-6 mb-6">
          <h2 className="text-2xl font-bold text-[#2C3E50] mb-4 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-[#52C878]" />
            Daily Progress
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold text-gray-700">Calories</span>
                <span className="text-sm font-bold text-[#2C3E50]">
                  {Math.round(dailyTotals.calories)} / {Math.round(dailyCalorieTarget.dct)}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-[#52C878] to-[#4A90E2] h-3 rounded-full transition-all"
                  style={{ width: `${Math.min(100, (dailyTotals.calories / dailyCalorieTarget.dct) * 100)}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold text-gray-700">Protein</span>
                <span className="text-sm font-bold text-blue-600">
                  {Math.round(dailyTotals.proteinG)}g
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-blue-500 h-3 rounded-full transition-all"
                  style={{ width: "100%" }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold text-gray-700">Carbs</span>
                <span className="text-sm font-bold text-yellow-600">
                  {Math.round(dailyTotals.carbsG)}g
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-yellow-500 h-3 rounded-full transition-all"
                  style={{ width: "100%" }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold text-gray-700">Fat</span>
                <span className="text-sm font-bold text-purple-600">
                  {Math.round(dailyTotals.fatG)}g
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-purple-500 h-3 rounded-full transition-all"
                  style={{ width: "100%" }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Water Tracking */}
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-xl p-6 mb-6">
          <h2 className="text-2xl font-bold text-[#2C3E50] mb-4 flex items-center gap-2">
            <Droplet className="w-6 h-6 text-blue-500" />
            Water Intake (up to 20 glasses)
          </h2>
          
          <div className="flex items-center gap-4">
            <button
              onClick={() => handleWaterChange(waterGlasses - 1)}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg font-bold"
              data-testid="button-water-decrease"
            >
              -
            </button>
            
            <div className="flex-1 flex gap-1">
              {[...Array(20)].map((_, i) => (
                <div
                  key={i}
                  className={`flex-1 h-8 rounded ${
                    i < waterGlasses ? 'bg-blue-500' : 'bg-gray-200'
                  } transition-colors`}
                />
              ))}
            </div>

            <button
              onClick={() => handleWaterChange(waterGlasses + 1)}
              className="px-4 py-2 bg-[#52C878] hover:bg-[#52C878]/90 text-white rounded-lg font-bold"
              data-testid="button-water-increase"
            >
              +
            </button>

            <div className="text-2xl font-bold text-[#2C3E50]" data-testid="text-water-count">
              {waterGlasses} / 20
            </div>
          </div>
        </div>

        {/* Meal Tabs */}
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-xl p-6">
          <div className="flex gap-2 mb-6 flex-wrap">
            {mealTabs.filter(tab => tab.show).map(tab => (
              <button
                key={tab.type}
                onClick={() => setActiveMeal(tab.type)}
                className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                  activeMeal === tab.type
                    ? 'bg-gradient-to-r from-[#52C878] to-[#4A90E2] text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                data-testid={`button-meal-${tab.type}`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Active Meal Content */}
          <div>
            <h3 className="text-xl font-bold text-[#2C3E50] mb-4 flex items-center gap-2">
              <Utensils className="w-5 h-5 text-[#52C878]" />
              {mealTabs.find(t => t.type === activeMeal)?.label} - Targets
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="p-4 bg-orange-50 rounded-xl">
                <p className="text-sm text-orange-700">Target Calories</p>
                <p className="text-2xl font-bold text-orange-900">{meals[activeMeal].targetCalories}</p>
              </div>
              <div className="p-4 bg-blue-50 rounded-xl">
                <p className="text-sm text-blue-700">Target Protein</p>
                <p className="text-2xl font-bold text-blue-900">{meals[activeMeal].targetProteinG}g</p>
              </div>
              <div className="p-4 bg-yellow-50 rounded-xl">
                <p className="text-sm text-yellow-700">Target Carbs</p>
                <p className="text-2xl font-bold text-yellow-900">{meals[activeMeal].targetCarbsG}g</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-xl">
                <p className="text-sm text-purple-700">Target Fat</p>
                <p className="text-2xl font-bold text-purple-900">{meals[activeMeal].targetFatG}g</p>
              </div>
            </div>

            {/* Food Search */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-[#2C3E50] mb-2">
                Search Foods
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#52C878]/20 focus:border-[#52C878]"
                  placeholder="Search for foods..."
                  data-testid="input-food-search"
                />
              </div>

              {/* Search Results */}
              {filteredFoods.length > 0 && (
                <div className="mt-2 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                  {filteredFoods.map(food => (
                    <button
                      key={food.id}
                      onClick={() => addFoodToMeal(food, activeMeal)}
                      className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b last:border-b-0 flex items-center justify-between"
                      data-testid={`button-add-food-${food.id}`}
                    >
                      <div>
                        <p className="font-semibold text-[#2C3E50]">{food.name}</p>
                        <p className="text-xs text-gray-600">
                          {food.caloriesPer100g} cal | P: {food.proteinPer100g}g | C: {food.carbsPer100g}g | F: {food.fatPer100g}g (per 100g)
                        </p>
                      </div>
                      <Plus className="w-5 h-5 text-[#52C878]" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Selected Foods */}
            <div>
              <h4 className="font-semibold text-[#2C3E50] mb-3">Selected Foods</h4>
              
              {meals[activeMeal].selectedFoods.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No foods added yet. Search and add foods above.</p>
              ) : (
                <div className="space-y-2">
                  {meals[activeMeal].selectedFoods.map((selected, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div className="flex-1">
                        <p className="font-semibold text-[#2C3E50]">{selected.food.name}</p>
                        <p className="text-sm text-gray-600">
                          {selected.quantityG}g | {Math.round(selected.calculatedCalories)} cal | 
                          P: {Math.round(selected.calculatedProteinG * 10) / 10}g | 
                          C: {Math.round(selected.calculatedCarbsG * 10) / 10}g | 
                          F: {Math.round(selected.calculatedFatG * 10) / 10}g
                        </p>
                      </div>
                      <button
                        onClick={() => removeFoodFromMeal(activeMeal, idx)}
                        className="ml-4 p-2 hover:bg-red-100 rounded-lg transition-colors"
                        data-testid={`button-remove-food-${idx}`}
                      >
                        <X className="w-5 h-5 text-red-500" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Meal Totals */}
            <div className="mt-6 p-4 bg-gradient-to-br from-[#52C878]/10 to-[#4A90E2]/10 rounded-xl border-2 border-[#52C878]/30">
              <h4 className="font-semibold text-[#2C3E50] mb-3">Meal Totals</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-700">Actual Calories</p>
                  <p className="text-xl font-bold text-[#2C3E50]">{Math.round(meals[activeMeal].actualCalories)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-700">Actual Protein</p>
                  <p className="text-xl font-bold text-blue-600">{Math.round(meals[activeMeal].actualProteinG * 10) / 10}g</p>
                </div>
                <div>
                  <p className="text-sm text-gray-700">Actual Carbs</p>
                  <p className="text-xl font-bold text-yellow-600">{Math.round(meals[activeMeal].actualCarbsG * 10) / 10}g</p>
                </div>
                <div>
                  <p className="text-sm text-gray-700">Actual Fat</p>
                  <p className="text-xl font-bold text-purple-600">{Math.round(meals[activeMeal].actualFatG * 10) / 10}g</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
