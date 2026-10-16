import React from 'react';
import { useSettings } from '../hooks/useSettings';

export default function AnnouncementBanner() {
  const { isAnnouncementEnabled, announcementText } = useSettings();

  if (!isAnnouncementEnabled || !announcementText) {
    return null;
  }

  return (
    <aside
      aria-label="Announcement"
      className="w-full bg-gradient-to-r from-[#0a1523] via-[#112338] to-[#0a1523] text-white py-2 px-4 border-b border-white/10 shadow-xs relative z-50 overflow-hidden"
    >
      {/* Subtle luxury ambient glow in center */}
      <div 
        aria-hidden="true" 
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/[0.06] via-transparent to-transparent opacity-80" 
      />

      <div className="relative max-w-5xl mx-auto flex items-center justify-center">
        <p className="text-[11.5px] sm:text-[12.5px] font-medium tracking-[0.04em] sm:tracking-[0.06em] text-slate-100 text-center line-clamp-1 select-none">
          {announcementText}
        </p>
      </div>
    </aside>
  );
}
