-- Add image column to debates table
ALTER TABLE debates
ADD COLUMN image_url TEXT;

-- Add a comment to the column for clarity
COMMENT ON COLUMN debates.image_url IS 'URL or base64 encoded string of the debate image';