import React from 'react';
import { Player } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface StatsPanelProps {
  player1: Player;
  player2: Player;
  accentP1: string;
  accentP2: string;
}

export const StatsPanel: React.FC<StatsPanelProps> = ({ player1, player2, accentP1, accentP2 }) => {
  // Combine histories into one dataset for the chart
  const maxLength = Math.max(player1.stats.history.length, player2.stats.history.length);
  const data = Array.from({ length: maxLength }, (_, i) => ({
    round: i + 1,
    p1: player1.stats.history[i] || null,
    p2: player2.stats.history[i] || null,
  }));

  const getAvg = (p: Player) => {
    if (p.stats.totalDarts === 0) return "0.0";
    return ((p.stats.totalPoints / p.stats.totalDarts) * 3).toFixed(1);
  };

  return (
    <div className="bg-cardBg border border-gray-800 rounded-xl p-4 w-full h-full flex flex-col">
      <h3 className="text-white font-display text-xl mb-4 tracking-wider">MATCH STATISTICS</h3>
      
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="text-center">
          <p className="text-sm text-gray-400">{player1.name}</p>
          <p className="text-2xl font-bold" style={{ color: accentP1 }}>{getAvg(player1)} <span className="text-sm text-gray-500">avg</span></p>
          <p className="text-sm text-gray-500">Wins: {player1.stats.wins}</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-400">{player2.name}</p>
          <p className="text-2xl font-bold" style={{ color: accentP2 }}>{getAvg(player2)} <span className="text-sm text-gray-500">avg</span></p>
          <p className="text-sm text-gray-500">Wins: {player2.stats.wins}</p>
        </div>
      </div>

      <div className="flex-1 min-h-[150px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis dataKey="round" stroke="#666" fontSize={12} tickLine={false} />
            <YAxis stroke="#666" fontSize={12} domain={[0, 180]} hide />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1E1E1E', border: '1px solid #333' }}
              itemStyle={{ fontSize: '12px' }}
              labelStyle={{ color: '#888', marginBottom: '5px' }}
            />
            <Line type="monotone" dataKey="p1" stroke={accentP1} strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
            <Line type="monotone" dataKey="p2" stroke={accentP2} strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};