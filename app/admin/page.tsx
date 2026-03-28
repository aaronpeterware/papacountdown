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

interface JournalEntry {
  id: string;
  day_number: number;
  entry_date: string;
  voice_recording_url: string | null;
  drawing_image_url: string | null;
  created_at: string;
}

export default function AdminPage() {
  const [roster, setRoster] = useState<Roster | null>(null);
  const [capsules, setCapsules] = useState<Capsule[]>([]);
  const [journal, setJournal] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [today, setToday] = useState('');
  const [journalTab, setJournalTab] = useState<'drawings' | 'voice'>('drawings');

  useEffect(() => {
    async function load() {
      const { date } = await fetch('/api/time').then(r => r.json());
      setToday(date);
      const { roster: r, capsules: c } = await fetch('/api/active-roster').then(r => r.json());
      if (r) { setRoster(r); setCapsules(c || []); }
      const entries = await fetch('/api/journal').then(r => r.json());
      setJournal(entries || []);
      setLoading(false);
    }
    load();
  }, []);

  const getStatus = (cap: Capsule) => {
    const filled = [cap.morning_audio_url, cap.photo_url, cap.dad_joke_audio_url, cap.bedtime_story_audio_url].filter(Boolean).length;
    if (filled === 0) return 'empty';
    if (filled < 3) return 'partial';
    return 'full';
  };

  const statusColor = (s: string) => s === 'full' ? 'bg-green-400' : s === 'partial' ? 'bg-yellow-400' : 'bg-red-400/50';

  const drawings = journal.filter(e => e.drawing_image_url);
  const voiceNotes = journal.filter(e => e.voice_recording_url);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-black mb-2">👨‍💼 Papa Admin</h1>
        <p className="text-white/60 mb-8">Manage Leo&apos;s countdown content</p>

        {loading ? (
          <div className="text-center py-12"><div className="text-4xl animate-spin">⭐</div></div>
        ) : (
          <>
            {/* Roster section */}
            {!roster ? (
              <div className="bg-white/5 rounded-2xl p-6 mb-6">
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
                      <div className="bg-green-400 h-2 rounded-full transition-all" style={{ width: `${(capsules.filter(c => getStatus(c) === 'full').length / Math.max(capsules.length, 1)) * 100}%` }} />
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 mb-6">
                  <Link href="/admin/roster" className="flex-1 bg-white/10 rounded-xl p-3 text-center font-bold hover:bg-white/20 transition-colors">📅 Edit Roster</Link>
                  <Link href="/admin/bulk" className="flex-1 bg-white/10 rounded-xl p-3 text-center font-bold hover:bg-white/20 transition-colors">📦 Bulk Upload</Link>
                </div>

                <h2 className="text-xl font-bold mb-3">14 Days</h2>
                <div className="space-y-2 mb-8">
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

            {/* Leo's Journal Section */}
            <div className="border-t border-white/10 pt-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-black">📓 Leo&apos;s Journal</h2>
                <div className="flex gap-1 text-sm">
                  <span className="text-white/50">{drawings.length} drawings</span>
                  <span className="text-white/30 mx-1">·</span>
                  <span className="text-white/50">{voiceNotes.length} voice notes</span>
                </div>
              </div>

              {journal.length === 0 ? (
                <div className="bg-white/5 rounded-2xl p-6 text-center text-white/40">
                  No journal entries yet
                </div>
              ) : (
                <>
                  {/* Tab toggle */}
                  <div className="flex gap-2 mb-4">
                    <button
                      onClick={() => setJournalTab('drawings')}
                      className={`flex-1 py-2 rounded-xl font-bold text-sm transition-colors ${journalTab === 'drawings' ? 'bg-pink-500/30 text-pink-300' : 'bg-white/5 text-white/50'}`}
                    >
                      🎨 Drawings ({drawings.length})
                    </button>
                    <button
                      onClick={() => setJournalTab('voice')}
                      className={`flex-1 py-2 rounded-xl font-bold text-sm transition-colors ${journalTab === 'voice' ? 'bg-purple-500/30 text-purple-300' : 'bg-white/5 text-white/50'}`}
                    >
                      🎙️ Voice Notes ({voiceNotes.length})
                    </button>
                  </div>

                  {journalTab === 'drawings' && (
                    <div className="grid grid-cols-2 gap-3">
                      {drawings.map((entry) => (
                        <div key={entry.id} className="bg-white/5 rounded-2xl overflow-hidden">
                          <img src={entry.drawing_image_url!} alt={`Leo drawing day ${entry.day_number}`} className="w-full aspect-square object-cover" />
                          <div className="p-2 text-xs text-white/50 text-center font-bold">
                            Day {entry.day_number} · {entry.entry_date}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {journalTab === 'voice' && (
                    <div className="space-y-3">
                      {voiceNotes.map((entry, i) => (
                        <div key={entry.id} className="bg-white/5 rounded-2xl p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-lg">🎙️</span>
                            <span className="text-white/70 text-sm font-bold">Day {entry.day_number} · {entry.entry_date}</span>
                            <span className="text-white/30 text-xs">#{i + 1}</span>
                          </div>
                          <audio controls className="w-full" src={entry.voice_recording_url!}>
                            <track kind="captions" />
                          </audio>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
