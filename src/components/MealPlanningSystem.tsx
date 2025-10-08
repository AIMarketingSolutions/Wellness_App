import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Calculator, Target, Utensils, Scale, ChefHat, Info } from 'lucide-react';

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
  is_primary_carb?: boolean;
  is_primary_protein?: boolean;
  is_primary_fat?: boolean;
}

interface MealCalculation {
  total_calories: number;
  total_protein_g: number;
  total_carbs_g: number;
  total_fat_g: number;
  calculated_foods: {
    food_item: FoodItem;
    recommended_oz: number;
    recommended_grams: number;
    calories: number;
    protein_g: number;
    carbs_g: number;
    fat_g: number;
    calculation_phase: 'carbohydrate' | 'protein' | 'fat';
  }[];
  adjustments_made: string[];
}

interface MealEntry {
  meal_type: string;
  target_calories: number;
  target_protein_g: number;
  target_carbs_g: number;
  target_fat_g: number;
  selected_foods: SelectedFood[];
  calculation_result?: MealCalculation;
  is_calculated: boolean;
}

interface UserProfile {
    tee_calories: number;
    protein_percentage: number;
    carb_percentage: number;
    fat_percentage: number;
    metabolic_profile: string;
    gender: string;
    full_profile: any;
}

interface MealPlanningSystemProps {
  userProfile: UserProfile;
}

function MealPlanningSystem({ userProfile }: MealPlanningSystemProps) {
  const [meals, setMeals] = useState<MealEntry[]>([]);
  const [showFoodModal, setShowFoodModal] = useState(false);
  const [selectedMealIndex, setSelectedMealIndex] = useState<number | null>(null);
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Initialize meals based on user profile
  useEffect(() => {
    if (userProfile) {
      const dailyCalories = userProfile.tee_calories;
      const proteinPercent = userProfile.protein_percentage;
      const carbPercent = userProfile.carb_percentage;
      const fatPercent = userProfile.fat_percentage;

      // Calculate macro targets
      const proteinCalories = (dailyCalories * proteinPercent) / 100;
      const carbCalories = (dailyCalories * carbPercent) / 100;
      const fatCalories = (dailyCalories * fatPercent) / 100;

      const proteinGrams = proteinCalories / 4;
      const carbGrams = carbCalories / 4;
      const fatGrams = fatCalories / 9;

      // Create meal structure (3 meals for now)
      const mealCalories = dailyCalories / 3;
      const mealProtein = proteinGrams / 3;
      const mealCarbs = carbGrams / 3;
      const mealFat = fatGrams / 3;

      const initialMeals: MealEntry[] = [
        {
          meal_type: 'breakfast',
          target_calories: Math.round(mealCalories),
          target_protein_g: Math.round(mealProtein * 10) / 10,
          target_carbs_g: Math.round(mealCarbs * 10) / 10,
          target_fat_g: Math.round(mealFat * 10) / 10,
          selected_foods: [],
          is_calculated: false
        },
        {
          meal_type: 'lunch',
          target_calories: Math.round(mealCalories),
          target_protein_g: Math.round(mealProtein * 10) / 10,
          target_carbs_g: Math.round(mealCarbs * 10) / 10,
          target_fat_g: Math.round(mealFat * 10) / 10,
          selected_foods: [],
          is_calculated: false
        },
        {
          meal_type: 'dinner',
          target_calories: Math.round(mealCalories),
          target_protein_g: Math.round(mealProtein * 10) / 10,
          target_carbs_g: Math.round(mealCarbs * 10) / 10,
          target_fat_g: Math.round(mealFat * 10) / 10,
          selected_foods: [],
          is_calculated: false
        }
      ];

      setMeals(initialMeals);
    }
  }, [userProfile]);

  // Load sample foods
  useEffect(() => {
    const sampleFoods: FoodItem[] = [
      // Proteins
      { id: '1', name: 'Chicken Breast', category: 'proteins', protein_per_100g: 31, carbs_per_100g: 0, fat_per_100g: 3.6, calories_per_100g: 165, serving_size_g: 100 },
      { id: '2', name: 'Salmon', category: 'proteins', protein_per_100g: 25, carbs_per_100g: 0, fat_per_100g: 12, calories_per_100g: 208, serving_size_g: 100 },
      { id: '3', name: 'Eggs', category: 'proteins', protein_per_100g: 13, carbs_per_100g: 1.1, fat_per_100g: 11, calories_per_100g: 155, serving_size_g: 100 },
      { id: '4', name: 'Greek Yogurt', category: 'proteins', protein_per_100g: 10, carbs_per_100g: 3.6, fat_per_100g: 0.4, calories_per_100g: 59, serving_size_g: 100 },
      
      // Carbohydrates
      { id: '5', name: 'Brown Rice', category: 'carbohydrates', protein_per_100g: 2.6, carbs_per_100g: 23, fat_per_100g: 0.9, calories_per_100g: 111, serving_size_g: 100 },
      { id: '6', name: 'Sweet Potato', category: 'carbohydrates', protein_per_100g: 2, carbs_per_100g: 20, fat_per_100g: 0.1, calories_per_100g: 86, serving_size_g: 100 },
      { id: '7', name: 'Quinoa', category: 'carbohydrates', protein_per_100g: 4.4, carbs_per_100g: 22, fat_per_100g: 1.9, calories_per_100g: 120, serving_size_g: 100 },
      { id: '8', name: 'Oats', category: 'carbohydrates', protein_per_100g: 17, carbs_per_100g: 66, fat_per_100g: 7, calories_per_100g: 389, serving_size_g: 100 },
      
      // Fats
      { id: '9', name: 'Avocado', category: 'fats', protein_per_100g: 2, carbs_per_100g: 9, fat_per_100g: 15, calories_per_100g: 160, serving_size_g: 100 },
      { id: '10', name: 'Olive Oil', category: 'fats', protein_per_100g: 0, carbs_per_100g: 0, fat_per_100g: 100, calories_per_100g: 884, serving_size_g: 100 },
      { id: '11', name: 'Almonds', category: 'fats', protein_per_100g: 21, carbs_per_100g: 22, fat_per_100g: 50, calories_per_100g: 579, serving_size_g: 100 },
      { id: '12', name: 'Coconut Oil', category: 'fats', protein_per_100g: 0, carbs_per_100g: 0, fat_per_100g: 100, calories_per_100g: 862, serving_size_g: 100 },
      
      // Vegetables
      { id: '13', name: 'Broccoli', category: 'vegetables', protein_per_100g: 2.8, carbs_per_100g: 7, fat_per_100g: 0.4, calories_per_100g: 34, serving_size_g: 100 },
      { id: '14', name: 'Spinach', category: 'vegetables', protein_per_100g: 2.9, carbs_per_100g: 3.6, fat_per_100g: 0.4, calories_per_100g: 23, serving_size_g: 100 },
      { id: '15', name: 'Bell Peppers', category: 'vegetables', protein_per_100g: 0.9, carbs_per_100g: 4.6, fat_per_100g: 0.2, calories_per_100g: 20, serving_size_g: 100 }
    ];
    
    setFoods(sampleFoods);
  }, []);

  const gramsToOunces = (grams: number): number => {
    return Math.round((grams / 28.3495) * 100) / 100;
  };

  const calculateCompleteMeal = (mealIndex: number) => {
    try {
    const meal = meals[mealIndex];
    if (meal.selected_foods.length === 0) return;

    const targets = {
      calories: meal.target_calories,
      protein: meal.target_protein_g,
      carbs: meal.target_carbs_g,
      fat: meal.target_fat_g
    };

    const adjustments: string[] = [];
    const calculatedFoods: any[] = [];
    
      // Separate foods by category
    const carbSources = meal.selected_foods.filter(food => 
      food.is_primary_carb || food.food_item.category === 'carbohydrates'
    );
      const proteinSources = meal.selected_foods.filter(food => 
        food.is_primary_protein || food.food_item.category === 'proteins'
      );
      const fatSources = meal.selected_foods.filter(food => 
        food.is_primary_fat || food.food_item.category === 'fats'
      );
      const otherFoods = meal.selected_foods.filter(food => 
        !food.is_primary_carb && !food.is_primary_protein && !food.is_primary_fat &&
        food.food_item.category !== 'carbohydrates' && 
        food.food_item.category !== 'proteins' && 
        food.food_item.category !== 'fats'
      );

      // PHASE 1: CARBOHYDRATE CALCULATION
    if (carbSources.length > 0) {
      const totalCarbsPer100g = carbSources.reduce((sum, food) => 
        sum + food.food_item.carbs_per_100g, 0
      );

        if (totalCarbsPer100g > 0) {
      const gramsNeededForCarbs = (targets.carbs / totalCarbsPer100g) * 100;
      const gramsPerCarbSource = gramsNeededForCarbs / carbSources.length;

      carbSources.forEach(food => {
        const foodItem = food.food_item;
        const grams = gramsPerCarbSource;
        const ounces = gramsToOunces(grams);

        calculatedFoods.push({
          food_item: foodItem,
          recommended_oz: ounces,
          recommended_grams: Math.round(grams * 10) / 10,
              calories: Math.round((foodItem.calories_per_100g * grams) / 100),
              protein_g: Math.round((foodItem.protein_per_100g * grams) / 100 * 10) / 10,
              carbs_g: Math.round((foodItem.carbs_per_100g * grams) / 100 * 10) / 10,
              fat_g: Math.round((foodItem.fat_per_100g * grams) / 100 * 10) / 10,
          calculation_phase: 'carbohydrate' as const
        });
          });

          adjustments.push(`Phase 1 - Carbohydrates: Calculated ${carbSources.length} carb source(s) to provide exactly ${targets.carbs}g carbs`);
        }
      }

      // PHASE 2: PROTEIN CALCULATION
      if (proteinSources.length > 0) {
        const proteinFromCarbs = calculatedFoods.reduce((sum, food) => 
          sum + (food.calculation_phase === 'carbohydrate' ? food.protein_g : 0), 0
        );
        
        const remainingProteinNeeded = Math.max(0, targets.protein - proteinFromCarbs);
        
        if (remainingProteinNeeded > 0) {
      const totalProteinPer100g = proteinSources.reduce((sum, food) => 
        sum + food.food_item.protein_per_100g, 0
      );

          if (totalProteinPer100g > 0) {
        const gramsNeededForProtein = (remainingProteinNeeded / totalProteinPer100g) * 100;
        const gramsPerProteinSource = gramsNeededForProtein / proteinSources.length;

        proteinSources.forEach(food => {
          const foodItem = food.food_item;
          const grams = gramsPerProteinSource;
          const ounces = gramsToOunces(grams);

          calculatedFoods.push({
            food_item: foodItem,
            recommended_oz: ounces,
            recommended_grams: Math.round(grams * 10) / 10,
                calories: Math.round((foodItem.calories_per_100g * grams) / 100),
                protein_g: Math.round((foodItem.protein_per_100g * grams) / 100 * 10) / 10,
                carbs_g: Math.round((foodItem.carbs_per_100g * grams) / 100 * 10) / 10,
                fat_g: Math.round((foodItem.fat_per_100g * grams) / 100 * 10) / 10,
            calculation_phase: 'protein' as const
          });
            });

            adjustments.push(`Phase 2 - Proteins: Calculated ${proteinSources.length} protein source(s) to provide exactly ${remainingProteinNeeded}g additional protein`);
          }
        }
      }

      // PHASE 3: FAT CALCULATION
      if (fatSources.length > 0) {
        const fatFromOtherSources = calculatedFoods.reduce((sum, food) => 
          sum + food.fat_g, 0
        );
        
        const remainingFatNeeded = Math.max(0, targets.fat - fatFromOtherSources);
        
        if (remainingFatNeeded > 0) {
      const totalFatPer100g = fatSources.reduce((sum, food) => 
        sum + food.food_item.fat_per_100g, 0
      );

      if (totalFatPer100g > 0) {
        const gramsNeededForFat = (remainingFatNeeded / totalFatPer100g) * 100;
        const gramsPerFatSource = gramsNeededForFat / fatSources.length;

        fatSources.forEach(food => {
          const foodItem = food.food_item;
          const grams = gramsPerFatSource;
          const ounces = gramsToOunces(grams);

          calculatedFoods.push({
            food_item: foodItem,
            recommended_oz: ounces,
            recommended_grams: Math.round(grams * 10) / 10,
                calories: Math.round((foodItem.calories_per_100g * grams) / 100),
                protein_g: Math.round((foodItem.protein_per_100g * grams) / 100 * 10) / 10,
                carbs_g: Math.round((foodItem.carbs_per_100g * grams) / 100 * 10) / 10,
                fat_g: Math.round((foodItem.fat_per_100g * grams) / 100 * 10) / 10,
            calculation_phase: 'fat' as const
          });
            });

            adjustments.push(`Phase 3 - Fats: Calculated ${fatSources.length} fat source(s) to provide exactly ${remainingFatNeeded}g additional fat`);
          }
        }
      }

      // Handle other foods - minimal portions
    otherFoods.forEach(food => {
      const foodItem = food.food_item;
        const grams = 50;
      const ounces = gramsToOunces(grams);

      calculatedFoods.push({
        food_item: foodItem,
        recommended_oz: ounces,
        recommended_grams: grams,
        calories: Math.round((foodItem.calories_per_100g * grams) / 100),
        protein_g: Math.round((foodItem.protein_per_100g * grams) / 100 * 10) / 10,
        carbs_g: Math.round((foodItem.carbs_per_100g * grams) / 100 * 10) / 10,
        fat_g: Math.round((foodItem.fat_per_100g * grams) / 100 * 10) / 10,
          calculation_phase: 'fat' as const
        });
    });

    // Calculate final totals
    const finalTotals = calculatedFoods.reduce((totals, food) => ({
      calories: totals.calories + food.calories,
      protein: totals.protein + food.protein_g,
      carbs: totals.carbs + food.carbs_g,
      fat: totals.fat + food.fat_g
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

    // Create calculation result
    const calculationResult: MealCalculation = {
      total_calories: Math.round(finalTotals.calories),
      total_protein_g: Math.round(finalTotals.protein * 10) / 10,
      total_carbs_g: Math.round(finalTotals.carbs * 10) / 10,
      total_fat_g: Math.round(finalTotals.fat * 10) / 10,
      calculated_foods: calculatedFoods,
        adjustments_made: adjustments
    };

    // Update meal with calculation result
    const updatedMeals = [...meals];
    updatedMeals[mealIndex].calculation_result = calculationResult;
    updatedMeals[mealIndex].is_calculated = true;
    setMeals(updatedMeals);
      
    } catch (error) {
      console.error('Error in meal calculation:', error);
      alert('An error occurred during meal calculation. Please check your food selections and try again.');
    }
  };

  const getMealTypeLabel = (mealType: string) => {
    return mealType.charAt(0).toUpperCase() + mealType.slice(1);
  };

  const addFoodToMeal = (food: FoodItem, mealIndex: number) => {
    const newFood: SelectedFood = {
      food_item: food,
      is_primary_carb: false,
      is_primary_protein: false,
      is_primary_fat: false
    };

    const updatedMeals = [...meals];
    updatedMeals[mealIndex].selected_foods.push(newFood);
    setMeals(updatedMeals);
    setShowFoodModal(false);
  };

  const removeFoodFromMeal = (mealIndex: number, foodIndex: number) => {
    const updatedMeals = [...meals];
    updatedMeals[mealIndex].selected_foods.splice(foodIndex, 1);
    setMeals(updatedMeals);
  };

  const toggleFoodRole = (mealIndex: number, foodIndex: number, role: 'carb' | 'protein' | 'fat') => {
    const updatedMeals = [...meals];
    const food = updatedMeals[mealIndex].selected_foods[foodIndex];
    
    // Reset all roles first
    food.is_primary_carb = false;
    food.is_primary_protein = false;
    food.is_primary_fat = false;
    
    // Set the selected role
    if (role === 'carb') food.is_primary_carb = true;
    if (role === 'protein') food.is_primary_protein = true;
    if (role === 'fat') food.is_primary_fat = true;
    
    setMeals(updatedMeals);
  };

  const filteredFoods = foods.filter(food => {
    const matchesSearch = food.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || food.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['all', ...Array.from(new Set(foods.map(f => f.category)))];

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Daily Meal Planning Calculator</h1>
        <p className="text-gray-600">
          Create personalized meal plans with precise ounce measurements and safety checks.
        </p>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-blue-800 mb-2">How to Use the Dynamic Meal Calculator</h3>
            <div className="text-blue-700 space-y-2 text-sm">
              <p>1. <strong>Select Foods:</strong> Click "Add Food" for each meal and choose your foods</p>
              <p>2. <strong>Assign Roles:</strong> Mark foods as Primary Carb, Protein, or Fat for optimal calculation</p>
              <p>3. <strong>Calculate:</strong> Click "Calculate Complete Meal" to get exact portions in ounces</p>
              <p>4. <strong>Review Results:</strong> The system automatically calculates optimal portions to hit your targets</p>
            </div>
          </div>
        </div>
      </div>

      {/* Meals */}
      <div className="space-y-8">
        {meals.map((meal, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                {getMealTypeLabel(meal.meal_type)}
              </h2>
                <button
                  onClick={() => {
                  setSelectedMealIndex(index);
                  setShowFoodModal(true);
                  }}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Food
                </button>
            </div>

            {/* Meal Targets */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-4 h-4 text-red-500" />
                  <span className="text-sm font-medium text-gray-600">Calories</span>
                </div>
                <div className="text-2xl font-bold text-gray-800">{meal.target_calories}</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Scale className="w-4 h-4 text-blue-500" />
                  <span className="text-sm font-medium text-gray-600">Protein (g)</span>
                </div>
                <div className="text-2xl font-bold text-gray-800">{meal.target_protein_g}</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Utensils className="w-4 h-4 text-green-500" />
                  <span className="text-sm font-medium text-gray-600">Carbs (g)</span>
                </div>
                <div className="text-2xl font-bold text-gray-800">{meal.target_carbs_g}</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <ChefHat className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm font-medium text-gray-600">Fat (g)</span>
                </div>
                <div className="text-2xl font-bold text-gray-800">{meal.target_fat_g}</div>
              </div>
            </div>

            {/* Selected Foods */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Selected Foods</h3>
              {meal.selected_foods.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Utensils className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No foods selected yet. Click "Add Food" to get started.</p>
                  <p className="text-sm mt-1">✨ Exact portions will be calculated automatically</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {meal.selected_foods.map((selectedFood, foodIndex) => (
                    <div key={foodIndex} className="flex items-center justify-between bg-gray-50 rounded-lg p-4">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="font-medium text-gray-800">{selectedFood.food_item.name}</span>
                          <div className="flex gap-2">
                            <button
                              onClick={() => toggleFoodRole(index, foodIndex, 'carb')}
                              className={`px-2 py-1 text-xs rounded ${
                                selectedFood.is_primary_carb
                                  ? 'bg-green-100 text-green-800 border border-green-300'
                                  : 'bg-gray-100 text-gray-600 border border-gray-300'
                              }`}
                            >
                              Carb
                            </button>
                            <button
                              onClick={() => toggleFoodRole(index, foodIndex, 'protein')}
                              className={`px-2 py-1 text-xs rounded ${
                                selectedFood.is_primary_protein
                                  ? 'bg-blue-100 text-blue-800 border border-blue-300'
                                  : 'bg-gray-100 text-gray-600 border border-gray-300'
                              }`}
                            >
                              Protein
                            </button>
                            <button
                              onClick={() => toggleFoodRole(index, foodIndex, 'fat')}
                              className={`px-2 py-1 text-xs rounded ${
                                selectedFood.is_primary_fat
                                  ? 'bg-yellow-100 text-yellow-800 border border-yellow-300'
                                  : 'bg-gray-100 text-gray-600 border border-gray-300'
                              }`}
                            >
                              Fat
                            </button>
                          </div>
                        </div>
                        <div className="text-sm text-gray-600">
                          {selectedFood.food_item.calories_per_100g} cal/100g | 
                          P: {selectedFood.food_item.protein_per_100g}g | 
                          C: {selectedFood.food_item.carbs_per_100g}g | 
                          F: {selectedFood.food_item.fat_per_100g}g
                        </div>
                    </div>
                    <button
                        onClick={() => removeFoodFromMeal(index, foodIndex)}
                        className="ml-4 p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  ))}
                </div>
              )}
            </div>

            {/* Calculate Button */}
            {meal.selected_foods.length > 0 && (
              <div className="flex justify-center">
                <button
                  onClick={() => calculateCompleteMeal(index)}
                  className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
                >
                  <Calculator className="w-5 h-5" />
                  Calculate Complete Meal
                </button>
              </div>
            )}

            {/* Calculation Results */}
            {meal.is_calculated && meal.calculation_result && (
              <div className="mt-8 border-t pt-8">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  ✨ Calculated Exact Portions (Automatically Determined):
                </h3>
                
                {/* Unified Results Table */}
                <div className="bg-gray-50 rounded-lg p-6 mb-6">
                  <h4 className="font-semibold text-gray-800 mb-4">Meal Targets vs Final Results</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-sm text-gray-600 mb-1">Calories</div>
                      <div className="text-lg font-bold text-gray-800">{meal.calculation_result.total_calories}</div>
                      <div className="text-xs text-gray-500">Target: {meal.target_calories}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-gray-600 mb-1">Protein (g)</div>
                      <div className="text-lg font-bold text-gray-800">{meal.calculation_result.total_protein_g}</div>
                      <div className="text-xs text-gray-500">Target: {meal.target_protein_g}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-gray-600 mb-1">Carbs (g)</div>
                      <div className="text-lg font-bold text-gray-800">{meal.calculation_result.total_carbs_g}</div>
                      <div className="text-xs text-gray-500">Target: {meal.target_carbs_g}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-gray-600 mb-1">Fat (g)</div>
                      <div className="text-lg font-bold text-gray-800">{meal.calculation_result.total_fat_g}</div>
                      <div className="text-xs text-gray-500">Target: {meal.target_fat_g}</div>
                    </div>
                    </div>
                  </div>

                {/* Calculated Foods */}
                <div className="space-y-3">
                  {meal.calculation_result.calculated_foods.map((food, foodIndex) => (
                    <div key={foodIndex} className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-gray-800">{food.food_item.name}</div>
                          <div className="text-sm text-gray-600">
                            🎯 Exact Amount: {food.recommended_oz} oz ({food.recommended_grams}g)
                          </div>
                        </div>
                        <div className="text-right text-sm text-gray-600">
                          <div>{food.calories} cal</div>
                          <div>P: {food.protein_g}g | C: {food.carbs_g}g | F: {food.fat_g}g</div>
                        </div>
                      </div>
                    </div>
                  ))}
                  </div>

                {/* Adjustments Made */}
                  {meal.calculation_result.adjustments_made.length > 0 && (
                  <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-800 mb-2">Calculation Process:</h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      {meal.calculation_result.adjustments_made.map((adjustment, adjIndex) => (
                        <li key={adjIndex}>• {adjustment}</li>
                        ))}
                      </ul>
                    </div>
                  )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Food Selection Modal */}
      {showFoodModal && selectedMealIndex !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
        <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-800">Select Food for {getMealTypeLabel(meals[selectedMealIndex].meal_type)}</h3>
                <button
                  onClick={() => setShowFoodModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
        </div>
        
          {/* Search and Filter */}
              <div className="mt-4 flex gap-4">
                <div className="flex-1">
            <input
              type="text"
              placeholder="Search foods..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
                </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
          </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredFoods.map(food => (
                  <div
                    key={food.id}
                    onClick={() => addFoodToMeal(food, selectedMealIndex)}
                    className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:bg-blue-50 cursor-pointer transition-colors"
                  >
                    <div className="font-medium text-gray-800 mb-2">{food.name}</div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div>{food.calories_per_100g} cal/100g</div>
                      <div>P: {food.protein_per_100g}g | C: {food.carbs_per_100g}g | F: {food.fat_per_100g}g</div>
                      <div className="text-xs text-blue-600 mt-2">
                        💡 Tip: Assign this food a role (Carb/Protein/Fat) for optimal calculation
                  </div>
                </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MealPlanningSystem;