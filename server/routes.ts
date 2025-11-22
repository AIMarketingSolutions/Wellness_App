import { Router } from "express";
import { storage } from "./storage";
import { hashPassword, verifyPassword, requireAuth, requireAdmin } from "./auth";
import * as schema from "@shared/schema";

const router = Router();

// Auth routes
router.post("/api/auth/signup", async (req, res) => {
  try {
    const { email, password, fullName } = req.body;

    const existingUser = await storage.getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    const passwordHash = await hashPassword(password);
    const user = await storage.createUser({ email, passwordHash, fullName });

    // Create user profile
    await storage.createUserProfile({ userId: user.id });

    req.session.userId = user.id;
    
    // Save session before responding
    req.session.save((err) => {
      if (err) {
        console.error("Session save error:", err);
      }
      res.json({ 
        id: user.id, 
        email: user.email, 
        fullName: user.fullName,
        token: user.id 
      });
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/api/auth/signin", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await storage.getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Set both session and return user ID for token-based auth
    req.session.userId = user.id;
    req.session.save((err) => {
      if (err) {
        console.error("Session save error:", err);
      }
      // Return user data with ID that frontend can use as token
      res.json({ 
        id: user.id, 
        email: user.email, 
        fullName: user.fullName,
        token: user.id // Use user ID as token for now
      });
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/api/auth/signout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: "Failed to sign out" });
    }
    res.json({ message: "Signed out successfully" });
  });
});

router.get("/api/auth/me", requireAuth, async (req, res) => {
  try {
    const user = await storage.getUser(req.userId!);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({ id: user.id, email: user.email, fullName: user.fullName });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// User Profile routes
router.get("/api/profile", requireAuth, async (req, res) => {
  try {
    const profile = await storage.getUserProfile(req.userId!);
    res.json(profile);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/api/profile", requireAuth, async (req, res) => {
  try {
    const validated = schema.insertUserProfileSchema.parse({ ...req.body, userId: req.userId });
    const profile = await storage.createUserProfile(validated);
    res.json(profile);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.patch("/api/profile", requireAuth, async (req, res) => {
  try {
    // Parse and validate the data, but make all fields optional for PATCH
    const validated = schema.insertUserProfileSchema.partial().parse(req.body);
    const profile = await storage.updateUserProfile(req.userId!, validated);
    res.json(profile);
  } catch (error: any) {
    console.error("Profile update error:", error);
    res.status(500).json({ error: error.message });
  }
});

// TEE Calculation routes
router.get("/api/tee", requireAuth, async (req, res) => {
  try {
    const calculations = await storage.getTEECalculations(req.userId!);
    res.json(calculations);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/api/tee", requireAuth, async (req, res) => {
  try {
    const validated = schema.insertTEECalculationSchema.parse({ ...req.body, userId: req.userId });
    const calc = await storage.createTEECalculation(validated);
    res.json(calc);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Body Fat Calculation routes
router.get("/api/bodyfat", requireAuth, async (req, res) => {
  try {
    const calculations = await storage.getBodyFatCalculations(req.userId!);
    res.json(calculations);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/api/bodyfat", requireAuth, async (req, res) => {
  try {
    const validated = schema.insertBodyFatCalculationSchema.parse({ ...req.body, userId: req.userId });
    const calc = await storage.createBodyFatCalculation(validated);
    res.json(calc);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Food Items routes
router.get("/api/food-items", requireAuth, async (req, res) => {
  try {
    const foods = await storage.getFoodItems();
    res.json(foods);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/api/food-items", requireAuth, async (req, res) => {
  try {
    const validated = schema.insertFoodItemSchema.parse({ ...req.body, createdBy: req.userId });
    const food = await storage.createFoodItem(validated);
    res.json(food);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Meal Plan routes
router.get("/api/meal-plans", requireAuth, async (req, res) => {
  try {
    const plans = await storage.getMealPlans(req.userId!);
    res.json(plans);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/api/meal-plans/:date", requireAuth, async (req, res) => {
  try {
    const plan = await storage.getMealPlanByDate(req.userId!, req.params.date);
    res.json(plan);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/api/meal-plans", requireAuth, async (req, res) => {
  try {
    const validated = schema.insertMealPlanSchema.parse({ ...req.body, userId: req.userId });
    const plan = await storage.createMealPlan(validated);
    res.json(plan);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Meal routes
router.get("/api/meals/:mealPlanId", requireAuth, async (req, res) => {
  try {
    const meals = await storage.getMeals(req.params.mealPlanId);
    res.json(meals);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/api/meals", requireAuth, async (req, res) => {
  try {
    const validated = schema.insertMealSchema.parse({ ...req.body, userId: req.userId });
    const meal = await storage.createMeal(validated);
    res.json(meal);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.patch("/api/meals/:id", requireAuth, async (req, res) => {
  try {
    const meal = await storage.updateMeal(req.params.id, req.body);
    res.json(meal);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Meal Foods routes
router.get("/api/meal-foods/:mealId", requireAuth, async (req, res) => {
  try {
    const foods = await storage.getMealFoods(req.params.mealId);
    res.json(foods);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/api/meal-foods", requireAuth, async (req, res) => {
  try {
    const validated = schema.insertMealFoodSchema.parse(req.body);
    const mealFood = await storage.createMealFood(validated);
    res.json(mealFood);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.delete("/api/meal-foods/:id", requireAuth, async (req, res) => {
  try {
    await storage.deleteMealFood(req.params.id);
    res.json({ message: "Deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Water Intake routes
router.get("/api/water-intake/:date", requireAuth, async (req, res) => {
  try {
    const water = await storage.getWaterIntake(req.userId!, req.params.date);
    res.json(water);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/api/water-intake", requireAuth, async (req, res) => {
  try {
    const validated = schema.insertWaterIntakeSchema.parse({ ...req.body, userId: req.userId });
    const water = await storage.createWaterIntake(validated);
    res.json(water);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.patch("/api/water-intake/:id", requireAuth, async (req, res) => {
  try {
    const { glassesConsumed } = req.body;
    const water = await storage.updateWaterIntake(req.params.id, glassesConsumed);
    res.json(water);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Exercise Types routes
router.get("/api/exercise-types", requireAuth, async (req, res) => {
  try {
    const types = await storage.getExerciseTypes();
    res.json(types);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Exercise Plan routes
router.get("/api/exercise-plans", requireAuth, async (req, res) => {
  try {
    const plans = await storage.getExercisePlans(req.userId!);
    res.json(plans);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/api/exercise-plans", requireAuth, async (req, res) => {
  try {
    const validated = schema.insertExercisePlanSchema.parse({ ...req.body, userId: req.userId });
    const plan = await storage.createExercisePlan(validated);
    res.json(plan);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Daily Exercise routes
router.get("/api/daily-exercises/:exercisePlanId", requireAuth, async (req, res) => {
  try {
    const exercises = await storage.getDailyExercises(req.params.exercisePlanId);
    res.json(exercises);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/api/daily-exercises/date/:date", requireAuth, async (req, res) => {
  try {
    const exercises = await storage.getDailyExercisesByDate(req.userId!, req.params.date);
    res.json(exercises);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/api/daily-exercises", requireAuth, async (req, res) => {
  try {
    const validated = schema.insertDailyExerciseSchema.parse({ ...req.body, userId: req.userId });
    const exercise = await storage.createDailyExercise(validated);
    res.json(exercise);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.patch("/api/daily-exercises/:id", requireAuth, async (req, res) => {
  try {
    const exercise = await storage.updateDailyExercise(req.params.id, req.body);
    res.json(exercise);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Supplements routes
router.get("/api/supplements", requireAuth, async (req, res) => {
  try {
    const supplements = await storage.getSupplements();
    res.json(supplements);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Nutrition Questionnaire routes
router.get("/api/nutrition-questionnaire", requireAuth, async (req, res) => {
  try {
    const questionnaire = await storage.getNutritionQuestionnaire(req.userId!);
    res.json(questionnaire);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/api/nutrition-questionnaire", requireAuth, async (req, res) => {
  try {
    const validated = schema.insertNutritionQuestionnaireSchema.parse({ ...req.body, userId: req.userId });
    const questionnaire = await storage.createNutritionQuestionnaire(validated);
    res.json(questionnaire);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// User Supplements routes
router.get("/api/user-supplements", requireAuth, async (req, res) => {
  try {
    const userSupplements = await storage.getUserSupplements(req.userId!);
    res.json(userSupplements);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/api/user-supplements", requireAuth, async (req, res) => {
  try {
    const validated = schema.insertUserSupplementSchema.parse({ ...req.body, userId: req.userId });
    const userSupplement = await storage.createUserSupplement(validated);
    res.json(userSupplement);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.patch("/api/user-supplements/:id", requireAuth, async (req, res) => {
  try {
    const { isActive } = req.body;
    const userSupplement = await storage.updateUserSupplement(req.params.id, isActive);
    res.json(userSupplement);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Grocery List routes
router.get("/api/grocery-lists", requireAuth, async (req, res) => {
  try {
    const lists = await storage.getGroceryLists(req.userId!);
    res.json(lists);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/api/grocery-lists", requireAuth, async (req, res) => {
  try {
    const validated = schema.insertGroceryListSchema.parse({ ...req.body, userId: req.userId });
    const list = await storage.createGroceryList(validated);
    res.json(list);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Grocery List Items routes
router.get("/api/grocery-list-items/:groceryListId", requireAuth, async (req, res) => {
  try {
    const items = await storage.getGroceryListItems(req.params.groceryListId);
    res.json(items);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/api/grocery-list-items", requireAuth, async (req, res) => {
  try {
    const validated = schema.insertGroceryListItemSchema.parse(req.body);
    const item = await storage.createGroceryListItem(validated);
    res.json(item);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.patch("/api/grocery-list-items/:id", requireAuth, async (req, res) => {
  try {
    const { isPurchased } = req.body;
    const item = await storage.updateGroceryListItem(req.params.id, isPurchased);
    res.json(item);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// CNF API Search route with database caching
router.get("/api/cnf/search", requireAuth, async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || typeof q !== 'string') {
      return res.status(400).json({ error: "Search query required" });
    }

    // Search CNF API
    const cnfResponse = await fetch(
      `https://food-nutrition.canada.ca/api/canadian-nutrient-file/food/?lang=en&type=json&search=${encodeURIComponent(q)}`
    );

    if (!cnfResponse.ok) {
      throw new Error(`CNF API error: ${cnfResponse.statusText}`);
    }

    const cnfData = await cnfResponse.json();

    // Transform and persist CNF data to our database
    const foods = await Promise.all(
      (cnfData || []).slice(0, 10).map(async (item: any) => {
        const cnfCode = item.food_code || item.FoodCode || null;
        
        // Check if this CNF food already exists in our database
        if (cnfCode) {
          const existing = await storage.getFoodItems();
          const found = existing.find(f => f.cnfCode === cnfCode);
          
          if (found) {
            return {
              id: found.id,
              name: found.name,
              category: cnfCode,
              proteinPer100g: found.proteinPer100g,
              carbsPer100g: found.carbsPer100g,
              fatPer100g: found.fatPer100g,
              caloriesPer100g: found.caloriesPer100g,
            };
          }
        }

        // Create new food item from CNF data
        const newFood = await storage.createFoodItem({
          name: item.food_description || item.FoodDescription || 'Unknown Food',
          cnfCode: cnfCode,
          category: 'other',
          proteinPer100g: item.protein || '0',
          carbsPer100g: item.carbohydrate || '0',
          fatPer100g: item.fat_total || '0',
          caloriesPer100g: item.energy_kcal || '0',
          servingSizeG: '100',
          isCustom: false,
          createdBy: null,
        });

        return {
          id: newFood.id,
          name: newFood.name,
          category: cnfCode || 'other',
          proteinPer100g: newFood.proteinPer100g,
          carbsPer100g: newFood.carbsPer100g,
          fatPer100g: newFood.fatPer100g,
          caloriesPer100g: newFood.caloriesPer100g,
        };
      })
    );

    res.json(foods);
  } catch (error: any) {
    console.error("CNF API error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Custom Foods routes
router.post("/api/custom-foods", requireAuth, async (req, res) => {
  try {
    const validated = schema.insertFoodItemSchema.parse({ 
      ...req.body, 
      isCustom: true, 
      createdBy: req.userId 
    });
    const food = await storage.createFoodItem(validated);
    res.json(food);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.get("/api/custom-foods", requireAuth, async (req, res) => {
  try {
    const foods = await storage.getFoodItems();
    const customFoods = foods.filter(f => f.isCustom && f.createdBy === req.userId);
    res.json(customFoods);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Exercise routes
router.get("/api/exercise-types", requireAuth, async (req, res) => {
  try {
    const exerciseTypes = await storage.getExerciseTypes();
    res.json(exerciseTypes);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/api/daily-exercise/today", requireAuth, async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const exercises = await storage.getDailyExercisesByDate(req.userId!, today);
    res.json(exercises.length > 0 ? exercises[0] : null);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/api/daily-exercise", requireAuth, async (req, res) => {
  try {
    const { exerciseTypeId, durationMinutes, caloriesBurned } = req.body;
    
    const today = new Date().toISOString().split('T')[0];
    const existingExercises = await storage.getDailyExercisesByDate(req.userId!, today);
    
    if (existingExercises.length > 0) {
      // Update existing exercise
      const updated = await storage.updateDailyExercise(existingExercises[0].id, {
        exerciseTypeId,
        durationMinutes,
        caloriesBurned,
        isCompleted: true,
      });
      res.json(updated);
    } else {
      // Create new exercise
      const newExercise = await storage.createDailyExercise({
        userId: req.userId!,
        exerciseTypeId,
        exerciseDate: today,
        durationMinutes,
        caloriesBurned,
        isCompleted: true,
      });
      res.json(newExercise);
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Admin seed database endpoint
router.post("/api/admin/seed-database", requireAdmin, async (req, res) => {
  try {
    // Get count of existing items before seeding
    const existingFoodItems = await storage.getFoodItems();
    const existingExerciseTypes = await storage.getExerciseTypes();
    const existingSupplements = await storage.getSupplements();

    // Seed food items
    const foodItemsData = [
      { name: 'Chicken Breast (skinless)', category: 'protein', proteinPer100g: '31.0', carbsPer100g: '0.0', fatPer100g: '3.6', caloriesPer100g: '165', servingSizeG: '100' },
      { name: 'Salmon (Atlantic)', category: 'protein', proteinPer100g: '25.4', carbsPer100g: '0.0', fatPer100g: '12.4', caloriesPer100g: '208', servingSizeG: '100' },
      { name: 'Ground Beef (93% lean)', category: 'protein', proteinPer100g: '22.0', carbsPer100g: '0.0', fatPer100g: '7.0', caloriesPer100g: '152', servingSizeG: '100' },
      { name: 'Eggs (whole)', category: 'protein', proteinPer100g: '13.0', carbsPer100g: '1.1', fatPer100g: '11.0', caloriesPer100g: '155', servingSizeG: '50' },
      { name: 'Greek Yogurt (plain)', category: 'protein', proteinPer100g: '10.0', carbsPer100g: '4.0', fatPer100g: '0.4', caloriesPer100g: '59', servingSizeG: '100' },
      { name: 'Cottage Cheese (low-fat)', category: 'protein', proteinPer100g: '11.0', carbsPer100g: '3.4', fatPer100g: '4.3', caloriesPer100g: '98', servingSizeG: '100' },
      { name: 'Tuna (canned in water)', category: 'protein', proteinPer100g: '25.5', carbsPer100g: '0.0', fatPer100g: '0.6', caloriesPer100g: '116', servingSizeG: '100' },
      { name: 'Turkey Breast', category: 'protein', proteinPer100g: '29.0', carbsPer100g: '0.0', fatPer100g: '1.2', caloriesPer100g: '135', servingSizeG: '100' },
      { name: 'Tofu (firm)', category: 'protein', proteinPer100g: '15.8', carbsPer100g: '4.3', fatPer100g: '8.7', caloriesPer100g: '144', servingSizeG: '100' },
      { name: 'Black Beans (cooked)', category: 'protein', proteinPer100g: '8.9', carbsPer100g: '23.0', fatPer100g: '0.5', caloriesPer100g: '132', servingSizeG: '100' },
      { name: 'Brown Rice (cooked)', category: 'carbohydrate', proteinPer100g: '2.6', carbsPer100g: '23.0', fatPer100g: '0.9', caloriesPer100g: '111', servingSizeG: '100' },
      { name: 'Quinoa (cooked)', category: 'carbohydrate', proteinPer100g: '4.4', carbsPer100g: '22.0', fatPer100g: '1.9', caloriesPer100g: '120', servingSizeG: '100' },
      { name: 'Sweet Potato (baked)', category: 'carbohydrate', proteinPer100g: '2.0', carbsPer100g: '20.1', fatPer100g: '0.1', caloriesPer100g: '86', servingSizeG: '100' },
      { name: 'Oats (dry)', category: 'carbohydrate', proteinPer100g: '16.9', carbsPer100g: '66.3', fatPer100g: '6.9', caloriesPer100g: '389', servingSizeG: '40' },
      { name: 'Banana', category: 'carbohydrate', proteinPer100g: '1.1', carbsPer100g: '23.0', fatPer100g: '0.3', caloriesPer100g: '89', servingSizeG: '100' },
      { name: 'Apple', category: 'carbohydrate', proteinPer100g: '0.3', carbsPer100g: '14.0', fatPer100g: '0.2', caloriesPer100g: '52', servingSizeG: '100' },
      { name: 'Broccoli', category: 'carbohydrate', proteinPer100g: '2.8', carbsPer100g: '7.0', fatPer100g: '0.4', caloriesPer100g: '34', servingSizeG: '100' },
      { name: 'Spinach', category: 'carbohydrate', proteinPer100g: '2.9', carbsPer100g: '3.6', fatPer100g: '0.4', caloriesPer100g: '23', servingSizeG: '100' },
      { name: 'Whole Wheat Bread', category: 'carbohydrate', proteinPer100g: '13.2', carbsPer100g: '43.3', fatPer100g: '3.4', caloriesPer100g: '247', servingSizeG: '30' },
      { name: 'Pasta (whole wheat, cooked)', category: 'carbohydrate', proteinPer100g: '5.3', carbsPer100g: '25.0', fatPer100g: '1.1', caloriesPer100g: '124', servingSizeG: '100' },
      { name: 'Olive Oil', category: 'fat', proteinPer100g: '0.0', carbsPer100g: '0.0', fatPer100g: '100.0', caloriesPer100g: '884', servingSizeG: '15' },
      { name: 'Avocado', category: 'fat', proteinPer100g: '2.0', carbsPer100g: '9.0', fatPer100g: '15.0', caloriesPer100g: '160', servingSizeG: '100' },
      { name: 'Almonds', category: 'fat', proteinPer100g: '21.2', carbsPer100g: '22.0', fatPer100g: '49.9', caloriesPer100g: '579', servingSizeG: '30' },
      { name: 'Walnuts', category: 'fat', proteinPer100g: '15.2', carbsPer100g: '14.0', fatPer100g: '65.2', caloriesPer100g: '654', servingSizeG: '30' },
      { name: 'Peanut Butter (natural)', category: 'fat', proteinPer100g: '25.8', carbsPer100g: '20.0', fatPer100g: '50.4', caloriesPer100g: '588', servingSizeG: '32' },
      { name: 'Coconut Oil', category: 'fat', proteinPer100g: '0.0', carbsPer100g: '0.0', fatPer100g: '99.1', caloriesPer100g: '862', servingSizeG: '15' },
      { name: 'Flaxseeds', category: 'fat', proteinPer100g: '18.3', carbsPer100g: '29.0', fatPer100g: '42.2', caloriesPer100g: '534', servingSizeG: '15' },
      { name: 'Chia Seeds', category: 'fat', proteinPer100g: '17.0', carbsPer100g: '42.0', fatPer100g: '31.0', caloriesPer100g: '486', servingSizeG: '15' },
      { name: 'Cashews', category: 'fat', proteinPer100g: '18.2', carbsPer100g: '30.2', fatPer100g: '43.9', caloriesPer100g: '553', servingSizeG: '30' },
      { name: 'Sunflower Seeds', category: 'fat', proteinPer100g: '20.8', carbsPer100g: '20.0', fatPer100g: '51.5', caloriesPer100g: '584', servingSizeG: '30' },
    ];

    await storage.seedFoodItems(foodItemsData);

    // Seed exercise types
    const exerciseTypesData = [
      { name: 'Bicycling, 12-14 mph, moderate', category: 'Cardio', caloriesPerMinute: '12.1', description: 'Moderate pace cycling (726 cal/60min)' },
      { name: 'Walking, 3.0 mph, moderate', category: 'Cardio', caloriesPerMinute: '5.0', description: 'Moderate pace walking (299 cal/60min)' },
      { name: 'Strength training', category: 'Strength', caloriesPerMinute: '4.53', description: 'General strength training (272 cal/60min)' },
    ];

    await storage.seedExerciseTypes(exerciseTypesData);

    // Seed supplements
    const supplementsData = [
      { name: 'Multivitamin', category: 'General Health', recommendedDosage: '1 tablet daily', timing: 'with_meal' as const, description: 'Complete vitamin and mineral supplement' },
      { name: 'Vitamin D3', category: 'Bone Health', recommendedDosage: '1000-2000 IU daily', timing: 'with_meal' as const, description: 'Supports bone health and immune function' },
      { name: 'Omega-3 Fish Oil', category: 'Heart Health', recommendedDosage: '1000mg daily', timing: 'with_meal' as const, description: 'Supports heart and brain health' },
      { name: 'Protein Powder', category: 'Fitness', recommendedDosage: '1-2 scoops daily', timing: 'after_workout' as const, description: 'Supports muscle recovery and growth' },
      { name: 'Creatine', category: 'Fitness', recommendedDosage: '3-5g daily', timing: 'after_workout' as const, description: 'Enhances strength and power' },
      { name: 'Magnesium', category: 'Sleep & Recovery', recommendedDosage: '200-400mg daily', timing: 'evening' as const, description: 'Supports muscle function and sleep' },
      { name: 'Probiotics', category: 'Digestive Health', recommendedDosage: '1 capsule daily', timing: 'empty_stomach' as const, description: 'Supports digestive and immune health' },
      { name: 'Vitamin C', category: 'Immune Support', recommendedDosage: '500-1000mg daily', timing: 'morning' as const, description: 'Antioxidant and immune support' },
      { name: 'B-Complex', category: 'Energy', recommendedDosage: '1 capsule daily', timing: 'morning' as const, description: 'Supports energy metabolism' },
      { name: 'Zinc', category: 'Immune Support', recommendedDosage: '8-11mg daily', timing: 'empty_stomach' as const, description: 'Supports immune function and wound healing' },
    ];

    await storage.seedSupplements(supplementsData);

    // Get new counts to determine what was actually added
    const newFoodItems = await storage.getFoodItems();
    const newExerciseTypes = await storage.getExerciseTypes();
    const newSupplements = await storage.getSupplements();

    res.json({ 
      message: "Database seeded successfully!",
      foodItems: newFoodItems.length,
      exerciseTypes: newExerciseTypes.length,
      supplements: newSupplements.length,
      alreadyExisted: existingFoodItems.length > 0 || existingExerciseTypes.length > 0 || existingSupplements.length > 0
    });
  } catch (error: any) {
    console.error("Seed error:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
