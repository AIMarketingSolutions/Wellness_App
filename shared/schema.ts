import { pgTable, uuid, text, numeric, integer, date, timestamptz, boolean, check, unique } from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table (for authentication)
export const users = pgTable("users", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  fullName: text("full_name"),
  createdAt: timestamptz("created_at").defaultNow().notNull(),
});

// User Profiles Table
export const userProfiles = pgTable("user_profiles", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull().unique(),
  fullName: text("full_name"),
  gender: text("gender").$type<'male' | 'female'>(),
  age: integer("age"),
  weightKg: numeric("weight_kg", { precision: 5, scale: 2 }),
  heightCm: numeric("height_cm", { precision: 5, scale: 2 }),
  weightLbs: numeric("weight_lbs", { precision: 5, scale: 2 }),
  heightInches: numeric("height_inches", { precision: 5, scale: 2 }),
  waistInches: numeric("waist_inches", { precision: 5, scale: 2 }),
  neckInches: numeric("neck_inches", { precision: 5, scale: 2 }),
  hipInches: numeric("hip_inches", { precision: 5, scale: 2 }),
  activityLevel: text("activity_level").$type<'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extremely_active'>(),
  bloodType: text("blood_type").$type<'A' | 'B' | 'AB' | 'O'>(),
  metabolicProfile: text("metabolic_profile").$type<'fast_oxidizer' | 'slow_oxidizer' | 'medium_oxidizer'>(),
  customProteinPercentage: numeric("custom_protein_percentage", { precision: 4, scale: 2 }),
  customCarbPercentage: numeric("custom_carb_percentage", { precision: 4, scale: 2 }),
  customFatPercentage: numeric("custom_fat_percentage", { precision: 4, scale: 2 }),
  weightLossGoal: text("weight_loss_goal").$type<'maintain' | 'lose_0_5' | 'lose_1' | 'lose_1_5' | 'lose_2'>(),
  deficitMethod: text("deficit_method").$type<'diet_only' | 'exercise_only' | 'combined'>(),
  targetWeight: numeric("target_weight", { precision: 5, scale: 2 }),
  createdAt: timestamptz("created_at").defaultNow().notNull(),
  updatedAt: timestamptz("updated_at").defaultNow().notNull(),
});

// TEE Calculations Table
export const teeCalculations = pgTable("tee_calculations", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  reeCalories: numeric("ree_calories", { precision: 7, scale: 2 }).notNull(),
  activityFactor: numeric("activity_factor", { precision: 3, scale: 2 }).notNull(),
  teeCalories: numeric("tee_calories", { precision: 7, scale: 2 }).notNull(),
  calculationDate: date("calculation_date").defaultNow().notNull(),
  createdAt: timestamptz("created_at").defaultNow().notNull(),
});

// Body Fat Calculations Table
export const bodyFatCalculations = pgTable("body_fat_calculations", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  bmi: numeric("bmi", { precision: 4, scale: 2 }).notNull(),
  bodyFatPercentage: numeric("body_fat_percentage", { precision: 4, scale: 2 }).notNull(),
  calculationDate: date("calculation_date").defaultNow().notNull(),
  createdAt: timestamptz("created_at").defaultNow().notNull(),
});

// Food Items Master Table
export const foodItems = pgTable("food_items", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  category: text("category").notNull(),
  proteinPer100g: numeric("protein_per_100g", { precision: 5, scale: 2 }).default("0"),
  carbsPer100g: numeric("carbs_per_100g", { precision: 5, scale: 2 }).default("0"),
  fatPer100g: numeric("fat_per_100g", { precision: 5, scale: 2 }).default("0"),
  caloriesPer100g: numeric("calories_per_100g", { precision: 6, scale: 2 }).default("0"),
  servingSizeG: numeric("serving_size_g", { precision: 6, scale: 2 }).default("100"),
  isCustom: boolean("is_custom").default(false),
  createdBy: uuid("created_by").references(() => users.id),
  createdAt: timestamptz("created_at").defaultNow().notNull(),
});

// Meal Plans Table
export const mealPlans = pgTable("meal_plans", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  planType: text("plan_type").$type<'three_meals' | 'three_meals_one_snack' | 'three_meals_two_snacks'>().default('three_meals'),
  dailyCalories: numeric("daily_calories", { precision: 7, scale: 2 }).notNull(),
  proteinPercentage: numeric("protein_percentage", { precision: 4, scale: 2 }).notNull(),
  carbPercentage: numeric("carb_percentage", { precision: 4, scale: 2 }).notNull(),
  fatPercentage: numeric("fat_percentage", { precision: 4, scale: 2 }).notNull(),
  planDate: date("plan_date").defaultNow().notNull(),
  createdAt: timestamptz("created_at").defaultNow().notNull(),
});

// Meals Table
export const meals = pgTable("meals", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  mealPlanId: uuid("meal_plan_id").references(() => mealPlans.id, { onDelete: "cascade" }),
  mealType: text("meal_type").$type<'breakfast' | 'lunch' | 'dinner' | 'snack'>().notNull(),
  targetCalories: numeric("target_calories", { precision: 6, scale: 2 }).notNull(),
  targetProteinG: numeric("target_protein_g", { precision: 6, scale: 2 }).notNull(),
  targetCarbsG: numeric("target_carbs_g", { precision: 6, scale: 2 }).notNull(),
  targetFatG: numeric("target_fat_g", { precision: 6, scale: 2 }).notNull(),
  actualCalories: numeric("actual_calories", { precision: 6, scale: 2 }).default("0"),
  actualProteinG: numeric("actual_protein_g", { precision: 6, scale: 2 }).default("0"),
  actualCarbsG: numeric("actual_carbs_g", { precision: 6, scale: 2 }).default("0"),
  actualFatG: numeric("actual_fat_g", { precision: 6, scale: 2 }).default("0"),
  isCompleted: boolean("is_completed").default(false),
  mealDate: date("meal_date").defaultNow().notNull(),
  createdAt: timestamptz("created_at").defaultNow().notNull(),
});

// Meal Foods Junction Table
export const mealFoods = pgTable("meal_foods", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  mealId: uuid("meal_id").references(() => meals.id, { onDelete: "cascade" }).notNull(),
  foodItemId: uuid("food_item_id").references(() => foodItems.id, { onDelete: "cascade" }).notNull(),
  quantityG: numeric("quantity_g", { precision: 6, scale: 2 }).notNull(),
  calories: numeric("calories", { precision: 6, scale: 2 }).notNull(),
  proteinG: numeric("protein_g", { precision: 5, scale: 2 }).notNull(),
  carbsG: numeric("carbs_g", { precision: 5, scale: 2 }).notNull(),
  fatG: numeric("fat_g", { precision: 5, scale: 2 }).notNull(),
  createdAt: timestamptz("created_at").defaultNow().notNull(),
});

// Water Intake Table
export const waterIntake = pgTable("water_intake", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  glassesConsumed: integer("glasses_consumed").default(0),
  targetGlasses: integer("target_glasses").default(8),
  intakeDate: date("intake_date").defaultNow().notNull(),
  createdAt: timestamptz("created_at").defaultNow().notNull(),
}, (table) => ({
  uniqueUserDate: unique().on(table.userId, table.intakeDate),
}));

// Exercise Types Master Table
export const exerciseTypes = pgTable("exercise_types", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  category: text("category").notNull(),
  caloriesPerMinute: numeric("calories_per_minute", { precision: 4, scale: 2 }).notNull(),
  description: text("description"),
  createdAt: timestamptz("created_at").defaultNow().notNull(),
});

// Exercise Plans Table
export const exercisePlans = pgTable("exercise_plans", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  planName: text("plan_name").notNull(),
  weekStartDate: date("week_start_date").defaultNow().notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamptz("created_at").defaultNow().notNull(),
});

// Daily Exercises Table
export const dailyExercises = pgTable("daily_exercises", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  exercisePlanId: uuid("exercise_plan_id").references(() => exercisePlans.id, { onDelete: "cascade" }),
  exerciseTypeId: uuid("exercise_type_id").references(() => exerciseTypes.id, { onDelete: "cascade" }),
  exerciseDate: date("exercise_date").defaultNow().notNull(),
  durationMinutes: integer("duration_minutes").notNull(),
  caloriesBurned: numeric("calories_burned", { precision: 6, scale: 2 }).notNull(),
  isRestDay: boolean("is_rest_day").default(false),
  isCompleted: boolean("is_completed").default(false),
  notes: text("notes"),
  createdAt: timestamptz("created_at").defaultNow().notNull(),
});

// Supplements Master Table
export const supplements = pgTable("supplements", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  category: text("category").notNull(),
  recommendedDosage: text("recommended_dosage"),
  timing: text("timing").$type<'morning' | 'afternoon' | 'evening' | 'with_meal' | 'empty_stomach' | 'before_workout' | 'after_workout'>(),
  canTakeTogether: text("can_take_together").array(),
  description: text("description"),
  createdAt: timestamptz("created_at").defaultNow().notNull(),
});

// Nutrition Questionnaire Table
export const nutritionQuestionnaire = pgTable("nutrition_questionnaire", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  energyLevel: integer("energy_level"),
  sleepQuality: integer("sleep_quality"),
  stressLevel: integer("stress_level"),
  digestiveHealth: integer("digestive_health"),
  immuneSystem: integer("immune_system"),
  jointHealth: integer("joint_health"),
  skinHealth: integer("skin_health"),
  dietaryRestrictions: text("dietary_restrictions").array(),
  healthGoals: text("health_goals").array(),
  currentMedications: text("current_medications").array(),
  completedAt: timestamptz("completed_at").defaultNow(),
  createdAt: timestamptz("created_at").defaultNow().notNull(),
});

// User Supplements Table
export const userSupplements = pgTable("user_supplements", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  supplementId: uuid("supplement_id").references(() => supplements.id, { onDelete: "cascade" }).notNull(),
  dosage: text("dosage").notNull(),
  timing: text("timing").notNull(),
  isActive: boolean("is_active").default(true),
  startDate: date("start_date").defaultNow().notNull(),
  notes: text("notes"),
  createdAt: timestamptz("created_at").defaultNow().notNull(),
});

// Grocery Lists Table
export const groceryLists = pgTable("grocery_lists", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  listName: text("list_name").notNull(),
  weekStartDate: date("week_start_date").defaultNow().notNull(),
  isGenerated: boolean("is_generated").default(true),
  createdAt: timestamptz("created_at").defaultNow().notNull(),
});

// Grocery List Items Table
export const groceryListItems = pgTable("grocery_list_items", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  groceryListId: uuid("grocery_list_id").references(() => groceryLists.id, { onDelete: "cascade" }).notNull(),
  foodItemId: uuid("food_item_id").references(() => foodItems.id, { onDelete: "cascade" }).notNull(),
  quantityNeeded: numeric("quantity_needed", { precision: 8, scale: 2 }).notNull(),
  unit: text("unit").notNull(),
  isPurchased: boolean("is_purchased").default(false),
  createdAt: timestamptz("created_at").defaultNow().notNull(),
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });

export type UserProfile = typeof userProfiles.$inferSelect;
export type InsertUserProfile = z.infer<typeof insertUserProfileSchema>;
export const insertUserProfileSchema = createInsertSchema(userProfiles).omit({ id: true, createdAt: true, updatedAt: true });

export type TEECalculation = typeof teeCalculations.$inferSelect;
export type InsertTEECalculation = z.infer<typeof insertTEECalculationSchema>;
export const insertTEECalculationSchema = createInsertSchema(teeCalculations).omit({ id: true, createdAt: true });

export type BodyFatCalculation = typeof bodyFatCalculations.$inferSelect;
export type InsertBodyFatCalculation = z.infer<typeof insertBodyFatCalculationSchema>;
export const insertBodyFatCalculationSchema = createInsertSchema(bodyFatCalculations).omit({ id: true, createdAt: true });

export type FoodItem = typeof foodItems.$inferSelect;
export type InsertFoodItem = z.infer<typeof insertFoodItemSchema>;
export const insertFoodItemSchema = createInsertSchema(foodItems).omit({ id: true, createdAt: true });

export type MealPlan = typeof mealPlans.$inferSelect;
export type InsertMealPlan = z.infer<typeof insertMealPlanSchema>;
export const insertMealPlanSchema = createInsertSchema(mealPlans).omit({ id: true, createdAt: true });

export type Meal = typeof meals.$inferSelect;
export type InsertMeal = z.infer<typeof insertMealSchema>;
export const insertMealSchema = createInsertSchema(meals).omit({ id: true, createdAt: true });

export type MealFood = typeof mealFoods.$inferSelect;
export type InsertMealFood = z.infer<typeof insertMealFoodSchema>;
export const insertMealFoodSchema = createInsertSchema(mealFoods).omit({ id: true, createdAt: true });

export type WaterIntake = typeof waterIntake.$inferSelect;
export type InsertWaterIntake = z.infer<typeof insertWaterIntakeSchema>;
export const insertWaterIntakeSchema = createInsertSchema(waterIntake).omit({ id: true, createdAt: true });

export type ExerciseType = typeof exerciseTypes.$inferSelect;
export type InsertExerciseType = z.infer<typeof insertExerciseTypeSchema>;
export const insertExerciseTypeSchema = createInsertSchema(exerciseTypes).omit({ id: true, createdAt: true });

export type ExercisePlan = typeof exercisePlans.$inferSelect;
export type InsertExercisePlan = z.infer<typeof insertExercisePlanSchema>;
export const insertExercisePlanSchema = createInsertSchema(exercisePlans).omit({ id: true, createdAt: true });

export type DailyExercise = typeof dailyExercises.$inferSelect;
export type InsertDailyExercise = z.infer<typeof insertDailyExerciseSchema>;
export const insertDailyExerciseSchema = createInsertSchema(dailyExercises).omit({ id: true, createdAt: true });

export type Supplement = typeof supplements.$inferSelect;
export type InsertSupplement = z.infer<typeof insertSupplementSchema>;
export const insertSupplementSchema = createInsertSchema(supplements).omit({ id: true, createdAt: true });

export type NutritionQuestionnaire = typeof nutritionQuestionnaire.$inferSelect;
export type InsertNutritionQuestionnaire = z.infer<typeof insertNutritionQuestionnaireSchema>;
export const insertNutritionQuestionnaireSchema = createInsertSchema(nutritionQuestionnaire).omit({ id: true, createdAt: true });

export type UserSupplement = typeof userSupplements.$inferSelect;
export type InsertUserSupplement = z.infer<typeof insertUserSupplementSchema>;
export const insertUserSupplementSchema = createInsertSchema(userSupplements).omit({ id: true, createdAt: true });

export type GroceryList = typeof groceryLists.$inferSelect;
export type InsertGroceryList = z.infer<typeof insertGroceryListSchema>;
export const insertGroceryListSchema = createInsertSchema(groceryLists).omit({ id: true, createdAt: true });

export type GroceryListItem = typeof groceryListItems.$inferSelect;
export type InsertGroceryListItem = z.infer<typeof insertGroceryListItemSchema>;
export const insertGroceryListItemSchema = createInsertSchema(groceryListItems).omit({ id: true, createdAt: true });
