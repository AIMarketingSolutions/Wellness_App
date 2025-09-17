/*
  # Add Food Items Data

  1. New Data
    - Add comprehensive food database with macronutrient information
    - Include common proteins, carbohydrates, fats, and mixed foods
    - Organize by categories for easy selection

  2. Food Categories
    - Proteins: Chicken, beef, fish, eggs, dairy, legumes
    - Carbohydrates: Grains, fruits, vegetables, starches
    - Fats: Oils, nuts, seeds, avocado
    - Mixed: Foods containing multiple macronutrients
*/

-- Insert comprehensive food database
INSERT INTO food_items (name, category, protein_per_100g, carbs_per_100g, fat_per_100g, calories_per_100g, serving_size_g) VALUES
-- Proteins
('Chicken Breast (skinless)', 'protein', 31.0, 0.0, 3.6, 165, 100),
('Salmon (Atlantic)', 'protein', 25.4, 0.0, 12.4, 208, 100),
('Ground Beef (93% lean)', 'protein', 22.0, 0.0, 7.0, 152, 100),
('Eggs (whole)', 'protein', 13.0, 1.1, 11.0, 155, 50),
('Greek Yogurt (plain)', 'protein', 10.0, 4.0, 0.4, 59, 100),
('Cottage Cheese (low-fat)', 'protein', 11.0, 3.4, 4.3, 98, 100),
('Tuna (canned in water)', 'protein', 25.5, 0.0, 0.6, 116, 100),
('Turkey Breast', 'protein', 29.0, 0.0, 1.2, 135, 100),
('Tofu (firm)', 'protein', 15.8, 4.3, 8.7, 144, 100),
('Black Beans (cooked)', 'protein', 8.9, 23.0, 0.5, 132, 100),

-- Carbohydrates
('Brown Rice (cooked)', 'carbohydrate', 2.6, 23.0, 0.9, 111, 100),
('Quinoa (cooked)', 'carbohydrate', 4.4, 22.0, 1.9, 120, 100),
('Sweet Potato (baked)', 'carbohydrate', 2.0, 20.1, 0.1, 86, 100),
('Oats (dry)', 'carbohydrate', 16.9, 66.3, 6.9, 389, 40),
('Banana', 'carbohydrate', 1.1, 23.0, 0.3, 89, 100),
('Apple', 'carbohydrate', 0.3, 14.0, 0.2, 52, 100),
('Broccoli', 'carbohydrate', 2.8, 7.0, 0.4, 34, 100),
('Spinach', 'carbohydrate', 2.9, 3.6, 0.4, 23, 100),
('Whole Wheat Bread', 'carbohydrate', 13.2, 43.3, 3.4, 247, 30),
('Pasta (whole wheat, cooked)', 'carbohydrate', 5.3, 25.0, 1.1, 124, 100),

-- Fats
('Olive Oil', 'fat', 0.0, 0.0, 100.0, 884, 15),
('Avocado', 'fat', 2.0, 9.0, 15.0, 160, 100),
('Almonds', 'fat', 21.2, 22.0, 49.9, 579, 30),
('Walnuts', 'fat', 15.2, 14.0, 65.2, 654, 30),
('Peanut Butter (natural)', 'fat', 25.8, 20.0, 50.4, 588, 32),
('Coconut Oil', 'fat', 0.0, 0.0, 99.1, 862, 15),
('Flaxseeds', 'fat', 18.3, 29.0, 42.2, 534, 15),
('Chia Seeds', 'fat', 17.0, 42.0, 31.0, 486, 15),
('Cashews', 'fat', 18.2, 30.2, 43.9, 553, 30),
('Sunflower Seeds', 'fat', 20.8, 20.0, 51.5, 584, 30);