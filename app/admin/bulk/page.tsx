'use client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function BulkPage() {
  const router = useRouter();
  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-lg mx-auto">
        <button onClick={() => router.back()} className="text-white/60 mb-4 block">← Back</button>
        <h1 className="text-3xl font-black mb-2">📦 Bulk Upload</h1>
        <p className="text-white/60 mb-8">Upload content for all 14 days at once.</p>
        <div className="bg-white/5 rounded-2xl p-6 text-center">
          <span className="text-4xl">🚧</span>
          <p className="text-white/60 mt-4">Bulk upload coming soon.</p>
          <p className="text-white/40 text-sm mt-2">For now, use the individual day editors.</p>
          <Link href="/admin" className="mt-6 inline-block bg-yellow-400 text-gray-900 font-bold px-6 py-3 rounded-xl">← Back to Dashboard</Link>
        </div>
      </div>
    </div>
  );
}
