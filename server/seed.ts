import { db } from "./db";
import * as schema from "@shared/schema";

async function seed() {
  console.log("Seeding database...");

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

  await db.insert(schema.foodItems).values(foodItemsData).onConflictDoNothing();

  // Seed exercise types
  const exerciseTypesData = [
    { name: 'Running (6 mph)', category: 'Cardio', caloriesPerMinute: '10.0', description: 'Moderate pace running' },
    { name: 'Walking (3.5 mph)', category: 'Cardio', caloriesPerMinute: '4.0', description: 'Brisk walking' },
    { name: 'Cycling (moderate)', category: 'Cardio', caloriesPerMinute: '8.0', description: 'Moderate intensity cycling' },
    { name: 'Swimming', category: 'Cardio', caloriesPerMinute: '11.0', description: 'General swimming' },
    { name: 'Weight Training', category: 'Strength', caloriesPerMinute: '6.0', description: 'General weight lifting' },
    { name: 'Push-ups', category: 'Strength', caloriesPerMinute: '7.0', description: 'Bodyweight push-ups' },
    { name: 'Squats', category: 'Strength', caloriesPerMinute: '8.0', description: 'Bodyweight squats' },
    { name: 'Yoga', category: 'Flexibility', caloriesPerMinute: '3.0', description: 'Hatha yoga' },
    { name: 'Pilates', category: 'Flexibility', caloriesPerMinute: '4.0', description: 'General pilates' },
    { name: 'HIIT', category: 'Cardio', caloriesPerMinute: '12.0', description: 'High-intensity interval training' },
  ];

  await db.insert(schema.exerciseTypes).values(exerciseTypesData).onConflictDoNothing();

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

  await db.insert(schema.supplements).values(supplementsData).onConflictDoNothing();

  console.log("Database seeded successfully!");
}

seed()
  .catch((error) => {
    console.error("Error seeding database:", error);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });
