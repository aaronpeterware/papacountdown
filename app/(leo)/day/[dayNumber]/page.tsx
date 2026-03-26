'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';
import BottomNav from '@/components/leo/BottomNav';

export default function DayPage() {
  const params = useParams();
  const router = useRouter();
  const dayNumber = params.dayNumber as string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [capsule, setCapsule] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(true);
  const [jokeListened, setJokeListened] = useState(false);

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/capsule/${dayNumber}`);
      if (res.ok) setCapsule(await res.json());
      setLoading(false);
    }
    load();
  }, [dayNumber]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div className="text-6xl" animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}>⭐</motion.div>
      </div>
    );
  }

  if (!capsule) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-8">
        <span className="text-6xl mb-4">😔</span>
        <p className="text-white/60 text-lg">Papa hasn&apos;t set up this day yet...</p>
        <button onClick={() => router.back()} className="mt-6 text-yellow-400 font-bold text-lg">← Go Back</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24">
      <div className="pt-6 px-4">
        <button onClick={() => router.back()} className="text-white/60 font-bold text-lg mb-4 block">← Back</button>
        <h1 className="text-3xl font-black text-yellow-400 mb-6 text-center">Day {dayNumber} 🌟</h1>

        <div className="space-y-4 max-w-md mx-auto">
          {/* Morning message */}
          {capsule.morning_audio_url && (
            <motion.div className="bg-white/10 rounded-3xl p-5" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <p className="text-white font-bold text-lg mb-3">🌅 Good Morning Message from Papa!</p>
              <audio controls className="w-full" src={capsule.morning_audio_url as string}>
                <track kind="captions" />
              </audio>
            </motion.div>
          )}

          {/* Photo */}
          {capsule.photo_url && (
            <motion.div className="bg-white/10 rounded-3xl p-5" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <p className="text-white font-bold text-lg mb-3">📸 Papa&apos;s Photo Today</p>
              <img src={capsule.photo_url as string} alt="Papa" className="w-full rounded-2xl object-cover" />
              {capsule.photo_caption && <p className="text-white/70 mt-2 text-center">{capsule.photo_caption as string}</p>}
            </motion.div>
          )}

          {/* Dad joke - must listen first */}
          {capsule.dad_joke_audio_url && (
            <motion.div className="bg-yellow-400/20 border border-yellow-400/30 rounded-3xl p-5" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
              <p className="text-white font-bold text-lg mb-3">😂 Papa&apos;s Joke!</p>
              <audio controls className="w-full" onEnded={() => setJokeListened(true)} src={capsule.dad_joke_audio_url as string}>
                <track kind="captions" />
              </audio>
              {!jokeListened && <p className="text-yellow-300/70 text-sm mt-2 text-center">🔒 Listen to the joke to unlock more!</p>}
            </motion.div>
          )}

          {/* Rest of content - gated behind joke */}
          {(!capsule.dad_joke_audio_url || jokeListened) && (
            <>
              {/* Love reason */}
              {(capsule.love_reason_text || capsule.love_reason_audio_url) && (
                <motion.div className="bg-pink-500/20 border border-pink-500/30 rounded-3xl p-5" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                  <p className="text-white font-bold text-lg mb-2">💖 I Love You Because...</p>
                  {capsule.love_reason_text && <p className="text-white/80 text-xl text-center font-bold">{capsule.love_reason_text as string}</p>}
                  {capsule.love_reason_audio_url && (
                    <audio controls className="w-full mt-3" src={capsule.love_reason_audio_url as string}>
                      <track kind="captions" />
                    </audio>
                  )}
                </motion.div>
              )}

              {/* Worksite */}
              {(capsule.map_location_name || capsule.worksite_photo_url) && (
                <motion.div className="bg-blue-500/20 border border-blue-500/30 rounded-3xl p-5" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                  <p className="text-white font-bold text-lg mb-2">📍 Where is Papa Today?</p>
                  {capsule.map_location_name && <p className="text-white/80 text-center text-lg">{capsule.map_location_name as string}</p>}
                  {capsule.worksite_photo_url && <img src={capsule.worksite_photo_url as string} alt="Worksite" className="w-full rounded-2xl mt-3 object-cover" />}
                  {capsule.map_audio_url && (
                    <audio controls className="w-full mt-3" src={capsule.map_audio_url as string}>
                      <track kind="captions" />
                    </audio>
                  )}
                </motion.div>
              )}

              {/* Bedtime story */}
              {capsule.bedtime_story_audio_url && (
                <motion.div className="bg-indigo-500/20 border border-indigo-500/30 rounded-3xl p-5" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                  <p className="text-white font-bold text-lg mb-2">🌙 Tonight&apos;s Bedtime Story</p>
                  {capsule.bedtime_story_title && <p className="text-white/70 text-center mb-2">{capsule.bedtime_story_title as string}</p>}
                  <audio controls className="w-full" src={capsule.bedtime_story_audio_url as string}>
                    <track kind="captions" />
                  </audio>
                </motion.div>
              )}
            </>
          )}
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
