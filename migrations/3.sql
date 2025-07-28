
-- Update the status values in existing records
UPDATE tickets SET status = 'cekanje_porezne' WHERE status = 'dovrseno';
