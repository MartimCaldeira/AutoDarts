import React from 'react';

interface NeonCardProps {
  isActive: boolean;
  accentColor: string;
  children: React.ReactNode;
  className?: string;
}

export const NeonCard: React.FC<NeonCardProps> = ({ isActive, accentColor, children, className = "" }) => {
  const borderColor = isActive ? accentColor : "#333";
  const bgColor = isActive ? "#1E1E1E" : "#181818";
  const shadow = isActive ? `0 0 15px ${accentColor}40` : "none";

  return (
    <div
      className={`rounded-xl border transition-all duration-300 ${className}`}
      style={{
        backgroundColor: bgColor,
        borderColor: borderColor,
        borderWidth: isActive ? "2px" : "1px",
        boxShadow: shadow
      }}
    >
      {children}
      {isActive && (
        <div 
          className="h-1.5 w-full mt-auto rounded-b-lg"
          style={{ backgroundColor: accentColor }}
        />
      )}
    </div>
  );
};