'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import BottomNav from '@/components/leo/BottomNav';

const LEO = { lat: -27.4698, lng: 153.0251 };
const DEFAULT_PAPA = { lat: -26.6581, lng: 150.1839 };

function toXY(lat: number, lng: number) {
  return {
    x: Math.max(2, Math.min(98, (lng - 148.5) / 6 * 100)),
    y: Math.max(2, Math.min(98, (lat - -25) / (-28.8 - -25) * 100)),
  };
}

function distKm(lat1: number, lng1: number, lat2: number, lng2: number) {
  const s = Math.sin((lat2 - lat1) * Math.PI / 180 / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin((lng2 - lng1) * Math.PI / 180 / 2) ** 2;
  return Math.round(12742 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s)));
}

const TOWNS = [
  { name: 'Toowoomba', lat: -27.5598, lng: 151.9507 },
  { name: 'Dalby', lat: -27.1815, lng: 151.2659 },
  { name: 'Chinchilla', lat: -26.7389, lng: 150.6301 },
  { name: 'Roma', lat: -26.573, lng: 148.791 },
  { name: 'Ipswich', lat: -27.6147, lng: 152.7607 },
  { name: 'Gatton', lat: -27.5576, lng: 152.2766 },
  { name: 'Sunshine Coast', lat: -26.65, lng: 153.0666 },
  { name: 'Gold Coast', lat: -28.0167, lng: 153.4 },
];

const ROUTE_WAYPOINTS = [
  LEO,
  { lat: -27.6147, lng: 152.7607 },
  { lat: -27.5576, lng: 152.2766 },
  { lat: -27.5598, lng: 151.9507 },
  { lat: -27.1815, lng: 151.2659 },
  { lat: -26.7389, lng: 150.6301 },
  DEFAULT_PAPA,
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function MapPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [capsule, setCapsule] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    async function load() {
      const { date } = await fetch('/api/time').then(r => r.json());
      const { capsules } = await fetch('/api/active-roster').then(r => r.json());
      if (capsules) {
        const found = capsules
          .filter((c: any) => c.unlock_date <= date && c.map_lat && c.map_lng)
          .sort((a: any, b: any) => b.day_number - a.day_number);
        if (found.length > 0) setCapsule(found[0]);
      }
      setLoading(false);
    }
    load();
  }, []);

  function playAudio() {
    if (!capsule?.map_audio_url) return;
    const audio = new Audio(capsule.map_audio_url);
    setPlaying(true);
    audio.play();
    audio.onended = () => setPlaying(false);
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <motion.div className="text-6xl" animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2 }}>🗺️</motion.div>
    </div>
  );

  const leoXY = toXY(LEO.lat, LEO.lng);
  const papaXY = capsule?.map_lat && capsule?.map_lng
    ? toXY(capsule.map_lat, capsule.map_lng)
    : toXY(DEFAULT_PAPA.lat, DEFAULT_PAPA.lng);
  const km = capsule?.map_lat && capsule?.map_lng
    ? distKm(LEO.lat, LEO.lng, capsule.map_lat, capsule.map_lng)
    : distKm(LEO.lat, LEO.lng, DEFAULT_PAPA.lat, DEFAULT_PAPA.lng);
  const locationName = capsule?.map_location_name || 'Miles, Queensland';

  const routeWaypoints = capsule?.map_lat && capsule?.map_lng
    ? [...ROUTE_WAYPOINTS.slice(0, -1), { lat: capsule.map_lat, lng: capsule.map_lng }]
    : ROUTE_WAYPOINTS;

  const routePath = routeWaypoints.map((p, i) => {
    const { x, y } = toXY(p.lat, p.lng);
    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ');

  return (
    <div className="min-h-screen pb-24" style={{ background: 'linear-gradient(180deg, #0a1628 0%, #0f1b3d 100%)' }}>
      <div className="pt-10 pb-4 text-center">
        <h1 className="text-3xl font-black text-white">Where&apos;s Papa?</h1>
        <p className="text-white/40 text-sm mt-1">Tap Papa to hear a message!</p>
      </div>

      <div className="px-3">
        <div className="relative rounded-3xl overflow-hidden aspect-[4/5] max-w-md mx-auto border-2 border-yellow-400/20"
          style={{ background: 'linear-gradient(180deg, #1a3a5c 0%, #1e4d6e 30%, #1a5e3a 60%, #2d6b3f 100%)' }}>

          {/* Ocean overlay right */}
          <div className="absolute right-0 top-0 bottom-0 w-[25%]"
            style={{ background: 'linear-gradient(270deg, #0d3b5e 0%, transparent 100%)', opacity: 0.6 }} />

          <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
            {/* Coastline */}
            <path
              d={`M ${toXY(-25, 153.2).x} 0
                L ${toXY(-25.5, 153.3).x} ${toXY(-25.5, 153.3).y}
                Q ${toXY(-26, 153.4).x} ${toXY(-26, 153.4).y} ${toXY(-26.5, 153.2).x} ${toXY(-26.5, 153.2).y}
                Q ${toXY(-27, 153.5).x} ${toXY(-27, 153.5).y} ${toXY(-27.5, 153.3).x} ${toXY(-27.5, 153.3).y}
                Q ${toXY(-28, 153.6).x} ${toXY(-28, 153.6).y} ${toXY(-28.2, 153.5).x} ${toXY(-28.2, 153.5).y}
                L ${toXY(-28.8, 153.6).x} 100
                L 100 100 L 100 0 Z`}
              fill="#0d3b5e" opacity="0.5"
            />
            {/* Grid */}
            {[20, 40, 60, 80].map(v => (
              <g key={v}>
                <line x1={v} y1="0" x2={v} y2="100" stroke="rgba(255,255,255,0.04)" strokeWidth="0.3" />
                <line x1="0" y1={v} x2="100" y2={v} stroke="rgba(255,255,255,0.04)" strokeWidth="0.3" />
              </g>
            ))}
            {/* Route path */}
            <motion.path
              d={routePath}
              fill="none"
              stroke="rgba(251,191,36,0.5)"
              strokeWidth="1.2"
              strokeDasharray="3,2"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 2.5, ease: 'easeInOut' }}
            />
            {/* Highway label */}
            <text x={toXY(-27.4, 152).x} y={toXY(-27.4, 152).y - 2}
              fill="rgba(251,191,36,0.4)" fontSize="2.2" fontWeight="bold" textAnchor="middle">
              Warrego Highway
            </text>
            {/* Straight distance line */}
            <motion.line
              x1={leoXY.x} y1={leoXY.y} x2={papaXY.x} y2={papaXY.y}
              stroke="rgba(255,255,255,0.15)" strokeWidth="0.4" strokeDasharray="1.5,1.5"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.5 }}
            />
            {/* Distance label */}
            <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 3 }}>
              <rect
                x={(leoXY.x + papaXY.x) / 2 - 10} y={(leoXY.y + papaXY.y) / 2 - 3}
                width="20" height="6" rx="2"
                fill="rgba(15,27,61,0.9)" stroke="rgba(251,191,36,0.3)" strokeWidth="0.3"
              />
              <text
                x={(leoXY.x + papaXY.x) / 2} y={(leoXY.y + papaXY.y) / 2 + 1.2}
                fill="#fbbf24" fontSize="3" fontWeight="bold" textAnchor="middle">
                {km} km
              </text>
            </motion.g>
          </svg>

          {/* Nature emojis */}
          <div className="absolute" style={{ left: '8%', top: '15%', fontSize: '16px', opacity: 0.4 }}>🌾</div>
          <div className="absolute" style={{ left: '15%', top: '35%', fontSize: '14px', opacity: 0.3 }}>🌿</div>
          <div className="absolute" style={{ left: '25%', top: '55%', fontSize: '12px', opacity: 0.3 }}>🌳</div>
          <div className="absolute" style={{ left: '12%', top: '70%', fontSize: '14px', opacity: 0.3 }}>🐄</div>
          <div className="absolute" style={{ left: '5%', top: '45%', fontSize: '16px', opacity: 0.3 }}>🦘</div>
          <div className="absolute" style={{ left: '35%', top: '20%', fontSize: '12px', opacity: 0.3 }}>⛏️</div>
          <div className="absolute" style={{ left: '20%', top: '10%', fontSize: '10px', opacity: 0.25 }}>🏜️</div>
          <div className="absolute" style={{ right: '8%', top: '30%', fontSize: '14px', opacity: 0.3 }}>🏖️</div>
          <div className="absolute" style={{ right: '5%', bottom: '25%', fontSize: '12px', opacity: 0.3 }}>🏄</div>
          <div className="absolute" style={{ right: '12%', top: '10%', fontSize: '12px', opacity: 0.25 }}>☀️</div>

          {/* Town dots */}
          {TOWNS.map(town => {
            const { x, y } = toXY(town.lat, town.lng);
            return (
              <div key={town.name} className="absolute flex flex-col items-center pointer-events-none"
                style={{ left: `${x}%`, top: `${y}%`, transform: 'translate(-50%, -50%)' }}>
                <div className="w-2 h-2 rounded-full bg-white/20" />
                <span className="text-white/30 text-[8px] font-medium mt-0.5 whitespace-nowrap">{town.name}</span>
              </div>
            );
          })}

          {/* Animated car */}
          <motion.div
            className="absolute text-lg z-10 pointer-events-none"
            style={{ left: `${leoXY.x}%`, top: `${leoXY.y}%` }}
            animate={{ left: [`${leoXY.x}%`, `${papaXY.x}%`], top: [`${leoXY.y}%`, `${papaXY.y}%`] }}
            transition={{ duration: 4, repeat: Infinity, repeatDelay: 3, ease: 'easeInOut' }}
          >
            🚗
          </motion.div>

          {/* Leo marker */}
          <motion.div
            className="absolute flex flex-col items-center z-20"
            style={{ left: `${leoXY.x}%`, top: `${leoXY.y}%`, transform: 'translate(-50%, -50%)' }}
            initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', bounce: 0.5 }}
          >
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-[3px] border-green-400 shadow-[0_0_15px_rgba(74,222,128,0.4)] overflow-hidden bg-green-900">
                <img src="https://bcvcxwrxusuvsvqdzqkd.supabase.co/storage/v1/object/public/bedtime-stories/map-markers/leo-headshot.jpg"
                  alt="Leo" className="w-full h-full object-cover" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-green-500 rounded-full flex items-center justify-center text-sm border-2 border-[#1a3a5c] shadow-md">
                🏠
              </div>
            </div>
            <div className="mt-1 bg-green-500/90 px-2 py-0.5 rounded-full">
              <span className="text-white text-[10px] font-black">LEO</span>
            </div>
            <span className="text-green-400/60 text-[8px] font-bold">Brisbane</span>
          </motion.div>

          {/* Papa marker */}
          <motion.button
            className="absolute flex flex-col items-center z-20"
            style={{ left: `${papaXY.x}%`, top: `${papaXY.y}%`, transform: 'translate(-50%, -50%)' }}
            initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5, type: 'spring', bounce: 0.5 }}
            whileTap={{ scale: 0.85 }}
            onClick={playAudio}
          >
            <motion.div
              className="relative"
              animate={playing ? { scale: [1, 1.15, 1] } : { scale: [1, 1.05, 1] }}
              transition={{ repeat: Infinity, duration: playing ? 0.4 : 2 }}
            >
              <div className="w-[72px] h-[72px] rounded-full border-[3px] border-yellow-400 shadow-[0_0_20px_rgba(251,191,36,0.5)] overflow-hidden bg-yellow-900">
                <img src="https://bcvcxwrxusuvsvqdzqkd.supabase.co/storage/v1/object/public/bedtime-stories/map-markers/papa-headshot.jpg"
                  alt="Papa" className="w-full h-full object-cover" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-yellow-400 rounded-full flex items-center justify-center text-sm border-2 border-[#1a3a5c] shadow-md">
                👷
              </div>
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-yellow-400"
                animate={{ scale: [1, 1.6], opacity: [0.6, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
              />
            </motion.div>
            <div className="mt-1 bg-yellow-400/90 px-2 py-0.5 rounded-full">
              <span className="text-black text-[10px] font-black">PAPA</span>
            </div>
            <span className="text-yellow-400/60 text-[8px] font-bold">{locationName}</span>
          </motion.button>

          {/* Labels */}
          <div className="absolute top-3 left-3">
            <p className="text-white/20 text-xs font-black tracking-widest">QUEENSLAND</p>
          </div>
          <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
            <span className="text-white/30 text-[10px] font-black">N</span>
          </div>
        </div>
      </div>

      <motion.div className="mt-6 text-center px-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.5 }}>
        <p className="text-white/70 text-lg font-bold">Papa is working in {locationName}</p>
        <div className="flex items-center justify-center gap-3 mt-2">
          <span className="text-lg">🚗</span>
          <span className="text-yellow-400 font-black text-2xl">{km.toLocaleString()} km</span>
          <span className="text-white/40">away</span>
        </div>
        <p className="text-white/30 text-sm mt-1">About 4 hours drive out west</p>

        {capsule?.map_audio_url && (
          <motion.button
            className="mt-5 w-20 h-20 mx-auto bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full flex items-center justify-center text-4xl shadow-lg shadow-yellow-400/20"
            whileTap={{ scale: 0.8 }}
            onClick={playAudio}
            animate={playing ? { scale: [1, 1.1, 1] } : {}}
            transition={{ repeat: Infinity, duration: 0.5 }}
          >
            {playing ? '🔊' : '▶️'}
          </motion.button>
        )}

        {capsule?.worksite_photo_url && (
          <motion.img
            src={capsule.worksite_photo_url}
            alt="Papa's worksite"
            className="mt-6 rounded-2xl w-full max-w-sm mx-auto border-2 border-white/10"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2 }}
          />
        )}
      </motion.div>

      <BottomNav />
    </div>
  );
}
