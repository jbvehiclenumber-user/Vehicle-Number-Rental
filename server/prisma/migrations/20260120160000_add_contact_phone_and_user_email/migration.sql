-- Add contact phone column for companies (optional)
ALTER TABLE "companies" ADD COLUMN "contact_phone" TEXT;

-- Add email column for users (optional, but unique when present)
ALTER TABLE "users" ADD COLUMN "email" TEXT;

-- Enforce uniqueness for user email when provided
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");


