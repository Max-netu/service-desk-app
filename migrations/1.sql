
-- Users table to store additional user information and roles
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  role TEXT NOT NULL CHECK (role IN ('korisnik', 'tehnicar', 'administracija')),
  is_active BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Gaming hall locations
CREATE TABLE locations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  address TEXT,
  is_active BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Gaming machines
CREATE TABLE machines (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  machine_id TEXT NOT NULL UNIQUE,
  location_id INTEGER NOT NULL,
  model TEXT,
  is_active BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Support tickets
CREATE TABLE tickets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ticket_number TEXT NOT NULL UNIQUE,
  user_id TEXT NOT NULL,
  technician_id TEXT,
  location_id INTEGER NOT NULL,
  machine_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'nova' CHECK (status IN ('nova', 'u_tijeku', 'ceka_se_dio', 'dovrseno', 'zatvoreno')),
  urgency TEXT NOT NULL DEFAULT 'srednja' CHECK (urgency IN ('niska', 'srednja', 'visoka', 'kriticna')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Ticket comments and work logs
CREATE TABLE ticket_comments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ticket_id INTEGER NOT NULL,
  user_id TEXT NOT NULL,
  comment TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- File attachments for tickets
CREATE TABLE ticket_attachments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ticket_id INTEGER NOT NULL,
  filename TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT,
  file_size INTEGER,
  uploaded_by TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
