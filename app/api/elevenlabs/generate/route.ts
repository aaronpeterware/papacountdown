import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const { text, voice_id } = await req.json();
  const apiKey = process.env.ELEVENLABS_API_KEY;
  const defaultVoiceId = voice_id || process.env.ELEVENLABS_VOICE_ID;

  if (!apiKey) return NextResponse.json({ error: 'ElevenLabs API key not set' }, { status: 500 });

  const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${defaultVoiceId}`, {
    method: 'POST',
    headers: {
      'xi-api-key': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text,
      model_id: 'eleven_monolingual_v1',
      voice_settings: { stability: 0.5, similarity_boost: 0.75 },
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    return NextResponse.json({ error: err }, { status: response.status });
  }

  const audioBuffer = await response.arrayBuffer();
  return new Response(audioBuffer, {
    headers: { 'Content-Type': 'audio/mpeg' },
  });
}
