import { useState, useEffect } from 'react';
import Navbar from './Navbar';
import Head from 'next/head';
import { useTheme } from '@/context/ThemeContext';
import BottomNav from './BottomNav';

export default function Layout({ children, onSearch, onTabChange, hideUIOnMobile = false, activeTab }) {
  const { theme, cycleTheme } = useTheme();
  const themeColor =
    theme === 'dark' ? '#09090b' : theme === 'magazine' ? '#1a1a1a' : '#ffffff';

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)' }}>
      <Head>
        <title>HONEST. Briefs</title>
        <meta
          name="description"
          content="HONEST. Briefs delivers a newspaper-style news feed you can install like an app."
        />
        <meta name="application-name" content="HONEST. Briefs" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-title" content="HONEST. Briefs" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="theme-color" content={themeColor} />
        <meta name="format-detection" content="telephone=no" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="manifest" href="/manifest.webmanifest" />
        <link rel="icon" href="/logo.png" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
      </Head>

      {/* Background Layer */}
      <div className="fixed inset-0 z-0" style={{ backgroundColor: 'var(--background)', transition: 'background-color 0.4s ease' }} />

      {/* Content wrapper */}
      <div className={`relative z-10 flex flex-col ${hideUIOnMobile ? 'h-[100dvh] max-h-[100dvh] overflow-hidden md:h-auto md:max-h-none md:overflow-visible md:min-h-screen' : 'min-h-screen'}`}>
        <div className={hideUIOnMobile ? 'hidden md:block' : ''}>
          <Navbar onSearch={onSearch} />
        </div>
        <main className={`flex-grow w-full flex justify-center ${hideUIOnMobile ? 'h-full pt-0 pb-0 md:h-auto md:max-w-7xl md:mx-auto md:px-4 sm:px-6 lg:px-8 md:pt-12 md:pb-12 mb-16 md:mb-0' : (theme === 'magazine' ? 'pt-12 pb-0' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-12 mb-16 md:mb-0')}`}>
          {children}
        </main>
        <BottomNav activeTab={activeTab || "home"} onTabChange={onTabChange} onThemeToggle={cycleTheme} />
      </div>

      {/* Footer Branding */}
      <div className={hideUIOnMobile ? 'hidden md:block' : ''}>
        <footer className="relative z-10 py-12 border-t" style={{ borderColor: 'var(--border-ink)', backgroundColor: 'var(--card-bg)', transition: 'all 0.4s ease' }}>
          <div className="max-w-7xl mx-auto px-4 text-center">
            <p className="news-meta">© {new Date().getFullYear()} HONEST. Briefs Publisher</p>
            <p className="text-[10px] uppercase font-bold tracking-widest mt-2 opacity-30">London • New York • New Delhi</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
