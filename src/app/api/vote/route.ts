import { NextRequest, NextResponse } from 'next/server';
import { recordVote } from '../../../../api/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { winnerId, loserId } = await request.json();
    
    if (!winnerId || !loserId || winnerId === loserId) {
      return NextResponse.json({ error: 'Invalid vote data' }, { status: 400 });
    }
    
    await recordVote(winnerId, loserId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error recording vote:', error);
    return NextResponse.json({ error: 'Failed to record vote' }, { status: 500 });
  }
}