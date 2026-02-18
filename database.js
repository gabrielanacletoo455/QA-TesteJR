const Database = require("better-sqlite3");
const path = require("path");

const db = new Database(path.join(__dirname, "jobs.db"));

db.pragma("journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS jobs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    company TEXT,
    location TEXT NOT NULL,
    salary_min REAL,
    salary_max REAL,
    type TEXT NOT NULL DEFAULT 'CLT',
    level TEXT NOT NULL DEFAULT 'junior',
    description TEXT,
    requirements TEXT,
    status TEXT NOT NULL DEFAULT 'active',
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  )
`);

module.exports = db;
