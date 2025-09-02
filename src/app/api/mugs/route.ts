import { NextResponse } from 'next/server';
import { getAllMugs } from '../../../../api/lib/db';

export async function GET() {
  try {
    const mugs = await getAllMugs();
    return NextResponse.json(mugs);
  } catch (error) {
    console.error('Error fetching mugs:', error);
    return NextResponse.json({ error: 'Failed to fetch mugs' }, { status: 500 });
  }
}