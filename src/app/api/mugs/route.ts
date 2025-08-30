import { NextResponse } from 'next/server';
import { getDB, getAllMugs } from '../../../../api/lib/db';

export async function GET() {
  try {
    getDB(); // Initialize database
    const mugs = getAllMugs();
    return NextResponse.json(mugs);
  } catch (error) {
    console.error('Error fetching mugs:', error);
    return NextResponse.json({ error: 'Failed to fetch mugs' }, { status: 500 });
  }
}