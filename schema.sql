CREATE TABLE IF NOT EXISTS qr_scans (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL,
  scanned_at TEXT NOT NULL,
  country TEXT,
  region TEXT,
  city TEXT,
  timezone TEXT,
  user_agent TEXT
);