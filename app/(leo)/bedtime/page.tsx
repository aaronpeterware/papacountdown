'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import BottomNav from '@/components/leo/BottomNav';

export default function BedtimePage() {
  const [capsule, setCapsule] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [hour, setHour] = useState(0);

  useEffect(() => {
    async function load() {
      const timeRes = await fetch('/api/time');
      const { date, hour: h } = await timeRes.json();
      setHour(h);
      const rosterRes = await fetch('/api/active-roster');
      const { capsules } = await rosterRes.json();
      const todayCapsule = (capsules || []).find((c: { unlock_date: string }) => c.unlock_date === date);
      if (todayCapsule) setCapsule(todayCapsule);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <motion.div className="text-6xl" animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}>⭐</motion.div>
    </div>
  );

  const unlocked = hour >= 19;

  return (
    <div className="min-h-screen pb-24 px-4 pt-8">
      <h1 className="text-3xl font-black text-indigo-300 text-center mb-6">🌙 Bedtime Story</h1>
      <div className="max-w-md mx-auto">
        {!unlocked ? (
          <motion.div className="bg-indigo-900/40 border border-indigo-400/30 rounded-3xl p-8 text-center" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
            <span className="text-6xl">🔒</span>
            <p className="text-white text-xl font-bold mt-4">Bedtime stories unlock at 7pm!</p>
            <p className="text-white/60 mt-2">Come back when it&apos;s nearly bedtime 😴</p>
          </motion.div>
        ) : capsule?.bedtime_story_audio_url ? (
          <motion.div className="bg-indigo-900/40 border border-indigo-400/30 rounded-3xl p-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-white font-bold text-xl mb-1 text-center">
              {(capsule.bedtime_story_title as string) || "Tonight's Story"}
            </p>
            <p className="text-indigo-300/70 text-sm text-center mb-4">Read by Papa 💙</p>
            <audio controls className="w-full" src={capsule.bedtime_story_audio_url as string}>
              <track kind="captions" />
            </audio>
          </motion.div>
        ) : (
          <div className="text-center py-12">
            <span className="text-6xl">📚</span>
            <p className="text-white/60 mt-4 text-lg">Papa hasn&apos;t uploaded tonight&apos;s story yet...</p>
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
}
