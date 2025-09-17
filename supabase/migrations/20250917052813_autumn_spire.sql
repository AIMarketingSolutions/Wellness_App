/*
  # Wellness App Database Schema

  This migration creates the complete database schema for the wellness app including:
  
  1. New Tables
    - `user_profiles` - Extended user information and body metrics
    - `tee_calculations` - Total Energy Expenditure calculations
    - `body_fat_calculations` - Body fat percentage tracking
    - `metabolic_profiles` - User's metabolic profile settings
    - `meal_plans` - Daily meal plan configurations
    - `meals` - Individual meal entries
    - `food_items` - Master food database
    - `meal_foods` - Junction table for meals and foods
    - `water_intake` - Daily water consumption tracking
    - `exercise_plans` - Weekly exercise schedules
    - `daily_exercises` - Individual exercise entries
    - `exercise_types` - Master exercise database
    - `nutrition_questionnaire` - Supplement needs assessment
    - `supplements` - Master supplement database
    - `user_supplements` - User's daily supplement schedule
    - `grocery_lists` - Generated shopping lists

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data

  3. Functions
    - Calculate TEE (Total Energy Expenditure)
    - Calculate Body Fat Percentage
    - Generate meal macronutrient distributions
    - Create grocery lists from meal plans
*/

-- User Profiles Table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  gender text CHECK (gender IN ('male', 'female')),
  age integer,
  weight_kg numeric(5,2),
  height_cm numeric(5,2),
  activity_level text CHECK (activity_level IN ('sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extremely_active')),
  blood_type text CHECK (blood_type IN ('A', 'B', 'AB', 'O')),
  metabolic_profile text CHECK (metabolic_profile IN ('fast_oxidizer', 'slow_oxidizer', 'medium_oxidizer')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- TEE Calculations Table
CREATE TABLE IF NOT EXISTS tee_calculations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  ree_calories numeric(7,2) NOT NULL,
  activity_factor numeric(3,2) NOT NULL,
  tee_calories numeric(7,2) NOT NULL,
  calculation_date date DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now()
);

-- Body Fat Calculations Table
CREATE TABLE IF NOT EXISTS body_fat_calculations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  bmi numeric(4,2) NOT NULL,
  body_fat_percentage numeric(4,2) NOT NULL,
  calculation_date date DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now()
);

-- Food Items Master Table
CREATE TABLE IF NOT EXISTS food_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL,
  protein_per_100g numeric(5,2) DEFAULT 0,
  carbs_per_100g numeric(5,2) DEFAULT 0,
  fat_per_100g numeric(5,2) DEFAULT 0,
  calories_per_100g numeric(6,2) DEFAULT 0,
  serving_size_g numeric(6,2) DEFAULT 100,
  created_at timestamptz DEFAULT now(),
  is_custom boolean DEFAULT false,
  created_by uuid REFERENCES auth.users(id)
);

-- Meal Plans Table
CREATE TABLE IF NOT EXISTS meal_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_type text CHECK (plan_type IN ('three_meals', 'three_meals_one_snack', 'three_meals_two_snacks')) DEFAULT 'three_meals',
  daily_calories numeric(7,2) NOT NULL,
  protein_percentage numeric(4,2) NOT NULL,
  carb_percentage numeric(4,2) NOT NULL,
  fat_percentage numeric(4,2) NOT NULL,
  plan_date date DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now()
);

-- Meals Table
CREATE TABLE IF NOT EXISTS meals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  meal_plan_id uuid REFERENCES meal_plans(id) ON DELETE CASCADE,
  meal_type text CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')) NOT NULL,
  target_calories numeric(6,2) NOT NULL,
  target_protein_g numeric(6,2) NOT NULL,
  target_carbs_g numeric(6,2) NOT NULL,
  target_fat_g numeric(6,2) NOT NULL,
  actual_calories numeric(6,2) DEFAULT 0,
  actual_protein_g numeric(6,2) DEFAULT 0,
  actual_carbs_g numeric(6,2) DEFAULT 0,
  actual_fat_g numeric(6,2) DEFAULT 0,
  is_completed boolean DEFAULT false,
  meal_date date DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now()
);

-- Meal Foods Junction Table
CREATE TABLE IF NOT EXISTS meal_foods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  meal_id uuid REFERENCES meals(id) ON DELETE CASCADE,
  food_item_id uuid REFERENCES food_items(id) ON DELETE CASCADE,
  quantity_g numeric(6,2) NOT NULL,
  calories numeric(6,2) NOT NULL,
  protein_g numeric(5,2) NOT NULL,
  carbs_g numeric(5,2) NOT NULL,
  fat_g numeric(5,2) NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Water Intake Table
CREATE TABLE IF NOT EXISTS water_intake (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  glasses_consumed integer DEFAULT 0 CHECK (glasses_consumed >= 0 AND glasses_consumed <= 20),
  target_glasses integer DEFAULT 8,
  intake_date date DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, intake_date)
);

-- Exercise Types Master Table
CREATE TABLE IF NOT EXISTS exercise_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL,
  calories_per_minute numeric(4,2) NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

-- Exercise Plans Table
CREATE TABLE IF NOT EXISTS exercise_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_name text NOT NULL,
  week_start_date date DEFAULT CURRENT_DATE,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Daily Exercises Table
CREATE TABLE IF NOT EXISTS daily_exercises (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  exercise_plan_id uuid REFERENCES exercise_plans(id) ON DELETE CASCADE,
  exercise_type_id uuid REFERENCES exercise_types(id) ON DELETE CASCADE,
  exercise_date date DEFAULT CURRENT_DATE,
  duration_minutes integer NOT NULL,
  calories_burned numeric(6,2) NOT NULL,
  is_rest_day boolean DEFAULT false,
  is_completed boolean DEFAULT false,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Supplements Master Table
CREATE TABLE IF NOT EXISTS supplements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL,
  recommended_dosage text,
  timing text CHECK (timing IN ('morning', 'afternoon', 'evening', 'with_meal', 'empty_stomach', 'before_workout', 'after_workout')),
  can_take_together text[], -- Array of supplement IDs that can be taken together
  description text,
  created_at timestamptz DEFAULT now()
);

-- Nutrition Questionnaire Table
CREATE TABLE IF NOT EXISTS nutrition_questionnaire (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  energy_level integer CHECK (energy_level >= 1 AND energy_level <= 5),
  sleep_quality integer CHECK (sleep_quality >= 1 AND sleep_quality <= 5),
  stress_level integer CHECK (stress_level >= 1 AND stress_level <= 5),
  digestive_health integer CHECK (digestive_health >= 1 AND digestive_health <= 5),
  immune_system integer CHECK (immune_system >= 1 AND immune_system <= 5),
  joint_health integer CHECK (joint_health >= 1 AND joint_health <= 5),
  skin_health integer CHECK (skin_health >= 1 AND skin_health <= 5),
  dietary_restrictions text[],
  health_goals text[],
  current_medications text[],
  completed_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- User Supplements Table
CREATE TABLE IF NOT EXISTS user_supplements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  supplement_id uuid REFERENCES supplements(id) ON DELETE CASCADE,
  dosage text NOT NULL,
  timing text NOT NULL,
  is_active boolean DEFAULT true,
  start_date date DEFAULT CURRENT_DATE,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Grocery Lists Table
CREATE TABLE IF NOT EXISTS grocery_lists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  list_name text NOT NULL,
  week_start_date date DEFAULT CURRENT_DATE,
  is_generated boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Grocery List Items Table
CREATE TABLE IF NOT EXISTS grocery_list_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  grocery_list_id uuid REFERENCES grocery_lists(id) ON DELETE CASCADE,
  food_item_id uuid REFERENCES food_items(id) ON DELETE CASCADE,
  quantity_needed numeric(8,2) NOT NULL,
  unit text NOT NULL,
  is_purchased boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tee_calculations ENABLE ROW LEVEL SECURITY;
ALTER TABLE body_fat_calculations ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_foods ENABLE ROW LEVEL SECURITY;
ALTER TABLE water_intake ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutrition_questionnaire ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_supplements ENABLE ROW LEVEL SECURITY;
ALTER TABLE grocery_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE grocery_list_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplements ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user-specific data
CREATE POLICY "Users can manage their own profile"
  ON user_profiles
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own TEE calculations"
  ON tee_calculations
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own body fat calculations"
  ON body_fat_calculations
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own meal plans"
  ON meal_plans
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own meals"
  ON meals
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own meal foods"
  ON meal_foods
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM meals 
    WHERE meals.id = meal_foods.meal_id 
    AND meals.user_id = auth.uid()
  ));

CREATE POLICY "Users can manage their own water intake"
  ON water_intake
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own exercise plans"
  ON exercise_plans
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own daily exercises"
  ON daily_exercises
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own questionnaire"
  ON nutrition_questionnaire
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own supplements"
  ON user_supplements
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own grocery lists"
  ON grocery_lists
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own grocery list items"
  ON grocery_list_items
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM grocery_lists 
    WHERE grocery_lists.id = grocery_list_items.grocery_list_id 
    AND grocery_lists.user_id = auth.uid()
  ));

-- Public read access for master tables
CREATE POLICY "Anyone can read food items"
  ON food_items
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create custom food items"
  ON food_items
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their custom food items"
  ON food_items
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Anyone can read exercise types"
  ON exercise_types
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Anyone can read supplements"
  ON supplements
  FOR SELECT
  TO authenticated
  USING (true);

-- Insert sample food items
INSERT INTO food_items (name, category, protein_per_100g, carbs_per_100g, fat_per_100g, calories_per_100g) VALUES
('Chicken Breast (skinless)', 'Protein', 31.0, 0.0, 3.6, 165),
('Salmon', 'Protein', 25.4, 0.0, 12.4, 208),
('Eggs', 'Protein', 13.0, 1.1, 11.0, 155),
('Greek Yogurt (plain)', 'Protein', 10.0, 3.6, 0.4, 59),
('Brown Rice (cooked)', 'Carbohydrate', 2.6, 23.0, 0.9, 111),
('Sweet Potato', 'Carbohydrate', 2.0, 20.1, 0.1, 86),
('Oats', 'Carbohydrate', 16.9, 66.3, 6.9, 389),
('Quinoa (cooked)', 'Carbohydrate', 4.4, 21.3, 1.9, 120),
('Avocado', 'Fat', 2.0, 8.5, 14.7, 160),
('Almonds', 'Fat', 21.2, 21.6, 49.9, 579),
('Olive Oil', 'Fat', 0.0, 0.0, 100.0, 884),
('Broccoli', 'Vegetable', 2.8, 7.0, 0.4, 34),
('Spinach', 'Vegetable', 2.9, 3.6, 0.4, 23),
('Banana', 'Fruit', 1.1, 22.8, 0.3, 89),
('Apple', 'Fruit', 0.3, 13.8, 0.2, 52);

-- Insert sample exercise types
INSERT INTO exercise_types (name, category, calories_per_minute, description) VALUES
('Running (6 mph)', 'Cardio', 10.0, 'Moderate pace running'),
('Walking (3.5 mph)', 'Cardio', 4.0, 'Brisk walking'),
('Cycling (moderate)', 'Cardio', 8.0, 'Moderate intensity cycling'),
('Swimming', 'Cardio', 11.0, 'General swimming'),
('Weight Training', 'Strength', 6.0, 'General weight lifting'),
('Push-ups', 'Strength', 7.0, 'Bodyweight push-ups'),
('Squats', 'Strength', 8.0, 'Bodyweight squats'),
('Yoga', 'Flexibility', 3.0, 'Hatha yoga'),
('Pilates', 'Flexibility', 4.0, 'General pilates'),
('HIIT', 'Cardio', 12.0, 'High-intensity interval training');

-- Insert sample supplements
INSERT INTO supplements (name, category, recommended_dosage, timing, description) VALUES
('Multivitamin', 'General Health', '1 tablet daily', 'with_meal', 'Complete vitamin and mineral supplement'),
('Vitamin D3', 'Bone Health', '1000-2000 IU daily', 'with_meal', 'Supports bone health and immune function'),
('Omega-3 Fish Oil', 'Heart Health', '1000mg daily', 'with_meal', 'Supports heart and brain health'),
('Protein Powder', 'Fitness', '1-2 scoops daily', 'after_workout', 'Supports muscle recovery and growth'),
('Creatine', 'Fitness', '3-5g daily', 'after_workout', 'Enhances strength and power'),
('Magnesium', 'Sleep & Recovery', '200-400mg daily', 'evening', 'Supports muscle function and sleep'),
('Probiotics', 'Digestive Health', '1 capsule daily', 'empty_stomach', 'Supports digestive and immune health'),
('Vitamin C', 'Immune Support', '500-1000mg daily', 'morning', 'Antioxidant and immune support'),
('B-Complex', 'Energy', '1 capsule daily', 'morning', 'Supports energy metabolism'),
('Zinc', 'Immune Support', '8-11mg daily', 'empty_stomach', 'Supports immune function and wound healing');

-- Functions for calculations
CREATE OR REPLACE FUNCTION calculate_ree(
  gender text,
  weight_kg numeric,
  height_cm numeric,
  age integer
) RETURNS numeric AS $$
BEGIN
  IF gender = 'male' THEN
    RETURN 66.437 + (13.752 * weight_kg) + (5.003 * height_cm) - (6.755 * age);
  ELSE
    RETURN 655.096 + (9.563 * weight_kg) + (1.85 * height_cm) - (4.676 * age);
  END IF;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION calculate_tee(
  ree numeric,
  activity_level text
) RETURNS numeric AS $$
DECLARE
  activity_factor numeric;
BEGIN
  CASE activity_level
    WHEN 'sedentary' THEN activity_factor := 1.2;
    WHEN 'lightly_active' THEN activity_factor := 1.375;
    WHEN 'moderately_active' THEN activity_factor := 1.55;
    WHEN 'very_active' THEN activity_factor := 1.725;
    WHEN 'extremely_active' THEN activity_factor := 1.9;
    ELSE activity_factor := 1.2;
  END CASE;
  
  RETURN ree * activity_factor;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION calculate_body_fat_percentage(
  gender text,
  bmi numeric,
  age integer
) RETURNS numeric AS $$
BEGIN
  IF gender = 'male' THEN
    RETURN 1.20 * bmi + 0.23 * age - 16.2;
  ELSE
    RETURN 1.20 * bmi + 0.23 * age - 5.4;
  END IF;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_metabolic_macros(
  metabolic_profile text
) RETURNS TABLE(protein_pct numeric, carb_pct numeric, fat_pct numeric) AS $$
BEGIN
  CASE metabolic_profile
    WHEN 'fast_oxidizer' THEN
      RETURN QUERY SELECT 20.0::numeric, 40.0::numeric, 40.0::numeric;
    WHEN 'slow_oxidizer' THEN
      RETURN QUERY SELECT 40.0::numeric, 20.0::numeric, 40.0::numeric;
    WHEN 'medium_oxidizer' THEN
      RETURN QUERY SELECT 30.0::numeric, 30.0::numeric, 40.0::numeric;
    ELSE
      RETURN QUERY SELECT 30.0::numeric, 30.0::numeric, 40.0::numeric;
  END CASE;
END;
$$ LANGUAGE plpgsql;