export type GameMode = 301 | 501;

export interface DartThrow {
  score: number;
  multiplier: 1 | 2 | 3;
  label: string; // e.g., "T20", "D5", "BULL"
  x: number; // Normalized coordinate 0-1
  y: number; // Normalized coordinate 0-1
  isBust: boolean;
}

export interface PlayerStats {
  totalPoints: number;
  totalDarts: number;
  history: number[]; // History of 3-dart averages for the graph
  wins: number;
}

export interface Player {
  id: number;
  name: string;
  score: number;
  stats: PlayerStats;
  currentLegDarts: DartThrow[]; // Darts thrown in current turn (max 3)
}

export interface GameState {
  mode: GameMode;
  doubleOut: boolean;
  currentPlayerIndex: 0 | 1;
  players: [Player, Player];
  winner: number | null;
  round: number;
}

export const SECTORS = [20, 1, 18, 4, 13, 6, 10, 15, 2, 17, 3, 19, 7, 16, 8, 11, 14, 9, 12, 5];