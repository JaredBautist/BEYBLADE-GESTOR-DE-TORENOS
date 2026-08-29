import React, { useState, useEffect } from 'react';
import { Blader } from '../types';

interface BladerAvatarProps {
  blader?: Blader | null;
  name?: string;
  avatarUrl?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  cornerColor?: 'red' | 'blue' | 'gold' | 'emerald' | 'purple' | 'auto';
  className?: string;
  showBadge?: boolean;
  badgeText?: string;
}

// Deterministic color palette for bladers based on name
const THEMES = [
  { bg: 'from-blue-600 to-cyan-500', text: 'text-white', border: 'border-cyan-400', icon: 'bolt', ring: 'ring-cyan-500/30' },
  { bg: 'from-red-600 to-rose-500', text: 'text-white', border: 'border-rose-400', icon: 'local_fire_department', ring: 'ring-rose-500/30' },
  { bg: 'from-amber-500 to-yellow-400', text: 'text-black', border: 'border-yellow-300', icon: 'flare', ring: 'ring-amber-500/30' },
  { bg: 'from-purple-600 to-indigo-500', text: 'text-white', border: 'border-purple-400', icon: 'shield_moon', ring: 'ring-purple-500/30' },
  { bg: 'from-emerald-600 to-teal-500', text: 'text-white', border: 'border-emerald-400', icon: 'security', ring: 'ring-emerald-500/30' },
  { bg: 'from-orange-600 to-amber-500', text: 'text-white', border: 'border-orange-400', icon: 'cyclone', ring: 'ring-orange-500/30' },
  { bg: 'from-sky-600 to-blue-700', text: 'text-white', border: 'border-blue-400', icon: 'sports_kabaddi', ring: 'ring-blue-500/30' },
  { bg: 'from-slate-700 to-slate-900', text: 'text-cyan-300', border: 'border-cyan-400', icon: 'military_tech', ring: 'ring-cyan-500/30' },
];

export const BladerAvatar: React.FC<BladerAvatarProps> = ({
  blader,
  name = '',
  avatarUrl = '',
  size = 'md',
  cornerColor = 'auto',
  className = '',
  showBadge = false,
  badgeText
}) => {
  const [imageError, setImageError] = useState(false);
  const displayName = blader?.name || name || 'Blader';
  const finalAvatarUrl = blader?.avatarUrl || avatarUrl || '';

  useEffect(() => {
    setImageError(false);
  }, [finalAvatarUrl]);

  // Derive initial characters
  const getInitials = (str: string) => {
    if (!str) return 'BX';
    const parts = str.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  };

  const initials = getInitials(displayName);

  // Hash the name to pick consistent theme
  const getHash = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash);
  };

  const themeIndex = getHash(displayName) % THEMES.length;
  const theme = THEMES[themeIndex];

  // Sizing definitions
  const sizeClasses = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-10 h-10 text-xs',
    md: 'w-12 h-12 text-sm',
    lg: 'w-16 h-16 text-base',
    xl: 'w-20 h-20 text-xl',
    '2xl': 'w-24 h-24 text-2xl'
  };

  const iconSizes = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-2xl',
    '2xl': 'text-3xl'
  };

  // Border style
  const cornerBorder =
    cornerColor === 'red'
      ? 'border-[#AC191F] ring-2 ring-[#AC191F]/30'
      : cornerColor === 'blue'
      ? 'border-[#04A8FC] ring-2 ring-[#04A8FC]/30'
      : cornerColor === 'gold'
      ? 'border-amber-400 ring-2 ring-amber-400/30'
      : cornerColor === 'emerald'
      ? 'border-emerald-500 ring-2 ring-emerald-500/30'
      : cornerColor === 'purple'
      ? 'border-purple-500 ring-2 ring-purple-500/30'
      : `border-transparent ${theme.ring} ring-2`;

  const hasImage = Boolean(finalAvatarUrl && finalAvatarUrl.trim().length > 0 && !imageError);

  return (
    <div className={`relative inline-flex items-center justify-center flex-shrink-0 ${className}`}>
      <div
        className={`${sizeClasses[size]} rounded-2xl bg-gradient-to-tr ${theme.bg} ${cornerBorder} border flex items-center justify-center shadow-md overflow-hidden relative select-none`}
      >
        {hasImage ? (
          <img
            src={finalAvatarUrl}
            alt={displayName}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center relative p-1">
            {/* Subtle tactical grid background */}
            <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:6px_6px] pointer-events-none"></div>

            {/* Emblem icon or Initials */}
            <span className={`font-headline font-black tracking-tighter ${theme.text} leading-none drop-shadow-sm`}>
              {initials}
            </span>

            {size !== 'xs' && size !== 'sm' && (
              <span className={`material-symbols-outlined ${iconSizes[size]} ${theme.text} opacity-75 mt-0.5`}>
                {theme.icon}
              </span>
            )}
          </div>
        )}
      </div>

      {showBadge && (
        <div
          className={`absolute -bottom-1.5 ${
            cornerColor === 'blue' ? '-right-1.5 bg-[#04A8FC]' : '-left-1.5 bg-[#AC191F]'
          } text-white text-[9px] font-label-caps uppercase px-1.5 py-0.5 rounded font-black shadow`}
        >
          {badgeText || (cornerColor === 'blue' ? 'BLUE' : 'RED')}
        </div>
      )}
    </div>
  );
};
