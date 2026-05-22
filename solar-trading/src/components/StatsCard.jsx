import React from 'react';
import { FaArrowUp, FaArrowDown, FaMinus } from 'react-icons/fa';

const COLOR_MAP = {
  solar:  { icon: 'text-solar-400',  ring: 'from-solar-500/20  to-solar-500/0',  border: 'border-solar-500/20'  },
  green:  { icon: 'text-green-400',  ring: 'from-green-500/20  to-green-500/0',  border: 'border-green-500/20'  },
  blue:   { icon: 'text-blue-400',   ring: 'from-blue-500/20   to-blue-500/0',   border: 'border-blue-500/20'   },
  red:    { icon: 'text-red-400',    ring: 'from-red-500/20    to-red-500/0',    border: 'border-red-500/20'    },
  purple: { icon: 'text-purple-400', ring: 'from-purple-500/20 to-purple-500/0', border: 'border-purple-500/20' },
};

const TREND_MAP = {
  up:      { icon: FaArrowUp,   cls: 'text-green-400' },
  down:    { icon: FaArrowDown, cls: 'text-red-400'   },
  neutral: { icon: FaMinus,     cls: 'text-gray-500'  },
};

export default function StatsCard({
  icon: Icon,
  label,
  value,
  unit = 'kWh',
  color = 'solar',
  trend = null,
  trendValue = null,
  subtitle = null,
}) {
  const colors = COLOR_MAP[color] ?? COLOR_MAP.solar;
  const trendInfo = trend ? TREND_MAP[trend] : null;
  const TrendIcon = trendInfo?.icon ?? null;

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border ${colors.border}
                  bg-dark-800/60 backdrop-blur-xl p-5
                  shadow-lg hover:shadow-2xl hover:-translate-y-0.5
                  transition-all duration-300 group`}
    >
      {/* Decorative gradient ring */}
      <div className={`absolute -top-12 -left-12 w-32 h-32 rounded-full bg-gradient-to-br ${colors.ring} blur-2xl pointer-events-none`} />

      <div className="relative flex items-start justify-between mb-4">
        <div className={`w-11 h-11 rounded-xl border ${colors.border} bg-dark-900/50 backdrop-blur flex items-center justify-center ${colors.icon}`}>
          <Icon className="text-lg" />
        </div>

        {trendInfo && TrendIcon && (
          <div className={`flex items-center gap-1 text-xs font-semibold ${trendInfo.cls}`}>
            <TrendIcon className="text-[10px]" />
            {trendValue !== null && <span>{trendValue}</span>}
          </div>
        )}
      </div>

      <p className="text-gray-400 text-sm mb-1">{label}</p>
      <div className="flex items-baseline gap-1.5">
        <p className="text-3xl font-bold text-white tracking-tight">{value}</p>
        {unit && <span className="text-xs text-gray-500 font-medium">{unit}</span>}
      </div>

      {subtitle && (
        <p className="text-xs text-gray-600 mt-2">{subtitle}</p>
      )}
    </div>
  );
}
