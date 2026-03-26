import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: "Papa's Countdown",
  description: 'Papa loves you, Leo!',
  manifest: '/manifest.json',
};

const stars = Array.from({ length: 80 }, (_, i) => ({
  left: `${(i * 17 + 7) % 100}%`,
  top: `${(i * 23 + 13) % 100}%`,
  width: `${(i % 3) + 1}px`,
  duration: `${(i % 4) + 2}s`,
  delay: `${(i % 5) * 0.5}s`,
}));

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap" rel="stylesheet" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#0f1b3d" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className="antialiased font-[Nunito]">
        <div className="min-h-screen relative overflow-hidden">
          <div className="starfield">
            {stars.map((star, i) => (
              <div
                key={i}
                className="star"
                style={{
                  left: star.left,
                  top: star.top,
                  width: star.width,
                  height: star.width,
                  ['--duration' as string]: star.duration,
                  animationDelay: star.delay,
                }}
              />
            ))}
          </div>
          <div className="relative z-10">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
