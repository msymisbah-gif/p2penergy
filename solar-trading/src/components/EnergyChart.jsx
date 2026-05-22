import React, { useEffect, useMemo, useState } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { FaChartArea, FaCircle } from 'react-icons/fa';

const AR_DAYS = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

function formatArabicDay(date) {
  return AR_DAYS[date.getDay()];
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || payload.length === 0) return null;

  const lookup = Object.fromEntries(payload.map((p) => [p.dataKey, p]));

  const ROWS = [
    { key: 'production',  label: 'الإنتاج',     color: '#f59e0b' },
    { key: 'consumption', label: 'الاستهلاك',  color: '#ef4444' },
    { key: 'surplus',     label: 'الفائض',     color: '#22c55e' },
  ];

  return (
    <div className="bg-dark-900/95 backdrop-blur-xl border border-dark-700 rounded-xl p-3 shadow-2xl min-w-[180px]">
      <p className="text-xs text-gray-400 mb-2 border-b border-dark-700 pb-2 text-right">{label}</p>
      <div className="space-y-1.5">
        {ROWS.map(({ key, label: rowLabel, color }) => {
          const entry = lookup[key];
          if (!entry) return null;
          return (
            <div key={key} className="flex items-center justify-between gap-3 text-xs">
              <span className="text-white font-bold tabular-nums">
                {Number(entry.value).toFixed(1)}
                <span className="text-gray-500 mr-1">kWh</span>
              </span>
              <div className="flex items-center gap-1.5">
                <span className="text-gray-300">{rowLabel}</span>
                <FaCircle style={{ color }} className="text-[7px]" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Generate deterministic 7-day fallback data anchored on homeData totals.
 * Real implementation would subscribe to /homes/{uid}/dailyStats.
 */
function generateFallbackData(homeData) {
  if (!homeData) return [];
  const today = new Date();
  const prodAvg = Math.max(8, (homeData.totalProduced ?? 70) / 30);
  const consAvg = Math.max(6, (homeData.totalConsumed ?? 50) / 30);

  return Array.from({ length: 7 }, (_, i) => {
    const day = new Date(today);
    day.setDate(today.getDate() - (6 - i));
    const seed = (day.getDate() * 17 + day.getMonth() * 31) % 100;
    const variance = (seed / 100) * 0.4 + 0.8;

    const production  = +(prodAvg * variance).toFixed(1);
    const consumption = +(consAvg * (2 - variance) * 0.9).toFixed(1);
    const surplus     = +Math.max(0, production - consumption).toFixed(1);

    return {
      day:  formatArabicDay(day),
      date: day.toLocaleDateString('ar-LY', { day: 'numeric', month: 'short' }),
      production,
      consumption,
      surplus,
    };
  });
}

export default function EnergyChart() {
  const { currentUser, homeData } = useAuth();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (!currentUser) return undefined;

    const q = query(
      collection(db, 'homes', currentUser.uid, 'dailyStats'),
      orderBy('date', 'desc'),
      limit(7),
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        if (snap.empty) {
          setStats([]);
          return;
        }
        const docs = snap.docs
          .map((d) => {
            const data = d.data();
            const date = data.date?.toDate?.() ?? new Date(data.date);
            return {
              day:         formatArabicDay(date),
              date:        date.toLocaleDateString('ar-LY', { day: 'numeric', month: 'short' }),
              production:  +(data.production  ?? 0).toFixed(1),
              consumption: +(data.consumption ?? 0).toFixed(1),
              surplus:     +(data.surplus     ?? Math.max(0, (data.production ?? 0) - (data.consumption ?? 0))).toFixed(1),
              _ts:         date.getTime(),
            };
          })
          .sort((a, b) => a._ts - b._ts);
        setStats(docs);
      },
      () => setStats([]),
    );

    return unsub;
  }, [currentUser]);

  const data = useMemo(() => {
    if (stats === null)     return [];                        // still loading
    if (stats.length === 0) return generateFallbackData(homeData);
    return stats;
  }, [stats, homeData]);

  const isFallback = stats !== null && stats.length === 0;

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-solar-500/10 border border-solar-500/20 flex items-center justify-center">
            <FaChartArea className="text-solar-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">نشاط الطاقة الأسبوعي</h2>
            <p className="text-xs text-gray-500">آخر 7 أيام</p>
          </div>
        </div>

        {isFallback && (
          <span className="text-[10px] bg-solar-500/10 text-solar-400 border border-solar-500/20 px-2 py-1 rounded-md">
            بيانات تقديرية
          </span>
        )}
      </div>

      <div className="h-72 w-full" dir="ltr">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="prodGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#f59e0b" stopOpacity={0.6} />
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="consGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#ef4444" stopOpacity={0.5} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="surpGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#22c55e" stopOpacity={0.5} />
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis
              dataKey="day"
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              width={35}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#f59e0b', strokeWidth: 1, strokeDasharray: '3 3' }} />
            <Legend
              wrapperStyle={{ fontSize: 12, color: '#94a3b8', paddingTop: 12 }}
              iconType="circle"
              formatter={(value) => {
                const map = { production: 'الإنتاج', consumption: 'الاستهلاك', surplus: 'الفائض' };
                return <span style={{ color: '#cbd5e1' }}>{map[value] ?? value}</span>;
              }}
            />

            <Area type="monotone" dataKey="production"  stroke="#f59e0b" strokeWidth={2} fill="url(#prodGrad)" />
            <Area type="monotone" dataKey="consumption" stroke="#ef4444" strokeWidth={2} fill="url(#consGrad)" />
            <Area type="monotone" dataKey="surplus"     stroke="#22c55e" strokeWidth={2} fill="url(#surpGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
