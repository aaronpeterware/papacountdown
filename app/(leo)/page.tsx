'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import BottomNav from '@/components/leo/BottomNav';

const CAPSULE_EMOJIS = ['⭐', '🚀', '💛', '🌈', '🎸', '🐨', '⚡', '🌊', '🎯', '🦖', '🎪', '🌟', '💫', '🏠'];

function SleepsCountdown({ sleeps }: { sleeps: number }) {
  return (
    <div className="text-center py-6">
      <p className="text-white/70 text-lg mb-2">Papa comes home in...</p>
      <motion.div
        className="flex items-center justify-center gap-4"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', bounce: 0.5 }}
      >
        <motion.span
          key={sleeps}
          className="text-8xl font-black text-yellow-400 drop-shadow-[0_0_30px_rgba(251,191,36,0.5)]"
          initial={{ scale: 1.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', bounce: 0.4 }}
        >
          {sleeps}
        </motion.span>
        <div className="flex flex-col items-center">
          <span className="text-4xl">😴</span>
          <span className="text-white/60 text-sm font-bold uppercase tracking-wider">Sleeps</span>
        </div>
      </motion.div>
      <div className="flex items-center justify-center gap-1 mt-6 px-8">
        {Array.from({ length: 14 }, (_, i) => {
          const n = i + 1;
          const past = n <= 14 - sleeps;
          const current = n === 14 - sleeps + 1;
          return (
            <div key={i} className="flex items-center">
              <motion.div
                className={`rounded-full ${past ? 'w-3 h-3 bg-green-400' : current ? 'w-5 h-5 bg-yellow-400' : 'w-3 h-3 bg-white/20'}`}
                animate={current ? { scale: [1, 1.3, 1] } : {}}
                transition={current ? { repeat: Infinity, duration: 1.5 } : {}}
              />
              {i < 13 && <div className={`w-2 h-0.5 ${past ? 'bg-green-400/50' : 'bg-white/10'}`} />}
            </div>
          );
        })}
        <span className="ml-2 text-2xl">🏠</span>
      </div>
    </div>
  );
}

interface Capsule {
  day_number: number;
  unlock_date: string;
  has_content: boolean;
}

function CapsuleGrid({ capsules, today }: { capsules: Capsule[]; today: string }) {
  return (
    <div className="grid grid-cols-3 gap-4 px-4 pb-28">
      {capsules.map((capsule, i) => {
        const past = capsule.unlock_date < today;
        const isToday = capsule.unlock_date === today;
        const future = capsule.unlock_date > today;
        const emoji = CAPSULE_EMOJIS[i] || '⭐';

        return (
          <motion.div
            key={capsule.day_number}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 * i, type: 'spring', bounce: 0.3 }}
          >
            {future ? (
              <motion.div
                className="aspect-square rounded-3xl flex flex-col items-center justify-center bg-white/5 border border-white/5 opacity-40 cursor-pointer"
                whileTap={{ scale: 0.95, rotate: [0, -5, 5, -5, 0] }}
                transition={{ duration: 0.4 }}
              >
                <span className="text-2xl mb-1 blur-[2px]">{emoji}</span>
                <span className="text-xl font-black text-white/30">{capsule.day_number}</span>
                <span className="text-lg mt-1">🔒</span>
              </motion.div>
            ) : (
              <Link href={`/day/${capsule.day_number}`}>
                <motion.div
                  className={`relative aspect-square rounded-3xl flex flex-col items-center justify-center cursor-pointer ${
                    isToday
                      ? 'bg-gradient-to-br from-yellow-400/30 to-amber-500/30 border-2 border-yellow-400/50 capsule-today'
                      : 'bg-white/10 border border-white/10'
                  }`}
                  whileTap={{ scale: 0.9 }}
                  animate={isToday ? { y: [0, -5, 0] } : {}}
                  transition={isToday ? { repeat: Infinity, duration: 2, ease: 'easeInOut' } : {}}
                >
                  <span className="text-3xl mb-1">{emoji}</span>
                  <span className={`text-2xl font-black ${isToday ? 'text-yellow-400' : 'text-white/70'}`}>
                    {capsule.day_number}
                  </span>
                  {past && (
                    <motion.div
                      className="absolute top-2 right-2 w-6 h-6 bg-green-400 rounded-full flex items-center justify-center"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                    >
                      <span className="text-xs">✓</span>
                    </motion.div>
                  )}
                  {isToday && (
                    <motion.div
                      className="absolute -top-1 -right-1 bg-yellow-400 text-[#0f1b3d] text-xs font-bold px-2 py-0.5 rounded-full"
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                    >
                      TODAY!
                    </motion.div>
                  )}
                </motion.div>
              </Link>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}

export default function HomePage() {
  const [roster, setRoster] = useState<{ end_date: string } | null>(null);
  const [capsules, setCapsules] = useState<Capsule[]>([]);
  const [today, setToday] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const timeRes = await fetch('/api/time');
      const { date } = await timeRes.json();
      setToday(date);

      const rosterRes = await fetch('/api/active-roster');
      const { roster: r, capsules: c } = await rosterRes.json();
      if (r) {
        setRoster(r);
        setCapsules(
          (c || [])
            .sort((a: Capsule, b: Capsule) => a.day_number - b.day_number)
            .map((cap: Capsule) => ({
              day_number: cap.day_number,
              unlock_date: cap.unlock_date,
              has_content: !!(
                (cap as any).morning_audio_url ||
                (cap as any).photo_url ||
                (cap as any).dad_joke_audio_url ||
                (cap as any).bedtime_story_audio_url
              ),
            }))
        );
      }
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          className="text-6xl"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
        >
          ⭐
        </motion.div>
      </div>
    );
  }

  if (!roster) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-8">
        <span className="text-8xl mb-6">💛</span>
        <h1 className="text-3xl font-black text-white mb-3">Papa&apos;s Countdown</h1>
        <p className="text-white/60 text-lg">Waiting for Papa to set up the next adventure...</p>
      </div>
    );
  }

  const todayDate = new Date(today);
  const endDate = new Date(roster.end_date);
  const sleeps = Math.max(0, Math.ceil((endDate.getTime() - todayDate.getTime()) / 86400000));

  return (
    <div className="min-h-screen pb-24">
      <div className="pt-8 pb-4 text-center">
        <motion.div
          className="w-28 h-28 mx-auto rounded-full overflow-hidden mb-4 shadow-[0_0_30px_rgba(251,191,36,0.4)] ring-4 ring-yellow-400/60"
          animate={{
            boxShadow: [
              '0 0 20px rgba(251,191,36,0.3)',
              '0 0 40px rgba(251,191,36,0.5)',
              '0 0 20px rgba(251,191,36,0.3)',
            ],
          }}
          transition={{ repeat: Infinity, duration: 3 }}
        >
          <img
            src="https://bcvcxwrxusuvsvqdzqkd.supabase.co/storage/v1/object/public/bedtime-stories/papa-photo.jpg"
            alt="Papa"
            className="w-full h-full object-cover"
          />
        </motion.div>
      </div>
      <SleepsCountdown sleeps={sleeps} />
      <div className="mt-6">
        <CapsuleGrid capsules={capsules} today={today} />
      </div>
      <BottomNav />
    </div>
  );
}
