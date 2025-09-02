import { NextResponse } from 'next/server';
import { getDB, getRandomMugPair } from '../../../../api/lib/db';

export async function GET() {
  try {
    getDB(); // Initialize database
    const [mug1, mug2] = await getRandomMugPair();
    return NextResponse.json({ mug1, mug2 });
  } catch (error) {
    console.error('Error getting battle pair:', error);
    return NextResponse.json({ error: 'Failed to get battle pair' }, { status: 500 });
  }
}