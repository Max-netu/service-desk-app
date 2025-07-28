
-- Revert the status values back
UPDATE tickets SET status = 'dovrseno' WHERE status = 'cekanje_porezne';
