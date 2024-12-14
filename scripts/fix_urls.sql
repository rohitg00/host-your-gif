-- Update all share URLs to use /uploads/ instead of /g/
UPDATE gifs 
SET "shareUrl" = REPLACE("shareUrl", '/g/', '/uploads/')
WHERE "shareUrl" LIKE '%/g/%'; 