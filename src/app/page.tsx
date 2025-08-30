'use client';

import { useState, useEffect } from 'react';
import { Mug } from '../../api/lib/db';
import Link from 'next/link';

export default function Home() {
  const [mug1, setMug1] = useState<Mug | null>(null);
  const [mug2, setMug2] = useState<Mug | null>(null);
  const [loading, setLoading] = useState(false);
  const [voting, setVoting] = useState(false);

  const fetchBattle = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/battle');
      const data = await response.json();
      setMug1(data.mug1);
      setMug2(data.mug2);
    } catch (error) {
      console.error('Error fetching battle:', error);
    } finally {
      setLoading(false);
    }
  };

  const vote = async (winner: Mug, loser: Mug) => {
    setVoting(true);
    try {
      await fetch('/api/vote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          winnerId: winner.id,
          loserId: loser.id,
        }),
      });
      
      // Fetch next battle
      await fetchBattle();
    } catch (error) {
      console.error('Error voting:', error);
    } finally {
      setVoting(false);
    }
  };

  useEffect(() => {
    fetchBattle();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-2xl font-semibold text-gray-700">Loading the next battle...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            🏆 Mug Tournament 🏆
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            Which mug deserves a spot on the cabinet? You decide!
          </p>
          <Link 
            href="/leaderboard" 
            className="inline-block bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            View Leaderboard
          </Link>
        </div>

        {/* Battle Arena */}
        {mug1 && mug2 && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-center mb-8 text-gray-800">
              Choose Your Favorite!
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
              {/* Mug 1 */}
              <div className="text-center">
                <button
                  onClick={() => vote(mug1, mug2)}
                  disabled={voting}
                  className="group w-full p-6 rounded-xl border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 disabled:opacity-50"
                >
                  <div className="aspect-square mb-4 flex items-center justify-center bg-gray-50 rounded-lg overflow-hidden">
                    <img
                      src={`/mugs/${mug1.filename}`}
                      alt={mug1.name}
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                  <h3 className="text-xl font-semibold capitalize text-gray-800 group-hover:text-blue-600">
                    {mug1.name}
                  </h3>
                  <div className="text-sm text-gray-500 mt-2">
                    {mug1.wins}W - {mug1.losses}L ({(mug1.winPercentage * 100).toFixed(1)}%)
                  </div>
                </button>
              </div>

              {/* VS */}
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-400">VS</div>
              </div>

              {/* Mug 2 */}
              <div className="text-center">
                <button
                  onClick={() => vote(mug2, mug1)}
                  disabled={voting}
                  className="group w-full p-6 rounded-xl border-2 border-gray-200 hover:border-red-500 hover:bg-red-50 transition-all duration-200 disabled:opacity-50"
                >
                  <div className="aspect-square mb-4 flex items-center justify-center bg-gray-50 rounded-lg overflow-hidden">
                    <img
                      src={`/mugs/${mug2.filename}`}
                      alt={mug2.name}
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                  <h3 className="text-xl font-semibold capitalize text-gray-800 group-hover:text-red-600">
                    {mug2.name}
                  </h3>
                  <div className="text-sm text-gray-500 mt-2">
                    {mug2.wins}W - {mug2.losses}L ({(mug2.winPercentage * 100).toFixed(1)}%)
                  </div>
                </button>
              </div>
            </div>

            {voting && (
              <div className="text-center mt-6">
                <div className="text-lg font-semibold text-gray-600">Recording your vote...</div>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-8 text-gray-500">
          <p>Click on your favorite mug to cast your vote!</p>
        </div>
      </div>
    </div>
  );
}
