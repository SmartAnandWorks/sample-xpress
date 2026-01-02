/*
  # Fix RLS Performance and Security Issues

  1. Security & Performance Fixes
    - Update RLS policies to use subquery `(select auth.uid())` instead of direct `auth.uid()` calls
      This prevents re-evaluation for each row and improves query performance at scale
    - Fix function search_path to be immutable and explicitly set to 'public'
      This prevents mutable search path security vulnerability

  2. Updated Policies
    - "Users can view own profile" - optimized with subquery
    - "Users can update own profile" - optimized with subquery
    - "Users can insert own profile" - optimized with subquery

  3. Function Security
    - `update_updated_at_column` now has immutable search_path
    - Function is recreated with SECURITY DEFINER to ensure consistent execution context

  4. Performance Impact
    - Subquery approach prevents re-evaluation, improving performance at scale
    - Especially important for queries accessing large datasets
*/

DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;

CREATE POLICY "Users can view own profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (id = (select auth.uid()));

CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (id = (select auth.uid()))
  WITH CHECK (id = (select auth.uid()));

CREATE POLICY "Users can insert own profile"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (id = (select auth.uid()));

DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
IMMUTABLE
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
