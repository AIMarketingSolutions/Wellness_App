/*
  # Add missing columns to user_profiles table

  1. Missing Columns
    - `height_inches` (numeric, for height in inches)
    - `weight_lbs` (numeric, for weight in pounds) 
    - `waist_inches` (numeric, for waist measurement)
    - `neck_inches` (numeric, for neck measurement)
    - `hip_inches` (numeric, for hip measurement, optional)
    - `custom_protein_percentage` (numeric, for custom macro ratios)
    - `custom_carb_percentage` (numeric, for custom macro ratios)
    - `custom_fat_percentage` (numeric, for custom macro ratios)
    - `weight_loss_goal` (text, with constraints)
    - `deficit_method` (text, with constraints)
    - `target_weight` (numeric, target weight goal)

  2. Data Type Updates
    - Convert existing weight_kg and height_cm to new imperial columns
    - Add proper constraints for new columns

  3. Safety
    - Use IF NOT EXISTS to prevent errors on re-run
    - Add appropriate constraints and defaults
*/

-- Add missing numeric columns
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'height_inches'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN height_inches numeric(5,2);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'weight_lbs'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN weight_lbs numeric(5,2);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'waist_inches'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN waist_inches numeric(5,2);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'neck_inches'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN neck_inches numeric(5,2);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'hip_inches'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN hip_inches numeric(5,2);
  END IF;
END $$;

-- Add custom macro percentage columns
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'custom_protein_percentage'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN custom_protein_percentage numeric(4,2);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'custom_carb_percentage'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN custom_carb_percentage numeric(4,2);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'custom_fat_percentage'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN custom_fat_percentage numeric(4,2);
  END IF;
END $$;

-- Add weight loss goal column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'weight_loss_goal'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN weight_loss_goal text;
  END IF;
END $$;

-- Add deficit method column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'deficit_method'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN deficit_method text;
  END IF;
END $$;

-- Add target weight column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'target_weight'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN target_weight numeric(5,2);
  END IF;
END $$;

-- Add constraints for weight_loss_goal if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'user_profiles' AND constraint_name = 'user_profiles_weight_loss_goal_check'
  ) THEN
    ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_weight_loss_goal_check 
    CHECK (weight_loss_goal = ANY (ARRAY['maintain'::text, 'lose_0_5'::text, 'lose_1'::text, 'lose_1_5'::text, 'lose_2'::text]));
  END IF;
END $$;

-- Add constraints for deficit_method if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'user_profiles' AND constraint_name = 'user_profiles_deficit_method_check'
  ) THEN
    ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_deficit_method_check 
    CHECK (deficit_method = ANY (ARRAY['diet_only'::text, 'exercise_only'::text, 'combined'::text]));
  END IF;
END $$;