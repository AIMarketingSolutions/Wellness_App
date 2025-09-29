import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Calculator, Target, Utensils, Scale, ChefHat, CheckCircle, AlertTriangle, Info } from 'lucide-react';
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
  phase_breakdown: {
    carb_phase: {
      target_carbs: number;
      achieved_carbs: number;
      foods_processed: string[];
    };
    protein_phase: {
      target_protein: number;
      achieved_protein: number;
      foods_processed: string[];
    };
    fat_phase: {
      target_fat: number;
      existing_fat: number;
      additional_fat_needed: number;
      foods_processed: string[];
    };
  };
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
    // Comprehensive food database with 100g nutritional values
    const sampleFoods: FoodItem[] = [
      // Carbohydrate Sources (Primary Carbs)
      { id: '1', name: 'Brown Rice (cooked)', category: 'carbohydrates', protein_per_100g: 2.6, carbs_per_100g: 23, fat_per_100g: 0.9, calories_per_100g: 111, serving_size_g: 100 },
      { id: '2', name: 'Sweet Potato (baked)', category: 'carbohydrates', protein_per_100g: 2.0, carbs_per_100g: 20.1, fat_per_100g: 0.1, calories_per_100g: 90, serving_size_g: 100 },
      { id: '3', name: 'Quinoa (cooked)', category: 'carbohydrates', protein_per_100g: 4.4, carbs_per_100g: 21.3, fat_per_100g: 1.9, calories_per_100g: 120, serving_size_g: 100 },
      { id: '4', name: 'Oatmeal (cooked)', category: 'carbohydrates', protein_per_100g: 2.4, carbs_per_100g: 12, fat_per_100g: 1.4, calories_per_100g: 68, serving_size_g: 100 },
      { id: '5', name: 'White Rice (cooked)', category: 'carbohydrates', protein_per_100g: 2.7, carbs_per_100g: 28, fat_per_100g: 0.3, calories_per_100g: 130, serving_size_g: 100 },
      { id: '6', name: 'Whole Wheat Pasta (cooked)', category: 'carbohydrates', protein_per_100g: 5.0, carbs_per_100g: 25, fat_per_100g: 1.1, calories_per_100g: 131, serving_size_g: 100 },
      
      // Protein Sources (Primary Proteins)
      { id: '7', name: 'Chicken Breast (grilled)', category: 'proteins', protein_per_100g: 31, carbs_per_100g: 0, fat_per_100g: 3.6, calories_per_100g: 165, serving_size_g: 100 },
      { id: '8', name: 'Salmon (baked)', category: 'proteins', protein_per_100g: 25, carbs_per_100g: 0, fat_per_100g: 12, calories_per_100g: 206, serving_size_g: 100 },
      { id: '9', name: 'Lean Ground Turkey', category: 'proteins', protein_per_100g: 27, carbs_per_100g: 0, fat_per_100g: 8, calories_per_100g: 189, serving_size_g: 100 },
      { id: '10', name: 'Greek Yogurt (plain)', category: 'proteins', protein_per_100g: 10, carbs_per_100g: 3.6, fat_per_100g: 0.4, calories_per_100g: 59, serving_size_g: 100 },
      { id: '11', name: 'Eggs (whole)', category: 'proteins', protein_per_100g: 13, carbs_per_100g: 1.1, fat_per_100g: 11, calories_per_100g: 155, serving_size_g: 100 },
      { id: '12', name: 'Lean Beef (sirloin)', category: 'proteins', protein_per_100g: 26, carbs_per_100g: 0, fat_per_100g: 6, calories_per_100g: 158, serving_size_g: 100 },
      { id: '13', name: 'Tuna (canned in water)', category: 'proteins', protein_per_100g: 25, carbs_per_100g: 0, fat_per_100g: 1, calories_per_100g: 116, serving_size_g: 100 },
      
      // Healthy Fats (Primary Fats)
      { id: '14', name: 'Avocado', category: 'fats', protein_per_100g: 2, carbs_per_100g: 8.5, fat_per_100g: 14.7, calories_per_100g: 160, serving_size_g: 100 },
      { id: '15', name: 'Olive Oil', category: 'fats', protein_per_100g: 0, carbs_per_100g: 0, fat_per_100g: 100, calories_per_100g: 884, serving_size_g: 100 },
      { id: '16', name: 'Almonds', category: 'fats', protein_per_100g: 21, carbs_per_100g: 22, fat_per_100g: 49, calories_per_100g: 579, serving_size_g: 100 },
      { id: '17', name: 'Walnuts', category: 'fats', protein_per_100g: 15, carbs_per_100g: 14, fat_per_100g: 65, calories_per_100g: 654, serving_size_g: 100 },
      { id: '18', name: 'Coconut Oil', category: 'fats', protein_per_100g: 0, carbs_per_100g: 0, fat_per_100g: 100, calories_per_100g: 862, serving_size_g: 100 },
      
      // Vegetables (Nutrient Dense, Low Calorie)
      { id: '19', name: 'Broccoli (steamed)', category: 'vegetables', protein_per_100g: 2.8, carbs_per_100g: 7, fat_per_100g: 0.4, calories_per_100g: 34, serving_size_g: 100 },
      { id: '20', name: 'Spinach (raw)', category: 'vegetables', protein_per_100g: 2.9, carbs_per_100g: 3.6, fat_per_100g: 0.4, calories_per_100g: 23, serving_size_g: 100 },
      { id: '21', name: 'Bell Peppers', category: 'vegetables', protein_per_100g: 1, carbs_per_100g: 7, fat_per_100g: 0.3, calories_per_100g: 31, serving_size_g: 100 },
      { id: '22', name: 'Asparagus', category: 'vegetables', protein_per_100g: 2.2, carbs_per_100g: 3.9, fat_per_100g: 0.1, calories_per_100g: 20, serving_size_g: 100 }
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

  const addFoodToMeal = (mealIndex: number, foodItem: FoodItem, foodRole?: 'primary_carb' | 'primary_protein' | 'primary_fat') => {
    const updatedMeals = [...meals];
    const selectedFood: SelectedFood = {
      food_item: foodItem,
      is_primary_carb: foodRole === 'primary_carb',
      is_primary_protein: foodRole === 'primary_protein',
      is_primary_fat: foodRole === 'primary_fat'
    };

    updatedMeals[mealIndex].selected_foods.push(selectedFood);
    updatedMeals[mealIndex].is_calculated = false;
    updatedMeals[mealIndex].calculation_result = undefined;
    setMeals(updatedMeals);
  };

  const removeFoodFromMeal = (mealIndex: number, foodIndex: number) => {
    const updatedMeals = [...meals];
    updatedMeals[mealIndex].selected_foods.splice(foodIndex, 1);
    updatedMeals[mealIndex].is_calculated = false;
    updatedMeals[mealIndex].calculation_result = undefined;
    setMeals(updatedMeals);
  };

  // Helper function to convert grams to ounces
  const gramsToOunces = (grams: number): number => {
    return Math.round((grams / 28.3495) * 100) / 100;
  };

  // DYNAMIC CALCULATION SYSTEM - No Predetermined Quantities
  const calculateCompleteMeal = (mealIndex: number) => {
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
    
    // Initialize phase tracking
    const phaseBreakdown = {
      carb_phase: { target_carbs: targets.carbs, achieved_carbs: 0, foods_processed: [] as string[] },
      protein_phase: { target_protein: targets.protein, achieved_protein: 0, foods_processed: [] as string[] },
      fat_phase: { target_fat: targets.fat, existing_fat: 0, additional_fat_needed: 0, foods_processed: [] as string[] }
    };

    // PHASE 1: CARBOHYDRATE CALCULATION - Calculate exact amounts needed
    const carbSources = meal.selected_foods.filter(food => 
      food.is_primary_carb || food.food_item.category === 'carbohydrates'
    );

    let totalCarbsFromCarbSources = 0;
    let totalProteinFromCarbSources = 0;
    let totalFatFromCarbSources = 0;

    if (carbSources.length > 0) {
      // Calculate total carbs available from carb sources per 100g
      const totalCarbsPer100g = carbSources.reduce((sum, food) => 
        sum + food.food_item.carbs_per_100g, 0
      );

      // Calculate how many grams of carb sources needed to meet carb target
      const gramsNeededForCarbs = (targets.carbs / totalCarbsPer100g) * 100;
      const gramsPerCarbSource = gramsNeededForCarbs / carbSources.length;

      carbSources.forEach(food => {
        const foodItem = food.food_item;
        const grams = gramsPerCarbSource;
        const ounces = gramsToOunces(grams);

        // Calculate nutritional contribution
        const carbContribution = (foodItem.carbs_per_100g * grams) / 100;
        const proteinContribution = (foodItem.protein_per_100g * grams) / 100;
        const fatContribution = (foodItem.fat_per_100g * grams) / 100;
        const calorieContribution = (foodItem.calories_per_100g * grams) / 100;

        totalCarbsFromCarbSources += carbContribution;
        totalProteinFromCarbSources += proteinContribution;
        totalFatFromCarbSources += fatContribution;

        calculatedFoods.push({
          food_item: foodItem,
          recommended_oz: ounces,
          recommended_grams: Math.round(grams * 10) / 10,
          calories: Math.round(calorieContribution),
          protein_g: Math.round(proteinContribution * 10) / 10,
          carbs_g: Math.round(carbContribution * 10) / 10,
          fat_g: Math.round(fatContribution * 10) / 10,
          calculation_phase: 'carbohydrate' as const
        });

        phaseBreakdown.carb_phase.foods_processed.push(foodItem.name);
      });

      phaseBreakdown.carb_phase.achieved_carbs = totalCarbsFromCarbSources;
      adjustments.push(`Phase 1 - Carbohydrates: Calculated ${carbSources.length} carb source(s) to provide ${Math.round(totalCarbsFromCarbSources)}g carbs`);
    }

    // PHASE 2: PROTEIN CALCULATION - Calculate exact amounts needed
    const proteinSources = meal.selected_foods.filter(food => 
      food.is_primary_protein || food.food_item.category === 'proteins'
    );

    let totalProteinFromProteinSources = 0;
    let totalFatFromProteinSources = 0;
    let totalCarbsFromProteinSources = 0;

    if (proteinSources.length > 0) {
      // Calculate remaining protein needed after accounting for protein from carb sources
      const remainingProteinNeeded = Math.max(0, targets.protein - totalProteinFromCarbSources);
      
      // Calculate total protein available from protein sources per 100g
      const totalProteinPer100g = proteinSources.reduce((sum, food) => 
        sum + food.food_item.protein_per_100g, 0
      );

      if (remainingProteinNeeded > 0 && totalProteinPer100g > 0) {
        // Calculate how many grams of protein sources needed
        const gramsNeededForProtein = (remainingProteinNeeded / totalProteinPer100g) * 100;
        const gramsPerProteinSource = gramsNeededForProtein / proteinSources.length;

        proteinSources.forEach(food => {
          const foodItem = food.food_item;
          const grams = gramsPerProteinSource;
          const ounces = gramsToOunces(grams);

          // Calculate nutritional contribution
          const proteinContribution = (foodItem.protein_per_100g * grams) / 100;
          const fatContribution = (foodItem.fat_per_100g * grams) / 100;
          const carbContribution = (foodItem.carbs_per_100g * grams) / 100;
          const calorieContribution = (foodItem.calories_per_100g * grams) / 100;

          totalProteinFromProteinSources += proteinContribution;
          totalFatFromProteinSources += fatContribution;
          totalCarbsFromProteinSources += carbContribution;

          calculatedFoods.push({
            food_item: foodItem,
            recommended_oz: ounces,
            recommended_grams: Math.round(grams * 10) / 10,
            calories: Math.round(calorieContribution),
            protein_g: Math.round(proteinContribution * 10) / 10,
            carbs_g: Math.round(carbContribution * 10) / 10,
            fat_g: Math.round(fatContribution * 10) / 10,
            calculation_phase: 'protein' as const
          });

          phaseBreakdown.protein_phase.foods_processed.push(foodItem.name);
        });

        phaseBreakdown.protein_phase.achieved_protein = totalProteinFromProteinSources;
        adjustments.push(`Phase 2 - Proteins: Calculated ${proteinSources.length} protein source(s) to provide ${Math.round(totalProteinFromProteinSources)}g additional protein`);
      }
    }

    // PHASE 3: FAT CALCULATION (Last for Flexibility) - Calculate exact amounts needed
    const fatSources = meal.selected_foods.filter(food => 
      food.is_primary_fat || food.food_item.category === 'fats'
    );

    // Calculate existing fat from carb and protein sources
    const existingFat = totalFatFromCarbSources + totalFatFromProteinSources;
    const remainingFatNeeded = Math.max(0, targets.fat - existingFat);

    phaseBreakdown.fat_phase.existing_fat = existingFat;
    phaseBreakdown.fat_phase.additional_fat_needed = remainingFatNeeded;

    let totalFatFromFatSources = 0;

    if (fatSources.length > 0 && remainingFatNeeded > 0) {
      // Calculate total fat available from fat sources per 100g
      const totalFatPer100g = fatSources.reduce((sum, food) => 
        sum + food.food_item.fat_per_100g, 0
      );

      if (totalFatPer100g > 0) {
        // Calculate how many grams of fat sources needed
        const gramsNeededForFat = (remainingFatNeeded / totalFatPer100g) * 100;
        const gramsPerFatSource = gramsNeededForFat / fatSources.length;

        fatSources.forEach(food => {
          const foodItem = food.food_item;
          const grams = gramsPerFatSource;
          const ounces = gramsToOunces(grams);

          // Calculate nutritional contribution
          const fatContribution = (foodItem.fat_per_100g * grams) / 100;
          const proteinContribution = (foodItem.protein_per_100g * grams) / 100;
          const carbContribution = (foodItem.carbs_per_100g * grams) / 100;
          const calorieContribution = (foodItem.calories_per_100g * grams) / 100;

          totalFatFromFatSources += fatContribution;

          calculatedFoods.push({
            food_item: foodItem,
            recommended_oz: ounces,
            recommended_grams: Math.round(grams * 10) / 10,
            calories: Math.round(calorieContribution),
            protein_g: Math.round(proteinContribution * 10) / 10,
            carbs_g: Math.round(carbContribution * 10) / 10,
            fat_g: Math.round(fatContribution * 10) / 10,
            calculation_phase: 'fat' as const
          });

          phaseBreakdown.fat_phase.foods_processed.push(foodItem.name);
        });

        adjustments.push(`Phase 3 - Fats: Calculated ${fatSources.length} fat source(s) to provide ${Math.round(totalFatFromFatSources)}g additional fat`);
      }
    } else if (remainingFatNeeded > 0) {
      adjustments.push(`Phase 3 - Fats: ${Math.round(remainingFatNeeded)}g additional healthy fats recommended (consider adding olive oil, avocado, or nuts)`);
    }

    // Handle vegetables and other foods (calculated at optimal portions)
    const otherFoods = meal.selected_foods.filter(food => 
      !food.is_primary_carb && !food.is_primary_protein && !food.is_primary_fat &&
      food.food_item.category !== 'carbohydrates' && 
      food.food_item.category !== 'proteins' && 
      food.food_item.category !== 'fats'
    );

    otherFoods.forEach(food => {
      const foodItem = food.food_item;
      const grams = 150; // Optimal vegetable portion
      const ounces = gramsToOunces(grams);

      calculatedFoods.push({
        food_item: foodItem,
        recommended_oz: ounces,
        recommended_grams: grams,
        calories: Math.round((foodItem.calories_per_100g * grams) / 100),
        protein_g: Math.round((foodItem.protein_per_100g * grams) / 100 * 10) / 10,
        carbs_g: Math.round((foodItem.carbs_per_100g * grams) / 100 * 10) / 10,
        fat_g: Math.round((foodItem.fat_per_100g * grams) / 100 * 10) / 10,
        calculation_phase: 'fat' as const // Processed last
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
      adjustments_made: adjustments,
      phase_breakdown: phaseBreakdown
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

  const getPhaseColor = (phase: 'carbohydrate' | 'protein' | 'fat') => {
    switch (phase) {
      case 'carbohydrate': return 'bg-blue-100 text-blue-800';
      case 'protein': return 'bg-green-100 text-green-800';
      case 'fat': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
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

      {/* Dynamic Calculation Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-center gap-3">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0" />
          <div>
            <p className="font-medium text-blue-800">Dynamic Portion Calculation</p>
            <p className="text-sm text-blue-700 mt-1">
              No predetermined quantities! The system calculates the exact ounces and grams needed for each food based on your meal targets. Simply select your foods and let the calculator determine optimal portions.
            </p>
          </div>
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
                    {meal.is_calculated ? 'Calculated' : 'Calculate Complete Meal'}
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

            {/* Selected Foods - No Quantities Shown */}
            <div className="space-y-3 mb-6">
              <h4 className="font-semibold text-gray-800">Selected Foods (quantities will be calculated):</h4>
              {meal.selected_foods.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No foods selected yet</p>
              ) : (
                meal.selected_foods.map((selectedFood, foodIndex) => (
                  <div key={foodIndex} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">{selectedFood.food_item.name}</p>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span>Quantity will be calculated</span>
                        {selectedFood.is_primary_carb && <span className="px-2 py-1 bg-[#4A90E2] text-white text-xs rounded">Primary Carb</span>}
                        {selectedFood.is_primary_protein && <span className="px-2 py-1 bg-[#52C878] text-white text-xs rounded">Primary Protein</span>}
                        {selectedFood.is_primary_fat && <span className="px-2 py-1 bg-purple-500 text-white text-xs rounded">Primary Fat</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span>Per 100g: {selectedFood.food_item.calories_per_100g} cal</span>
                      <span className="text-[#52C878]">{selectedFood.food_item.protein_per_100g}p</span>
                      <span className="text-[#4A90E2]">{selectedFood.food_item.carbs_per_100g}c</span>
                      <span className="text-purple-600">{selectedFood.food_item.fat_per_100g}f</span>
                    </div>
                    <button
                      onClick={() => removeFoodFromMeal(mealIndex, foodIndex)}
                      className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-colors ml-4"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Calculation Results */}
            {meal.calculation_result && (
              <div className="space-y-6">
                <div className="border-t border-gray-200 pt-6">
                  <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <ChefHat className="w-4 h-4" />
                    Complete Meal Calculation Results
                  </h4>
                  
                  {/* Final Nutritional Totals */}
                  <div className="grid grid-cols-4 gap-4 mb-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl">
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

                  {/* Calculated Food Portions with Ounces and Grams */}
                  <div className="space-y-3 mb-6">
                    <h5 className="font-medium text-gray-700 flex items-center gap-2">
                      <Scale className="w-4 h-4" />
                      Recommended Portions:
                    </h5>
                    {meal.calculation_result.calculated_foods.map((food, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium text-gray-800">{food.food_item.name}</p>
                            <span className={`px-2 py-1 text-xs rounded ${getPhaseColor(food.calculation_phase)}`}>
                              {food.calculation_phase.charAt(0).toUpperCase() + food.calculation_phase.slice(1)} Phase
                            </span>
                          </div>
                          <p className="text-sm font-semibold text-[#4A90E2]">
                            Recommended: {food.recommended_oz} oz ({food.recommended_grams}g)
                          </p>
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

                  {/* Three-Phase Calculation Breakdown */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                      <h6 className="font-semibold text-blue-800 mb-2">Phase 1: Carbohydrates</h6>
                      <p className="text-sm text-blue-700">Target: {meal.calculation_result.phase_breakdown.carb_phase.target_carbs}g</p>
                      <p className="text-sm text-blue-700">Achieved: {Math.round(meal.calculation_result.phase_breakdown.carb_phase.achieved_carbs * 10) / 10}g</p>
                      <p className="text-xs text-blue-600 mt-1">
                        Foods: {meal.calculation_result.phase_breakdown.carb_phase.foods_processed.join(', ') || 'None'}
                      </p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                      <h6 className="font-semibold text-green-800 mb-2">Phase 2: Proteins</h6>
                      <p className="text-sm text-green-700">Target: {meal.calculation_result.phase_breakdown.protein_phase.target_protein}g</p>
                      <p className="text-sm text-green-700">Achieved: {Math.round(meal.calculation_result.phase_breakdown.protein_phase.achieved_protein * 10) / 10}g</p>
                      <p className="text-xs text-green-600 mt-1">
                        Foods: {meal.calculation_result.phase_breakdown.protein_phase.foods_processed.join(', ') || 'None'}
                      </p>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
                      <h6 className="font-semibold text-purple-800 mb-2">Phase 3: Fats</h6>
                      <p className="text-sm text-purple-700">Target: {meal.calculation_result.phase_breakdown.fat_phase.target_fat}g</p>
                      <p className="text-sm text-purple-700">Existing: {Math.round(meal.calculation_result.phase_breakdown.fat_phase.existing_fat * 10) / 10}g</p>
                      <p className="text-sm text-purple-700">Additional: {Math.round(meal.calculation_result.phase_breakdown.fat_phase.additional_fat_needed * 10) / 10}g</p>
                      <p className="text-xs text-purple-600 mt-1">
                        Foods: {meal.calculation_result.phase_breakdown.fat_phase.foods_processed.join(', ') || 'None'}
                      </p>
                    </div>
                  </div>

                  {/* Calculation Process Details */}
                  {meal.calculation_result.adjustments_made.length > 0 && (
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                      <h5 className="font-medium text-yellow-800 mb-2 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" />
                        Calculation Process Details:
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
          onAddFood={(foodItem, role) => {
            addFoodToMeal(selectedMealIndex, foodItem, role);
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
  onAddFood: (foodItem: FoodItem, role?: 'primary_carb' | 'primary_protein' | 'primary_fat') => void;
  onClose: () => void;
}

function FoodSelectorModal({ foodItems, onAddFood, onClose }: FoodSelectorModalProps) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [foodRole, setFoodRole] = useState<'primary_carb' | 'primary_protein' | 'primary_fat' | 'none'>('none');

  const categories = ['all', ...Array.from(new Set(foodItems.map(item => item.category)))];
  
  const filteredFoods = foodItems.filter(food => {
    const matchesCategory = selectedCategory === 'all' || food.category === selectedCategory;
    const matchesSearch = food.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleAddFood = () => {
    if (selectedFood) {
      onAddFood(selectedFood, foodRole === 'none' ? undefined : foodRole);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-5xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-800">Add Food to Meal</h3>
          <p className="text-sm text-gray-600 mt-1">Select foods - quantities will be calculated automatically</p>
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
                    Per 100g: {food.calories_per_100g} cal • P:{food.protein_per_100g}g • C:{food.carbs_per_100g}g • F:{food.fat_per_100g}g
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

                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Scale className="w-4 h-4 text-blue-600" />
                    <h5 className="font-medium text-blue-800">Dynamic Quantity Calculation</h5>
                  </div>
                  <p className="text-sm text-blue-700">
                    No predetermined quantities! The system will calculate the exact ounces and grams needed for this food based on your meal targets.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Food Role in Meal Calculation
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
                    Primary sources are calculated first in their respective phases to meet macro targets
                  </p>
                </div>
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
            disabled={!selectedFood}
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