-- Remove address and contactPerson columns from companies table
-- This migration removes the address and contactPerson fields that are no longer needed

-- Step 1: Drop the columns (if they exist)
ALTER TABLE companies DROP COLUMN IF EXISTS address;
ALTER TABLE companies DROP COLUMN IF EXISTS contact_person;

-- Note: This will permanently delete the data in these columns
-- Make sure to backup your data if needed before running this migration

