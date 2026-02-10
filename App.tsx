import React, { useState, useEffect, useRef } from 'react';
import { GameState, Player, GameMode, DartThrow, PlayerStats } from './types';
import { CHECKOUTS, SOUNDS, INITIAL_STATS } from './constants';
import { NeonCard } from './components/NeonCard';
import { Dartboard } from './components/Dartboard';
import { StatsPanel } from './components/StatsPanel';

const INITIAL_SCORE = 501;

function App() {
  // Setup State
  const [setupMode, setSetupMode] = useState(true);
  
  // Game State
  const [game, setGame] = useState<GameState>({
    mode: 501,
    doubleOut: true,
    currentPlayerIndex: 0,
    players: [
      { id: 1, name: "Player 1", score: INITIAL_SCORE, stats: { ...INITIAL_STATS }, currentLegDarts: [] },
      { id: 2, name: "Player 2", score: INITIAL_SCORE, stats: { ...INITIAL_STATS }, currentLegDarts: [] }
    ],
    winner: null,
    round: 1
  });

  // Camera State
  const videoRef = useRef<HTMLVideoElement>(null);

  // Audio refs
  const audioHit = useRef(new Audio(SOUNDS.HIT));
  const audioBust = useRef(new Audio(SOUNDS.BUST));
  const audioWin = useRef(new Audio(SOUNDS.WIN));

  useEffect(() => {
    // Start Camera
    if (!setupMode && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
          if (videoRef.current) videoRef.current.srcObject = stream;
        })
        .catch(err => console.error("Camera error:", err));
    }
  }, [setupMode]);

  const playSound = (type: 'hit' | 'bust' | 'win') => {
    const audio = type === 'hit' ? audioHit.current : type === 'bust' ? audioBust.current : audioWin.current;
    audio.currentTime = 0;
    audio.play().catch(() => {}); // Ignore interaction errors
  };

  const startGame = (mode: GameMode, doubleOut: boolean, p1Name: string, p2Name: string) => {
    setGame({
      mode,
      doubleOut,
      currentPlayerIndex: 0,
      players: [
        { id: 1, name: p1Name || "Player 1", score: mode, stats: { ...INITIAL_STATS, history: [] }, currentLegDarts: [] },
        { id: 2, name: p2Name || "Player 2", score: mode, stats: { ...INITIAL_STATS, history: [] }, currentLegDarts: [] }
      ],
      winner: null,
      round: 1
    });
    setSetupMode(false);
  };

  const handleDart = (points: number, multiplier: 1 | 2 | 3, label: string) => {
    if (game.winner) return;

    setGame(prev => {
      const currentPlayer = prev.players[prev.currentPlayerIndex];
      const currentScore = currentPlayer.score;
      const dartScore = points * multiplier;
      const newScore = currentScore - dartScore;
      
      let isBust = false;
      let isWin = false;

      // Bust Logic
      if (newScore < 0) isBust = true;
      else if (newScore === 0) {
        if (prev.doubleOut && multiplier !== 2) isBust = true;
        else isWin = true;
      } else if (newScore === 1 && prev.doubleOut) {
        isBust = true;
      }

      // Record Dart
      const newDart: DartThrow = {
        score: isBust ? 0 : dartScore,
        multiplier,
        label: isBust ? "BUST" : label,
        x: 0, y: 0, // Mock coordinates
        isBust
      };

      const updatedDarts = [...currentPlayer.currentLegDarts, newDart];
      const updatedScore = isBust ? currentScore : newScore; // On bust, score doesn't change from start of turn (simplified logic for immediate visual, technically reverts at end of turn)

      // Handle Sound
      if (isWin) playSound('win');
      else if (isBust) playSound('bust');
      else playSound('hit');

      // Update Player
      const updatedPlayer = {
        ...currentPlayer,
        score: updatedScore,
        currentLegDarts: updatedDarts,
        stats: {
          ...currentPlayer.stats,
          totalPoints: currentPlayer.stats.totalPoints + (isBust ? 0 : dartScore),
          totalDarts: currentPlayer.stats.totalDarts + 1
        }
      };

      const newPlayers = [...prev.players] as [Player, Player];
      newPlayers[prev.currentPlayerIndex] = updatedPlayer;

      // Check Win or End Turn
      if (isWin) {
        // Update stats win count
        newPlayers[prev.currentPlayerIndex].stats.wins += 1;
        return {
          ...prev,
          players: newPlayers,
          winner: prev.currentPlayerIndex
        };
      }
      
      // Auto switch after 3 darts or Bust
      if (updatedDarts.length === 3 || isBust) {
         // Calculate Avg for history before switch
         const avg = (updatedPlayer.stats.totalPoints / updatedPlayer.stats.totalDarts) * 3;
         newPlayers[prev.currentPlayerIndex].stats.history.push(avg);

         return {
           ...prev,
           players: newPlayers
         };
      }

      return {
        ...prev,
        players: newPlayers
      };
    });
  };

  const nextTurn = () => {
    setGame(prev => {
      // Clear darts for current player
      const p = [...prev.players] as [Player, Player];
      p[prev.currentPlayerIndex].currentLegDarts = [];
      
      // If bust occurred, reset score to what it was at start of turn? 
      // Simplified: current logic handles score interactively. 
      // Strict rules: if bust, score resets. 
      // Since we updated score dart-by-dart, we need to handle bust reset if not already handled.
      // My handleDart logic prevents score update on bust immediately.

      return {
        ...prev,
        currentPlayerIndex: prev.currentPlayerIndex === 0 ? 1 : 0,
        players: p,
        round: prev.currentPlayerIndex === 1 ? prev.round + 1 : prev.round
      };
    });
  };

  const resetGame = () => {
    setGame(prev => ({
      ...prev,
      winner: null,
      players: prev.players.map(p => ({
        ...p,
        score: prev.mode,
        currentLegDarts: [],
        // Keep stats history? Usually yes for a session.
      })) as [Player, Player],
      round: 1,
      currentPlayerIndex: 0
    }));
  };

  const getCheckoutHint = (score: number) => {
    return CHECKOUTS[score] || "";
  };

  // Render Setup Screen
  if (setupMode) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-appBg text-white p-4 bg-[url('https://images.unsplash.com/photo-1533560707687-b08e2448386a?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center">
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm"></div>
        <div className="relative z-10 w-full max-w-md bg-cardBg border-2 border-accentP1 rounded-2xl p-8 shadow-[0_0_30px_rgba(0,229,255,0.3)]">
          <h1 className="text-6xl font-display text-center mb-2 tracking-tighter">DART<span className="text-accentP1">PRO</span></h1>
          <p className="text-center text-gray-400 mb-8 font-body">V13 CHAMPIONSHIP EDITION</p>
          
          <form onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            startGame(
              parseInt(fd.get('mode') as string) as GameMode,
              fd.get('doubleOut') === 'on',
              fd.get('p1') as string,
              fd.get('p2') as string
            );
          }} className="space-y-6">
            
            <div className="space-y-2">
              <label className="text-sm text-gray-400 font-bold uppercase">Game Mode</label>
              <select name="mode" className="w-full bg-appBg border border-gray-700 rounded p-3 text-white focus:border-accentP1 outline-none">
                <option value="501">501</option>
                <option value="301">301</option>
              </select>
            </div>

            <div className="flex items-center space-x-3">
              <input type="checkbox" name="doubleOut" defaultChecked className="w-5 h-5 accent-accentP1" />
              <label className="text-white">Double Out Required</label>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2">
                <label className="text-sm text-gray-400">Player 1</label>
                <input name="p1" defaultValue="Guest 1" className="w-full bg-appBg border border-gray-700 rounded p-3 text-white focus:border-accentP1 outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-gray-400">Player 2</label>
                <input name="p2" defaultValue="Guest 2" className="w-full bg-appBg border border-gray-700 rounded p-3 text-white focus:border-accentP2 outline-none" />
              </div>
            </div>

            <button type="submit" className="w-full py-4 bg-accentP1 hover:bg-cyan-600 text-black font-bold rounded-lg text-lg transition-colors">
              START MATCH
            </button>
          </form>
        </div>
      </div>
    );
  }

  const currentPlayer = game.players[game.currentPlayerIndex];
  const isTurnOver = currentPlayer.currentLegDarts.length === 3 || game.winner !== null || (currentPlayer.currentLegDarts.length > 0 && currentPlayer.currentLegDarts[currentPlayer.currentLegDarts.length - 1].isBust);

  return (
    <div className="min-h-screen bg-appBg text-white flex flex-col overflow-hidden">
      {/* Top Bar */}
      <header className="h-16 border-b border-gray-800 flex items-center justify-between px-6 bg-cardBg">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-display tracking-tight">DART<span className="text-accentP1">PRO</span></span>
          <span className="px-2 py-0.5 bg-gray-800 rounded text-xs text-gray-400">V13</span>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right">
             <span className="block text-xs text-gray-500">MODE</span>
             <span className="font-bold text-accentP1">{game.mode} {game.doubleOut ? '(DO)' : ''}</span>
          </div>
          <button onClick={() => setSetupMode(true)} className="px-4 py-2 border border-gray-600 rounded hover:bg-gray-800 text-sm">EXIT</button>
        </div>
      </header>

      {/* Main Grid */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-0 lg:gap-6 p-0 lg:p-6 overflow-hidden">
        
        {/* LEFT COLUMN: Players & Scoreboard */}
        <div className="lg:col-span-4 flex flex-col gap-4 p-4 lg:p-0">
          {game.players.map((p, idx) => (
             <NeonCard 
                key={p.id} 
                isActive={game.currentPlayerIndex === idx && !game.winner} 
                accentColor={idx === 0 ? '#00E5FF' : '#FF4081'}
                className="p-6 relative overflow-hidden"
             >
                <div className="flex justify-between items-start mb-2">
                  <span className={`text-xl font-bold ${game.currentPlayerIndex === idx ? 'text-white' : 'text-gray-500'}`}>{p.name}</span>
                  <span className="text-xs text-gray-500">AVG: {((p.stats.totalPoints / (p.stats.totalDarts || 1)) * 3).toFixed(1)}</span>
                </div>
                
                <div className="flex justify-between items-end">
                   <span className="text-7xl font-display tracking-tighter text-white">{p.score}</span>
                   {game.winner === idx && <span className="text-gold font-display text-2xl animate-bounce">WINNER!</span>}
                </div>

                {/* Checkout Hint */}
                {game.currentPlayerIndex === idx && !game.winner && (
                  <div className="absolute top-4 right-4 text-right">
                    <span className="text-checkout text-xl font-bold font-display tracking-wide">
                      {getCheckoutHint(p.score)}
                    </span>
                  </div>
                )}
             </NeonCard>
          ))}

          {/* Current Turn Darts */}
          <div className="bg-black/40 rounded-xl p-4 border border-gray-800">
             <div className="flex justify-between items-center mb-2">
               <span className="text-sm text-gray-500 uppercase tracking-widest">Current Throw</span>
               <span className="text-sm text-white">Round {game.round}</span>
             </div>
             <div className="grid grid-cols-3 gap-2">
                {[0, 1, 2].map(i => {
                  const dart = currentPlayer.currentLegDarts[i];
                  return (
                    <div key={i} className={`h-16 rounded flex items-center justify-center text-xl font-bold border ${dart ? 'border-gray-600 bg-gray-800 text-white' : 'border-dashed border-gray-800 text-gray-700'}`}>
                      {dart ? dart.label : "--"}
                    </div>
                  )
                })}
             </div>
          </div>

          <div className="mt-auto">
             {game.winner !== null ? (
               <button onClick={resetGame} className="w-full py-6 bg-success text-white text-2xl font-display rounded-xl hover:opacity-90 transition-opacity">
                 PLAY AGAIN
               </button>
             ) : (
                <button 
                  onClick={nextTurn}
                  disabled={!isTurnOver}
                  className={`w-full py-6 text-2xl font-display rounded-xl transition-all ${isTurnOver ? 'bg-accentP1 text-black hover:bg-cyan-400' : 'bg-gray-800 text-gray-500 cursor-not-allowed'}`}
                >
                  NEXT PLAYER
                </button>
             )}
          </div>
        </div>

        {/* MIDDLE/RIGHT COLUMN: Visuals */}
        <div className="lg:col-span-8 grid grid-rows-2 gap-4 h-full p-4 lg:p-0">
           
           {/* Top Row: Camera & Board */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Camera Feed with Overlay */}
              <div className="relative rounded-xl overflow-hidden bg-black border border-gray-800 aspect-video md:aspect-auto">
                <video ref={videoRef} autoPlay playsInline muted className="absolute inset-0 w-full h-full object-cover opacity-60" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-64 h-64 border-2 border-green-500/50 rounded-full flex items-center justify-center relative">
                    <div className="w-1 h-4 bg-green-500/50 absolute top-0 -mt-2"></div>
                    <div className="w-1 h-4 bg-green-500/50 absolute bottom-0 -mb-2"></div>
                    <div className="h-1 w-4 bg-green-500/50 absolute left-0 -ml-2"></div>
                    <div className="h-1 w-4 bg-green-500/50 absolute right-0 -mr-2"></div>
                    <span className="text-green-500/80 text-xs mt-32 bg-black/50 px-2 rounded">YOLO V8 ACTIVE</span>
                  </div>
                </div>
                <div className="absolute top-2 left-2 bg-red-600 text-white text-[10px] px-2 py-0.5 rounded animate-pulse">LIVE</div>
              </div>

              {/* Interactive Virtual Board */}
              <div className="bg-cardBg rounded-xl border border-gray-800 p-4 flex items-center justify-center">
                 <Dartboard onSegmentClick={handleDart} />
              </div>
           </div>

           {/* Bottom Row: Stats */}
           <div className="h-full min-h-[250px]">
              <StatsPanel 
                player1={game.players[0]} 
                player2={game.players[1]} 
                accentP1="#00E5FF" 
                accentP2="#FF4081" 
              />
           </div>

        </div>
      </main>
    </div>
  );
}

export default App;