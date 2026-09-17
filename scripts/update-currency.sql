-- Update existing products from EUR to MXN
UPDATE "Product" SET currency = 'mxn' WHERE currency = 'eur';
UPDATE "Purchase" SET currency = 'mxn' WHERE currency = 'eur';

-- Verify changes
SELECT id, name, price, currency FROM "Product" LIMIT 5;
