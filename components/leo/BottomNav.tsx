'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/', icon: '⭐', label: 'Home' },
  { href: '/map', icon: '🗺️', label: 'Map' },
];

export default function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#0f1b3d]/95 backdrop-blur-lg border-t border-white/10">
      <div className="flex justify-around items-center h-20 max-w-md mx-auto pb-2">
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center w-20 h-20 rounded-2xl transition-all ${active ? 'bg-white/10 scale-110' : 'opacity-60 hover:opacity-100'}`}
            >
              <span className="text-3xl">{item.icon}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
