import { NextResponse } from 'next/server';
import { getDB, getLeaderboard } from '../../../../api/lib/db';

export async function GET() {
  try {
    getDB(); // Initialize database
    const leaderboard = getLeaderboard();
    return NextResponse.json(leaderboard);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 });
  }
}