import React from 'react';
import { SECTORS } from '../types';

interface DartboardProps {
  onSegmentClick: (score: number, multiplier: 1 | 2 | 3, label: string) => void;
}

export const Dartboard: React.FC<DartboardProps> = ({ onSegmentClick }) => {
  const radius = 200;
  const centerX = 200;
  const centerY = 200;

  // Radii for rings
  const rBullInner = 12.7 / 170 * radius;
  const rBullOuter = 31.8 / 170 * radius;
  const rTripInner = 99 / 170 * radius;
  const rTripOuter = 107 / 170 * radius;
  const rDblInner = 162 / 170 * radius;
  const rDblOuter = 170 / 170 * radius;

  // Helper to create arc path
  const createArc = (startAngle: number, endAngle: number, innerR: number, outerR: number) => {
    const x1 = centerX + innerR * Math.cos(startAngle);
    const y1 = centerY + innerR * Math.sin(startAngle);
    const x2 = centerX + outerR * Math.cos(startAngle);
    const y2 = centerY + outerR * Math.sin(startAngle);
    const x3 = centerX + outerR * Math.cos(endAngle);
    const y3 = centerY + outerR * Math.sin(endAngle);
    const x4 = centerX + innerR * Math.cos(endAngle);
    const y4 = centerY + innerR * Math.sin(endAngle);

    return `M ${x1} ${y1} L ${x2} ${y2} A ${outerR} ${outerR} 0 0 1 ${x3} ${y3} L ${x4} ${y4} A ${innerR} ${innerR} 0 0 0 ${x1} ${y1} Z`;
  };

  const handleClick = (s: number, m: 1 | 2 | 3, label: string) => {
    onSegmentClick(s, m, label);
  };

  return (
    <div className="relative w-full max-w-[500px] aspect-square mx-auto">
      <svg viewBox="0 0 400 400" className="w-full h-full drop-shadow-2xl">
        {/* Background */}
        <circle cx={centerX} cy={centerY} r={radius + 10} fill="#111" stroke="#333" strokeWidth="2" />

        {SECTORS.map((score, i) => {
          // -90 degrees offset because index 0 (20) is at top
          // Each sector is 18 degrees (PI/10)
          const anglePerSector = (Math.PI * 2) / 20;
          const startAngle = (i * anglePerSector) - (Math.PI / 2) - (anglePerSector / 2);
          const endAngle = startAngle + anglePerSector;

          const isBlack = i % 2 === 0; // Alternating colors
          const colorNormal = isBlack ? "#111" : "#E3E3E3"; // Black / White
          const colorMulti = isBlack ? "#E63946" : "#00C853"; // Red / Green

          return (
            <g key={score} className="cursor-pointer hover:opacity-80 transition-opacity">
              {/* Single Inner */}
              <path
                d={createArc(startAngle, endAngle, rBullOuter, rTripInner)}
                fill={colorNormal}
                stroke="#555"
                strokeWidth="1"
                onClick={() => handleClick(score, 1, `${score}`)}
              />
              {/* Treble */}
              <path
                d={createArc(startAngle, endAngle, rTripInner, rTripOuter)}
                fill={colorMulti}
                stroke="#555"
                strokeWidth="1"
                onClick={() => handleClick(score, 3, `T${score}`)}
              />
              {/* Single Outer */}
              <path
                d={createArc(startAngle, endAngle, rTripOuter, rDblInner)}
                fill={colorNormal}
                stroke="#555"
                strokeWidth="1"
                onClick={() => handleClick(score, 1, `${score}`)}
              />
              {/* Double */}
              <path
                d={createArc(startAngle, endAngle, rDblInner, rDblOuter)}
                fill={colorMulti}
                stroke="#555"
                strokeWidth="1"
                onClick={() => handleClick(score, 2, `D${score}`)}
              />
              {/* Text Label */}
              <text
                x={centerX + (radius - 15) * Math.cos(startAngle + anglePerSector / 2)}
                y={centerY + (radius - 15) * Math.sin(startAngle + anglePerSector / 2)}
                fill="white"
                fontSize="16"
                fontWeight="bold"
                textAnchor="middle"
                dominantBaseline="central"
                style={{ pointerEvents: 'none' }}
              >
                {score}
              </text>
            </g>
          );
        })}

        {/* Outer Bull (25) */}
        <circle
          cx={centerX}
          cy={centerY}
          r={rBullOuter}
          fill="#00C853"
          stroke="#555"
          className="cursor-pointer hover:opacity-80"
          onClick={() => handleClick(25, 1, "25")}
        />
        {/* Inner Bull (50) */}
        <circle
          cx={centerX}
          cy={centerY}
          r={rBullInner}
          fill="#D32F2F"
          stroke="#555"
          className="cursor-pointer hover:opacity-80"
          onClick={() => handleClick(50, 1, "BULL")}
        />
      </svg>
    </div>
  );
};