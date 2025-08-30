'use client';

import { useState, useEffect } from 'react';
import { Mug } from '../../../../api/lib/db';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function MugProfile() {
  const params = useParams();
  const [mug, setMug] = useState<Mug | null>(null);
  const [loading, setLoading] = useState(true);
  const [allMugs, setAllMugs] = useState<Mug[]>([]);

  useEffect(() => {
    const fetchMugData = async () => {
      try {
        // Get all mugs to find the specific one and calculate rank
        const response = await fetch('/api/leaderboard');
        const data = await response.json();
        setAllMugs(data);
        
        // Find the specific mug by ID
        const targetMug = data.find((m: Mug) => m.id === parseInt(params.id as string));
        setMug(targetMug || null);
      } catch (error) {
        console.error('Error fetching mug data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchMugData();
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-2xl font-semibold text-gray-700">Loading mug profile...</div>
      </div>
    );
  }

  if (!mug) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">☕</div>
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">Mug Not Found</h2>
          <Link 
            href="/leaderboard" 
            className="text-purple-600 hover:text-purple-700 underline"
          >
            Back to Leaderboard
          </Link>
        </div>
      </div>
    );
  }

  const rank = allMugs.findIndex(m => m.id === mug.id) + 1;
  const totalBattles = mug.wins + mug.losses;

  const getRankBadge = () => {
    if (rank === 1) return { emoji: '🥇', color: 'bg-yellow-500', text: 'Champion', mobileText: '🥇' };
    if (rank === 2) return { emoji: '🥈', color: 'bg-gray-400', text: 'Runner-up', mobileText: '🥈' };
    if (rank === 3) return { emoji: '🥉', color: 'bg-amber-600', text: 'Third Place', mobileText: '🥉' };
    return { emoji: '', color: 'bg-blue-500', text: `Rank #${rank}`, mobileText: `#${rank}` };
  };

  const badge = getRankBadge();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 px-4 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Navigation */}
        <div className="mb-6 text-center">
          <Link 
            href="/leaderboard" 
            className="inline-block text-blue-600 hover:text-blue-700 mb-4"
          >
            ← Back to Leaderboard
          </Link>
        </div>

        {/* Baseball Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border-8 border-gray-200" style={{
          background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.6)'
        }}>
          {/* Card Header with Rank Badge */}
          <div className="relative bg-gradient-to-r from-red-600 to-blue-600 text-white p-6 text-center">
            <div className={`absolute top-4 right-4 ${badge.color} text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg`}>
              <span className="hidden md:inline">{badge.emoji} {badge.text}</span>
              <span className="md:hidden">{badge.mobileText}</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold capitalize tracking-wide">
              {mug.name}
            </h1>
            <div className="text-lg opacity-90 mt-2">Tournament Competitor</div>
          </div>

          {/* Main Image */}
          <div className="p-8 bg-white">
            <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl flex items-center justify-center shadow-inner border-4 border-gray-200">
              <img
                src={`/mugs/${mug.filename}`}
                alt={mug.name}
                className="max-w-full max-h-full object-contain drop-shadow-lg"
              />
            </div>
          </div>

          {/* Stats Section */}
          <div className="bg-gradient-to-r from-slate-100 to-slate-200 p-6">
            <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Tournament Stats</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg p-4 text-center shadow-md">
                <div className="text-2xl font-bold text-green-600">{mug.wins}</div>
                <div className="text-sm text-gray-600 font-medium">Wins</div>
              </div>
              <div className="bg-white rounded-lg p-4 text-center shadow-md">
                <div className="text-2xl font-bold text-red-600">{mug.losses}</div>
                <div className="text-sm text-gray-600 font-medium">Losses</div>
              </div>
              <div className="bg-white rounded-lg p-4 text-center shadow-md">
                <div className="text-2xl font-bold text-blue-600">{totalBattles}</div>
                <div className="text-sm text-gray-600 font-medium">Total Battles</div>
              </div>
              <div className="bg-white rounded-lg p-4 text-center shadow-md">
                <div className="text-2xl font-bold text-purple-600">{(mug.winPercentage * 100).toFixed(1)}%</div>
                <div className="text-sm text-gray-600 font-medium">Win Rate</div>
              </div>
            </div>

            {/* Win Rate Bar */}
            <div className="mt-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Performance</span>
                <span className="text-sm text-gray-600">{(mug.winPercentage * 100).toFixed(1)}%</span>
              </div>
              <div className="bg-gray-300 rounded-full h-4 overflow-hidden shadow-inner">
                <div 
                  className="bg-gradient-to-r from-green-400 to-blue-500 h-full transition-all duration-500 rounded-full shadow-sm"
                  style={{ width: `${mug.winPercentage * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Card Footer */}
          <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-white p-4 text-center">
            <div className="text-sm opacity-75">Mug Tournament Series • 2025 Edition</div>
          </div>
        </div>
      </div>
    </div>
  );
}