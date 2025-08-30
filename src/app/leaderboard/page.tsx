'use client';

import { useState, useEffect } from 'react';
import { Mug } from '../../../api/lib/db';
import Link from 'next/link';

export default function Leaderboard() {
  const [mugs, setMugs] = useState<Mug[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await fetch('/api/leaderboard');
        const data = await response.json();
        setMugs(data);
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-2xl font-semibold text-gray-700">Loading leaderboard...</div>
      </div>
    );
  }

  const getRankEmoji = (index: number) => {
    if (index === 0) return '🥇';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return `${index + 1}.`;
  };

  const getRankColor = (index: number) => {
    if (index === 0) return 'bg-yellow-100 border-yellow-300';
    if (index === 1) return 'bg-gray-100 border-gray-300';
    if (index === 2) return 'bg-amber-100 border-amber-300';
    return 'bg-white border-gray-200';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            📊 Leaderboard 📊
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            See which mugs are dominating the tournament!
          </p>
          <Link 
            href="/" 
            className="inline-block bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Back to Tournament
          </Link>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Total Mugs</h3>
            <div className="text-3xl font-bold text-purple-600">{mugs.length}</div>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Total Battles</h3>
            <div className="text-3xl font-bold text-blue-600">
              {mugs.reduce((sum, mug) => sum + mug.wins + mug.losses, 0) / 2}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Top Win Rate</h3>
            <div className="text-3xl font-bold text-green-600">
              {mugs.length > 0 ? `${(mugs[0].winPercentage * 100).toFixed(1)}%` : '0%'}
            </div>
          </div>
        </div>

        {/* Leaderboard */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="p-6 bg-gradient-to-r from-purple-600 to-blue-600 text-white">
            <h2 className="text-2xl font-bold text-center">Mug Rankings</h2>
          </div>
          
          <div className="divide-y divide-gray-200">
            {mugs.map((mug, index) => (
              <div 
                key={mug.id} 
                className={`p-6 flex items-center space-x-6 hover:bg-gray-50 transition-colors border-l-4 ${getRankColor(index)}`}
              >
                {/* Rank */}
                <div className="text-2xl font-bold w-12 text-center">
                  {getRankEmoji(index)}
                </div>

                {/* Mug Image */}
                <div className="w-20 h-20 flex-shrink-0 bg-gray-50 rounded-lg overflow-hidden flex items-center justify-center">
                  <img
                    src={`/mugs/${mug.filename}`}
                    alt={mug.name}
                    className="max-w-full max-h-full object-contain"
                  />
                </div>

                {/* Mug Info */}
                <div className="flex-grow">
                  <h3 className="text-xl font-semibold capitalize text-gray-800 mb-1">
                    {mug.name}
                  </h3>
                  <div className="text-sm text-gray-500">
                    {mug.wins + mug.losses} total battles
                  </div>
                </div>

                {/* Stats */}
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-800 mb-1">
                    {(mug.winPercentage * 100).toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-500">
                    {mug.wins}W - {mug.losses}L
                  </div>
                </div>

                {/* Win Rate Bar */}
                <div className="w-24">
                  <div className="bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-purple-500 to-blue-500 h-full transition-all duration-300"
                      style={{ width: `${mug.winPercentage * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {mugs.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">☕</div>
            <h3 className="text-2xl font-semibold text-gray-700 mb-2">No battles yet!</h3>
            <p className="text-gray-600">Start voting to see the leaderboard.</p>
          </div>
        )}
      </div>
    </div>
  );
}