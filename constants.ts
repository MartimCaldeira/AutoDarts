export const CHECKOUTS: Record<number, string> = {
  170: "T20 T20 BULL", 167: "T20 T19 BULL", 164: "T20 T18 BULL", 161: "T20 T17 BULL",
  160: "T20 T20 D20", 158: "T20 T20 D19", 156: "T20 T20 D18", 150: "T20 T18 D18",
  140: "T20 T16 D16", 130: "T20 T18 D8", 121: "T20 T11 D14", 120: "T20 20 D20",
  110: "T20 10 D20", 100: "T20 D20", 90: "T18 D18", 80: "T16 D16",
  70: "T18 D8", 60: "20 D20", 50: "10 D20", 40: "D20", 36: "D18", 32: "D16",
  20: "D10", 10: "D5", 4: "D2", 2: "D1"
};

export const SOUNDS = {
  HIT: "https://assets.mixkit.co/active_storage/sfx/2578/2578-preview.mp3", // Short beep
  BUST: "https://assets.mixkit.co/active_storage/sfx/2572/2572-preview.mp3", // Error buzzer
  WIN: "https://assets.mixkit.co/active_storage/sfx/1992/1992-preview.mp3" // Success chime
};

export const INITIAL_STATS = {
  totalPoints: 0,
  totalDarts: 0,
  history: [],
  wins: 0
};