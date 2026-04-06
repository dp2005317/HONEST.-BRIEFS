import { Home, Palette, Video } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';

export default function BottomNav({ activeTab = 'home', onTabChange, onThemeToggle }) {
  return (
    <div className="md:hidden fixed bottom-0 left-0 w-full z-50 bg-white border-t safe-area-pb" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-ink)' }}>
      <div className="flex justify-around items-center h-16">
        <button 
          onClick={() => onTabChange && onTabChange('home')}
          className={`relative flex flex-1 flex-col items-center justify-center gap-1 transition-all py-2 ${activeTab === 'home' ? '' : 'opacity-50'}`}
          style={{ color: activeTab === 'home' ? 'var(--foreground)' : 'var(--ink-secondary)' }}
        >
          <div className="relative p-1.5 px-4 rounded-full transition-all flex items-center justify-center">
             {activeTab === 'home' && (
               <div className="absolute inset-0 rounded-full opacity-10" style={{ backgroundColor: 'var(--foreground)' }} />
             )}
             <Home className={`w-6 h-6 relative z-10 ${activeTab === 'home' ? 'fill-current' : ''}`} />
          </div>
          <span className="text-[10px] font-bold tracking-tight">Home</span>
        </button>

        <button 
          onClick={() => onThemeToggle && onThemeToggle()}
          className="relative flex flex-1 flex-col items-center justify-center gap-1 transition-all opacity-50 py-2 cursor-pointer"
          style={{ color: 'var(--ink-secondary)' }}
        >
          <div className="relative p-1.5 px-4 rounded-full transition-all flex items-center justify-center">
             <Palette className="w-6 h-6 relative z-10" />
          </div>
          <span className="text-[10px] font-bold tracking-tight">Theme</span>
        </button>

        <button 
          onClick={() => onTabChange && onTabChange('Video News')}
          className={`relative flex flex-1 flex-col items-center justify-center gap-1 transition-all py-2 ${activeTab === 'Video News' ? '' : 'opacity-50'}`}
          style={{ color: activeTab === 'Video News' ? 'var(--foreground)' : 'var(--ink-secondary)' }}
        >
          <div className="relative p-1.5 px-4 rounded-full transition-all flex items-center justify-center">
             {activeTab === 'Video News' && (
               <div className="absolute inset-0 rounded-full opacity-20" style={{ backgroundColor: 'rgba(128,128,128,0.5)' }} />
             )}
             <Video className={`w-6 h-6 relative z-10 ${activeTab === 'Video News' ? 'fill-current' : ''}`} />
          </div>
          <span className="text-[10px] font-bold tracking-tight text-center">Video<br/>News</span>
        </button>
      </div>
    </div>
  );
}
