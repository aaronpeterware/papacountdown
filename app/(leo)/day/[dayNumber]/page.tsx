'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function BackButton({ onBack }: { onBack: () => void }) {
  return (
    <motion.button
      className="absolute top-8 left-6 w-14 h-14 bg-yellow-400 rounded-2xl flex items-center justify-center text-2xl text-black font-bold z-20 shadow-lg shadow-yellow-400/30"
      whileTap={{ scale: 0.8 }}
      onClick={onBack}
    >
      ←
    </motion.button>
  );
}

// Unlock animation screen
function UnlockScreen({ dayNumber, onComplete }: { dayNumber: number; onComplete: () => void }) {
  useEffect(() => {
    const t = setTimeout(onComplete, 4000);
    return () => clearTimeout(t);
  }, [onComplete]);

  return (
    <motion.div className="min-h-screen flex flex-col items-center justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      {Array.from({ length: 30 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-3 h-3 rounded-full"
          style={{ backgroundColor: ['#fbbf24','#fb7185','#60a5fa','#34d399','#a78bfa'][i % 5], left: `${50 + (Math.random() - 0.5) * 80}%`, top: '50%' }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: [0, 1, 1, 0], scale: [0, 1, 1, 0.5], x: (Math.random() - 0.5) * 400, y: (Math.random() - 0.5) * 600 }}
          transition={{ duration: 2, delay: 0.5 + 0.5 * Math.random() }}
        />
      ))}
      <motion.div className="text-9xl" initial={{ scale: 0, rotate: -180 }} animate={{ scale: [0, 1.3, 1], rotate: 0 }} transition={{ duration: 0.8, type: 'spring' }}>🎁</motion.div>
      <motion.h1 className="text-4xl font-black text-yellow-400 mt-6" initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }}>
        Day {dayNumber}!
      </motion.h1>
      <motion.button className="mt-8 w-20 h-20 bg-yellow-400 rounded-full flex items-center justify-center text-3xl shadow-[0_0_30px_rgba(251,191,36,0.5)]" whileTap={{ scale: 0.8 }} onClick={onComplete} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1, type: 'spring' }}>
        ✨
      </motion.button>
    </motion.div>
  );
}

// Main cards grid
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CardsScreen({ capsule, dayNumber, onSelectView, onBack }: { capsule: any; dayNumber: number; onSelectView: (v: string) => void; onBack: () => void }) {
  const cards = [
    { icon: '😂', view: 'joke', available: !!capsule.dad_joke_audio_url },
    { icon: '🎙️', view: 'morning', available: !!capsule.morning_audio_url },
    { icon: '📸', view: 'photo', available: !!capsule.photo_url },
    { icon: '❤️', view: 'love', available: !!(capsule.love_reason_text || capsule.love_reason_audio_url) },
    { icon: '🗺️', view: 'map', available: !!capsule.map_location_name },
    { icon: '🏗️', view: 'worksite', available: !!capsule.worksite_photo_url },
    { icon: '🃏', view: 'wisdom', available: !!capsule.wisdom_card_text },
    { icon: '🎬', view: 'video', available: !!capsule.video_url },
    { icon: '🎮', view: 'game', available: capsule.minigame_type !== 'none' },
    { icon: '🌙', view: 'bedtime', available: !!capsule.bedtime_story_audio_url },
    { icon: '📓', view: 'journal', available: true, alwaysShow: true },
  ].filter(c => c.available);

  return (
    <motion.div className="min-h-screen pt-12 pb-8 px-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="flex items-center justify-between mb-8">
        <motion.button className="w-14 h-14 bg-yellow-400 rounded-2xl flex items-center justify-center text-2xl text-black font-bold shadow-lg shadow-yellow-400/30" whileTap={{ scale: 0.8 }} onClick={onBack}>←</motion.button>
        <h1 className="text-3xl font-black text-yellow-400">Day {dayNumber}</h1>
        <div className="w-14" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        {cards.map((card, i) => (
          <motion.button
            key={card.view}
            className={`aspect-square rounded-3xl border flex items-center justify-center text-5xl active:bg-white/20 ${card.view === 'journal' ? 'bg-gradient-to-br from-pink-500/20 to-purple-500/20 border-pink-400/30' : 'bg-white/10 border-white/10'}`}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 * i, type: 'spring' }}
            whileTap={{ scale: 0.85 }}
            onClick={() => onSelectView(card.view)}
          >
            {card.icon}
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}

// Joke screen
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function JokeScreen({ capsule, onBack }: { capsule: any; onBack: () => void }) {
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  return (
    <motion.div className="min-h-screen flex flex-col items-center justify-center px-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <BackButton onBack={onBack} />
      <motion.div className="text-8xl mb-6" animate={playing ? { scale: [1, 1.1, 1], rotate: [0, -5, 5, 0] } : { scale: [1, 1.05, 1] }} transition={{ repeat: Infinity, duration: playing ? 0.4 : 2 }}>😂</motion.div>
      <h2 className="text-2xl font-bold text-white text-center mb-8">Papa&apos;s Joke!</h2>
      <motion.button
        className={`w-28 h-28 rounded-full flex items-center justify-center text-5xl shadow-lg ${playing ? 'bg-gradient-to-br from-pink-400 to-red-400 shadow-[0_0_30px_rgba(244,63,94,0.4)]' : 'bg-gradient-to-br from-yellow-400 to-amber-500 shadow-[0_0_30px_rgba(251,191,36,0.4)]'}`}
        whileTap={{ scale: 0.8 }}
        onClick={() => {
          if (!capsule.dad_joke_audio_url) return;
          if (audioRef.current) audioRef.current.pause();
          const a = new Audio(capsule.dad_joke_audio_url);
          audioRef.current = a;
          setPlaying(true);
          a.play();
          a.onended = () => setPlaying(false);
        }}
        animate={playing ? { scale: [1, 1.05, 1] } : {}}
        transition={{ repeat: Infinity, duration: 0.5 }}
      >
        {playing ? '🔊' : '▶️'}
      </motion.button>
      <motion.p className="text-white/40 mt-6 text-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>Tap to hear Papa&apos;s joke!</motion.p>
    </motion.div>
  );
}

// Morning message screen
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function MorningScreen({ capsule, onBack }: { capsule: any; onBack: () => void }) {
  const [playing, setPlaying] = useState(false);
  return (
    <motion.div className="min-h-screen flex flex-col items-center justify-center px-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <BackButton onBack={onBack} />
      {capsule.photo_url && (
        <motion.img src={capsule.photo_url} alt="Papa" className="w-48 h-48 rounded-full object-cover mb-8 border-4 border-yellow-400/50 shadow-[0_0_30px_rgba(251,191,36,0.3)]" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }} />
      )}
      <motion.button
        className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full flex items-center justify-center text-5xl shadow-lg"
        whileTap={{ scale: 0.8 }}
        onClick={() => {
          if (!capsule.morning_audio_url) return;
          const a = new Audio(capsule.morning_audio_url);
          setPlaying(true);
          a.play();
          a.onended = () => setPlaying(false);
        }}
        animate={playing ? { scale: [1, 1.1, 1] } : { scale: [1, 1.05, 1] }}
        transition={{ repeat: Infinity, duration: playing ? 0.5 : 2 }}
      >
        {playing ? '🔊' : '▶️'}
      </motion.button>
      {playing && (
        <div className="flex items-end gap-1 mt-8 h-10">
          {Array.from({ length: 12 }).map((_, i) => (
            <motion.div key={i} className="w-2 bg-yellow-400 rounded-full" animate={{ height: [8, 24 + 16 * Math.random(), 8] }} transition={{ repeat: Infinity, duration: 0.5 + 0.5 * Math.random(), delay: 0.05 * i }} />
          ))}
        </div>
      )}
    </motion.div>
  );
}

// Photo screen
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function PhotoScreen({ capsule, onBack }: { capsule: any; onBack: () => void }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <motion.div className="min-h-screen flex flex-col items-center justify-center px-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <BackButton onBack={onBack} />
      <motion.div className="bg-white p-4 pb-12 rounded-lg shadow-2xl max-w-[300px]" initial={{ rotate: -10, scale: 0.5 }} animate={{ rotate: [0, 2, -2, 0], scale: 1 }} transition={{ type: 'spring', bounce: 0.4 }} whileTap={{ rotate: [0, 5, -5, 3, -3, 0] }}>
        {capsule.photo_url && (
          <motion.img src={capsule.photo_url} alt="Papa today" className="w-full aspect-square object-cover rounded" initial={{ filter: 'brightness(3) blur(20px)' }} animate={{ filter: loaded ? 'brightness(1) blur(0px)' : 'brightness(3) blur(20px)' }} transition={{ duration: 2 }} onLoad={() => setTimeout(() => setLoaded(true), 500)} />
        )}
      </motion.div>
      {capsule.photo_caption && (
        <motion.p className="text-white/50 text-sm mt-6 text-center italic" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2 }}>{capsule.photo_caption}</motion.p>
      )}
    </motion.div>
  );
}

// Love screen
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function LoveScreen({ capsule, onBack }: { capsule: any; onBack: () => void }) {
  const [, setPlaying] = useState(false);
  const [revealed, setRevealed] = useState(false);
  return (
    <motion.div className="min-h-screen flex flex-col items-center justify-center px-8 relative overflow-hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <BackButton onBack={onBack} />
      {revealed && Array.from({ length: 20 }).map((_, i) => (
        <motion.div key={i} className="absolute text-3xl" style={{ left: `${Math.random() * 90}%`, bottom: '-20px' }} initial={{ y: 0, opacity: 0 }} animate={{ y: '-110vh', opacity: [0, 1, 1, 0], rotate: [-20, 20, -20] }} transition={{ duration: 4 + 3 * Math.random(), delay: 0.3 * i, repeat: Infinity }}>
          {['❤️', '💛', '💖', '💕', '💗'][i % 5]}
        </motion.div>
      ))}
      <motion.button
        className="w-32 h-32 bg-gradient-to-br from-pink-400 to-red-500 rounded-full flex items-center justify-center text-7xl shadow-[0_0_40px_rgba(244,63,94,0.4)] z-10"
        whileTap={{ scale: 0.8 }}
        onClick={() => {
          if (!capsule.love_reason_audio_url) { setRevealed(true); return; }
          const a = new Audio(capsule.love_reason_audio_url);
          setPlaying(true); setRevealed(true);
          a.play();
          a.onended = () => setPlaying(false);
        }}
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ repeat: Infinity, duration: 1.5 }}
      >
        ❤️
      </motion.button>
      {capsule.love_reason_text && (
        <motion.p className="text-white/60 text-center text-lg mt-8 max-w-xs z-10" initial={{ opacity: 0, y: 20 }} animate={{ opacity: revealed ? 1 : 0, y: revealed ? 0 : 20 }} transition={{ delay: 1 }}>
          {capsule.love_reason_text}
        </motion.p>
      )}
    </motion.div>
  );
}

// Map detail screen
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function MapDetailScreen({ capsule, onBack }: { capsule: any; onBack: () => void }) {
  const [playing, setPlaying] = useState(false);
  return (
    <motion.div className="min-h-screen flex flex-col items-center justify-center px-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <BackButton onBack={onBack} />
      <span className="text-7xl mb-4">🗺️</span>
      <h2 className="text-2xl font-bold text-white mb-2">{capsule.map_location_name}</h2>
      {capsule.map_audio_url && (
        <motion.button className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full flex items-center justify-center text-4xl shadow-lg mt-4" whileTap={{ scale: 0.8 }} onClick={() => { const a = new Audio(capsule.map_audio_url); setPlaying(true); a.play(); a.onended = () => setPlaying(false); }} animate={playing ? { scale: [1, 1.1, 1] } : {}} transition={{ repeat: Infinity, duration: 0.5 }}>
          {playing ? '🔊' : '▶️'}
        </motion.button>
      )}
    </motion.div>
  );
}

// Worksite screen
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function WorksiteScreen({ capsule, onBack }: { capsule: any; onBack: () => void }) {
  const [playing, setPlaying] = useState(false);
  return (
    <motion.div className="min-h-screen flex flex-col items-center justify-center px-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <BackButton onBack={onBack} />
      {capsule.worksite_photo_url && (
        <motion.img src={capsule.worksite_photo_url} alt="Papa's worksite" className="w-full max-w-sm rounded-2xl mb-6 shadow-2xl" initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: 'spring' }} />
      )}
      {capsule.worksite_audio_url && (
        <motion.button className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full flex items-center justify-center text-4xl shadow-lg" whileTap={{ scale: 0.8 }} onClick={() => { const a = new Audio(capsule.worksite_audio_url); setPlaying(true); a.play(); a.onended = () => setPlaying(false); }}>
          {playing ? '🔊' : '▶️'}
        </motion.button>
      )}
    </motion.div>
  );
}

// Bedtime story screen
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function BedtimeScreen({ capsule, dayNumber, onBack }: { capsule: any; dayNumber: number; onBack: () => void }) {
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  return (
    <motion.div className="min-h-screen flex flex-col items-center justify-center px-6 pb-12" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ background: 'linear-gradient(180deg, #0a0a2e 0%, #1a0a3e 100%)' }}>
      <BackButton onBack={onBack} />
      <motion.div className="text-6xl mb-4" animate={{ y: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}>🌙</motion.div>
      <h2 className="text-2xl font-black text-yellow-400 text-center mb-2">{capsule.bedtime_story_title || `Day ${dayNumber} Story`}</h2>
      {capsule.bedtime_story_illustration_url && (
        <motion.img src={capsule.bedtime_story_illustration_url} alt="Story illustration" className="w-full max-w-xs rounded-3xl my-6 shadow-2xl border-2 border-purple-400/30" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring' }} />
      )}
      <motion.button
        className={`w-28 h-28 rounded-full flex items-center justify-center text-5xl shadow-lg ${playing ? 'bg-gradient-to-br from-purple-500 to-indigo-600 shadow-[0_0_30px_rgba(139,92,246,0.5)]' : 'bg-gradient-to-br from-yellow-400 to-amber-500 shadow-[0_0_30px_rgba(251,191,36,0.4)]'}`}
        whileTap={{ scale: 0.85 }}
        onClick={() => {
          if (!capsule.bedtime_story_audio_url) return;
          if (audioRef.current) { audioRef.current.pause(); }
          if (playing) { setPlaying(false); return; }
          const a = new Audio(capsule.bedtime_story_audio_url);
          audioRef.current = a;
          setPlaying(true);
          a.play();
          a.onended = () => setPlaying(false);
        }}
        animate={playing ? { scale: [1, 1.05, 1] } : {}}
        transition={{ repeat: Infinity, duration: 1.5 }}
      >
        {playing ? '⏸️' : '▶️'}
      </motion.button>
      <p className="text-white/40 text-sm mt-4">{playing ? 'Tap to pause' : 'Tap to start the story!'}</p>
      {playing && (
        <div className="flex items-end gap-1 mt-6 h-8">
          {Array.from({ length: 8 }).map((_, i) => (
            <motion.div key={i} className="w-2 bg-purple-400 rounded-full" animate={{ height: [6, 20 + 12 * Math.random(), 6] }} transition={{ repeat: Infinity, duration: 0.6 + 0.4 * Math.random(), delay: 0.08 * i }} />
          ))}
        </div>
      )}
    </motion.div>
  );
}

// Wisdom card screen
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function WisdomScreen({ capsule, dayNumber, onBack }: { capsule: any; dayNumber: number; onBack: () => void }) {
  const [flipped, setFlipped] = useState(false);
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const themes: Record<string, string> = { space: 'from-indigo-800 to-purple-900', jungle: 'from-green-700 to-emerald-900', ocean: 'from-blue-600 to-cyan-800', mountains: 'from-gray-600 to-slate-800', desert: 'from-amber-600 to-orange-800', forest: 'from-green-800 to-teal-900', city: 'from-zinc-600 to-gray-800' };
  const icons: Record<string, string> = { space: '🌌', jungle: '🌴', ocean: '🌊', mountains: '⛰️', desert: '🏜️', forest: '🌲', city: '🌃' };
  const theme = capsule.wisdom_card_theme || 'space';
  const grad = themes[theme] || themes.space;
  const icon = icons[theme] || '⭐';
  const audioUrl = `https://bcvcxwrxusuvsvqdzqkd.supabase.co/storage/v1/object/public/wisdom-card-illustrations/wisdom-audio/day-${dayNumber}/wisdom.mp3`;

  return (
    <motion.div className="min-h-screen flex flex-col items-center justify-center px-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <BackButton onBack={() => { audioRef.current?.pause(); onBack(); }} />
      <motion.div
        className="w-72 h-96 cursor-pointer"
        whileTap={{ scale: 0.95 }}
        onClick={() => {
          const next = !flipped;
          setFlipped(next);
          if (next) {
            audioRef.current?.pause();
            const a = new Audio(audioUrl);
            audioRef.current = a;
            setPlaying(true);
            a.play().catch(() => {});
            a.onended = () => setPlaying(false);
          } else {
            audioRef.current?.pause();
            setPlaying(false);
          }
        }}
      >
        <motion.div className="w-full h-full relative" animate={{ rotateY: flipped ? 180 : 0 }} transition={{ duration: 0.6, type: 'spring' }} style={{ transformStyle: 'preserve-3d' }}>
          <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${grad} flex flex-col items-center justify-center border-2 border-white/20 shadow-2xl`} style={{ backfaceVisibility: 'hidden' }}>
            <span className="text-6xl mb-4">{icon}</span>
            <span className="text-white/50 text-lg font-bold">Tap to flip!</span>
          </div>
          <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${grad} flex flex-col items-center justify-center p-8 border-2 border-yellow-400/30 shadow-2xl`} style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
            <span className="text-5xl mb-4">{icon}</span>
            <p className="text-white text-center text-lg font-bold leading-relaxed">{capsule.wisdom_card_text}</p>
            {playing && (
              <motion.div className="mt-4 flex items-center gap-1" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <motion.div key={i} className="w-1.5 bg-yellow-400 rounded-full" animate={{ height: [6, 16 + 10 * Math.random(), 6] }} transition={{ repeat: Infinity, duration: 0.4 + 0.3 * Math.random() }} />
                ))}
              </motion.div>
            )}
            <div className="absolute bottom-4 w-12 h-12 rounded-full border-2 border-yellow-400/50 flex items-center justify-center">
              <span className="text-yellow-400 font-black">{dayNumber}</span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

// Video screen
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function VideoScreen({ capsule, onBack }: { capsule: any; onBack: () => void }) {
  return (
    <motion.div className="min-h-screen flex flex-col items-center justify-center px-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <BackButton onBack={onBack} />
      {capsule.video_url && (
        <motion.video src={capsule.video_url} controls className="w-full max-w-md rounded-3xl shadow-2xl" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring' }} />
      )}
    </motion.div>
  );
}

export default function DayPage() {
  const params = useParams();
  const router = useRouter();
  const dayNumber = parseInt(params.dayNumber as string);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [capsule, setCapsule] = useState<any>(null);
  const [view, setView] = useState('unlock');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/unlock?day=${dayNumber}`);
      const { unlocked } = await res.json();
      if (!unlocked) { router.push('/'); return; }

      const { capsules } = await fetch('/api/active-roster').then(r => r.json());
      const cap = capsules?.find((c: { day_number: number }) => c.day_number === dayNumber);
      if (cap) {
        setCapsule(cap);
        if (localStorage.getItem(`day-${dayNumber}-visited`)) setView('cards');
      }
      setLoading(false);
    }
    load();
  }, [dayNumber, router]);

  const onUnlockComplete = useCallback(() => {
    setView('cards');
    localStorage.setItem(`day-${dayNumber}-visited`, 'true');
  }, [dayNumber]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <motion.div className="text-6xl" animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}>⭐</motion.div>
    </div>
  );

  if (!capsule) return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-8">
      <span className="text-6xl mb-4">😔</span>
      <p className="text-white/60 text-lg">Papa hasn&apos;t set up this day yet...</p>
      <button onClick={() => router.back()} className="mt-6 text-yellow-400 font-bold text-lg">← Go Back</button>
    </div>
  );

  return (
    <div className="min-h-screen">
      <AnimatePresence mode="wait">
        {view === 'unlock' && <UnlockScreen key="unlock" dayNumber={dayNumber} onComplete={onUnlockComplete} />}
        {view === 'cards' && <CardsScreen key="cards" capsule={capsule} dayNumber={dayNumber} onSelectView={setView} onBack={() => router.push('/')} />}
        {view === 'joke' && <JokeScreen key="joke" capsule={capsule} onBack={() => setView('cards')} />}
        {view === 'morning' && <MorningScreen key="morning" capsule={capsule} onBack={() => setView('cards')} />}
        {view === 'photo' && <PhotoScreen key="photo" capsule={capsule} onBack={() => setView('cards')} />}
        {view === 'love' && <LoveScreen key="love" capsule={capsule} onBack={() => setView('cards')} />}
        {view === 'map' && <MapDetailScreen key="mapdetail" capsule={capsule} onBack={() => setView('cards')} />}
        {view === 'worksite' && <WorksiteScreen key="worksite" capsule={capsule} onBack={() => setView('cards')} />}
        {view === 'bedtime' && <BedtimeScreen key="bedtime" capsule={capsule} dayNumber={dayNumber} onBack={() => setView('cards')} />}
        {view === 'wisdom' && <WisdomScreen key="wisdom" capsule={capsule} dayNumber={dayNumber} onBack={() => setView('cards')} />}
        {view === 'video' && <VideoScreen key="video" capsule={capsule} onBack={() => setView('cards')} />}
      </AnimatePresence>
    </div>
  );
}
