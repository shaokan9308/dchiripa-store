-- =============================================
-- SUPABASE RLS SECURITY FIX
-- Run this in Supabase SQL Editor to enable Row Level Security
-- =============================================

-- 1. Enable RLS on all tables
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Account" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Session" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Verification" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Product" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Subscription" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Purchase" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Download" ENABLE ROW LEVEL SECURITY;

-- 2. Create policies for User table
CREATE POLICY "Users can view own profile" ON "User"
  FOR SELECT USING (auth.uid()::text = id);

CREATE POLICY "Users can update own profile" ON "User"
  FOR UPDATE USING (auth.uid()::text = id);

-- 3. Create policies for Account table
CREATE POLICY "Users can view own accounts" ON "Account"
  FOR SELECT USING (auth.uid()::text = "userId");

CREATE POLICY "Users can manage own accounts" ON "Account"
  FOR ALL USING (auth.uid()::text = "userId");

-- 4. Create policies for Session table
CREATE POLICY "Users can view own sessions" ON "Session"
  FOR SELECT USING (auth.uid()::text = "userId");

CREATE POLICY "Users can manage own sessions" ON "Session"
  FOR ALL USING (auth.uid()::text = "userId");

-- 5. Create policies for Product table (public read, admin write)
CREATE POLICY "Anyone can view active products" ON "Product"
  FOR SELECT USING ("isActive" = true);

CREATE POLICY "Admin can manage products" ON "Product"
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM "User" 
      WHERE id = auth.uid()::text AND role = 'admin'
    )
  );

-- 6. Create policies for Subscription table
CREATE POLICY "Users can view own subscription" ON "Subscription"
  FOR SELECT USING (auth.uid()::text = "userId");

CREATE POLICY "Admin can manage subscriptions" ON "Subscription"
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM "User" 
      WHERE id = auth.uid()::text AND role = 'admin'
    )
  );

-- 7. Create policies for Purchase table
CREATE POLICY "Users can view own purchases" ON "Purchase"
  FOR SELECT USING (auth.uid()::text = "userId");

CREATE POLICY "Admin can manage purchases" ON "Purchase"
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM "User" 
      WHERE id = auth.uid()::text AND role = 'admin'
    )
  );

-- 8. Create policies for Download table
CREATE POLICY "Users can view own downloads" ON "Download"
  FOR SELECT USING (auth.uid()::text = "userId");

CREATE POLICY "Users can create own downloads" ON "Download"
  FOR INSERT WITH CHECK (auth.uid()::text = "userId");

CREATE POLICY "Admin can manage downloads" ON "Download"
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM "User" 
      WHERE id = auth.uid()::text AND role = 'admin'
    )
  );

-- 9. Create policies for Verification table
CREATE POLICY "Users can view own verifications" ON "Verification"
  FOR SELECT USING (true);

CREATE POLICY "System can manage verifications" ON "Verification"
  FOR ALL USING (true);

-- 10. Verify RLS is enabled
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;
