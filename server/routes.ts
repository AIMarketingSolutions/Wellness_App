import { Router } from "express";
import { storage } from "./storage";
import { hashPassword, verifyPassword, requireAuth } from "./auth";
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

export default router;
