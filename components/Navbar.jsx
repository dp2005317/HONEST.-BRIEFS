import { Search, Menu, User, LogOut, Settings, Sun, Moon, Palette, Download } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useInstall } from '@/hooks/useInstall';
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

export default function Navbar({ onSearch }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isPrefsOpen, setIsPrefsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { user, logout, loginWithGoogle } = useAuth();
  const { theme, cycleTheme } = useTheme();
  const { handleInstall, showInstallOptions, deferredPrompt } = useInstall();

  const ThemeIcon = THEME_ICONS[theme];
  
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchTerm);
      setIsMenuOpen(false);
    }
  };

  return (
    <>
      <nav className="fixed w-full z-50 news-clear">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-12">
            
             <div className="hidden md:flex flex-shrink-0 items-center gap-3 cursor-pointer group">
               <img 
                 src="/logo.png" 
                 alt="HONEST. Briefs" 
                 className="h-6 w-auto object-contain group-hover:scale-105 transition-transform" 
               />
               <Link href="/" className="font-serif font-black text-2xl tracking-tighter border-b-2 border-transparent group-hover:border-current transition-all" style={{ color: 'var(--foreground)' }}>
                 HONEST. Briefs
               </Link>
             </div>

            {/* Search Bar */}
            <div className="hidden md:flex flex-1 justify-center px-8">
              <form onSubmit={handleSearchSubmit} className="relative w-full max-w-xl group">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search"
                  className="w-full bg-transparent border-b-2 py-2 pl-4 pr-10 focus:outline-none transition-all font-serif italic text-lg"
                  style={{ borderColor: 'var(--border-ink)', color: 'var(--foreground)' }}
                />
                <button 
                  type="submit"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center opacity-40 hover:opacity-100 transition-colors" 
                  style={{ color: 'var(--foreground)' }}
                >
                  <Search className="h-5 w-5" />
                </button>
              </form>
            </div>

            {/* Right Actions */}
            <div className="hidden md:flex items-center gap-6">
              {/* Theme Toggle */}
              <button 
                onClick={cycleTheme}
                className="w-7 h-7 flex items-center justify-center border-2 transition-all hover:scale-110"
                style={{ borderColor: 'var(--accent)', color: 'var(--foreground)', borderRadius: 'var(--pill-radius)' }}
                title={`Theme: ${THEME_LABELS[theme]}`}
              >
                <ThemeIcon className="h-4 w-4" />
              </button>

              {/* Desktop Install App Button */}
              {showInstallOptions && (
                 <button 
                   onClick={handleInstall}
                   className="flex items-center gap-2 font-black text-[9px] tracking-widest uppercase py-1.5 px-3 border-2 transition-all active:scale-95"
                   style={{ borderColor: 'var(--accent)', color: 'var(--btn-color)', backgroundColor: 'var(--accent)', borderRadius: 'var(--pill-radius)' }}
                   title="Install App"
                 >
                   <Download className="h-3 w-3" />
                   <span>{deferredPrompt ? 'Install App' : 'Add to Home'}</span>
                 </button>
              )}


              
              {user ? (
                 <div className="flex items-center gap-6">
                   <div className="flex flex-col items-end">
                     <span className="text-[9px] uppercase font-black tracking-widest leading-none opacity-40">Registered</span>
                     <span className="text-[10px] font-bold truncate max-w-[100px]">{user.displayName || 'Subscriber'}</span>
                   </div>
                   
                   <div className="flex items-center gap-2">
                     <button 
                       onClick={() => setIsPrefsOpen(true)}
                       className="w-7 h-7 border-2 flex items-center justify-center transition-all"
                       style={{ borderColor: 'var(--accent)', borderRadius: 'var(--pill-radius)' }}
                       title="Tailor My Edition"
                     >
                       <Settings className="h-4 w-4" />
                     </button>
                     <button 
                       onClick={logout}
                       className="w-7 h-7 border-2 flex items-center justify-center transition-all"
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
                   className="btn-primary text-[9px] tracking-[0.2em] h-7 flex items-center justify-center px-4"
                 >
                   Access
                 </button>
              )}
            </div>

            {/* Mobile View Navigation (App Style) */}
            <div className="md:hidden flex items-center justify-between w-full h-full relative">
              {/* Logo - Absolute Center */}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center pointer-events-auto">
                <Link href="/">
                  <img 
                    src="/logo.png" 
                    alt="HONEST. Briefs" 
                    className="h-6 w-auto object-contain active:scale-95 transition-transform" 
                  />
                </Link>
              </div>

              {/* Search Icon - Left */}
              <div className="flex-1 flex justify-start items-center gap-1">
                <button 
                  onClick={() => setIsMenuOpen(true)}
                  className="p-2 transition-all active:scale-90"
                  style={{ color: 'var(--foreground)' }}
                >
                  <Search className="h-6 w-6" />
                </button>
                {/* Mobile Install App Button */}
                {showInstallOptions && (
                  <button 
                    onClick={handleInstall}
                    className="flex items-center gap-1 font-black text-[9px] tracking-widest uppercase py-1.5 px-3 border-2 transition-all shadow-md active:scale-95 ml-2"
                    style={{ 
                      borderColor: 'var(--accent)', 
                      color: 'var(--btn-color)', 
                      backgroundColor: 'var(--accent)', 
                      borderRadius: 'var(--pill-radius)' 
                    }}
                  >
                    <Download className="h-3 w-3" />
                    <span>Install</span>
                  </button>
                )}
              </div>

              {/* Avatar/Profile - Right */}
              <div className="flex-1 flex justify-end items-center gap-2 pr-1">
                {user ? (
                  <>
                    <div 
                      onClick={() => setIsPrefsOpen(true)}
                      className="w-8 h-8 rounded-full flex items-center justify-center font-black text-xs uppercase cursor-pointer transition-all active:scale-95 shadow-sm"
                      style={{ backgroundColor: 'var(--accent)', color: 'var(--btn-color)' }}
                    >
                      {user.displayName ? user.displayName[0] : 'U'}
                    </div>
                    <button 
                      onClick={logout}
                      className="p-2 transition-all opacity-60 hover:opacity-100"
                      style={{ color: 'var(--foreground)' }}
                    >
                      <LogOut className="h-5 w-5" />
                    </button>
                  </>
                ) : (
                  <button 
                    onClick={loginWithGoogle}
                    className="flex items-center gap-2 font-black text-[9px] tracking-widest uppercase py-1.5 px-3 border-2 active:scale-95 transition-all"
                    style={{ borderColor: 'var(--accent)', color: 'var(--foreground)', borderRadius: 'var(--pill-radius)' }}
                  >
                    <User className="h-3 w-3" />
                    <span>Access</span>
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* Mobile Drawer (used for Search overflow) */}
        {isMenuOpen && (
          <div className="md:hidden border-t-2 absolute w-full left-0 top-12 shadow-2xl p-6 flex flex-col gap-6 animate-in slide-in-from-top-2" style={{ borderColor: 'var(--accent)', backgroundColor: 'var(--card-bg)' }}>
            
            {/* Mobile Search Overlay */}
            <form onSubmit={handleSearchSubmit} className="relative w-full group">
              <input
                type="text"
                autoFocus
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search"
                className="w-full bg-transparent border-b-2 py-2 pl-4 pr-10 focus:outline-none transition-all font-serif italic text-lg"
                style={{ borderColor: 'var(--border-ink)', color: 'var(--foreground)' }}
              />
              <button 
                type="submit"
                className="absolute inset-y-0 right-0 pr-3 flex items-center opacity-40 hover:opacity-100 transition-colors"
                style={{ color: 'var(--foreground)' }}
              >
                <Search className="h-5 w-5" />
              </button>
            </form>

            <div className="flex flex-col gap-6 mt-4">
               {user ? (
                 <>
                   <button 
                     onClick={() => { setIsPrefsOpen(true); setIsMenuOpen(false); }}
                     className="w-full py-4 border-2 flex items-center justify-center gap-3 font-black uppercase tracking-widest text-[10px]"
                     style={{ borderColor: 'var(--accent)', color: 'var(--foreground)', borderRadius: 'var(--pill-radius)' }}
                   >
                     <Settings className="w-4 h-4" />
                     Tailor My Edition
                   </button>
                   <button 
                     onClick={() => { logout(); setIsMenuOpen(false); }}
                     className="w-full py-4 flex items-center justify-center gap-3 font-black uppercase tracking-widest text-[10px]"
                     style={{ backgroundColor: 'var(--accent)', color: 'var(--btn-color)', borderRadius: 'var(--pill-radius)' }}
                   >
                     <LogOut className="w-4 h-4" />
                     Sign Out
                   </button>
                 </>
               ) : (
                 <button 
                   onClick={() => { loginWithGoogle(); setIsMenuOpen(false); }}
                   className="w-full py-4 flex items-center justify-center gap-3 font-black uppercase tracking-widest text-[10px]"
                   style={{ backgroundColor: 'var(--accent)', color: 'var(--btn-color)', borderRadius: 'var(--pill-radius)' }}
                 >
                   <User className="w-4 h-4" />
                   Access Account
                 </button>
               )}
            </div>
            
            <button onClick={() => setIsMenuOpen(false)} className="text-[10px] font-black uppercase tracking-widest opacity-40 mt-4 text-center">Close Menu</button>
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
