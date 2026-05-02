import { useState, useMemo, useEffect, Fragment } from "react";
import { useAuth } from "@/lib/auth";
import { Link } from "wouter";
import { ArrowLeft, BarChart2, Calculator, Check, Droplet, Plus, Minus, Printer } from "lucide-react";
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

export default function MealPlanner() {
  const { user } = useAuth();
  const [activeMeal, setActiveMeal] = useState<MealType>('breakfast');
  const [selectedCarbIds, setSelectedCarbIds] = useState<string[]>([]);
  const [selectedProteinIds, setSelectedProteinIds] = useState<string[]>([]);
  const [selectedFatIds, setSelectedFatIds] = useState<string[]>([]);
  const [calculation, setCalculation] = useState<MealCalculation | null>(null);

  const getLocalDateString = () => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const getMealSummaryKey = (userId: string, dateStr: string) =>
    `mealSummaries_${userId}_${dateStr}`;

  const loadSummariesForDate = (userId: string, dateStr: string): Partial<Record<MealType, MealCalculation>> => {
    try {
      const stored = localStorage.getItem(getMealSummaryKey(userId, dateStr));
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  };

  const [currentDay, setCurrentDay] = useState<string>(() => getLocalDateString());
  const [mealSummaries, setMealSummaries] = useState<Partial<Record<MealType, MealCalculation>>>({});

  // Load persisted summaries once user ID is known (auth query resolves async)
  useEffect(() => {
    if (!user?.id) return;
    setMealSummaries(loadSummariesForDate(user.id, currentDay));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // Check every minute for day rollover; reset state for the new day when it occurs
  useEffect(() => {
    if (!user?.id) return;
    const checkDayRollover = () => {
      const today = getLocalDateString();
      if (today !== currentDay) {
        setCurrentDay(today);
        setMealSummaries(loadSummariesForDate(user.id!, today));
        setCalculation(null);
        setSelectedCarbIds([]);
        setSelectedProteinIds([]);
        setSelectedFatIds([]);
        setActiveMeal('breakfast');
      }
    };
    const interval = setInterval(checkDayRollover, 60_000);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, currentDay]);

  // Persist summaries to localStorage whenever they change
  useEffect(() => {
    if (!user?.id) return;
    try {
      localStorage.setItem(getMealSummaryKey(user.id, currentDay), JSON.stringify(mealSummaries));
    } catch {
      // ignore storage errors
    }
  }, [mealSummaries, currentDay, user?.id]);

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

  // Fetch today's water intake
  const today = new Date().toISOString().split('T')[0];
  const { data: waterIntake } = useQuery<WaterIntake | null>({
    queryKey: [`/api/water-intake/${today}`],
  });

  // Water intake mutation
  const updateWaterMutation = useMutation({
    mutationFn: async (newGlasses: number) => {
      if (waterIntake?.id) {
        return await apiRequest(`/api/water-intake/${waterIntake.id}`, {
          method: "PATCH",
          body: JSON.stringify({ glassesConsumed: newGlasses }),
        });
      } else {
        return await apiRequest("/api/water-intake", {
          method: "POST",
          body: JSON.stringify({ intakeDate: today, glassesConsumed: newGlasses }),
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/water-intake/${today}`] });
    },
  });

  // Water intake helpers (1 glass = 8 oz)
  const currentGlasses = waterIntake?.glassesConsumed || 0;
  const targetGlasses = waterIntake?.targetGlasses || 8;
  const currentWaterOz = currentGlasses * 8;
  const targetWaterOz = targetGlasses * 8;
  
  const addGlasses = (glassesToAdd: number) => {
    const newGlasses = Math.max(0, currentGlasses + glassesToAdd);
    updateWaterMutation.mutate(newGlasses);
  };

  // Calculate calories burned from today's exercise
  const exerciseCalories = useMemo(() => {
    if (!todayExercise) return 0;
    return parseInt(todayExercise.caloriesBurned);
  }, [todayExercise]);

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
        contributedCarbsG: (gramsNeeded / 100) * carbsPer100g,
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
        contributedProteinG: (gramsNeeded / 100) * proteinPer100g,
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
        contributedFatG: (gramsNeeded / 100) * fatPer100g,
        contributedProteinG: (gramsNeeded / 100) * proteinPer100g,
        contributedCarbsG: (gramsNeeded / 100) * carbsPer100g,
      };
    });

      // Calculate totals before validation
      console.log('Calculating totals...');
      const allFoods = [...calculatedCarbFoods, ...calculatedProteinFoods, ...calculatedFatFoods];
      let totalProtein = allFoods.reduce((sum, f) => sum + f.contributedProteinG, 0);
      let totalCarbs = allFoods.reduce((sum, f) => sum + f.contributedCarbsG, 0);
      let totalFat = allFoods.reduce((sum, f) => sum + f.contributedFatG, 0);

      // VALIDATION & ADJUSTMENT: Check if any macronutrient exceeds recommended amount
      console.log('Before adjustment:', { totalCarbs, totalProtein, totalFat, targetCarbsG, targetProteinG, targetFatG });
      
      // Check each macronutrient and adjust if over target
      if (totalCarbs > targetCarbsG) {
        totalCarbs = targetCarbsG;
      }
      
      if (totalProtein > targetProteinG) {
        totalProtein = targetProteinG;
      }
      
      if (totalFat > targetFatG) {
        totalFat = targetFatG;
      }

      console.log('After adjustment:', { totalCarbs, totalProtein, totalFat });
      
      const totalCalories = (totalProtein * 4) + (totalCarbs * 4) + (totalFat * 9);

      console.log('Setting calculation state...');
      const result = {
        carbFoods: calculatedCarbFoods,
        proteinFoods: calculatedProteinFoods,
        fatFoods: calculatedFatFoods,
        totalProtein: Math.round(totalProtein),
        totalCarbs: Math.round(totalCarbs),
        totalFat: Math.round(totalFat),
        totalCalories: Math.round(totalCalories),
      };
      console.log('Calculation result:', result);
      setCalculation(result);
      
      console.log('Calculation complete!');
      setMealSummaries(prev => ({ ...prev, [activeMeal]: result }));

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

  // Full-day macro goal: sum per-meal allocations for each visible tab
  // (uses the same distribution logic as mealTargets to stay consistent)
  const dailyGoal = useMemo(() => {
    if (!profile) return { calories: 0, proteinG: 0, carbsG: 0, fatG: 0 };

    let proteinPercent = 30, carbPercent = 30, fatPercent = 40;
    if (profile.metabolicProfile === "fast_oxidizer") { proteinPercent = 25; carbPercent = 35; fatPercent = 40; }
    else if (profile.metabolicProfile === "slow_oxidizer") { proteinPercent = 35; carbPercent = 25; fatPercent = 40; }
    else if (profile.metabolicProfile === "medium_oxidizer") { proteinPercent = 30; carbPercent = 30; fatPercent = 40; }
    else if (profile.customProteinPercentage && profile.customCarbPercentage && profile.customFatPercentage) {
      proteinPercent = parseFloat(profile.customProteinPercentage);
      carbPercent = parseFloat(profile.customCarbPercentage);
      fatPercent = parseFloat(profile.customFatPercentage);
    }

    const age = profile.age || 0;
    const weight = parseFloat(profile.weightKg || "0");
    const height = parseFloat(profile.heightCm || "0");
    const gender = profile.gender || "male";
    let bmr = gender === "male"
      ? 66.5 + (13.75 * weight) + (5.003 * height) - (6.755 * age)
      : 655.1 + (9.563 * weight) + (1.850 * height) - (4.676 * age);

    const activityMultipliers: Record<string, number> = { sedentary: 1.2, lightly_active: 1.375, moderately_active: 1.55, very_active: 1.725, extremely_active: 1.9 };
    const tee = bmr * (activityMultipliers[profile.activityLevel || "moderately_active"] || 1.55);
    const deficits: Record<string, number> = { maintain: 0, lose_0_5: 250, lose_1: 500, lose_1_5: 750, lose_2: 1000 };
    const deficit = deficits[profile.weightLossGoal || "maintain"] || 0;
    const minCalories = gender === "male" ? 1500 : 1200;
    const dct = Math.max(tee - deficit, minCalories) + exerciseCalories;

    // Compute per-meal calorie allocations for each visible tab (same logic as mealTargets)
    const planType = profile.mealPlanType || 'three_meals';
    const getMealCal = (mealType: MealType): number => {
      if (planType === 'three_meals') {
        return (mealType === 'breakfast' || mealType === 'lunch' || mealType === 'dinner') ? dct * (100 / 3 / 100) : 0;
      } else if (planType === 'three_meals_one_snack') {
        if (mealType === 'breakfast' || mealType === 'lunch' || mealType === 'dinner') return dct * 0.3;
        if (mealType === 'snack') return dct * 0.1;
      } else if (planType === 'three_meals_two_snacks') {
        if (mealType === 'breakfast' || mealType === 'lunch' || mealType === 'dinner') return dct * (80 / 3 / 100);
        if (mealType === 'snack' || mealType === 'snack2') return dct * 0.1;
      }
      return 0;
    };

    const visibleTabTypes: MealType[] = ['breakfast', 'lunch', 'dinner'];
    if (planType !== 'three_meals') visibleTabTypes.push('snack');
    if (planType === 'three_meals_two_snacks') visibleTabTypes.push('snack2');

    const totalCal = visibleTabTypes.reduce((sum, t) => sum + getMealCal(t), 0);
    const proteinG = (totalCal * (proteinPercent / 100)) / 4;
    const carbsG = (totalCal * (carbPercent / 100)) / 4;
    const fatG = (totalCal * (fatPercent / 100)) / 9;

    return { calories: Math.round(totalCal), proteinG: Math.round(proteinG), carbsG: Math.round(carbsG), fatG: Math.round(fatG) };
  }, [profile, exerciseCalories]);

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
          <h1 className="text-4xl font-bold text-[#2C3E50] mb-2">Smart Meal Planning</h1>
          <p className="text-sm text-gray-500 italic mb-2">Plan today's meals, calorie target, workouts, and water intake in one place.</p>
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

        {/* Calorie Breakdown */}
        {profile && (
          <div className="bg-gradient-to-br from-blue-50/80 to-indigo-50/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 mb-6 border border-blue-100">
            <div className="flex items-center gap-3 mb-4">
              <Calculator className="w-6 h-6 text-blue-600" />
              <h2 className="text-2xl font-bold text-[#2C3E50]">Calorie Breakdown</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Total Daily Calories (TEE) */}
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <p className="text-xs text-gray-600 mb-1">Total Daily Calories (TEE)</p>
                <p className="text-3xl font-bold text-[#2C3E50]" data-testid="text-tee">
                  {(() => {
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
                    const multiplier = activityMultipliers[activityLevel as keyof typeof activityMultipliers] || 1.55;
                    const tee = bmr * multiplier;
                    return Math.round(tee);
                  })()}
                </p>
                <p className="text-xs text-gray-500 mt-1">Base metabolism + activity</p>
              </div>

              {/* Weight Loss Goal */}
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <p className="text-xs text-gray-600 mb-1">Weight Loss Goal</p>
                <p className="text-lg font-bold text-orange-600" data-testid="text-weight-loss-goal">
                  {(() => {
                    const weightLossGoalLabels = {
                      maintain: 'Maintain',
                      lose_0_5: 'Lose 0.5 lb/week (-250 cal/day)',
                      lose_1: 'Lose 1 lb/week (-500 cal/day)',
                      lose_1_5: 'Lose 1.5 lb/week (-750 cal/day)',
                      lose_2: 'Lose 2 lb/week (-1000 cal/day)',
                    };
                    return profile.weightLossGoal ? weightLossGoalLabels[profile.weightLossGoal as keyof typeof weightLossGoalLabels] : "Not set";
                  })()}
                </p>
              </div>

              {/* Daily Fitness Routine */}
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <p className="text-xs text-gray-600 mb-1">Daily Fitness Routine</p>
                {todayExercise ? (
                  <>
                    <p className="text-sm font-bold text-[#52C878]" data-testid="text-today-exercise">
                      {exerciseTypes.find(e => e.id === todayExercise.exerciseTypeId)?.name || "Exercise"}
                    </p>
                    <p className="text-xs text-gray-600">
                      {todayExercise.durationMinutes} min • <span className="text-[#52C878] font-semibold">{exerciseCalories} cal</span>
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-gray-500">No workout selected</p>
                )}
              </div>

              {/* Daily Calorie Target */}
              <div className="bg-gradient-to-br from-[#52C878]/20 to-[#4A90E2]/20 rounded-xl p-4 shadow-sm border-2 border-[#52C878]/50">
                <p className="text-xs text-gray-700 mb-1 font-semibold">Daily Calorie Target</p>
                <p className="text-3xl font-bold text-[#52C878]" data-testid="text-dct-display">
                  {(() => {
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
                    const multiplier = activityMultipliers[activityLevel as keyof typeof activityMultipliers] || 1.55;
                    const tee = bmr * multiplier;

                    const deficits = {
                      maintain: 0,
                      lose_0_5: 250,
                      lose_1: 500,
                      lose_1_5: 750,
                      lose_2: 1000,
                    };
                    const deficit = deficits[profile.weightLossGoal as keyof typeof deficits] || 0;
                    const minimumCalories = gender === 'male' ? 1500 : 1200;
                    const baseDct = Math.max(tee - deficit, minimumCalories);
                    const dct = baseDct + exerciseCalories;
                    return Math.round(dct);
                  })()}
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  {exerciseCalories > 0 ? `Base ${(() => {
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
                    const multiplier = activityMultipliers[activityLevel as keyof typeof activityMultipliers] || 1.55;
                    const tee = bmr * multiplier;
                    const deficits = {
                      maintain: 0,
                      lose_0_5: 250,
                      lose_1: 500,
                      lose_1_5: 750,
                      lose_2: 1000,
                    };
                    const deficit = deficits[profile.weightLossGoal as keyof typeof deficits] || 0;
                    const minimumCalories = gender === 'male' ? 1500 : 1200;
                    return Math.round(Math.max(tee - deficit, minimumCalories));
                  })()} + Exercise ${exerciseCalories}` : 'No exercise added'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Hydration Tracker */}
        <div className="bg-gradient-to-br from-blue-50/80 to-cyan-50/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 mb-6 border border-blue-100">
          <div className="flex items-center gap-3 mb-4">
            <Droplet className="w-6 h-6 text-blue-500" />
            <h2 className="text-2xl font-bold text-[#2C3E50]">Hydration Tracker</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            {/* Progress */}
            <div className="md:col-span-2">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Today's water intake</span>
                <span className="font-semibold text-blue-600">{currentGlasses} / {targetGlasses} glasses ({currentWaterOz} oz)</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-blue-400 to-cyan-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (currentGlasses / targetGlasses) * 100)}%` }}
                  data-testid="progress-water"
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Target: {targetGlasses} glasses per day (1 glass = 8 oz)
              </p>
            </div>
            
            {/* Quick Add Buttons */}
            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                <button
                  onClick={() => addGlasses(1)}
                  disabled={updateWaterMutation.isPending}
                  className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                  data-testid="button-add-1glass"
                >
                  <Plus className="w-4 h-4" />
                  1 Glass
                </button>
                <button
                  onClick={() => addGlasses(2)}
                  disabled={updateWaterMutation.isPending}
                  className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                  data-testid="button-add-2glasses"
                >
                  <Plus className="w-4 h-4" />
                  2 Glasses
                </button>
              </div>
              <button
                onClick={() => addGlasses(-1)}
                disabled={updateWaterMutation.isPending || currentGlasses === 0}
                className="flex items-center justify-center gap-1 px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors disabled:opacity-50"
                data-testid="button-remove-1glass"
              >
                <Minus className="w-4 h-4" />
                Remove 1 Glass
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
          <div id="calculation-results" className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-xl p-8 mb-6">
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

        {/* Daily Meal Summary Chart */}
        {Object.keys(mealSummaries).length > 0 && (
          <div id="daily-meal-summary-print" className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-xl p-8 mb-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <BarChart2 className="w-6 h-6 text-[#4A90E2]" />
                <h2 className="text-2xl font-bold text-[#2C3E50]">Daily Meal Summary</h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 text-sm bg-[#4A90E2] hover:bg-[#4A90E2]/90 text-white rounded-lg transition-colors inline-flex items-center gap-1.5"
                  data-testid="button-print-summary"
                >
                  <Printer className="w-4 h-4" />
                  Print / Export PDF
                </button>
                <button
                  onClick={() => setMealSummaries({})}
                  className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg transition-colors"
                  data-testid="button-clear-summary"
                >
                  Clear Summary
                </button>
              </div>
            </div>

            <div className="overflow-x-auto" data-testid="table-daily-summary">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gradient-to-r from-[#2C3E50] to-[#4A90E2] text-white">
                    <th className="text-left py-3 px-4 rounded-tl-lg font-semibold">Meal</th>
                    <th className="text-center py-3 px-4 font-semibold">Calories<br /><span className="text-xs font-normal opacity-80">kcal</span></th>
                    <th className="text-center py-3 px-4 font-semibold">Protein<br /><span className="text-xs font-normal opacity-80">g</span></th>
                    <th className="text-center py-3 px-4 font-semibold">Carbs<br /><span className="text-xs font-normal opacity-80">g</span></th>
                    <th className="text-center py-3 px-4 rounded-tr-lg font-semibold">Fat<br /><span className="text-xs font-normal opacity-80">g</span></th>
                  </tr>
                </thead>
                <tbody>
                  {mealTabs.filter(tab => tab.show).map((tab, idx) => {
                    const summary = mealSummaries[tab.type];
                    if (!summary) {
                      return (
                        <tr key={tab.type} className={idx % 2 === 0 ? 'bg-white/50' : 'bg-gray-50/50'}>
                          <td className="py-3 px-4 font-semibold text-[#2C3E50]">{tab.label}</td>
                          <td className="py-3 px-4 text-center"><span className="text-gray-300">—</span></td>
                          <td className="py-3 px-4 text-center"><span className="text-gray-300">—</span></td>
                          <td className="py-3 px-4 text-center"><span className="text-gray-300">—</span></td>
                          <td className="py-3 px-4 text-center"><span className="text-gray-300">—</span></td>
                        </tr>
                      );
                    }
                    const allFoods = [...summary.carbFoods, ...summary.proteinFoods, ...summary.fatFoods];
                    return (
                      <Fragment key={tab.type}>
                        <tr className="bg-gradient-to-r from-[#2C3E50]/10 to-[#4A90E2]/10 border-t border-gray-200">
                          <td colSpan={5} className="py-2 px-4 font-bold text-[#2C3E50] text-sm uppercase tracking-wide">{tab.label}</td>
                        </tr>
                        {allFoods.map((cf, foodIdx) => {
                          const foodCal = Math.round(cf.contributedProteinG * 4 + cf.contributedCarbsG * 4 + cf.contributedFatG * 9);
                          return (
                            <tr key={`${tab.type}-food-${foodIdx}`} className={foodIdx % 2 === 0 ? 'bg-white/40' : 'bg-gray-50/40'}>
                              <td className="py-2 px-4 pl-8 text-gray-700">
                                {cf.food.name}
                                <span className="text-xs text-gray-400 ml-2">— {cf.recommendedOz.toFixed(2)} oz</span>
                              </td>
                              <td className="py-2 px-4 text-center text-gray-600">{foodCal}</td>
                              <td className="py-2 px-4 text-center text-gray-600">{cf.contributedProteinG.toFixed(1)}g</td>
                              <td className="py-2 px-4 text-center text-gray-600">{cf.contributedCarbsG.toFixed(1)}g</td>
                              <td className="py-2 px-4 text-center text-gray-600">{cf.contributedFatG.toFixed(1)}g</td>
                            </tr>
                          );
                        })}
                        <tr key={`${tab.type}-subtotal`} className="bg-[#52C878]/10 border-t border-[#52C878]/20">
                          <td className="py-2 px-4 pl-8 font-bold text-[#2C3E50] text-sm">{tab.label} Total</td>
                          <td className="py-2 px-4 text-center font-bold text-[#2C3E50]">{summary.totalCalories}</td>
                          <td className="py-2 px-4 text-center font-bold text-[#2C3E50]">{summary.totalProtein}g</td>
                          <td className="py-2 px-4 text-center font-bold text-[#2C3E50]">{summary.totalCarbs}g</td>
                          <td className="py-2 px-4 text-center font-bold text-[#2C3E50]">{summary.totalFat}g</td>
                        </tr>
                      </Fragment>
                    );
                  })}

                  {/* Totals, Goal, Remaining rows — only include visible tabs */}
                  {(() => {
                    const visibleTypes = mealTabs.filter(tab => tab.show).map(tab => tab.type);
                    const totals = visibleTypes.reduce(
                      (acc, t) => {
                        const m = mealSummaries[t];
                        return { cal: acc.cal + (m?.totalCalories || 0), pro: acc.pro + (m?.totalProtein || 0), carb: acc.carb + (m?.totalCarbs || 0), fat: acc.fat + (m?.totalFat || 0) };
                      },
                      { cal: 0, pro: 0, carb: 0, fat: 0 }
                    );
                    const remaining = { cal: dailyGoal.calories - totals.cal, pro: dailyGoal.proteinG - totals.pro, carb: dailyGoal.carbsG - totals.carb, fat: dailyGoal.fatG - totals.fat };
                    const remColor = (v: number) => v >= 0 ? 'text-[#52C878] font-bold' : 'text-red-500 font-bold';
                    return (
                      <>
                        <tr className="border-t-2 border-gray-200 bg-[#2C3E50]/5">
                          <td className="py-3 px-4 font-bold text-[#2C3E50]">Totals</td>
                          <td className="py-3 px-4 text-center font-bold text-[#2C3E50]" data-testid="text-summary-totals-calories">{totals.cal}</td>
                          <td className="py-3 px-4 text-center font-bold text-[#2C3E50]" data-testid="text-summary-totals-protein">{totals.pro}g</td>
                          <td className="py-3 px-4 text-center font-bold text-[#2C3E50]" data-testid="text-summary-totals-carbs">{totals.carb}g</td>
                          <td className="py-3 px-4 text-center font-bold text-[#2C3E50]" data-testid="text-summary-totals-fat">{totals.fat}g</td>
                        </tr>
                        <tr className="bg-[#4A90E2]/5">
                          <td className="py-3 px-4 font-semibold text-[#4A90E2]">Your Daily Goal</td>
                          <td className="py-3 px-4 text-center text-[#4A90E2] font-semibold" data-testid="text-summary-goal-calories">{dailyGoal.calories}</td>
                          <td className="py-3 px-4 text-center text-[#4A90E2] font-semibold" data-testid="text-summary-goal-protein">{dailyGoal.proteinG}g</td>
                          <td className="py-3 px-4 text-center text-[#4A90E2] font-semibold" data-testid="text-summary-goal-carbs">{dailyGoal.carbsG}g</td>
                          <td className="py-3 px-4 text-center text-[#4A90E2] font-semibold" data-testid="text-summary-goal-fat">{dailyGoal.fatG}g</td>
                        </tr>
                        <tr className="bg-white/80 rounded-b-lg">
                          <td className="py-3 px-4 font-semibold text-[#2C3E50]">Remaining</td>
                          <td className={`py-3 px-4 text-center ${remColor(remaining.cal)}`} data-testid="text-summary-remaining-calories">{remaining.cal}</td>
                          <td className={`py-3 px-4 text-center ${remColor(remaining.pro)}`} data-testid="text-summary-remaining-protein">{remaining.pro}g</td>
                          <td className={`py-3 px-4 text-center ${remColor(remaining.carb)}`} data-testid="text-summary-remaining-carbs">{remaining.carb}g</td>
                          <td className={`py-3 px-4 text-center ${remColor(remaining.fat)}`} data-testid="text-summary-remaining-fat">{remaining.fat}g</td>
                        </tr>
                      </>
                    );
                  })()}
                </tbody>
              </table>
            </div>

            <p className="text-xs text-gray-500 mt-3 text-center">
              Summary updates each time you calculate a meal. Switch between meal tabs and calculate each one to build your full day.
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
