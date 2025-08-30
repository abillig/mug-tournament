import Database from 'better-sqlite3';
import { readdirSync } from 'fs';
import path from 'path';

export interface Mug {
  id: number;
  name: string;
  filename: string;
  wins: number;
  losses: number;
  winPercentage: number;
}

export interface Vote {
  id: number;
  winnerId: number;
  loserId: number;
  timestamp: string;
}

let db: Database.Database;

export function getDB() {
  if (!db) {
    db = new Database('mug-tournament.db');
    initializeDB();
  }
  return db;
}

function initializeDB() {
  // Create mugs table
  db.exec(`
    CREATE TABLE IF NOT EXISTS mugs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      filename TEXT NOT NULL,
      wins INTEGER DEFAULT 0,
      losses INTEGER DEFAULT 0
    )
  `);

  // Create votes table
  db.exec(`
    CREATE TABLE IF NOT EXISTS votes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      winner_id INTEGER NOT NULL,
      loser_id INTEGER NOT NULL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (winner_id) REFERENCES mugs(id),
      FOREIGN KEY (loser_id) REFERENCES mugs(id)
    )
  `);

  // Initialize mugs from image files if table is empty
  const mugCount = db.prepare('SELECT COUNT(*) as count FROM mugs').get() as { count: number };
  if (mugCount.count === 0) {
    seedMugs();
  }
}

function seedMugs() {
  const mugsDir = path.join(process.cwd(), 'public/mugs');
  const files = readdirSync(mugsDir).filter(file => file.endsWith('.png'));
  
  const insert = db.prepare('INSERT INTO mugs (name, filename) VALUES (?, ?)');
  const insertMany = db.transaction((mugs: { name: string, filename: string }[]) => {
    for (const mug of mugs) insert.run(mug.name, mug.filename);
  });

  const mugData = files.map(file => ({
    name: file.replace('.png', '').replace(/-/g, ' '),
    filename: file
  }));

  insertMany(mugData);
  console.log(`Initialized ${files.length} mugs in database`);
}

export function getAllMugs(): Mug[] {
  const mugs = db.prepare(`
    SELECT 
      id, 
      name, 
      filename, 
      wins, 
      losses,
      CASE 
        WHEN (wins + losses) = 0 THEN 0.5
        ELSE CAST(wins AS REAL) / (wins + losses)
      END as winPercentage
    FROM mugs
    ORDER BY winPercentage DESC, wins DESC
  `).all() as Mug[];
  
  return mugs;
}

export function getRandomMugPair(): [Mug, Mug] {
  const mugs = getAllMugs();
  if (mugs.length < 2) {
    throw new Error('Need at least 2 mugs for competition');
  }
  
  // Simple random selection
  const shuffled = [...mugs].sort(() => Math.random() - 0.5);
  return [shuffled[0], shuffled[1]];
}

export function recordVote(winnerId: number, loserId: number): void {
  const updateWinner = db.prepare('UPDATE mugs SET wins = wins + 1 WHERE id = ?');
  const updateLoser = db.prepare('UPDATE mugs SET losses = losses + 1 WHERE id = ?');
  const insertVote = db.prepare('INSERT INTO votes (winner_id, loser_id) VALUES (?, ?)');
  
  const transaction = db.transaction(() => {
    updateWinner.run(winnerId);
    updateLoser.run(loserId);
    insertVote.run(winnerId, loserId);
  });
  
  transaction();
}

export function getLeaderboard(): Mug[] {
  return getAllMugs();
}