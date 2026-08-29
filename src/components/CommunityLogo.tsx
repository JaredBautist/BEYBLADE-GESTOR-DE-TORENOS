import React from 'react';

interface CommunityLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'hero';
  className?: string;
  customImageUrl?: string;
  communityText?: string;
}

export const CommunityLogo: React.FC<CommunityLogoProps> = ({
  size = 'md',
  className = '',
  customImageUrl,
  communityText = 'Cúcuta'
}) => {
  const dimensions = {
    sm: 'w-9 h-9',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
    hero: 'w-36 h-36'
  };

  // Calculate dynamic font size based on text length for logo bottom line
  const textLength = communityText.trim().length;
  let dynamicFontSize = '64px';
  if (textLength > 12) {
    dynamicFontSize = '36px';
  } else if (textLength > 8) {
    dynamicFontSize = '48px';
  } else if (textLength > 6) {
    dynamicFontSize = '56px';
  }

  if (customImageUrl) {
    return (
      <div className={`relative flex items-center justify-center ${dimensions[size]} ${className}`}>
        <img
          src={customImageUrl}
          alt={communityText || 'Comunidad Beyblade'}
          className="w-full h-full object-contain drop-shadow-md"
          referrerPolicy="no-referrer"
        />
      </div>
    );
  }

  return (
    <div className={`relative flex items-center justify-center ${dimensions[size]} ${className}`}>
      <svg
        viewBox="0 0 400 380"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-lg select-none"
      >
        <defs>
          {/* Gradients */}
          <linearGradient id="beybladeBlue3D" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="35%" stopColor="#2563EB" />
            <stop offset="80%" stopColor="#1D4ED8" />
            <stop offset="100%" stopColor="#1E3A8A" />
          </linearGradient>

          <linearGradient id="cucutaRedTop" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#EF4444" />
            <stop offset="45%" stopColor="#DC2626" />
            <stop offset="50%" stopColor="#111827" />
            <stop offset="100%" stopColor="#030712" />
          </linearGradient>

          <linearGradient id="capeYellow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FDE047" />
            <stop offset="60%" stopColor="#EAB308" />
            <stop offset="100%" stopColor="#CA8A04" />
          </linearGradient>

          <linearGradient id="beyBladeRed" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#EF4444" />
            <stop offset="50%" stopColor="#DC2626" />
            <stop offset="100%" stopColor="#991B1B" />
          </linearGradient>

          <linearGradient id="beyBladeBase" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#B91C1C" />
            <stop offset="100%" stopColor="#7F1D1D" />
          </linearGradient>
        </defs>

        {/* --- LEFT YELLOW CLOTH/FLAME EMBLEM --- */}
        <g id="yellow-cape-emblem">
          <path
            d="M58 152 C48 160, 36 178, 34 205 C32 235, 48 258, 92 250 C80 242, 75 220, 85 200 C92 185, 96 172, 88 160 C80 150, 68 148, 58 152 Z"
            fill="url(#capeYellow)"
            stroke="#92400E"
            strokeWidth="3"
            strokeLinejoin="round"
          />
          {/* Inner folds of cloth */}
          <path
            d="M48 185 C55 205, 62 225, 75 240 M42 210 C50 225, 60 238, 70 245 M58 165 C68 185, 78 205, 84 225"
            stroke="#B45309"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </g>

        {/* --- SPARKLES (✦) --- */}
        {/* Left sparkle */}
        <path
          d="M20 205 Q24 205 24 197 Q24 205 28 205 Q24 205 24 213 Q24 205 20 205 Z"
          fill="#1E293B"
          stroke="#000000"
          strokeWidth="1"
        />
        {/* Mid-right sparkle */}
        <path
          d="M272 218 Q276 218 276 212 Q276 218 280 218 Q276 218 276 224 Q276 218 272 218 Z"
          fill="#1E293B"
        />
        {/* Far-right sparkle */}
        <path
          d="M352 290 Q356 290 356 284 Q356 290 360 290 Q356 290 356 296 Q356 290 352 290 Z"
          fill="#1E293B"
        />

        {/* --- 1. COMUNIDAD TEXT --- */}
        <g id="text-comunidad" className="font-headline font-black">
          <text
            x="200"
            y="112"
            textAnchor="middle"
            fill="#111827"
            style={{
              fontFamily: 'system-ui, -apple-system, sans-serif',
              fontWeight: 900,
              fontSize: '44px',
              letterSpacing: '0.08em',
              textTransform: 'uppercase'
            }}
          >
            COMUNIDAD
          </text>
        </g>

        {/* --- 2. BEYBLADE 3D BLUE TEXT --- */}
        <g id="text-beyblade">
          {/* Black 3D Extrusion Shadow Behind */}
          <text
            x="203"
            y="193"
            textAnchor="middle"
            fill="#030712"
            style={{
              fontFamily: '"Impact", "Arial Black", sans-serif',
              fontWeight: 900,
              fontSize: '66px',
              letterSpacing: '0.04em',
              fontStyle: 'italic',
              textTransform: 'uppercase'
            }}
          >
            BEYBLADE
          </text>

          {/* Main Blue Letters with White & Black Border */}
          <text
            x="200"
            y="190"
            textAnchor="middle"
            fill="url(#beybladeBlue3D)"
            stroke="#000000"
            strokeWidth="3.5"
            style={{
              fontFamily: '"Impact", "Arial Black", sans-serif',
              fontWeight: 900,
              fontSize: '66px',
              letterSpacing: '0.04em',
              fontStyle: 'italic',
              textTransform: 'uppercase',
              paintOrder: 'stroke fill'
            }}
          >
            BEYBLADE
          </text>
        </g>

        {/* --- 3. COMMUNITY / CITY RED / BLACK EDGY TEXT --- */}
        <g id="text-cucuta">
          {/* Shadow */}
          <text
            x="192"
            y="266"
            textAnchor="middle"
            fill="#000000"
            style={{
              fontFamily: '"Impact", "Arial Black", sans-serif',
              fontWeight: 900,
              fontSize: dynamicFontSize,
              letterSpacing: '0.05em',
              fontStyle: 'italic',
              textTransform: 'uppercase'
            }}
          >
            {communityText}
          </text>

          {/* Red-to-Black Gradient Front Text */}
          <text
            x="190"
            y="264"
            textAnchor="middle"
            fill="url(#cucutaRedTop)"
            stroke="#000000"
            strokeWidth="3"
            style={{
              fontFamily: '"Impact", "Arial Black", sans-serif',
              fontWeight: 900,
              fontSize: dynamicFontSize,
              letterSpacing: '0.05em',
              fontStyle: 'italic',
              textTransform: 'uppercase',
              paintOrder: 'stroke fill'
            }}
          >
            {communityText}
          </text>
        </g>

        {/* --- LIGHTNING STREAKS (LEFT & RIGHT) --- */}
        {/* Left lightning */}
        <path
          d="M102 245 L74 275 L92 278 L68 312 L100 292 L88 288 L114 260 Z"
          fill="#111827"
          stroke="#000000"
          strokeWidth="1.5"
        />
        {/* Right lightning */}
        <path
          d="M280 200 L286 240 L298 232 L288 270 L304 250 L294 246 L362 195 L306 220 Z"
          fill="#111827"
          stroke="#000000"
          strokeWidth="1.5"
        />

        {/* --- SPINNING BEYBLADE TOP (BOTTOM RIGHT) --- */}
        <g id="beyblade-spinning-top" transform="translate(15, 10)">
          {/* Ratchet & Bit Lower Base (Dark Red/Burgundy) */}
          <path
            d="M280 268 L296 298 L328 296 L340 262 Z"
            fill="url(#beyBladeBase)"
            stroke="#450A0A"
            strokeWidth="3"
          />

          {/* Top Elliptical Spinning Metal Blade (Red) */}
          <ellipse
            cx="308"
            cy="260"
            rx="52"
            ry="20"
            transform="rotate(-20 308 260)"
            fill="url(#beyBladeRed)"
            stroke="#111827"
            strokeWidth="4"
          />

          {/* Blade highlights */}
          <ellipse
            cx="304"
            cy="258"
            rx="40"
            ry="12"
            transform="rotate(-20 304 258)"
            fill="#EF4444"
            opacity="0.8"
          />

          {/* Center Bit Core */}
          <circle
            cx="306"
            cy="259"
            r="7"
            fill="#FEE2E2"
            stroke="#7F1D1D"
            strokeWidth="2"
          />
        </g>
      </svg>
    </div>
  );
};

