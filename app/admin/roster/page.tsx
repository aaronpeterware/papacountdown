'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function RosterPage() {
  const router = useRouter();
  const [startDate, setStartDate] = useState('');
  const [daysOn, setDaysOn] = useState(14);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const getPreview = () => {
    if (!startDate) return [];
    return Array.from({ length: daysOn }, (_, i) => {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      return { day: i + 1, date: d.toISOString().split('T')[0] };
    });
  };

  const handleSave = async () => {
    if (!startDate) return;
    setSaving(true);
    const res = await fetch('/api/roster', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ start_date: startDate, days_on: daysOn }),
    });
    if (res.ok) {
      setMsg('✅ Roster created! Redirecting...');
      setTimeout(() => router.push('/admin'), 1500);
    } else {
      setMsg('❌ Something went wrong');
    }
    setSaving(false);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-lg mx-auto">
        <button onClick={() => router.back()} className="text-white/60 mb-4 block">← Back</button>
        <h1 className="text-3xl font-black mb-2">📅 Set Up Roster</h1>
        <p className="text-white/60 mb-8">Tell me when you leave and I&apos;ll set up all 14 days for Leo.</p>

        <div className="space-y-4">
          <div>
            <label className="block text-white/70 text-sm font-bold mb-2">What date do you leave? (Day 1)</label>
            <input
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className="w-full bg-white/10 rounded-xl px-4 py-3 text-white font-bold border border-white/20 focus:border-yellow-400 outline-none"
            />
          </div>

          <div>
            <label className="block text-white/70 text-sm font-bold mb-2">Days on (default: 14)</label>
            <input
              type="number"
              value={daysOn}
              onChange={e => setDaysOn(parseInt(e.target.value))}
              min={1} max={28}
              className="w-full bg-white/10 rounded-xl px-4 py-3 text-white font-bold border border-white/20 focus:border-yellow-400 outline-none"
            />
          </div>

          {startDate && (
            <motion.div className="bg-white/5 rounded-2xl p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <p className="text-white/60 text-sm font-bold mb-3">Preview — {daysOn} days:</p>
              <div className="grid grid-cols-2 gap-1 max-h-48 overflow-y-auto">
                {getPreview().map(({ day, date }) => (
                  <div key={day} className="flex justify-between text-sm bg-white/5 rounded-lg px-3 py-1">
                    <span className="text-white/70">Day {day}</span>
                    <span className="text-yellow-400 font-bold">{date}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {msg && <p className="text-center font-bold">{msg}</p>}

          <button
            onClick={handleSave}
            disabled={!startDate || saving}
            className="w-full bg-yellow-400 text-gray-900 font-black py-4 rounded-xl text-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-yellow-300 transition-colors"
          >
            {saving ? 'Creating...' : '🚀 Create Roster'}
          </button>
        </div>
      </div>
    </div>
  );
}
