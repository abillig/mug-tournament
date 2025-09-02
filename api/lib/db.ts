import { createClient } from '@libsql/client';

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

let client: ReturnType<typeof createClient>;
let initialized = false;

export function getDB() {
  if (!client) {
    // Use Turso in production, SQLite locally
    if (process.env.NODE_ENV === 'production') {
      if (!process.env.TURSO_DATABASE_URL || !process.env.TURSO_AUTH_TOKEN) {
        throw new Error('TURSO_DATABASE_URL and TURSO_AUTH_TOKEN must be set in production');
      }
      client = createClient({
        url: process.env.TURSO_DATABASE_URL,
        authToken: process.env.TURSO_AUTH_TOKEN,
      });
    } else {
      // Local SQLite file for development
      client = createClient({
        url: 'file:mug-tournament.db',
      });
    }
  }
  return client;
}

async function ensureInitialized() {
  if (!initialized) {
    await initializeDB();
    initialized = true;
  }
}

async function initializeDB() {
  const db = getDB();
  
  // Create mugs table
  await db.execute(`
    CREATE TABLE IF NOT EXISTS mugs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      filename TEXT NOT NULL,
      wins INTEGER DEFAULT 0,
      losses INTEGER DEFAULT 0
    )
  `);

  // Create votes table
  await db.execute(`
    CREATE TABLE IF NOT EXISTS votes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      winner_id INTEGER NOT NULL,
      loser_id INTEGER NOT NULL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (winner_id) REFERENCES mugs(id),
      FOREIGN KEY (loser_id) REFERENCES mugs(id)
    )
  `);

  // Initialize mugs from hardcoded list if table is empty
  const result = await db.execute('SELECT COUNT(*) as count FROM mugs');
  const mugCount = result.rows[0]?.count as number;
  
  if (mugCount === 0) {
    await seedMugs();
  }
}

async function seedMugs() {
  // Hardcoded list of mugs for production reliability
  const mugFiles = [
    'acadia.png', 'aqua.png', 'bacteria.png', 'beatles.png', 'bicycles.png',
    'blue-lavender.png', 'blue-white.png', 'blue.png', 'breathe.png', 'california.png',
    'carbapenem.png', 'cat.png', 'christmas.png', 'clay.png', 'efron.png',
    'friends.png', 'heaven.png', 'how-you-doin.png', 'internet.png', 'journal-news.png',
    'kensington.png', 'lamour-toujours.png', 'milagro.png', 'montreal.png', 'nechama.png',
    'olympia.png', 'pink.png', 'polka-dot.png', 'presidents.png', 'rabbit.png',
    'sleep.png', 'st-donat.png', 'vibras.png'
  ];
  
  const db = getDB();
  
  // Use transaction for better performance
  await db.batch(
    mugFiles.map(file => ({
      sql: 'INSERT INTO mugs (name, filename) VALUES (?, ?)',
      args: [file.replace('.png', '').replace(/-/g, ' '), file]
    }))
  );
  
  console.log(`Initialized ${mugFiles.length} mugs in database`);
}

export async function getAllMugs(): Promise<Mug[]> {
  const db = getDB();
  await ensureInitialized();
  const result = await db.execute(`
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
  `);
  
  return result.rows.map(row => ({
    id: row.id as number,
    name: row.name as string,
    filename: row.filename as string,
    wins: row.wins as number,
    losses: row.losses as number,
    winPercentage: row.winPercentage as number,
  }));
}

export async function getRandomMugPair(): Promise<[Mug, Mug]> {
  await ensureInitialized();
  const mugs = await getAllMugs();
  if (mugs.length < 2) {
    throw new Error('Need at least 2 mugs for competition');
  }
  
  // Simple random selection
  const shuffled = [...mugs].sort(() => Math.random() - 0.5);
  return [shuffled[0], shuffled[1]];
}

export async function recordVote(winnerId: number, loserId: number): Promise<void> {
  const db = getDB();
  await ensureInitialized();
  
  // Use transaction to ensure consistency
  await db.batch([
    {
      sql: 'UPDATE mugs SET wins = wins + 1 WHERE id = ?',
      args: [winnerId]
    },
    {
      sql: 'UPDATE mugs SET losses = losses + 1 WHERE id = ?',
      args: [loserId]
    },
    {
      sql: 'INSERT INTO votes (winner_id, loser_id) VALUES (?, ?)',
      args: [winnerId, loserId]
    }
  ]);
}

export async function getLeaderboard(): Promise<Mug[]> {
  return getAllMugs();
}