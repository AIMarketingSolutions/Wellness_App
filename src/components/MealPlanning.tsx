import React, { useState, useEffect } from 'react';
import { Plus, Trash2, ShoppingCart, Target, Clock, Utensils } from 'lucide-react';
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
  is_completed: boolean;
  foods: MealFood[];
}

interface MealPlanningProps {
  userProfile: any;
  teeCalories: number;
  proteinPercentage: number;
  carbPercentage: number;
  fatPercentage: number;
}

function MealPlanning({ userProfile, teeCalories, proteinPercentage, carbPercentage, fatPercentage }: MealPlanningProps) {
  const [planType, setPlanType] = useState<'three_meals' | 'three_meals_one_snack' | 'three_meals_two_snacks'>('three_meals');
  const [meals, setMeals] = useState<Meal[]>([]);
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [selectedMeal, setSelectedMeal] = useState<string | null>(null);
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
    if (teeCalories > 0) {
      generateMealPlan();
    }
  }, [planType, teeCalories, proteinPercentage, carbPercentage, fatPercentage]);

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

  const generateMealPlan = () => {
    const minCalories = userProfile?.gender === 'male' ? 1500 : 1200;
    const dailyCalories = Math.max(teeCalories, minCalories);
    
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
          snack: 0.2 // This will be split between two snacks
        };
        break;
    }

    const newMeals: Meal[] = [];
    
    Object.entries(mealDistribution).forEach(([mealType, percentage]) => {
      if (mealType === 'snack' && planType === 'three_meals_two_snacks') {
        // Create two snacks for the two-snack plan
        for (let i = 1; i <= 2; i++) {
          const calories = Math.round(dailyCalories * (percentage / 2));
          const protein = Math.round((calories * proteinPercentage / 100) / 4);
          const carbs = Math.round((calories * carbPercentage / 100) / 4);
          const fat = Math.round((calories * fatPercentage / 100) / 9);

          newMeals.push({
            meal_type: 'snack',
            target_calories: calories,
            target_protein_g: protein,
            target_carbs_g: carbs,
            target_fat_g: fat,
            actual_calories: 0,
            actual_protein_g: 0,
            actual_carbs_g: 0,
            actual_fat_g: 0,
            is_completed: false,
            foods: []
          });
        }
      } else if (mealType !== 'snack' || planType !== 'three_meals_two_snacks') {
        const calories = Math.round(dailyCalories * percentage);
        const protein = Math.round((calories * proteinPercentage / 100) / 4);
        const carbs = Math.round((calories * carbPercentage / 100) / 4);
        const fat = Math.round((calories * fatPercentage / 100) / 9);

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
          is_completed: false,
          foods: []
        });
      }
    });

    setMeals(newMeals);
  };

  const addFoodToMeal = (mealIndex: number, foodItem: FoodItem, quantity: number) => {
    const calories = (foodItem.calories_per_100g * quantity) / 100;
    const protein = (foodItem.protein_per_100g * quantity) / 100;
    const carbs = (foodItem.carbs_per_100g * quantity) / 100;
    const fat = (foodItem.fat_per_100g * quantity) / 100;

    const newFood: MealFood = {
      food_item_id: foodItem.id,
      food_item: foodItem,
      quantity_g: quantity,
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

  const saveMealPlan = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      // Save meal plan
      const { data: mealPlan, error: planError } = await supabase
        .from('meal_plans')
        .insert({
          user_id: user.id,
          plan_type: planType,
          daily_calories: teeCalories,
          protein_percentage: proteinPercentage,
          carb_percentage: carbPercentage,
          fat_percentage: fatPercentage
        })
        .select()
        .single();

      if (planError) throw planError;

      // Save meals
      for (const meal of meals) {
        const { data: savedMeal, error: mealError } = await supabase
          .from('meals')
          .insert({
            user_id: user.id,
            meal_plan_id: mealPlan.id,
            meal_type: meal.meal_type,
            target_calories: meal.target_calories,
            target_protein_g: meal.target_protein_g,
            target_carbs_g: meal.target_carbs_g,
            target_fat_g: meal.target_fat_g,
            actual_calories: meal.actual_calories,
            actual_protein_g: meal.actual_protein_g,
            actual_carbs_g: meal.actual_carbs_g,
            actual_fat_g: meal.actual_fat_g,
            is_completed: meal.is_completed
          })
          .select()
          .single();

        if (mealError) throw mealError;

        // Save meal foods
        for (const food of meal.foods) {
          await supabase.from('meal_foods').insert({
            meal_id: savedMeal.id,
            food_item_id: food.food_item_id,
            quantity_g: food.quantity_g,
            calories: food.calories,
            protein_g: food.protein_g,
            carbs_g: food.carbs_g,
            fat_g: food.fat_g
          });
        }
      }

      alert('Meal plan saved successfully!');
    } catch (error) {
      console.error('Error saving meal plan:', error);
      alert('Error saving meal plan. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getTotalActuals = () => {
    return meals.reduce((totals, meal) => ({
      calories: totals.calories + meal.actual_calories,
      protein: totals.protein + meal.actual_protein_g,
      carbs: totals.carbs + meal.actual_carbs_g,
      fat: totals.fat + meal.actual_fat_g
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
  };

  const getMealTypeLabel = (mealType: string, index: number) => {
    if (mealType === 'snack' && planType === 'three_meals_two_snacks') {
      return `Snack ${index === meals.findIndex(m => m.meal_type === 'snack') ? '1' : '2'}`;
    }
    return mealType.charAt(0).toUpperCase() + mealType.slice(1);
  };

  const totals = getTotalActuals();

  return (
    <div className="space-y-6">
      {/* Plan Type Selection */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Meal Plan Type</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { value: 'three_meals', label: '3 Meals', description: 'Breakfast, Lunch, Dinner (33.33% each)' },
            { value: 'three_meals_one_snack', label: '3 Meals + 1 Snack', description: '3 meals (30% each) + 1 snack (10%)' },
            { value: 'three_meals_two_snacks', label: '3 Meals + 2 Snacks', description: '3 meals (26.67% each) + 2 snacks (10% each)' }
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => setPlanType(option.value as any)}
              className={`p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                planType === option.value
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-300'
              }`}
            >
              <h4 className="font-semibold text-gray-800">{option.label}</h4>
              <p className="text-sm text-gray-600 mt-1">{option.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Daily Totals */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Daily Targets vs Actual</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-sm text-gray-600">Calories</p>
            <p className="text-2xl font-bold text-gray-800">{Math.round(totals.calories)}</p>
            <p className="text-sm text-blue-600">/ {teeCalories}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Protein (g)</p>
            <p className="text-2xl font-bold text-green-600">{Math.round(totals.protein)}</p>
            <p className="text-sm text-green-500">/ {Math.round((teeCalories * proteinPercentage / 100) / 4)}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Carbs (g)</p>
            <p className="text-2xl font-bold text-yellow-600">{Math.round(totals.carbs)}</p>
            <p className="text-sm text-yellow-500">/ {Math.round((teeCalories * carbPercentage / 100) / 4)}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Fat (g)</p>
            <p className="text-2xl font-bold text-purple-600">{Math.round(totals.fat)}</p>
            <p className="text-sm text-purple-500">/ {Math.round((teeCalories * fatPercentage / 100) / 9)}</p>
          </div>
        </div>
      </div>

      {/* Meals */}
      <div className="space-y-4">
        {meals.map((meal, mealIndex) => (
          <div key={mealIndex} className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <Utensils className="w-5 h-5" />
                {getMealTypeLabel(meal.meal_type, mealIndex)}
              </h3>
              <button
                onClick={() => {
                  setSelectedMeal(mealIndex.toString());
                  setShowFoodSelector(true);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                <Plus className="w-4 h-4" />
                Add Food
              </button>
            </div>

            {/* Meal Targets */}
            <div className="grid grid-cols-4 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
              <div className="text-center">
                <p className="text-xs text-gray-600">Target Calories</p>
                <p className="font-semibold text-gray-800">{meal.target_calories}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-600">Protein (g)</p>
                <p className="font-semibold text-green-600">{meal.target_protein_g}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-600">Carbs (g)</p>
                <p className="font-semibold text-yellow-600">{meal.target_carbs_g}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-600">Fat (g)</p>
                <p className="font-semibold text-purple-600">{meal.target_fat_g}</p>
              </div>
            </div>

            {/* Foods in Meal */}
            <div className="space-y-2">
              {meal.foods.map((food, foodIndex) => (
                <div key={foodIndex} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">{food.food_item?.name}</p>
                    <p className="text-sm text-gray-600">{food.quantity_g}g</p>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span>{Math.round(food.calories)} cal</span>
                    <span className="text-green-600">{Math.round(food.protein_g)}p</span>
                    <span className="text-yellow-600">{Math.round(food.carbs_g)}c</span>
                    <span className="text-purple-600">{Math.round(food.fat_g)}f</span>
                    <button
                      onClick={() => removeFoodFromMeal(mealIndex, foodIndex)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Meal Actuals */}
            <div className="grid grid-cols-4 gap-4 mt-4 p-4 bg-blue-50 rounded-lg">
              <div className="text-center">
                <p className="text-xs text-gray-600">Actual Calories</p>
                <p className="font-semibold text-gray-800">{Math.round(meal.actual_calories)}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-600">Protein (g)</p>
                <p className="font-semibold text-green-600">{Math.round(meal.actual_protein_g)}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-600">Carbs (g)</p>
                <p className="font-semibold text-yellow-600">{Math.round(meal.actual_carbs_g)}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-600">Fat (g)</p>
                <p className="font-semibold text-purple-600">{Math.round(meal.actual_fat_g)}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Save Button */}
      <div className="flex justify-center">
        <button
          onClick={saveMealPlan}
          disabled={loading}
          className="px-8 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Saving...' : 'Save Meal Plan'}
        </button>
      </div>

      {/* Food Selector Modal */}
      {showFoodSelector && selectedMeal !== null && (
        <FoodSelectorModal
          foodItems={foodItems}
          onAddFood={(foodItem, quantity) => addFoodToMeal(parseInt(selectedMeal), foodItem, quantity)}
          onClose={() => {
            setShowFoodSelector(false);
            setSelectedMeal(null);
          }}
        />
      )}
    </div>
  );
}

interface FoodSelectorModalProps {
  foodItems: FoodItem[];
  onAddFood: (foodItem: FoodItem, quantity: number) => void;
  onClose: () => void;
}

function FoodSelectorModal({ foodItems, onAddFood, onClose }: FoodSelectorModalProps) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
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
      <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-800">Add Food to Meal</h3>
        </div>
        
        <div className="p-6 space-y-4">
          {/* Search and Filter */}
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="Search foods..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
              {filteredFoods.map(food => (
                <button
                  key={food.id}
                  onClick={() => setSelectedFood(food)}
                  className={`w-full text-left p-3 rounded-lg border transition-all duration-200 ${
                    selectedFood?.id === food.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300'
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

            {/* Food Details and Quantity */}
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    min="1"
                  />
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
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            Add Food
          </button>
        </div>
      </div>
    </div>
  );
}

export default MealPlanning;