import { useState, useEffect } from 'react';
import Navbar from './Navbar';
import Head from 'next/head';
import { useTheme } from '@/context/ThemeContext';
import BottomNav from './BottomNav';

export default function Layout({ children, onSearch, onTabChange }) {
  const { theme, cycleTheme } = useTheme();

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)' }}>
      <Head>
        <title>HONEST. Briefs</title>
        <meta name="description" content="Premium Newspaper News Aggregator" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/logo.png" />
      </Head>

      {/* Background Layer */}
      <div className="fixed inset-0 z-0" style={{ backgroundColor: 'var(--background)', transition: 'background-color 0.4s ease' }} />

      {/* Content wrapper */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar onSearch={onSearch} />
        <main className={`flex-grow w-full ${theme === 'magazine' ? 'pt-12 pb-0' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-12 mb-16 md:mb-0'}`}>
          {children}
        </main>
        <BottomNav activeTab="home" onTabChange={onTabChange} onThemeToggle={cycleTheme} />
      </div>

      {/* Footer Branding */}
      <footer className="relative z-10 py-12 border-t" style={{ borderColor: 'var(--border-ink)', backgroundColor: 'var(--card-bg)', transition: 'all 0.4s ease' }}>
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="news-meta">© {new Date().getFullYear()} HONEST. Briefs Publisher</p>
          <p className="text-[10px] uppercase font-bold tracking-widest mt-2 opacity-30">London • New York • New Delhi</p>
        </div>
      </footer>
    </div>
  );
}
