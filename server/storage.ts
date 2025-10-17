import { eq, and, desc } from "drizzle-orm";
import { db } from "./db";
import * as schema from "@shared/schema";
import type {
  User,
  InsertUser,
  UserProfile,
  InsertUserProfile,
  TEECalculation,
  InsertTEECalculation,
  BodyFatCalculation,
  InsertBodyFatCalculation,
  FoodItem,
  InsertFoodItem,
  MealPlan,
  InsertMealPlan,
  Meal,
  InsertMeal,
  MealFood,
  InsertMealFood,
  WaterIntake,
  InsertWaterIntake,
  ExerciseType,
  InsertExerciseType,
  ExercisePlan,
  InsertExercisePlan,
  DailyExercise,
  InsertDailyExercise,
  Supplement,
  InsertSupplement,
  NutritionQuestionnaire,
  InsertNutritionQuestionnaire,
  UserSupplement,
  InsertUserSupplement,
  GroceryList,
  InsertGroceryList,
  GroceryListItem,
  InsertGroceryListItem
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // User Profile methods
  getUserProfile(userId: string): Promise<UserProfile | undefined>;
  createUserProfile(profile: InsertUserProfile): Promise<UserProfile>;
  updateUserProfile(userId: string, profile: Partial<InsertUserProfile>): Promise<UserProfile | undefined>;

  // TEE Calculation methods
  getTEECalculations(userId: string): Promise<TEECalculation[]>;
  createTEECalculation(calc: InsertTEECalculation): Promise<TEECalculation>;

  // Body Fat Calculation methods
  getBodyFatCalculations(userId: string): Promise<BodyFatCalculation[]>;
  createBodyFatCalculation(calc: InsertBodyFatCalculation): Promise<BodyFatCalculation>;

  // Food Item methods
  getFoodItems(): Promise<FoodItem[]>;
  getFoodItem(id: string): Promise<FoodItem | undefined>;
  createFoodItem(food: InsertFoodItem): Promise<FoodItem>;

  // Meal Plan methods
  getMealPlans(userId: string): Promise<MealPlan[]>;
  getMealPlan(id: string): Promise<MealPlan | undefined>;
  getMealPlanByDate(userId: string, date: string): Promise<MealPlan | undefined>;
  createMealPlan(plan: InsertMealPlan): Promise<MealPlan>;

  // Meal methods
  getMeals(mealPlanId: string): Promise<Meal[]>;
  getMeal(id: string): Promise<Meal | undefined>;
  createMeal(meal: InsertMeal): Promise<Meal>;
  updateMeal(id: string, meal: Partial<InsertMeal>): Promise<Meal | undefined>;

  // Meal Food methods
  getMealFoods(mealId: string): Promise<MealFood[]>;
  createMealFood(mealFood: InsertMealFood): Promise<MealFood>;
  deleteMealFood(id: string): Promise<void>;

  // Water Intake methods
  getWaterIntake(userId: string, date: string): Promise<WaterIntake | undefined>;
  createWaterIntake(water: InsertWaterIntake): Promise<WaterIntake>;
  updateWaterIntake(id: string, glassesConsumed: number): Promise<WaterIntake | undefined>;

  // Exercise Type methods
  getExerciseTypes(): Promise<ExerciseType[]>;
  getExerciseType(id: string): Promise<ExerciseType | undefined>;

  // Exercise Plan methods
  getExercisePlans(userId: string): Promise<ExercisePlan[]>;
  getExercisePlan(id: string): Promise<ExercisePlan | undefined>;
  createExercisePlan(plan: InsertExercisePlan): Promise<ExercisePlan>;

  // Daily Exercise methods
  getDailyExercises(exercisePlanId: string): Promise<DailyExercise[]>;
  getDailyExercisesByDate(userId: string, date: string): Promise<DailyExercise[]>;
  createDailyExercise(exercise: InsertDailyExercise): Promise<DailyExercise>;
  updateDailyExercise(id: string, exercise: Partial<InsertDailyExercise>): Promise<DailyExercise | undefined>;

  // Supplement methods
  getSupplements(): Promise<Supplement[]>;
  getSupplement(id: string): Promise<Supplement | undefined>;

  // Nutrition Questionnaire methods
  getNutritionQuestionnaire(userId: string): Promise<NutritionQuestionnaire | undefined>;
  createNutritionQuestionnaire(questionnaire: InsertNutritionQuestionnaire): Promise<NutritionQuestionnaire>;

  // User Supplement methods
  getUserSupplements(userId: string): Promise<UserSupplement[]>;
  createUserSupplement(userSupplement: InsertUserSupplement): Promise<UserSupplement>;
  updateUserSupplement(id: string, isActive: boolean): Promise<UserSupplement | undefined>;

  // Grocery List methods
  getGroceryLists(userId: string): Promise<GroceryList[]>;
  getGroceryList(id: string): Promise<GroceryList | undefined>;
  createGroceryList(list: InsertGroceryList): Promise<GroceryList>;

  // Grocery List Item methods
  getGroceryListItems(groceryListId: string): Promise<GroceryListItem[]>;
  createGroceryListItem(item: InsertGroceryListItem): Promise<GroceryListItem>;
  updateGroceryListItem(id: string, isPurchased: boolean): Promise<GroceryListItem | undefined>;
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(schema.users).where(eq(schema.users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(schema.users).where(eq(schema.users.email, email));
    return user || undefined;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(schema.users).values(user).returning();
    return newUser;
  }

  // User Profile methods
  async getUserProfile(userId: string): Promise<UserProfile | undefined> {
    const [profile] = await db.select().from(schema.userProfiles).where(eq(schema.userProfiles.userId, userId));
    return profile || undefined;
  }

  async createUserProfile(profile: InsertUserProfile): Promise<UserProfile> {
    const [newProfile] = await db.insert(schema.userProfiles).values(profile).returning();
    return newProfile;
  }

  async updateUserProfile(userId: string, profile: Partial<InsertUserProfile>): Promise<UserProfile | undefined> {
    const [updated] = await db
      .update(schema.userProfiles)
      .set({ ...profile, updatedAt: new Date() })
      .where(eq(schema.userProfiles.userId, userId))
      .returning();
    return updated || undefined;
  }

  // TEE Calculation methods
  async getTEECalculations(userId: string): Promise<TEECalculation[]> {
    return await db.select().from(schema.teeCalculations).where(eq(schema.teeCalculations.userId, userId)).orderBy(desc(schema.teeCalculations.calculationDate));
  }

  async createTEECalculation(calc: InsertTEECalculation): Promise<TEECalculation> {
    const [newCalc] = await db.insert(schema.teeCalculations).values(calc).returning();
    return newCalc;
  }

  // Body Fat Calculation methods
  async getBodyFatCalculations(userId: string): Promise<BodyFatCalculation[]> {
    return await db.select().from(schema.bodyFatCalculations).where(eq(schema.bodyFatCalculations.userId, userId)).orderBy(desc(schema.bodyFatCalculations.calculationDate));
  }

  async createBodyFatCalculation(calc: InsertBodyFatCalculation): Promise<BodyFatCalculation> {
    const [newCalc] = await db.insert(schema.bodyFatCalculations).values(calc).returning();
    return newCalc;
  }

  // Food Item methods
  async getFoodItems(): Promise<FoodItem[]> {
    return await db.select().from(schema.foodItems);
  }

  async getFoodItem(id: string): Promise<FoodItem | undefined> {
    const [food] = await db.select().from(schema.foodItems).where(eq(schema.foodItems.id, id));
    return food || undefined;
  }

  async createFoodItem(food: InsertFoodItem): Promise<FoodItem> {
    const [newFood] = await db.insert(schema.foodItems).values(food).returning();
    return newFood;
  }

  // Meal Plan methods
  async getMealPlans(userId: string): Promise<MealPlan[]> {
    return await db.select().from(schema.mealPlans).where(eq(schema.mealPlans.userId, userId)).orderBy(desc(schema.mealPlans.planDate));
  }

  async getMealPlan(id: string): Promise<MealPlan | undefined> {
    const [plan] = await db.select().from(schema.mealPlans).where(eq(schema.mealPlans.id, id));
    return plan || undefined;
  }

  async getMealPlanByDate(userId: string, date: string): Promise<MealPlan | undefined> {
    const [plan] = await db.select().from(schema.mealPlans).where(and(eq(schema.mealPlans.userId, userId), eq(schema.mealPlans.planDate, date)));
    return plan || undefined;
  }

  async createMealPlan(plan: InsertMealPlan): Promise<MealPlan> {
    const [newPlan] = await db.insert(schema.mealPlans).values(plan).returning();
    return newPlan;
  }

  // Meal methods
  async getMeals(mealPlanId: string): Promise<Meal[]> {
    return await db.select().from(schema.meals).where(eq(schema.meals.mealPlanId, mealPlanId));
  }

  async getMeal(id: string): Promise<Meal | undefined> {
    const [meal] = await db.select().from(schema.meals).where(eq(schema.meals.id, id));
    return meal || undefined;
  }

  async createMeal(meal: InsertMeal): Promise<Meal> {
    const [newMeal] = await db.insert(schema.meals).values(meal).returning();
    return newMeal;
  }

  async updateMeal(id: string, meal: Partial<InsertMeal>): Promise<Meal | undefined> {
    const [updated] = await db
      .update(schema.meals)
      .set(meal)
      .where(eq(schema.meals.id, id))
      .returning();
    return updated || undefined;
  }

  // Meal Food methods
  async getMealFoods(mealId: string): Promise<MealFood[]> {
    return await db.select().from(schema.mealFoods).where(eq(schema.mealFoods.mealId, mealId));
  }

  async createMealFood(mealFood: InsertMealFood): Promise<MealFood> {
    const [newMealFood] = await db.insert(schema.mealFoods).values(mealFood).returning();
    return newMealFood;
  }

  async deleteMealFood(id: string): Promise<void> {
    await db.delete(schema.mealFoods).where(eq(schema.mealFoods.id, id));
  }

  // Water Intake methods
  async getWaterIntake(userId: string, date: string): Promise<WaterIntake | undefined> {
    const [water] = await db.select().from(schema.waterIntake).where(and(eq(schema.waterIntake.userId, userId), eq(schema.waterIntake.intakeDate, date)));
    return water || undefined;
  }

  async createWaterIntake(water: InsertWaterIntake): Promise<WaterIntake> {
    const [newWater] = await db.insert(schema.waterIntake).values(water).returning();
    return newWater;
  }

  async updateWaterIntake(id: string, glassesConsumed: number): Promise<WaterIntake | undefined> {
    const [updated] = await db
      .update(schema.waterIntake)
      .set({ glassesConsumed })
      .where(eq(schema.waterIntake.id, id))
      .returning();
    return updated || undefined;
  }

  // Exercise Type methods
  async getExerciseTypes(): Promise<ExerciseType[]> {
    return await db.select().from(schema.exerciseTypes);
  }

  async getExerciseType(id: string): Promise<ExerciseType | undefined> {
    const [type] = await db.select().from(schema.exerciseTypes).where(eq(schema.exerciseTypes.id, id));
    return type || undefined;
  }

  // Exercise Plan methods
  async getExercisePlans(userId: string): Promise<ExercisePlan[]> {
    return await db.select().from(schema.exercisePlans).where(eq(schema.exercisePlans.userId, userId)).orderBy(desc(schema.exercisePlans.weekStartDate));
  }

  async getExercisePlan(id: string): Promise<ExercisePlan | undefined> {
    const [plan] = await db.select().from(schema.exercisePlans).where(eq(schema.exercisePlans.id, id));
    return plan || undefined;
  }

  async createExercisePlan(plan: InsertExercisePlan): Promise<ExercisePlan> {
    const [newPlan] = await db.insert(schema.exercisePlans).values(plan).returning();
    return newPlan;
  }

  // Daily Exercise methods
  async getDailyExercises(exercisePlanId: string): Promise<DailyExercise[]> {
    return await db.select().from(schema.dailyExercises).where(eq(schema.dailyExercises.exercisePlanId, exercisePlanId));
  }

  async getDailyExercisesByDate(userId: string, date: string): Promise<DailyExercise[]> {
    return await db.select().from(schema.dailyExercises).where(and(eq(schema.dailyExercises.userId, userId), eq(schema.dailyExercises.exerciseDate, date)));
  }

  async createDailyExercise(exercise: InsertDailyExercise): Promise<DailyExercise> {
    const [newExercise] = await db.insert(schema.dailyExercises).values(exercise).returning();
    return newExercise;
  }

  async updateDailyExercise(id: string, exercise: Partial<InsertDailyExercise>): Promise<DailyExercise | undefined> {
    const [updated] = await db
      .update(schema.dailyExercises)
      .set(exercise)
      .where(eq(schema.dailyExercises.id, id))
      .returning();
    return updated || undefined;
  }

  // Supplement methods
  async getSupplements(): Promise<Supplement[]> {
    return await db.select().from(schema.supplements);
  }

  async getSupplement(id: string): Promise<Supplement | undefined> {
    const [supplement] = await db.select().from(schema.supplements).where(eq(schema.supplements.id, id));
    return supplement || undefined;
  }

  // Nutrition Questionnaire methods
  async getNutritionQuestionnaire(userId: string): Promise<NutritionQuestionnaire | undefined> {
    const [questionnaire] = await db.select().from(schema.nutritionQuestionnaire).where(eq(schema.nutritionQuestionnaire.userId, userId)).orderBy(desc(schema.nutritionQuestionnaire.createdAt));
    return questionnaire || undefined;
  }

  async createNutritionQuestionnaire(questionnaire: InsertNutritionQuestionnaire): Promise<NutritionQuestionnaire> {
    const [newQuestionnaire] = await db.insert(schema.nutritionQuestionnaire).values(questionnaire).returning();
    return newQuestionnaire;
  }

  // User Supplement methods
  async getUserSupplements(userId: string): Promise<UserSupplement[]> {
    return await db.select().from(schema.userSupplements).where(eq(schema.userSupplements.userId, userId));
  }

  async createUserSupplement(userSupplement: InsertUserSupplement): Promise<UserSupplement> {
    const [newUserSupplement] = await db.insert(schema.userSupplements).values(userSupplement).returning();
    return newUserSupplement;
  }

  async updateUserSupplement(id: string, isActive: boolean): Promise<UserSupplement | undefined> {
    const [updated] = await db
      .update(schema.userSupplements)
      .set({ isActive })
      .where(eq(schema.userSupplements.id, id))
      .returning();
    return updated || undefined;
  }

  // Grocery List methods
  async getGroceryLists(userId: string): Promise<GroceryList[]> {
    return await db.select().from(schema.groceryLists).where(eq(schema.groceryLists.userId, userId)).orderBy(desc(schema.groceryLists.weekStartDate));
  }

  async getGroceryList(id: string): Promise<GroceryList | undefined> {
    const [list] = await db.select().from(schema.groceryLists).where(eq(schema.groceryLists.id, id));
    return list || undefined;
  }

  async createGroceryList(list: InsertGroceryList): Promise<GroceryList> {
    const [newList] = await db.insert(schema.groceryLists).values(list).returning();
    return newList;
  }

  // Grocery List Item methods
  async getGroceryListItems(groceryListId: string): Promise<GroceryListItem[]> {
    return await db.select().from(schema.groceryListItems).where(eq(schema.groceryListItems.groceryListId, groceryListId));
  }

  async createGroceryListItem(item: InsertGroceryListItem): Promise<GroceryListItem> {
    const [newItem] = await db.insert(schema.groceryListItems).values(item).returning();
    return newItem;
  }

  async updateGroceryListItem(id: string, isPurchased: boolean): Promise<GroceryListItem | undefined> {
    const [updated] = await db
      .update(schema.groceryListItems)
      .set({ isPurchased })
      .where(eq(schema.groceryListItems.id, id))
      .returning();
    return updated || undefined;
  }
}

export const storage = new DatabaseStorage();
