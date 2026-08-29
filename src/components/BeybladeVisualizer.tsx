import React from 'react';

interface BeybladeVisualizerProps {
  bladeName: string;
  ratchetName?: string;
  bitName?: string;
  category?: 'Attack' | 'Defense' | 'Stamina' | 'Balance';
  size?: 'sm' | 'md' | 'lg';
  isSpinning?: boolean;
}

export const BeybladeVisualizer: React.FC<BeybladeVisualizerProps> = ({
  bladeName,
  ratchetName = '3-60',
  bitName = 'F',
  category,
  size = 'md',
  isSpinning = false
}) => {
  // Infer category from blade name if not passed
  const isAttack =
    category === 'Attack' ||
    bladeName.includes('Dran') ||
    bladeName.includes('Shark') ||
    bladeName.includes('Phoenix') ||
    bladeName.includes('Drake');

  const isDefense =
    category === 'Defense' ||
    bladeName.includes('Knight') ||
    bladeName.includes('Shield') ||
    bladeName.includes('Lance') ||
    bitName.includes('Needle') ||
    bitName.includes('Hexa');

  const isStamina =
    category === 'Stamina' ||
    bladeName.includes('Wizard') ||
    bladeName.includes('Viper') ||
    bitName.includes('Ball');

  // Colors
  const primaryColor = isAttack ? '#AC191F' : isDefense ? '#10B981' : isStamina ? '#04A8FC' : '#F59E0B';
  const secondaryColor = isAttack ? '#FFA500' : isDefense ? '#065F46' : isStamina ? '#006398' : '#D97706';
  const accentColor = isAttack ? '#FFE55C' : isDefense ? '#A7F3D0' : isStamina ? '#93CCFF' : '#FDE68A';

  const sizeClasses = {
    sm: 'w-20 h-20',
    md: 'w-36 h-36',
    lg: 'w-48 h-48'
  };

  return (
    <div className={`relative ${sizeClasses[size]} flex items-center justify-center select-none group`}>
      <svg
        viewBox="0 0 100 100"
        className={`w-full h-full transform transition-transform duration-700 ease-out group-hover:rotate-180 ${
          isSpinning ? 'animate-spin' : ''
        }`}
      >
        <defs>
          <linearGradient id={`grad-${bladeName}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={primaryColor} />
            <stop offset="50%" stopColor={secondaryColor} />
            <stop offset="100%" stopColor="#1e1e24" />
          </linearGradient>
          <filter id="metalShadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.4" />
          </filter>
        </defs>

        {/* Outer Heavy Die-Cast Metal Ring */}
        <circle cx="50" cy="50" r="46" fill="#2d3748" stroke="#cbd5e1" strokeWidth="2.5" />

        {/* Ratchet Gear Teeth (3, 4, or 5 protrusions) */}
        {ratchetName.startsWith('3') ? (
          <>
            <polygon points="50,6 44,16 56,16" fill="#e2e8f0" />
            <polygon points="88,72 78,66 84,56" fill="#e2e8f0" />
            <polygon points="12,72 22,66 16,56" fill="#e2e8f0" />
          </>
        ) : ratchetName.startsWith('4') ? (
          <>
            <polygon points="50,6 44,16 56,16" fill="#e2e8f0" />
            <polygon points="94,50 84,44 84,56" fill="#e2e8f0" />
            <polygon points="50,94 44,84 56,84" fill="#e2e8f0" />
            <polygon points="6,50 16,44 16,56" fill="#e2e8f0" />
          </>
        ) : (
          <>
            <polygon points="50,6 44,15 56,15" fill="#e2e8f0" />
            <polygon points="92,36 82,34 86,45" fill="#e2e8f0" />
            <polygon points="76,89 70,80 80,78" fill="#e2e8f0" />
            <polygon points="24,89 30,80 20,78" fill="#e2e8f0" />
            <polygon points="8,36 18,34 14,45" fill="#e2e8f0" />
          </>
        )}

        {/* Blade Attack Wings / Armor Plates */}
        {isAttack ? (
          /* Triple aggressive curved strike wings */
          <g fill={`url(#grad-${bladeName})`} stroke={accentColor} strokeWidth="1.5">
            <path d="M50 8 C68 8, 88 28, 88 50 L74 44 C70 30, 60 20, 50 18 Z" />
            <path d="M88 50 C88 68, 68 88, 50 88 L44 74 C58 70, 68 60, 70 50 Z" />
            <path d="M50 88 C32 88, 12 68, 12 50 L26 56 C30 70, 40 80, 50 82 Z" />
            <path d="M12 50 C12 32, 32 12, 50 12 L56 26 C42 30, 32 40, 30 50 Z" />
          </g>
        ) : isDefense ? (
          /* Hexagonal heavy deflection shields */
          <g fill={`url(#grad-${bladeName})`} stroke={accentColor} strokeWidth="1.5">
            <polygon points="50,14 78,28 78,72 50,86 22,72 22,28" />
            <circle cx="50" cy="50" r="28" fill="#1e293b" stroke="#64748b" strokeWidth="2" />
          </g>
        ) : isStamina ? (
          /* Concentric ultra-smooth aerodynamic disc */
          <g fill={`url(#grad-${bladeName})`} stroke={accentColor} strokeWidth="1.5">
            <circle cx="50" cy="50" r="36" />
            <circle cx="50" cy="50" r="28" fill="#0f172a" stroke="#38bdf8" strokeWidth="1" />
          </g>
        ) : (
          /* Dual counter-attack balance geometry */
          <g fill={`url(#grad-${bladeName})`} stroke={accentColor} strokeWidth="1.5">
            <path d="M50 12 C72 12, 88 32, 88 50 C88 68, 72 88, 50 88 C50 68, 62 50, 62 50 C62 50, 50 32, 50 12 Z" />
            <path d="M50 88 C28 88, 12 68, 12 50 C12 32, 28 12, 50 12 C50 32, 38 50, 38 50 C38 50, 50 68, 50 88 Z" />
          </g>
        )}

        {/* Central Lock Gear & Bit Core */}
        <circle cx="50" cy="50" r="16" fill="#0f172a" stroke="#e2e8f0" strokeWidth="2" />

        {/* Bit Initial / Symbol */}
        <text
          x="50"
          y="54"
          textAnchor="middle"
          fontSize="10"
          fontWeight="900"
          fill="#ffffff"
          fontFamily="system-ui, sans-serif"
          letterSpacing="0"
        >
          {bitName.substring(0, 2).replace(' (', '')}
        </text>
      </svg>
    </div>
  );
};
