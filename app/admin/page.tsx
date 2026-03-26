'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface Capsule {
  day_number: number;
  unlock_date: string;
  morning_audio_url?: string;
  photo_url?: string;
  dad_joke_audio_url?: string;
  bedtime_story_audio_url?: string;
  love_reason_audio_url?: string;
}

interface Roster {
  id: string;
  start_date: string;
  end_date: string;
  days_on: number;
  is_active: boolean;
}

export default function AdminPage() {
  const [roster, setRoster] = useState<Roster | null>(null);
  const [capsules, setCapsules] = useState<Capsule[]>([]);
  const [loading, setLoading] = useState(true);
  const [today, setToday] = useState('');

  useEffect(() => {
    async function load() {
      const timeRes = await fetch('/api/time');
      const { date } = await timeRes.json();
      setToday(date);
      const rosterRes = await fetch('/api/active-roster');
      const { roster: r, capsules: c } = await rosterRes.json();
      if (r) { setRoster(r); setCapsules(c || []); }
      setLoading(false);
    }
    load();
  }, []);

  const getStatus = (cap: Capsule) => {
    const fields = [cap.morning_audio_url, cap.photo_url, cap.dad_joke_audio_url, cap.bedtime_story_audio_url];
    const filled = fields.filter(Boolean).length;
    if (filled === 0) return 'empty';
    if (filled < 3) return 'partial';
    return 'full';
  };

  const statusColor = (s: string) => s === 'full' ? 'bg-green-400' : s === 'partial' ? 'bg-yellow-400' : 'bg-red-400/50';

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-black mb-2">👨‍💼 Papa Admin</h1>
        <p className="text-white/60 mb-8">Manage Leo&apos;s countdown content</p>

        {loading ? (
          <div className="text-center py-12"><div className="text-4xl animate-spin">⭐</div></div>
        ) : !roster ? (
          <div className="bg-white/5 rounded-2xl p-6">
            <h2 className="text-xl font-bold mb-4">No active roster found</h2>
            <Link href="/admin/roster" className="bg-yellow-400 text-gray-900 font-bold px-6 py-3 rounded-xl inline-block">
              ➕ Set Up Roster
            </Link>
          </div>
        ) : (
          <>
            <div className="bg-white/5 rounded-2xl p-5 mb-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-white/60 text-sm">Active Roster</p>
                  <p className="text-xl font-bold">{roster.start_date} → {roster.end_date}</p>
                  <p className="text-white/60 text-sm mt-1">{roster.days_on} days on</p>
                </div>
                <div className="text-right">
                  <p className="text-white/60 text-sm">Today</p>
                  <p className="font-bold">{today}</p>
                </div>
              </div>
              <div className="mt-4">
                <div className="flex justify-between text-xs text-white/60 mb-1">
                  <span>Content progress</span>
                  <span>{capsules.filter(c => getStatus(c) === 'full').length}/{capsules.length} days ready</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2">
                  <div
                    className="bg-green-400 h-2 rounded-full transition-all"
                    style={{ width: `${(capsules.filter(c => getStatus(c) === 'full').length / Math.max(capsules.length, 1)) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 mb-6">
              <Link href="/admin/roster" className="flex-1 bg-white/10 rounded-xl p-3 text-center font-bold hover:bg-white/20 transition-colors">
                📅 Edit Roster
              </Link>
              <Link href="/admin/bulk" className="flex-1 bg-white/10 rounded-xl p-3 text-center font-bold hover:bg-white/20 transition-colors">
                📦 Bulk Upload
              </Link>
            </div>

            <h2 className="text-xl font-bold mb-3">14 Days</h2>
            <div className="space-y-2">
              {capsules.map((cap) => {
                const status = getStatus(cap);
                const isToday = cap.unlock_date === today;
                return (
                  <Link key={cap.day_number} href={`/admin/day/${cap.day_number}`}>
                    <motion.div
                      className={`flex items-center justify-between p-4 rounded-xl cursor-pointer transition-colors ${isToday ? 'bg-yellow-400/20 border border-yellow-400/40' : 'bg-white/5 hover:bg-white/10'}`}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${statusColor(status)}`} />
                        <div>
                          <span className="font-bold">Day {cap.day_number}</span>
                          {isToday && <span className="ml-2 text-yellow-400 text-xs font-bold">TODAY</span>}
                          <p className="text-white/50 text-xs">{cap.unlock_date}</p>
                        </div>
                      </div>
                      <span className="text-white/40">→</span>
                    </motion.div>
                  </Link>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
