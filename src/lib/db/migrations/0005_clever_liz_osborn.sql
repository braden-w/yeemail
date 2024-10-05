-- Step 1: Drop the existing column
ALTER TABLE
  "session" DROP COLUMN "google_access_token_expires_at";

-- Step 2: Add the new column with the desired data type
ALTER TABLE
  "session"
ADD
  COLUMN "google_access_token_expires_at" timestamp WITH time zone;