'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

type CapsuleData = Record<string, string | null>;

export default function AdminDayPage() {
  const params = useParams();
  const router = useRouter();
  const dayNumber = params.dayNumber as string;
  const [capsule, setCapsule] = useState<CapsuleData>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [uploading, setUploading] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/capsule/${dayNumber}`)
      .then(r => r.json())
      .then(d => { setCapsule(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [dayNumber]);

  const handleSave = async () => {
    setSaving(true);
    const res = await fetch(`/api/capsule/${dayNumber}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(capsule),
    });
    setMsg(res.ok ? '✅ Saved!' : '❌ Error saving');
    setSaving(false);
    setTimeout(() => setMsg(''), 3000);
  };

  const handleUpload = async (field: string, file: File, bucket = 'bedtime-stories') => {
    setUploading(field);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('bucket', bucket);
    formData.append('path', `day${dayNumber}/${field}-${Date.now()}.${file.name.split('.').pop()}`);
    const res = await fetch('/api/admin/upload', { method: 'POST', body: formData });
    if (res.ok) {
      const { url } = await res.json();
      setCapsule(prev => ({ ...prev, [field]: url }));
    }
    setUploading(null);
  };

  const Field = ({ label, field, type = 'text', placeholder = '' }: { label: string; field: string; type?: string; placeholder?: string }) => (
    <div>
      <label className="block text-white/70 text-sm font-bold mb-1">{label}</label>
      <input
        type={type}
        value={(capsule[field] as string) || ''}
        onChange={e => setCapsule(prev => ({ ...prev, [field]: e.target.value }))}
        placeholder={placeholder}
        className="w-full bg-white/10 rounded-xl px-4 py-3 text-white border border-white/20 focus:border-yellow-400 outline-none"
      />
    </div>
  );

  const AudioUpload = ({ label, field }: { label: string; field: string }) => (
    <div>
      <label className="block text-white/70 text-sm font-bold mb-1">{label}</label>
      {capsule[field] && (
        <div className="mb-2">
          <audio controls src={capsule[field] as string} className="w-full"><track kind="captions" /></audio>
        </div>
      )}
      <label className={`flex items-center gap-2 cursor-pointer bg-white/10 rounded-xl px-4 py-3 border border-white/20 hover:border-yellow-400 transition-colors ${uploading === field ? 'opacity-50' : ''}`}>
        <span className="text-lg">🎙️</span>
        <span className="text-white/70">{uploading === field ? 'Uploading...' : capsule[field] ? 'Replace audio' : 'Upload MP3/WAV'}</span>
        <input type="file" accept="audio/*" className="hidden" disabled={!!uploading} onChange={e => e.target.files?.[0] && handleUpload(field, e.target.files[0])} />
      </label>
    </div>
  );

  const PhotoUpload = ({ label, field }: { label: string; field: string }) => (
    <div>
      <label className="block text-white/70 text-sm font-bold mb-1">{label}</label>
      {capsule[field] && <img src={capsule[field] as string} alt="" className="w-32 h-32 rounded-2xl object-cover mb-2" />}
      <label className={`flex items-center gap-2 cursor-pointer bg-white/10 rounded-xl px-4 py-3 border border-white/20 hover:border-yellow-400 transition-colors ${uploading === field ? 'opacity-50' : ''}`}>
        <span className="text-lg">📸</span>
        <span className="text-white/70">{uploading === field ? 'Uploading...' : capsule[field] ? 'Replace photo' : 'Upload photo'}</span>
        <input type="file" accept="image/*" className="hidden" disabled={!!uploading} onChange={e => e.target.files?.[0] && handleUpload(field, e.target.files[0])} />
      </label>
    </div>
  );

  if (loading) return <div className="min-h-screen bg-gray-900 flex items-center justify-center"><div className="text-4xl animate-spin">⭐</div></div>;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-lg mx-auto">
        <button onClick={() => router.back()} className="text-white/60 mb-4 block">← Back</button>
        <h1 className="text-3xl font-black mb-1">Day {dayNumber}</h1>
        <p className="text-white/60 mb-6">Unlock date: {capsule.unlock_date}</p>

        <div className="space-y-6">
          <section className="bg-white/5 rounded-2xl p-5 space-y-4">
            <h2 className="font-black text-lg text-yellow-400">🌅 Morning</h2>
            <AudioUpload label="Morning message (Papa's voice)" field="morning_audio_url" />
            <PhotoUpload label="Photo of Papa today" field="photo_url" />
            <Field label="Photo caption (Mum reads to Leo)" field="photo_caption" placeholder="Smiling at the worksite today!" />
          </section>

          <section className="bg-white/5 rounded-2xl p-5 space-y-4">
            <h2 className="font-black text-lg text-yellow-400">😂 Dad Joke</h2>
            <p className="text-white/60 text-xs">Leo must listen to this before the rest unlocks!</p>
            <AudioUpload label="Dad joke audio" field="dad_joke_audio_url" />
          </section>

          <section className="bg-white/5 rounded-2xl p-5 space-y-4">
            <h2 className="font-black text-lg text-yellow-400">💖 I Love You Because</h2>
            <Field label="Reason text" field="love_reason_text" placeholder="...you always share your snacks!" />
            <AudioUpload label="Audio version" field="love_reason_audio_url" />
          </section>

          <section className="bg-white/5 rounded-2xl p-5 space-y-4">
            <h2 className="font-black text-lg text-yellow-400">📍 Where Is Papa?</h2>
            <Field label="Location name" field="map_location_name" placeholder="Bowen Basin, Queensland" />
            <AudioUpload label="Location audio (Papa describing where he is)" field="map_audio_url" />
            <PhotoUpload label="Worksite photo" field="worksite_photo_url" />
          </section>

          <section className="bg-white/5 rounded-2xl p-5 space-y-4">
            <h2 className="font-black text-lg text-yellow-400">🌙 Bedtime Story (unlocks 7pm)</h2>
            <Field label="Story title" field="bedtime_story_title" placeholder="Leo and the Rocket Race" />
            <AudioUpload label="Story audio (Papa reading)" field="bedtime_story_audio_url" />
          </section>

          {msg && <motion.p className="text-center font-bold text-lg" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>{msg}</motion.p>}

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-yellow-400 text-gray-900 font-black py-4 rounded-xl text-lg disabled:opacity-50 hover:bg-yellow-300 transition-colors"
          >
            {saving ? 'Saving...' : '💾 Save Day'}
          </button>
        </div>
      </div>
    </div>
  );
}
