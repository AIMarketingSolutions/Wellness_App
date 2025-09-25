/*
  # Add custom macro percentage columns to user_profiles

  1. New Columns
    - `custom_protein_percentage` (numeric, nullable)
    - `custom_carb_percentage` (numeric, nullable) 
    - `custom_fat_percentage` (numeric, nullable)
    - `weight_loss_goal` (text, nullable)
    - `deficit_method` (text, nullable)
    - `target_weight` (numeric, nullable)

  2. Changes
    - Add missing columns to support custom macro ratios and weight loss goals
    - All columns are nullable as they are optional features
*/

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

-- Add weight loss goal columns
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'weight_loss_goal'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN weight_loss_goal text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'deficit_method'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN deficit_method text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'target_weight'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN target_weight numeric(5,2);
  END IF;
END $$;

-- Add constraints for weight loss goal
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

-- Add constraints for deficit method
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