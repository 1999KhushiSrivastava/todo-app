import Database from "better-sqlite3";

export type DB = Database.Database;

/** Opens (and migrates) a SQLite database. Use ":memory:" for tests. */
export function createDb(file: string = process.env.DB_FILE ?? "todos.db"): DB {
  const db = new Database(file);
  if (file !== ":memory:") db.pragma("journal_mode = WAL");
  db.exec(`
    CREATE TABLE IF NOT EXISTS todos (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      title        TEXT    NOT NULL,
      description  TEXT    NOT NULL DEFAULT '',
      completed    INTEGER NOT NULL DEFAULT 0,
      priority     TEXT    NOT NULL DEFAULT 'medium' CHECK (priority IN ('low','medium','high')),
      category     TEXT    NOT NULL DEFAULT 'personal',
      due_date     TEXT,
      due_time     TEXT,
      created_at   TEXT    NOT NULL,
      updated_at   TEXT    NOT NULL,
      completed_at TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_todos_completed ON todos(completed);
  `);
  migrate(db);
  return db;
}

/** Adds columns introduced after the first release to databases created earlier. */
function migrate(db: DB): void {
  const cols = (db.prepare("PRAGMA table_info(todos)").all() as { name: string }[]).map((c) => c.name);
  if (!cols.includes("category")) {
    db.exec("ALTER TABLE todos ADD COLUMN category TEXT NOT NULL DEFAULT 'personal'");
  }
  if (!cols.includes("due_time")) {
    db.exec("ALTER TABLE todos ADD COLUMN due_time TEXT");
  }
}
