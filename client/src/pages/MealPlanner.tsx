import { useState, useMemo, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { Link } from "wouter";
import { ArrowLeft, Calculator, Check, Dumbbell } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { UserProfile } from "@shared/schema";

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

interface CalculatedFood {
  food: FoodItem;
  recommendedOz: number;
  contributedProteinG: number;
  contributedCarbsG: number;
  contributedFatG: number;
}

interface MealCalculation {
  carbFoods: CalculatedFood[];
  proteinFoods: CalculatedFood[];
  fatFoods: CalculatedFood[];
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  totalCalories: number;
}

interface ExerciseType {
  id: string;
  name: string;
  category: string;
  caloriesPerMinute: string;
  description: string | null;
}

interface DailyExercise {
  id: string;
  userId: string;
  exerciseTypeId: string;
  exerciseDate: string;
  durationMinutes: number;
  caloriesBurned: string;
  isCompleted: boolean;
}

const GRAMS_PER_OUNCE = 28.3495;
const DURATION_OPTIONS = [60, 40, 30, 20];

export default function MealPlanner() {
  useAuth();
  const [activeMeal, setActiveMeal] = useState<MealType>('breakfast');
  const [selectedCarbIds, setSelectedCarbIds] = useState<string[]>([]);
  const [selectedProteinIds, setSelectedProteinIds] = useState<string[]>([]);
  const [selectedFatIds, setSelectedFatIds] = useState<string[]>([]);
  const [calculation, setCalculation] = useState<MealCalculation | null>(null);
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>('');
  const [selectedDuration, setSelectedDuration] = useState<number>(0);

  // Fetch user profile
  const { data: profile } = useQuery<UserProfile>({
    queryKey: ["/api/profile"],
  });

  // Fetch food items
  const { data: foodItems = [] } = useQuery<FoodItem[]>({
    queryKey: ["/api/food-items"],
  });

  // Fetch exercise types
  const { data: exerciseTypes = [] } = useQuery<ExerciseType[]>({
    queryKey: ["/api/exercise-types"],
  });

  // Fetch today's exercise
  const { data: todayExercise } = useQuery<DailyExercise | null>({
    queryKey: ["/api/daily-exercise/today"],
  });

  // Set selected exercise from today's exercise
  useEffect(() => {
    if (todayExercise) {
      setSelectedExerciseId(todayExercise.exerciseTypeId);
      setSelectedDuration(todayExercise.durationMinutes);
    }
  }, [todayExercise]);

  // Calculate calories burned from exercise
  const exerciseCalories = useMemo(() => {
    if (!selectedExerciseId || !selectedDuration) return 0;
    const exercise = exerciseTypes.find(e => e.id === selectedExerciseId);
    if (!exercise) return 0;
    const caloriesPerMin = parseFloat(exercise.caloriesPerMinute);
    return Math.round(caloriesPerMin * selectedDuration);
  }, [selectedExerciseId, selectedDuration, exerciseTypes]);

  // Handle workout selection save
  const handleWorkoutSave = () => {
    if (!selectedExerciseId || !selectedDuration) {
      alert('Please select an exercise type and duration');
      return;
    }
    saveExerciseMutation.mutate({
      exerciseTypeId: selectedExerciseId,
      durationMinutes: selectedDuration,
      caloriesBurned: exerciseCalories,
    });
  };

  // Save exercise mutation
  const saveExerciseMutation = useMutation({
    mutationFn: async (data: { exerciseTypeId: string; durationMinutes: number; caloriesBurned: number }) => {
      return await apiRequest("/api/daily-exercise", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/daily-exercise/today"] });
    },
  });

  // Separate foods by category
  const carbFoods = foodItems.filter(f => f.category === 'carbohydrate');
  const proteinFoods = foodItems.filter(f => f.category === 'protein');
  const fatFoods = foodItems.filter(f => f.category === 'fat');

  // Calculate macro targets for active meal
  const mealTargets = useMemo(() => {
    if (!profile) return { calories: 0, proteinG: 0, carbsG: 0, fatG: 0 };

    // Get macro percentages based on metabolic profile (must match TransformationTracker)
    let proteinPercent = 30;
    let carbPercent = 30;
    let fatPercent = 40;

    if (profile.metabolicProfile === "fast_oxidizer") {
      proteinPercent = 25;
      carbPercent = 35;
      fatPercent = 40;
    } else if (profile.metabolicProfile === "slow_oxidizer") {
      proteinPercent = 35;
      carbPercent = 25;
      fatPercent = 40;
    } else if (profile.metabolicProfile === "medium_oxidizer") {
      proteinPercent = 30;
      carbPercent = 30;
      fatPercent = 40;
    } else if (profile.customProteinPercentage && profile.customCarbPercentage && profile.customFatPercentage) {
      proteinPercent = parseFloat(profile.customProteinPercentage);
      carbPercent = parseFloat(profile.customCarbPercentage);
      fatPercent = parseFloat(profile.customFatPercentage);
    }

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

    // Apply weight loss deficit
    const deficits = {
      maintain: 0,
      lose_0_5: 250,
      lose_1: 500,
      lose_1_5: 750,
      lose_2: 1000,
    };

    const weightLossGoal = profile.weightLossGoal || "maintain";
    const deficit = deficits[weightLossGoal] || 0;

    // Calculate DCT with minimum safety and add exercise calories
    const minCalories = gender === "male" ? 1500 : 1200;
    const baseDct = Math.max(tee - deficit, minCalories);
    const dct = baseDct + exerciseCalories;

    // Distribute calories across meals based on meal plan type
    const mealPlanType = profile.mealPlanType || 'three_meals';
    let mealCalories = 0;

    if (mealPlanType === 'three_meals') {
      // 33.33% per meal
      mealCalories = activeMeal === 'breakfast' || activeMeal === 'lunch' || activeMeal === 'dinner' ? dct * (100 / 3 / 100) : 0;
    } else if (mealPlanType === 'three_meals_one_snack') {
      // 30% per meal, 10% snack
      if (activeMeal === 'breakfast' || activeMeal === 'lunch' || activeMeal === 'dinner') {
        mealCalories = dct * 0.3;
      } else if (activeMeal === 'snack') {
        mealCalories = dct * 0.1;
      }
    } else if (mealPlanType === 'three_meals_two_snacks') {
      // 26.67% per meal, 10% per snack
      if (activeMeal === 'breakfast' || activeMeal === 'lunch' || activeMeal === 'dinner') {
        mealCalories = dct * (80 / 3 / 100);
      } else if (activeMeal === 'snack' || activeMeal === 'snack2') {
        mealCalories = dct * 0.1;
      }
    }

    // Calculate macro grams
    const proteinG = (mealCalories * (proteinPercent / 100)) / 4;
    const carbsG = (mealCalories * (carbPercent / 100)) / 4;
    const fatG = (mealCalories * (fatPercent / 100)) / 9;

    return {
      calories: Math.round(mealCalories),
      proteinG: Math.round(proteinG),
      carbsG: Math.round(carbsG),
      fatG: Math.round(fatG),
    };
  }, [profile, activeMeal, exerciseCalories]);

  // Waterfall calculation algorithm
  const calculateMeal = () => {
    console.log('Calculate button clicked!');
    console.log('Profile:', profile);
    console.log('Meal Targets:', mealTargets);
    console.log('Selected Carbs:', selectedCarbIds);
    console.log('Selected Proteins:', selectedProteinIds);
    console.log('Selected Fats:', selectedFatIds);

    // Check if profile is complete
    if (!profile || !profile.weightLossGoal || !profile.metabolicProfile || !profile.mealPlanType) {
      console.log('Profile incomplete');
      alert('Please complete your Personal Profile Assessment first before using the meal calculator.');
      return;
    }

    // Check if macro targets are valid
    const targetProteinG = mealTargets.proteinG;
    const targetCarbsG = mealTargets.carbsG;
    const targetFatG = mealTargets.fatG;

    if (mealTargets.calories === 0 || (targetProteinG === 0 && targetCarbsG === 0 && targetFatG === 0)) {
      console.log('Macro targets invalid');
      alert('Unable to calculate macros. Please ensure your profile has valid age, weight, height, and activity level.');
      return;
    }

    const selectedCarbFoods = carbFoods.filter(f => selectedCarbIds.includes(f.id));
    const selectedProteinFoods = proteinFoods.filter(f => selectedProteinIds.includes(f.id));
    const selectedFatFoods = fatFoods.filter(f => selectedFatIds.includes(f.id));

    console.log('Selected carb foods:', selectedCarbFoods);
    console.log('Selected protein foods:', selectedProteinFoods);
    console.log('Selected fat foods:', selectedFatFoods);

    if (selectedCarbFoods.length === 0 || selectedProteinFoods.length === 0 || selectedFatFoods.length === 0) {
      console.log('Not all food categories selected');
      alert('Please select at least one food from each category (Carb, Protein, Fat)');
      return;
    }

    console.log('Starting calculation...');
    
    try {
      // STEP 1: Calculate carbohydrate quantities in ounces to match allowed grams
      console.log('Step 1: Calculating carbs...');
      const carbsPerFood = targetCarbsG / selectedCarbFoods.length;
    const calculatedCarbFoods: CalculatedFood[] = selectedCarbFoods.map(food => {
      const carbsPer100g = parseFloat(food.carbsPer100g);
      const proteinPer100g = parseFloat(food.proteinPer100g);
      const fatPer100g = parseFloat(food.fatPer100g);
      
      // Calculate grams needed to get carbsPerFood grams of carbs
      const gramsNeeded = (carbsPerFood / carbsPer100g) * 100;
      const recommendedOz = gramsNeeded / GRAMS_PER_OUNCE;
      
      return {
        food,
        recommendedOz,
        contributedCarbsG: carbsPerFood,
        contributedProteinG: (gramsNeeded / 100) * proteinPer100g,
        contributedFatG: (gramsNeeded / 100) * fatPer100g,
      };
    });

    // STEP 2: Calculate protein from carbs, then calculate remaining protein needed
    const proteinFromCarbs = calculatedCarbFoods.reduce((sum, cf) => sum + cf.contributedProteinG, 0);
    const remainingProteinNeeded = Math.max(0, targetProteinG - proteinFromCarbs);
    
    const proteinPerFood = remainingProteinNeeded / selectedProteinFoods.length;
    const calculatedProteinFoods: CalculatedFood[] = selectedProteinFoods.map(food => {
      const proteinPer100g = parseFloat(food.proteinPer100g);
      const carbsPer100g = parseFloat(food.carbsPer100g);
      const fatPer100g = parseFloat(food.fatPer100g);
      
      // Calculate grams needed to get proteinPerFood grams of protein
      const gramsNeeded = proteinPer100g > 0 ? (proteinPerFood / proteinPer100g) * 100 : 0;
      const recommendedOz = gramsNeeded / GRAMS_PER_OUNCE;
      
      return {
        food,
        recommendedOz,
        contributedProteinG: proteinPerFood,
        contributedCarbsG: (gramsNeeded / 100) * carbsPer100g,
        contributedFatG: (gramsNeeded / 100) * fatPer100g,
      };
    });

    // STEP 3: Calculate fat from carbs and proteins, then calculate remaining fat needed
    const fatFromCarbs = calculatedCarbFoods.reduce((sum, cf) => sum + cf.contributedFatG, 0);
    const fatFromProteins = calculatedProteinFoods.reduce((sum, pf) => sum + pf.contributedFatG, 0);
    const remainingFatNeeded = Math.max(0, targetFatG - fatFromCarbs - fatFromProteins);
    
    const fatPerFood = remainingFatNeeded / selectedFatFoods.length;
    const calculatedFatFoods: CalculatedFood[] = selectedFatFoods.map(food => {
      const fatPer100g = parseFloat(food.fatPer100g);
      const proteinPer100g = parseFloat(food.proteinPer100g);
      const carbsPer100g = parseFloat(food.carbsPer100g);
      
      // Calculate grams needed to get fatPerFood grams of fat
      const gramsNeeded = fatPer100g > 0 ? (fatPerFood / fatPer100g) * 100 : 0;
      const recommendedOz = gramsNeeded / GRAMS_PER_OUNCE;
      
      return {
        food,
        recommendedOz,
        contributedFatG: fatPerFood,
        contributedProteinG: (gramsNeeded / 100) * proteinPer100g,
        contributedCarbsG: (gramsNeeded / 100) * carbsPer100g,
      };
    });

      // Calculate totals
      console.log('Calculating totals...');
      const allFoods = [...calculatedCarbFoods, ...calculatedProteinFoods, ...calculatedFatFoods];
      const totalProtein = allFoods.reduce((sum, f) => sum + f.contributedProteinG, 0);
      const totalCarbs = allFoods.reduce((sum, f) => sum + f.contributedCarbsG, 0);
      const totalFat = allFoods.reduce((sum, f) => sum + f.contributedFatG, 0);
      const totalCalories = (totalProtein * 4) + (totalCarbs * 4) + (totalFat * 9);

      console.log('Setting calculation state...');
      const result = {
        carbFoods: calculatedCarbFoods,
        proteinFoods: calculatedProteinFoods,
        fatFoods: calculatedFatFoods,
        totalProtein,
        totalCarbs,
        totalFat,
        totalCalories,
      };
      console.log('Calculation result:', result);
      setCalculation(result);
      
      console.log('Calculation complete!');
      
      // Scroll to results after a brief delay to ensure render
      setTimeout(() => {
        const resultsElement = document.getElementById('calculation-results');
        if (resultsElement) {
          resultsElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    } catch (error) {
      console.error('ERROR during calculation:', error);
      alert('An error occurred during calculation: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  // Meal tabs
  const mealPlanType = profile?.mealPlanType || 'three_meals';
  const mealTabs = [
    { type: 'breakfast' as MealType, label: 'Breakfast', show: true },
    { type: 'lunch' as MealType, label: 'Lunch', show: true },
    { type: 'dinner' as MealType, label: 'Dinner', show: true },
    { type: 'snack' as MealType, label: 'Snack 1', show: mealPlanType !== 'three_meals' },
    { type: 'snack2' as MealType, label: 'Snack 2', show: mealPlanType === 'three_meals_two_snacks' },
  ];

  const toggleSelection = (id: string, category: 'carb' | 'protein' | 'fat') => {
    if (category === 'carb') {
      setSelectedCarbIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    } else if (category === 'protein') {
      setSelectedProteinIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    } else {
      setSelectedFatIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    }
    setCalculation(null); // Clear calculation when selection changes
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#52C878]/5 via-[#4A90E2]/5 to-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <Link href="/dashboard">
          <button className="flex items-center gap-2 text-[#2C3E50] hover:text-[#52C878] mb-6 transition-colors" data-testid="button-back">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-semibold">Back to Dashboard</span>
          </button>
        </Link>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-[#2C3E50] mb-2">Daily Meal Calculator</h1>
          <p className="text-gray-600">Select foods from each category and calculate recommended portions</p>
        </div>

        {/* Meal Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap justify-center">
          {mealTabs.filter(tab => tab.show).map(tab => (
            <button
              key={tab.type}
              onClick={() => {
                setActiveMeal(tab.type);
                setSelectedCarbIds([]);
                setSelectedProteinIds([]);
                setSelectedFatIds([]);
                setCalculation(null);
              }}
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

        {/* Daily Workout Selector */}
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Dumbbell className="w-7 h-7 text-[#52C878]" />
            <h2 className="text-2xl font-bold text-[#2C3E50]">Daily Fitness Routine</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Exercise Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Exercise Type</label>
              <select
                value={selectedExerciseId}
                onChange={(e) => setSelectedExerciseId(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#52C878] focus:outline-none transition-colors"
                data-testid="select-exercise-type"
              >
                <option value="">Select Exercise</option>
                {exerciseTypes.map(ex => (
                  <option key={ex.id} value={ex.id}>{ex.name}</option>
                ))}
              </select>
            </div>

            {/* Duration Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Duration (minutes)</label>
              <div className="grid grid-cols-4 gap-2">
                {DURATION_OPTIONS.map(duration => (
                  <button
                    key={duration}
                    onClick={() => setSelectedDuration(duration)}
                    className={`px-3 py-3 rounded-xl font-semibold transition-all ${
                      selectedDuration === duration
                        ? 'bg-[#52C878] text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    data-testid={`button-duration-${duration}`}
                  >
                    {duration}
                  </button>
                ))}
              </div>
            </div>

            {/* Calories Burned Display */}
            <div className="flex flex-col justify-between">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Calories Burned</label>
                <div className="text-center p-3 bg-gradient-to-br from-[#52C878]/10 to-[#4A90E2]/10 rounded-xl">
                  <p className="text-3xl font-bold text-[#2C3E50]" data-testid="text-exercise-calories">
                    {exerciseCalories}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">cal</p>
                </div>
              </div>
              <button
                onClick={handleWorkoutSave}
                disabled={!selectedExerciseId || !selectedDuration}
                className={`mt-2 px-4 py-2 rounded-xl font-semibold transition-all ${
                  selectedExerciseId && selectedDuration
                    ? 'bg-gradient-to-r from-[#52C878] to-[#4A90E2] text-white hover:shadow-lg'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
                data-testid="button-save-workout"
              >
                {saveExerciseMutation.isPending ? 'Saving...' : 'Save Workout'}
              </button>
            </div>
          </div>
        </div>

        {/* Macro Targets */}
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-xl p-6 mb-6">
          <h2 className="text-2xl font-bold text-[#2C3E50] mb-4">Macro Targets for {mealTabs.find(t => t.type === activeMeal)?.label}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gradient-to-br from-[#52C878]/10 to-[#4A90E2]/10 rounded-xl">
              <p className="text-sm text-gray-600 mb-1">Calories</p>
              <p className="text-3xl font-bold text-[#2C3E50]" data-testid="text-target-calories">{mealTargets.calories}</p>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-[#4A90E2]/10 to-[#52C878]/10 rounded-xl">
              <p className="text-sm text-gray-600 mb-1">Protein</p>
              <p className="text-3xl font-bold text-[#2C3E50]" data-testid="text-target-protein">{mealTargets.proteinG}g</p>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-[#52C878]/10 to-[#4A90E2]/10 rounded-xl">
              <p className="text-sm text-gray-600 mb-1">Carbs</p>
              <p className="text-3xl font-bold text-[#2C3E50]" data-testid="text-target-carbs">{mealTargets.carbsG}g</p>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-[#4A90E2]/10 to-[#52C878]/10 rounded-xl">
              <p className="text-sm text-gray-600 mb-1">Fat</p>
              <p className="text-3xl font-bold text-[#2C3E50]" data-testid="text-target-fat">{mealTargets.fatG}g</p>
            </div>
          </div>
        </div>

        {/* Food Selection */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Carbohydrate Sources */}
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-xl p-6">
            <h3 className="text-xl font-bold text-[#52C878] mb-4">Carbohydrate Sources</h3>
            <p className="text-sm text-gray-600 mb-4">Select one or more carb sources:</p>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {carbFoods.map(food => (
                <button
                  key={food.id}
                  onClick={() => toggleSelection(food.id, 'carb')}
                  className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                    selectedCarbIds.includes(food.id)
                      ? 'border-[#52C878] bg-[#52C878]/10'
                      : 'border-gray-200 hover:border-[#52C878]/50'
                  }`}
                  data-testid={`button-select-carb-${food.id}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-[#2C3E50]">{food.name}</span>
                    {selectedCarbIds.includes(food.id) && (
                      <Check className="w-5 h-5 text-[#52C878]" />
                    )}
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    C: {food.carbsPer100g}g • P: {food.proteinPer100g}g • F: {food.fatPer100g}g (per 100g)
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Protein Sources */}
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-xl p-6">
            <h3 className="text-xl font-bold text-[#4A90E2] mb-4">Protein Sources</h3>
            <p className="text-sm text-gray-600 mb-4">Select one or more protein sources:</p>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {proteinFoods.map(food => (
                <button
                  key={food.id}
                  onClick={() => toggleSelection(food.id, 'protein')}
                  className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                    selectedProteinIds.includes(food.id)
                      ? 'border-[#4A90E2] bg-[#4A90E2]/10'
                      : 'border-gray-200 hover:border-[#4A90E2]/50'
                  }`}
                  data-testid={`button-select-protein-${food.id}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-[#2C3E50]">{food.name}</span>
                    {selectedProteinIds.includes(food.id) && (
                      <Check className="w-5 h-5 text-[#4A90E2]" />
                    )}
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    P: {food.proteinPer100g}g • C: {food.carbsPer100g}g • F: {food.fatPer100g}g (per 100g)
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Fat Sources */}
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-xl p-6">
            <h3 className="text-xl font-bold text-[#52C878] mb-4">Fat Sources</h3>
            <p className="text-sm text-gray-600 mb-4">Select one or more fat sources:</p>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {fatFoods.map(food => (
                <button
                  key={food.id}
                  onClick={() => toggleSelection(food.id, 'fat')}
                  className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                    selectedFatIds.includes(food.id)
                      ? 'border-[#52C878] bg-[#52C878]/10'
                      : 'border-gray-200 hover:border-[#52C878]/50'
                  }`}
                  data-testid={`button-select-fat-${food.id}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-[#2C3E50]">{food.name}</span>
                    {selectedFatIds.includes(food.id) && (
                      <Check className="w-5 h-5 text-[#52C878]" />
                    )}
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    F: {food.fatPer100g}g • P: {food.proteinPer100g}g • C: {food.carbsPer100g}g (per 100g)
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Calculate Button */}
        <div className="text-center mb-6">
          <button
            onClick={calculateMeal}
            className="px-8 py-4 bg-gradient-to-r from-[#52C878] to-[#4A90E2] hover:from-[#52C878]/90 hover:to-[#4A90E2]/90 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all inline-flex items-center gap-2"
            data-testid="button-calculate"
          >
            <Calculator className="w-6 h-6" />
            Calculate Recommended Portions
          </button>
        </div>

        {/* Calculation Results */}
        {calculation && (
          <div id="calculation-results" className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-[#2C3E50] mb-6">Recommended Portions (in Ounces)</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              {/* Carbohydrate Results */}
              <div>
                <h3 className="text-lg font-bold text-[#52C878] mb-3">Carbohydrate Sources</h3>
                {calculation.carbFoods.map((cf, idx) => (
                  <div key={idx} className="mb-3 p-3 bg-[#52C878]/10 rounded-lg">
                    <p className="font-bold text-[#2C3E50]">{cf.food.name}</p>
                    <p className="text-2xl font-bold text-[#52C878]" data-testid={`text-carb-oz-${idx}`}>
                      {cf.recommendedOz.toFixed(2)} oz
                    </p>
                    <p className="text-xs text-gray-600">
                      C: {cf.contributedCarbsG.toFixed(1)}g • P: {cf.contributedProteinG.toFixed(1)}g • F: {cf.contributedFatG.toFixed(1)}g
                    </p>
                  </div>
                ))}
              </div>

              {/* Protein Results */}
              <div>
                <h3 className="text-lg font-bold text-[#4A90E2] mb-3">Protein Sources</h3>
                {calculation.proteinFoods.map((pf, idx) => (
                  <div key={idx} className="mb-3 p-3 bg-[#4A90E2]/10 rounded-lg">
                    <p className="font-bold text-[#2C3E50]">{pf.food.name}</p>
                    <p className="text-2xl font-bold text-[#4A90E2]" data-testid={`text-protein-oz-${idx}`}>
                      {pf.recommendedOz.toFixed(2)} oz
                    </p>
                    <p className="text-xs text-gray-600">
                      P: {pf.contributedProteinG.toFixed(1)}g • C: {pf.contributedCarbsG.toFixed(1)}g • F: {pf.contributedFatG.toFixed(1)}g
                    </p>
                  </div>
                ))}
              </div>

              {/* Fat Results */}
              <div>
                <h3 className="text-lg font-bold text-[#52C878] mb-3">Fat Sources</h3>
                {calculation.fatFoods.map((ff, idx) => (
                  <div key={idx} className="mb-3 p-3 bg-[#52C878]/10 rounded-lg">
                    <p className="font-bold text-[#2C3E50]">{ff.food.name}</p>
                    <p className="text-2xl font-bold text-[#52C878]" data-testid={`text-fat-oz-${idx}`}>
                      {ff.recommendedOz.toFixed(2)} oz
                    </p>
                    <p className="text-xs text-gray-600">
                      F: {ff.contributedFatG.toFixed(1)}g • P: {ff.contributedProteinG.toFixed(1)}g • C: {ff.contributedCarbsG.toFixed(1)}g
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Total Macros */}
            <div className="border-t-2 border-gray-200 pt-6">
              <h3 className="text-xl font-bold text-[#2C3E50] mb-4">Total Macronutrients</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-gradient-to-br from-[#52C878]/10 to-[#4A90E2]/10 rounded-xl">
                  <p className="text-sm text-gray-600 mb-1">Calories</p>
                  <p className="text-3xl font-bold text-[#2C3E50]" data-testid="text-total-calories">{Math.round(calculation.totalCalories)}</p>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-[#4A90E2]/10 to-[#52C878]/10 rounded-xl">
                  <p className="text-sm text-gray-600 mb-1">Protein</p>
                  <p className="text-3xl font-bold text-[#2C3E50]" data-testid="text-total-protein">{Math.round(calculation.totalProtein)}g</p>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-[#52C878]/10 to-[#4A90E2]/10 rounded-xl">
                  <p className="text-sm text-gray-600 mb-1">Carbs</p>
                  <p className="text-3xl font-bold text-[#2C3E50]" data-testid="text-total-carbs">{Math.round(calculation.totalCarbs)}g</p>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-[#4A90E2]/10 to-[#52C878]/10 rounded-xl">
                  <p className="text-sm text-gray-600 mb-1">Fat</p>
                  <p className="text-3xl font-bold text-[#2C3E50]" data-testid="text-total-fat">{Math.round(calculation.totalFat)}g</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
