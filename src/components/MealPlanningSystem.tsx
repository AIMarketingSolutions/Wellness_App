import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Calculator, Target, Utensils, Scale, ChefHat, CheckCircle, AlertTriangle } from 'lucide-react';
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

interface SelectedFood {
  food_item: FoodItem;
  quantity_g: number;
  is_primary_carb?: boolean;
  is_primary_protein?: boolean;
  is_primary_fat?: boolean;
}

interface MealCalculation {
  total_calories: number;
  total_protein_g: number;
  total_carbs_g: number;
  total_fat_g: number;
  adjusted_foods: {
    food_item: FoodItem;
    final_quantity_g: number;
    calories: number;
    protein_g: number;
    carbs_g: number;
    fat_g: number;
  }[];
  adjustments_made: string[];
}

interface Meal {
  id?: string;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  target_calories: number;
  target_protein_g: number;
  target_carbs_g: number;
  target_fat_g: number;
  selected_foods: SelectedFood[];
  calculation_result?: MealCalculation;
  is_calculated: boolean;
}

interface MealPlanningSystemProps {
  userProfile: {
    tee_calories: number;
    protein_percentage: number;
    carb_percentage: number;
    fat_percentage: number;
    metabolic_profile: string;
    gender: string;
    weight_loss_goal?: string;
    full_profile: any;
  };
}

function MealPlanningSystem({ userProfile }: MealPlanningSystemProps) {
  const [planType, setPlanType] = useState<'three_meals' | 'three_meals_one_snack' | 'three_meals_two_snacks'>('three_meals');
  const [meals, setMeals] = useState<Meal[]>([]);
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [selectedMealIndex, setSelectedMealIndex] = useState<number | null>(null);
  const [showFoodSelector, setShowFoodSelector] = useState(false);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
    loadFoodItems();
  }, []);

  useEffect(() => {
    if (userProfile?.tee_calories > 0) {
      generateMealPlan();
    }
  }, [planType, userProfile]);

  const loadFoodItems = async () => {
    // Sample food data with detailed nutritional information
    const sampleFoods: FoodItem[] = [
      // Carbohydrate Sources
      { id: '1', name: 'Brown Rice (cooked)', category: 'carbohydrates', protein_per_100g: 2.6, carbs_per_100g: 23, fat_per_100g: 0.9, calories_per_100g: 111, serving_size_g: 150 },
      { id: '2', name: 'Sweet Potato (baked)', category: 'carbohydrates', protein_per_100g: 2.0, carbs_per_100g: 20.1, fat_per_100g: 0.1, calories_per_100g: 90, serving_size_g: 200 },
      { id: '3', name: 'Quinoa (cooked)', category: 'carbohydrates', protein_per_100g: 4.4, carbs_per_100g: 21.3, fat_per_100g: 1.9, calories_per_100g: 120, serving_size_g: 150 },
      { id: '4', name: 'Oatmeal (cooked)', category: 'carbohydrates', protein_per_100g: 2.4, carbs_per_100g: 12, fat_per_100g: 1.4, calories_per_100g: 68, serving_size_g: 200 },
      
      // Protein Sources
      { id: '5', name: 'Chicken Breast (grilled)', category: 'proteins', protein_per_100g: 31, carbs_per_100g: 0, fat_per_100g: 3.6, calories_per_100g: 165, serving_size_g: 150 },
      { id: '6', name: 'Salmon (baked)', category: 'proteins', protein_per_100g: 25, carbs_per_100g: 0, fat_per_100g: 12, calories_per_100g: 206, serving_size_g: 150 },
      { id: '7', name: 'Lean Ground Turkey', category: 'proteins', protein_per_100g: 27, carbs_per_100g: 0, fat_per_100g: 8, calories_per_100g: 189, serving_size_g: 150 },
      { id: '8', name: 'Greek Yogurt (plain)', category: 'proteins', protein_per_100g: 10, carbs_per_100g: 3.6, fat_per_100g: 0.4, calories_per_100g: 59, serving_size_g: 200 },
      { id: '9', name: 'Eggs (whole)', category: 'proteins', protein_per_100g: 13, carbs_per_100g: 1.1, fat_per_100g: 11, calories_per_100g: 155, serving_size_g: 100 },
      
      // Healthy Fats
      { id: '10', name: 'Avocado', category: 'fats', protein_per_100g: 2, carbs_per_100g: 8.5, fat_per_100g: 14.7, calories_per_100g: 160, serving_size_g: 100 },
      { id: '11', name: 'Olive Oil', category: 'fats', protein_per_100g: 0, carbs_per_100g: 0, fat_per_100g: 100, calories_per_100g: 884, serving_size_g: 15 },
      { id: '12', name: 'Almonds', category: 'fats', protein_per_100g: 21, carbs_per_100g: 22, fat_per_100g: 49, calories_per_100g: 579, serving_size_g: 30 },
      { id: '13', name: 'Walnuts', category: 'fats', protein_per_100g: 15, carbs_per_100g: 14, fat_per_100g: 65, calories_per_100g: 654, serving_size_g: 30 },
      
      // Vegetables (low calorie, nutrient dense)
      { id: '14', name: 'Broccoli (steamed)', category: 'vegetables', protein_per_100g: 2.8, carbs_per_100g: 7, fat_per_100g: 0.4, calories_per_100g: 34, serving_size_g: 150 },
      { id: '15', name: 'Spinach (raw)', category: 'vegetables', protein_per_100g: 2.9, carbs_per_100g: 3.6, fat_per_100g: 0.4, calories_per_100g: 23, serving_size_g: 100 },
      { id: '16', name: 'Bell Peppers', category: 'vegetables', protein_per_100g: 1, carbs_per_100g: 7, fat_per_100g: 0.3, calories_per_100g: 31, serving_size_g: 150 }
    ];

    setFoodItems(sampleFoods);
  };

  const generateMealPlan = () => {
    const minCalories = userProfile?.gender === 'male' ? 1500 : 1200;
    const dailyCalories = Math.max(userProfile.tee_calories, minCalories);
    
    let mealDistribution: { [key: string]: number } = {};
    
    switch (planType) {
      case 'three_meals':
        mealDistribution = { breakfast: 0.3333, lunch: 0.3333, dinner: 0.3334 };
        break;
      case 'three_meals_one_snack':
        mealDistribution = { breakfast: 0.3, lunch: 0.3, dinner: 0.3, snack: 0.1 };
        break;
      case 'three_meals_two_snacks':
        mealDistribution = { breakfast: 0.2667, lunch: 0.2667, dinner: 0.2666, snack: 0.2 };
        break;
    }

    const newMeals: Meal[] = [];
    
    Object.entries(mealDistribution).forEach(([mealType, percentage]) => {
      if (mealType === 'snack' && planType === 'three_meals_two_snacks') {
        // Create two snacks
        for (let i = 1; i <= 2; i++) {
          const calories = Math.round(dailyCalories * (percentage / 2));
          const protein = Math.round((calories * userProfile.protein_percentage / 100) / 4);
          const carbs = Math.round((calories * userProfile.carb_percentage / 100) / 4);
          const fat = Math.round((calories * userProfile.fat_percentage / 100) / 9);

          newMeals.push({
            meal_type: 'snack',
            target_calories: calories,
            target_protein_g: protein,
            target_carbs_g: carbs,
            target_fat_g: fat,
            selected_foods: [],
            is_calculated: false
          });
        }
      } else if (mealType !== 'snack' || planType !== 'three_meals_two_snacks') {
        const calories = Math.round(dailyCalories * percentage);
        const protein = Math.round((calories * userProfile.protein_percentage / 100) / 4);
        const carbs = Math.round((calories * userProfile.carb_percentage / 100) / 4);
        const fat = Math.round((calories * userProfile.fat_percentage / 100) / 9);

        newMeals.push({
          meal_type: mealType as any,
          target_calories: calories,
          target_protein_g: protein,
          target_carbs_g: carbs,
          target_fat_g: fat,
          selected_foods: [],
          is_calculated: false
        });
      }
    });

    setMeals(newMeals);
  };

  const addFoodToMeal = (mealIndex: number, foodItem: FoodItem, quantity: number, foodRole?: 'primary_carb' | 'primary_protein' | 'primary_fat') => {
    const updatedMeals = [...meals];
    const selectedFood: SelectedFood = {
      food_item: foodItem,
      quantity_g: quantity,
      is_primary_carb: foodRole === 'primary_carb',
      is_primary_protein: foodRole === 'primary_protein',
      is_primary_fat: foodRole === 'primary_fat'
    };

    updatedMeals[mealIndex].selected_foods.push(selectedFood);
    updatedMeals[mealIndex].is_calculated = false; // Reset calculation status
    setMeals(updatedMeals);
  };

  const removeFoodFromMeal = (mealIndex: number, foodIndex: number) => {
    const updatedMeals = [...meals];
    updatedMeals[mealIndex].selected_foods.splice(foodIndex, 1);
    updatedMeals[mealIndex].is_calculated = false; // Reset calculation status
    updatedMeals[mealIndex].calculation_result = undefined;
    setMeals(updatedMeals);
  };

  // CORE CALCULATION SYSTEM - Processes complete meal after all foods are selected
  const calculateCompleteMeal = (mealIndex: number) => {
    const meal = meals[mealIndex];
    if (meal.selected_foods.length === 0) return;

    const targets = {
      calories: meal.target_calories,
      protein: meal.target_protein_g,
      carbs: meal.target_carbs_g,
      fat: meal.target_fat_g
    };

    // Step 1: Calculate initial nutritional values for all foods
    let totalNutrition = {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0
    };

    const foodCalculations = meal.selected_foods.map(selectedFood => {
      const food = selectedFood.food_item;
      const quantity = selectedFood.quantity_g;
      
      return {
        food_item: food,
        original_quantity_g: quantity,
        calories: (food.calories_per_100g * quantity) / 100,
        protein_g: (food.protein_per_100g * quantity) / 100,
        carbs_g: (food.carbs_per_100g * quantity) / 100,
        fat_g: (food.fat_per_100g * quantity) / 100,
        is_primary_carb: selectedFood.is_primary_carb,
        is_primary_protein: selectedFood.is_primary_protein,
        is_primary_fat: selectedFood.is_primary_fat
      };
    });

    // Calculate initial totals
    foodCalculations.forEach(calc => {
      totalNutrition.calories += calc.calories;
      totalNutrition.protein += calc.protein_g;
      totalNutrition.carbs += calc.carbs_g;
      totalNutrition.fat += calc.fat_g;
    });

    // Step 2: Apply meal-based adjustments
    const adjustments: string[] = [];
    const adjustedFoods = [...foodCalculations];

    // Adjustment Phase 1: Handle Carbohydrate Sources
    const carbSources = adjustedFoods.filter(food => 
      food.is_primary_carb || food.food_item.category === 'carbohydrates'
    );
    
    if (carbSources.length > 0 && totalNutrition.carbs !== targets.carbs) {
      const carbAdjustmentFactor = targets.carbs / totalNutrition.carbs;
      carbSources.forEach(food => {
        const oldQuantity = food.original_quantity_g;
        const newQuantity = oldQuantity * carbAdjustmentFactor;
        const quantityDiff = newQuantity - oldQuantity;
        
        // Adjust all macros proportionally for carb sources
        food.calories += (food.food_item.calories_per_100g * quantityDiff) / 100;
        food.protein_g += (food.food_item.protein_per_100g * quantityDiff) / 100;
        food.carbs_g += (food.food_item.carbs_per_100g * quantityDiff) / 100;
        food.fat_g += (food.food_item.fat_per_100g * quantityDiff) / 100;
        
        if (Math.abs(quantityDiff) > 5) {
          adjustments.push(`Adjusted ${food.food_item.name} by ${quantityDiff > 0 ? '+' : ''}${Math.round(quantityDiff)}g to meet carb target`);
        }
      });
    }

    // Recalculate totals after carb adjustments
    totalNutrition = { calories: 0, protein: 0, carbs: 0, fat: 0 };
    adjustedFoods.forEach(calc => {
      totalNutrition.calories += calc.calories;
      totalNutrition.protein += calc.protein_g;
      totalNutrition.carbs += calc.carbs_g;
      totalNutrition.fat += calc.fat_g;
    });

    // Adjustment Phase 2: Handle Protein Sources
    const proteinSources = adjustedFoods.filter(food => 
      food.is_primary_protein || food.food_item.category === 'proteins'
    );
    
    if (proteinSources.length > 0 && Math.abs(totalNutrition.protein - targets.protein) > 2) {
      const proteinDeficit = targets.protein - totalNutrition.protein;
      const proteinPerGram = proteinSources.reduce((sum, food) => 
        sum + food.food_item.protein_per_100g, 0) / proteinSources.length / 100;
      
      const additionalProteinNeeded = proteinDeficit / proteinPerGram / proteinSources.length;
      
      proteinSources.forEach(food => {
        // Adjust protein sources to meet protein target
        food.calories += (food.food_item.calories_per_100g * additionalProteinNeeded) / 100;
        food.protein_g += (food.food_item.protein_per_100g * additionalProteinNeeded) / 100;
        food.carbs_g += (food.food_item.carbs_per_100g * additionalProteinNeeded) / 100;
        food.fat_g += (food.food_item.fat_per_100g * additionalProteinNeeded) / 100;
        
        if (Math.abs(additionalProteinNeeded) > 5) {
          adjustments.push(`Adjusted ${food.food_item.name} by ${additionalProteinNeeded > 0 ? '+' : ''}${Math.round(additionalProteinNeeded)}g to meet protein target`);
        }
      });
    }

    // Recalculate totals after protein adjustments
    totalNutrition = { calories: 0, protein: 0, carbs: 0, fat: 0 };
    adjustedFoods.forEach(calc => {
      totalNutrition.calories += calc.calories;
      totalNutrition.protein += calc.protein_g;
      totalNutrition.carbs += calc.carbs_g;
      totalNutrition.fat += calc.fat_g;
    });

    // Adjustment Phase 3: Handle Fat Sources (calculated last for flexibility)
    const fatDeficit = targets.fat - totalNutrition.fat;
    
    if (Math.abs(fatDeficit) > 1) {
      const fatSources = adjustedFoods.filter(food => 
        food.is_primary_fat || food.food_item.category === 'fats'
      );
      
      if (fatSources.length > 0) {
        const fatPerGram = fatSources.reduce((sum, food) => 
          sum + food.food_item.fat_per_100g, 0) / fatSources.length / 100;
        
        const additionalFatNeeded = fatDeficit / fatPerGram / fatSources.length;
        
        fatSources.forEach(food => {
          food.calories += (food.food_item.calories_per_100g * additionalFatNeeded) / 100;
          food.protein_g += (food.food_item.protein_per_100g * additionalFatNeeded) / 100;
          food.carbs_g += (food.food_item.carbs_per_100g * additionalFatNeeded) / 100;
          food.fat_g += (food.food_item.fat_per_100g * additionalFatNeeded) / 100;
          
          if (Math.abs(additionalFatNeeded) > 3) {
            adjustments.push(`Adjusted ${food.food_item.name} by ${additionalFatNeeded > 0 ? '+' : ''}${Math.round(additionalFatNeeded)}g to meet fat target`);
          }
        });
      } else {
        // Add healthy fat recommendation if no fat sources present
        adjustments.push(`Consider adding ${Math.round(fatDeficit)}g of healthy fats (olive oil, avocado, nuts) to meet fat target`);
      }
    }

    // Final totals calculation
    const finalTotals = { calories: 0, protein: 0, carbs: 0, fat: 0 };
    adjustedFoods.forEach(calc => {
      finalTotals.calories += calc.calories;
      finalTotals.protein += calc.protein_g;
      finalTotals.carbs += calc.carbs_g;
      finalTotals.fat += calc.fat_g;
    });

    // Create final calculation result
    const calculationResult: MealCalculation = {
      total_calories: Math.round(finalTotals.calories),
      total_protein_g: Math.round(finalTotals.protein * 10) / 10,
      total_carbs_g: Math.round(finalTotals.carbs * 10) / 10,
      total_fat_g: Math.round(finalTotals.fat * 10) / 10,
      adjusted_foods: adjustedFoods.map(food => ({
        food_item: food.food_item,
        final_quantity_g: Math.round(food.original_quantity_g * 10) / 10,
        calories: Math.round(food.calories),
        protein_g: Math.round(food.protein_g * 10) / 10,
        carbs_g: Math.round(food.carbs_g * 10) / 10,
        fat_g: Math.round(food.fat_g * 10) / 10
      })),
      adjustments_made: adjustments
    };

    // Update meal with calculation result
    const updatedMeals = [...meals];
    updatedMeals[mealIndex].calculation_result = calculationResult;
    updatedMeals[mealIndex].is_calculated = true;
    setMeals(updatedMeals);
  };

  const getMealTypeLabel = (mealType: string, index: number) => {
    if (mealType === 'snack' && planType === 'three_meals_two_snacks') {
      const snackCount = meals.slice(0, index).filter(m => m.meal_type === 'snack').length + 1;
      return `Snack ${snackCount}`;
    }
    return mealType.charAt(0).toUpperCase() + mealType.slice(1);
  };

  const getTargetVsActual = (target: number, actual: number) => {
    const diff = actual - target;
    const percentage = target > 0 ? (diff / target) * 100 : 0;
    return { diff, percentage };
  };

  return (
    <div className="space-y-6">
      {/* User Profile Display */}
      <div className="bg-gradient-to-r from-[#52C878]/10 to-[#4A90E2]/10 rounded-2xl p-6 border border-[#52C878]/20">
        <h2 className="text-2xl font-bold text-[#2C3E50] mb-4">Your Active Nutrition Profile</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-white/50 rounded-xl">
            <p className="text-sm text-gray-600">Daily Calories</p>
            <p className="text-2xl font-bold text-[#2C3E50]">{userProfile.tee_calories}</p>
          </div>
          <div className="text-center p-4 bg-white/50 rounded-xl">
            <p className="text-sm text-gray-600">Protein</p>
            <p className="text-2xl font-bold text-[#52C878]">{userProfile.protein_percentage}%</p>
          </div>
          <div className="text-center p-4 bg-white/50 rounded-xl">
            <p className="text-sm text-gray-600">Carbs</p>
            <p className="text-2xl font-bold text-[#4A90E2]">{userProfile.carb_percentage}%</p>
          </div>
          <div className="text-center p-4 bg-white/50 rounded-xl">
            <p className="text-sm text-gray-600">Fat</p>
            <p className="text-2xl font-bold text-purple-600">{userProfile.fat_percentage}%</p>
          </div>
        </div>
        <p className="text-center text-sm text-gray-600 mt-4">
          Metabolic Profile: <span className="font-semibold">{userProfile.metabolic_profile.replace('_', ' ').toUpperCase()}</span>
        </p>
      </div>

      {/* Plan Type Selection */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Meal Plan Type</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { value: 'three_meals', label: '3 Meals', description: 'Breakfast, Lunch, Dinner' },
            { value: 'three_meals_one_snack', label: '3 Meals + 1 Snack', description: '3 meals + 1 snack' },
            { value: 'three_meals_two_snacks', label: '3 Meals + 2 Snacks', description: '3 meals + 2 snacks' }
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
              <h4 className="font-semibold text-gray-800">{option.label}</h4>
              <p className="text-sm text-gray-600 mt-1">{option.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Meals */}
      <div className="space-y-6">
        {meals.map((meal, mealIndex) => (
          <div key={mealIndex} className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Utensils className="w-5 h-5" />
                {getMealTypeLabel(meal.meal_type, mealIndex)}
              </h3>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => {
                    setSelectedMealIndex(mealIndex);
                    setShowFoodSelector(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-[#52C878] text-white rounded-lg hover:bg-[#52C878]/90 transition-colors duration-200"
                >
                  <Plus className="w-4 h-4" />
                  Add Food
                </button>
                {meal.selected_foods.length > 0 && (
                  <button
                    onClick={() => calculateCompleteMeal(mealIndex)}
                    disabled={meal.is_calculated}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors duration-200 ${
                      meal.is_calculated
                        ? 'bg-green-100 text-green-700 cursor-not-allowed'
                        : 'bg-[#4A90E2] text-white hover:bg-[#4A90E2]/90'
                    }`}
                  >
                    {meal.is_calculated ? <CheckCircle className="w-4 h-4" /> : <Calculator className="w-4 h-4" />}
                    {meal.is_calculated ? 'Calculated' : 'Calculate Meal'}
                  </button>
                )}
              </div>
            </div>

            {/* Meal Targets */}
            <div className="grid grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 rounded-xl">
              <div className="text-center">
                <p className="text-xs text-gray-600">Target Calories</p>
                <p className="font-semibold text-gray-800">{meal.target_calories}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-600">Protein (g)</p>
                <p className="font-semibold text-[#52C878]">{meal.target_protein_g}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-600">Carbs (g)</p>
                <p className="font-semibold text-[#4A90E2]">{meal.target_carbs_g}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-600">Fat (g)</p>
                <p className="font-semibold text-purple-600">{meal.target_fat_g}</p>
              </div>
            </div>

            {/* Selected Foods */}
            <div className="space-y-3 mb-6">
              <h4 className="font-semibold text-gray-800">Selected Foods:</h4>
              {meal.selected_foods.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No foods selected yet</p>
              ) : (
                meal.selected_foods.map((selectedFood, foodIndex) => (
                  <div key={foodIndex} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">{selectedFood.food_item.name}</p>
                      <p className="text-sm text-gray-600">
                        {selectedFood.quantity_g}g
                        {selectedFood.is_primary_carb && <span className="ml-2 px-2 py-1 bg-[#4A90E2] text-white text-xs rounded">Primary Carb</span>}
                        {selectedFood.is_primary_protein && <span className="ml-2 px-2 py-1 bg-[#52C878] text-white text-xs rounded">Primary Protein</span>}
                        {selectedFood.is_primary_fat && <span className="ml-2 px-2 py-1 bg-purple-500 text-white text-xs rounded">Primary Fat</span>}
                      </p>
                    </div>
                    <button
                      onClick={() => removeFoodFromMeal(mealIndex, foodIndex)}
                      className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Calculation Results */}
            {meal.calculation_result && (
              <div className="space-y-4">
                <div className="border-t border-gray-200 pt-4">
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <ChefHat className="w-4 h-4" />
                    Complete Meal Calculation Results
                  </h4>
                  
                  {/* Final Nutritional Totals */}
                  <div className="grid grid-cols-4 gap-4 mb-4 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl">
                    <div className="text-center">
                      <p className="text-xs text-gray-600">Final Calories</p>
                      <p className="font-bold text-gray-800">{meal.calculation_result.total_calories}</p>
                      <p className="text-xs text-gray-500">
                        {getTargetVsActual(meal.target_calories, meal.calculation_result.total_calories).diff > 0 ? '+' : ''}
                        {Math.round(getTargetVsActual(meal.target_calories, meal.calculation_result.total_calories).diff)}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-600">Final Protein</p>
                      <p className="font-bold text-[#52C878]">{meal.calculation_result.total_protein_g}g</p>
                      <p className="text-xs text-gray-500">
                        {getTargetVsActual(meal.target_protein_g, meal.calculation_result.total_protein_g).diff > 0 ? '+' : ''}
                        {Math.round(getTargetVsActual(meal.target_protein_g, meal.calculation_result.total_protein_g).diff * 10) / 10}g
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-600">Final Carbs</p>
                      <p className="font-bold text-[#4A90E2]">{meal.calculation_result.total_carbs_g}g</p>
                      <p className="text-xs text-gray-500">
                        {getTargetVsActual(meal.target_carbs_g, meal.calculation_result.total_carbs_g).diff > 0 ? '+' : ''}
                        {Math.round(getTargetVsActual(meal.target_carbs_g, meal.calculation_result.total_carbs_g).diff * 10) / 10}g
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-600">Final Fat</p>
                      <p className="font-bold text-purple-600">{meal.calculation_result.total_fat_g}g</p>
                      <p className="text-xs text-gray-500">
                        {getTargetVsActual(meal.target_fat_g, meal.calculation_result.total_fat_g).diff > 0 ? '+' : ''}
                        {Math.round(getTargetVsActual(meal.target_fat_g, meal.calculation_result.total_fat_g).diff * 10) / 10}g
                      </p>
                    </div>
                  </div>

                  {/* Adjusted Food Quantities */}
                  <div className="space-y-2">
                    <h5 className="font-medium text-gray-700">Final Food Quantities:</h5>
                    {meal.calculation_result.adjusted_foods.map((food, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium text-gray-800">{food.food_item.name}</p>
                          <p className="text-sm text-gray-600">{food.final_quantity_g}g</p>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <span>{food.calories} cal</span>
                          <span className="text-[#52C878]">{food.protein_g}p</span>
                          <span className="text-[#4A90E2]">{food.carbs_g}c</span>
                          <span className="text-purple-600">{food.fat_g}f</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Adjustments Made */}
                  {meal.calculation_result.adjustments_made.length > 0 && (
                    <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                      <h5 className="font-medium text-yellow-800 mb-2 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" />
                        Meal Adjustments Made:
                      </h5>
                      <ul className="text-sm text-yellow-700 space-y-1">
                        {meal.calculation_result.adjustments_made.map((adjustment, index) => (
                          <li key={index}>• {adjustment}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Food Selector Modal */}
      {showFoodSelector && selectedMealIndex !== null && (
        <FoodSelectorModal
          foodItems={foodItems}
          onAddFood={(foodItem, quantity, role) => {
            addFoodToMeal(selectedMealIndex, foodItem, quantity, role);
            setShowFoodSelector(false);
            setSelectedMealIndex(null);
          }}
          onClose={() => {
            setShowFoodSelector(false);
            setSelectedMealIndex(null);
          }}
        />
      )}
    </div>
  );
}

interface FoodSelectorModalProps {
  foodItems: FoodItem[];
  onAddFood: (foodItem: FoodItem, quantity: number, role?: 'primary_carb' | 'primary_protein' | 'primary_fat') => void;
  onClose: () => void;
}

function FoodSelectorModal({ foodItems, onAddFood, onClose }: FoodSelectorModalProps) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [quantity, setQuantity] = useState(100);
  const [foodRole, setFoodRole] = useState<'primary_carb' | 'primary_protein' | 'primary_fat' | 'none'>('none');

  const categories = ['all', ...Array.from(new Set(foodItems.map(item => item.category)))];
  
  const filteredFoods = foodItems.filter(food => {
    const matchesCategory = selectedCategory === 'all' || food.category === selectedCategory;
    const matchesSearch = food.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleAddFood = () => {
    if (selectedFood && quantity > 0) {
      onAddFood(selectedFood, quantity, foodRole === 'none' ? undefined : foodRole);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-5xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-800">Add Food to Meal</h3>
          <p className="text-sm text-gray-600 mt-1">Select foods that will be calculated together as a complete meal</p>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Search and Filter */}
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="Search foods..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#52C878] focus:border-[#52C878]"
            />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#52C878] focus:border-[#52C878]"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Food List */}
            <div className="space-y-2 max-h-96 overflow-y-auto">
              <h4 className="font-semibold text-gray-800 mb-3">Available Foods ({filteredFoods.length})</h4>
              {filteredFoods.map(food => (
                <button
                  key={food.id}
                  onClick={() => setSelectedFood(food)}
                  className={`w-full text-left p-3 rounded-lg border transition-all duration-200 ${
                    selectedFood?.id === food.id
                      ? 'border-[#52C878] bg-[#52C878]/10'
                      : 'border-gray-200 hover:border-[#52C878]/50'
                  }`}
                >
                  <p className="font-medium text-gray-800">{food.name}</p>
                  <p className="text-sm text-gray-600 capitalize">{food.category}</p>
                  <p className="text-xs text-gray-500">
                    {food.calories_per_100g} cal/100g • P:{food.protein_per_100g}g • C:{food.carbs_per_100g}g • F:{food.fat_per_100g}g
                  </p>
                </button>
              ))}
            </div>

            {/* Food Configuration */}
            {selectedFood && (
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-2">{selectedFood.name}</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>Calories: {selectedFood.calories_per_100g}/100g</div>
                    <div>Protein: {selectedFood.protein_per_100g}g/100g</div>
                    <div>Carbs: {selectedFood.carbs_per_100g}g/100g</div>
                    <div>Fat: {selectedFood.fat_per_100g}g/100g</div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity (grams)
                  </label>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#52C878] focus:border-[#52C878]"
                    min="1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Food Role in Meal
                  </label>
                  <select
                    value={foodRole}
                    onChange={(e) => setFoodRole(e.target.value as any)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#52C878] focus:border-[#52C878]"
                  >
                    <option value="none">Regular Food Item</option>
                    <option value="primary_carb">Primary Carbohydrate Source</option>
                    <option value="primary_protein">Primary Protein Source</option>
                    <option value="primary_fat">Primary Fat Source</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Primary sources will be adjusted first to meet macro targets
                  </p>
                </div>

                {quantity > 0 && (
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h5 className="font-medium text-gray-800 mb-2">Nutrition for {quantity}g:</h5>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>Calories: {Math.round((selectedFood.calories_per_100g * quantity) / 100)}</div>
                      <div>Protein: {Math.round((selectedFood.protein_per_100g * quantity) / 100 * 10) / 10}g</div>
                      <div>Carbs: {Math.round((selectedFood.carbs_per_100g * quantity) / 100 * 10) / 10}g</div>
                      <div>Fat: {Math.round((selectedFood.fat_per_100g * quantity) / 100 * 10) / 10}g</div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
          >
            Cancel
          </button>
          <button
            onClick={handleAddFood}
            disabled={!selectedFood || quantity <= 0}
            className="px-6 py-2 bg-[#52C878] text-white rounded-lg hover:bg-[#52C878]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            Add to Meal
          </button>
        </div>
      </div>
    </div>
  );
}

export default MealPlanningSystem;