import { Search, Menu, User, LogOut, Settings, Sun, Moon, Palette } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import PreferenceModal from './PreferenceModal';

const THEME_ICONS = {
  day: Sun,
  dark: Moon,
  magazine: Palette,
};

const THEME_LABELS = {
  day: 'Day',
  dark: 'Dark',
  magazine: 'Magazine',
};

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isPrefsOpen, setIsPrefsOpen] = useState(false);
  const { user, logout, loginWithGoogle } = useAuth();
  const { theme, cycleTheme } = useTheme();

  const ThemeIcon = THEME_ICONS[theme];

  return (
    <>
      <nav className="fixed w-full z-50 news-clear">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            
            {/* Paper Logo - HONEST. Briefs */}
            <div className="flex-shrink-0 flex items-center gap-3 cursor-pointer group">
              <img 
                src="/logo.png" 
                alt="HONEST. Briefs" 
                className="h-8 w-auto object-contain group-hover:scale-105 transition-transform" 
              />
              <Link href="/" className="font-serif font-black text-3xl tracking-tighter border-b-2 border-transparent group-hover:border-current transition-all" style={{ color: 'var(--foreground)' }}>
                HONEST. Briefs
              </Link>
            </div>

            {/* Search Bar */}
            <div className="hidden md:flex flex-1 justify-center px-8">
              <div className="relative w-full max-w-xl group">
                <input
                  type="text"
                  placeholder="Search Archive..."
                  className="w-full bg-transparent border-b-2 py-2 pl-4 pr-10 focus:outline-none transition-all font-serif italic text-lg"
                  style={{ borderColor: 'var(--border-ink)', color: 'var(--foreground)' }}
                />
                <button className="absolute inset-y-0 right-0 pr-3 flex items-center opacity-40 hover:opacity-100 transition-colors" style={{ color: 'var(--foreground)' }}>
                  <Search className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Right Actions */}
            <div className="hidden md:flex items-center gap-6">
              {/* Theme Toggle */}
              <button 
                onClick={cycleTheme}
                className="w-10 h-10 flex items-center justify-center border-2 transition-all hover:scale-110"
                style={{ borderColor: 'var(--accent)', color: 'var(--foreground)', borderRadius: 'var(--pill-radius)' }}
                title={`Theme: ${THEME_LABELS[theme]}`}
              >
                <ThemeIcon className="h-4 w-4" />
              </button>

              <button className="text-[10px] font-black uppercase tracking-[0.25em] opacity-40 hover:opacity-100 transition-opacity">Digital Archives</button>
              
              {user ? (
                 <div className="flex items-center gap-6">
                   <div className="flex flex-col items-end">
                     <span className="text-[9px] uppercase font-black tracking-widest leading-none opacity-40">Registered</span>
                     <span className="text-[10px] font-bold truncate max-w-[100px]">{user.displayName || 'Subscriber'}</span>
                   </div>
                   
                   <div className="flex items-center gap-2">
                     <button 
                       onClick={() => setIsPrefsOpen(true)}
                       className="w-10 h-10 border-2 flex items-center justify-center transition-all"
                       style={{ borderColor: 'var(--accent)', borderRadius: 'var(--pill-radius)' }}
                       title="Tailor My Edition"
                     >
                       <Settings className="h-4 w-4" />
                     </button>
                     <button 
                       onClick={logout}
                       className="w-10 h-10 border-2 flex items-center justify-center transition-all"
                       style={{ borderColor: 'var(--accent)', borderRadius: 'var(--pill-radius)' }}
                       title="Logout"
                     >
                       <LogOut className="h-4 w-4" />
                     </button>
                   </div>
                 </div>
              ) : (
                 <button 
                   onClick={loginWithGoogle}
                   className="btn-primary text-[10px] tracking-[0.25em] h-10 flex items-center justify-center px-6"
                 >
                   Access
                 </button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center gap-3">
              <button 
                onClick={cycleTheme}
                className="p-2 transition-all"
                style={{ color: 'var(--foreground)' }}
              >
                <ThemeIcon className="h-5 w-5" />
              </button>
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="transition-colors"
                style={{ color: 'var(--foreground)' }}
              >
                <Menu className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Drawer */}
        {isMenuOpen && (
          <div className="md:hidden border-t-2 absolute w-full left-0 top-20 shadow-2xl p-6 flex flex-col gap-6 animate-in slide-in-from-top-2" style={{ borderColor: 'var(--accent)', backgroundColor: 'var(--card-bg)' }}>
            
            {/* Mobile Search */}
            <div className="relative w-full group">
              <input
                type="text"
                placeholder="Search Archive..."
                className="w-full bg-transparent border-b-2 py-2 pl-4 pr-10 focus:outline-none transition-all font-serif italic text-lg"
                style={{ borderColor: 'var(--border-ink)', color: 'var(--foreground)' }}
              />
              <button className="absolute inset-y-0 right-0 pr-3 flex items-center opacity-40 hover:opacity-100 transition-colors">
                <Search className="h-5 w-5" />
              </button>
            </div>

            <div className="flex flex-col gap-4 border-t pt-4" style={{ borderColor: 'var(--border-ink)' }}>
              <button className="text-left text-xs font-black uppercase tracking-[0.25em] opacity-40 hover:opacity-100 transition-opacity">Digital Archives</button>
              
              {user ? (
                 <div className="flex flex-col gap-4">
                   <div className="flex flex-col">
                     <span className="text-[9px] uppercase font-black tracking-widest leading-none opacity-40 mb-1">Registered</span>
                     <span className="text-sm font-bold truncate max-w-[200px]">{user.displayName || 'Subscriber'}</span>
                   </div>
                   
                   <div className="flex items-center gap-4">
                     <button 
                       onClick={() => { setIsPrefsOpen(true); setIsMenuOpen(false); }}
                       className="flex-1 py-3 border-2 flex items-center justify-center gap-2 transition-all text-xs font-bold uppercase tracking-widest"
                       style={{ borderColor: 'var(--accent)', borderRadius: 'var(--pill-radius)' }}
                     >
                       <Settings className="h-4 w-4" /> Tailor Edition
                     </button>
                     <button 
                       onClick={() => { logout(); setIsMenuOpen(false); }}
                       className="w-12 h-[44px] border-2 flex items-center justify-center transition-all"
                       style={{ borderColor: 'var(--accent)', borderRadius: 'var(--pill-radius)' }}
                     >
                       <LogOut className="h-4 w-4" />
                     </button>
                   </div>
                 </div>
              ) : (
                 <button 
                   onClick={() => { loginWithGoogle(); setIsMenuOpen(false); }}
                   className="btn-primary w-full text-xs tracking-[0.25em] h-12 flex items-center justify-center px-6"
                 >
                   Access Account
                 </button>
              )}
            </div>
          </div>
        )}
      </nav>

      <PreferenceModal 
         isOpen={isPrefsOpen}
         onClose={() => setIsPrefsOpen(false)}
      />
    </>
  );
}
