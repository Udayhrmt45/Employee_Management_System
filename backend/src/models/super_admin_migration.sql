-- Migration to add SUPER_ADMIN role

-- 1. Add SUPER_ADMIN to user roles
ALTER TYPE user_role_enum ADD VALUE IF NOT EXISTS 'SUPER_ADMIN';

-- 2. Allow users without a company (for super admins)
ALTER TABLE users ALTER COLUMN company_id DROP NOT NULL;

-- 3. Create platform settings table
CREATE TABLE IF NOT EXISTS settings (
  id BIGSERIAL PRIMARY KEY,
  key VARCHAR(255) UNIQUE NOT NULL,
  value JSONB,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 4. Add is_active to companies for activate/deactivate
ALTER TABLE companies ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
