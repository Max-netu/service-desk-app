
-- Insert sample locations
INSERT INTO locations (name, address, is_active, created_at, updated_at) VALUES 
('Gaming Hall Zagreb Centar', 'Ilica 10, Zagreb', 1, datetime('now'), datetime('now')),
('Gaming Hall Split', 'Riva 5, Split', 1, datetime('now'), datetime('now')),
('Gaming Hall Rijeka', 'Korzo 15, Rijeka', 1, datetime('now'), datetime('now'));

-- Insert sample machines
INSERT INTO machines (machine_id, location_id, model, is_active, created_at, updated_at) VALUES 
('ZG-001', 1, 'MultiGame Pro X1', 1, datetime('now'), datetime('now')),
('ZG-002', 1, 'MultiGame Pro X1', 1, datetime('now'), datetime('now')),
('ZG-003', 1, 'Lucky Seven 2024', 1, datetime('now'), datetime('now')),
('ST-001', 2, 'MultiGame Pro X1', 1, datetime('now'), datetime('now')),
('ST-002', 2, 'Lucky Seven 2024', 1, datetime('now'), datetime('now')),
('RI-001', 3, 'MultiGame Pro X1', 1, datetime('now'), datetime('now'));
