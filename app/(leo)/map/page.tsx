'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import BottomNav from '@/components/leo/BottomNav';

export default function MapPage() {
  const [capsule, setCapsule] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const timeRes = await fetch('/api/time');
      const { date } = await timeRes.json();
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

  return (
    <div className="min-h-screen pb-24 px-4 pt-8">
      <h1 className="text-3xl font-black text-yellow-400 text-center mb-6">🗺️ Where is Papa?</h1>
      <div className="max-w-md mx-auto space-y-4">
        {capsule?.map_location_name ? (
          <>
            <motion.div className="bg-white/10 rounded-3xl p-5 text-center" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
              <span className="text-5xl">📍</span>
              <p className="text-white text-xl font-bold mt-2">{capsule.map_location_name as string}</p>
            </motion.div>
            {capsule.map_audio_url && (
              <motion.div className="bg-white/10 rounded-3xl p-5" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <p className="text-white/70 mb-2 font-bold">🎙️ Papa describing where he is:</p>
                <audio controls className="w-full" src={capsule.map_audio_url as string}>
                  <track kind="captions" />
                </audio>
              </motion.div>
            )}
            {capsule.worksite_photo_url && (
              <motion.div className="bg-white/10 rounded-3xl overflow-hidden" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <img src={capsule.worksite_photo_url as string} alt="Worksite" className="w-full object-cover" />
              </motion.div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <span className="text-6xl">🌍</span>
            <p className="text-white/60 mt-4 text-lg">Papa hasn&apos;t updated the map yet today!</p>
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
}
