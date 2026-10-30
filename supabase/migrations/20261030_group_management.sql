-- Migration: Group Management Enhancements
-- Adds description to groups, role to group_members, and indexes for query performance.

-- 1. Add description column to groups if not present
ALTER TABLE groups 
ADD COLUMN IF NOT EXISTS description TEXT;

-- 2. Add role column to group_members if not present ('admin' or 'member', default 'member')
ALTER TABLE group_members 
ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'member';

-- Set group creator as admin for any existing groups
UPDATE group_members gm
SET role = 'admin'
FROM groups g
WHERE gm.group_id = g.id AND gm.user_id = g.created_by;

-- 3. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_group_members_group_user ON group_members(group_id, user_id);
CREATE INDEX IF NOT EXISTS idx_expenses_group_id ON expenses(group_id);
CREATE INDEX IF NOT EXISTS idx_expense_splits_expense_id ON expense_splits(expense_id);
CREATE INDEX IF NOT EXISTS idx_settlements_group_status ON settlements(group_id, status);
CREATE INDEX IF NOT EXISTS idx_groups_invite_code ON groups(invite_code);

