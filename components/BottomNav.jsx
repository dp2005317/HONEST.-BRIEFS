import { Home, Palette, Video } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';

export default function BottomNav({ activeTab = 'home', onTabChange, onThemeToggle }) {
  return (
    <div className="md:hidden fixed bottom-0 left-0 w-full z-50 bg-white border-t safe-area-pb" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-ink)' }}>
      <div className="flex justify-around items-center h-16">
        <button 
          onClick={() => onTabChange && onTabChange('home')}
          className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'home' ? 'text-black' : 'text-gray-400'}`}
          style={{ color: activeTab === 'home' ? 'var(--foreground)' : 'var(--ink-secondary)' }}
        >
          <div className={`p-1.5 px-6 rounded-full transition-all ${activeTab === 'home' ? 'bg-black/10' : ''}`}>
             <Home className={`w-6 h-6 ${activeTab === 'home' ? 'fill-current' : ''}`} />
          </div>
          <span className="text-[10px] font-bold tracking-tight">Home</span>
        </button>

        <button 
          onClick={() => onThemeToggle && onThemeToggle()}
          className="flex flex-col items-center gap-1 transition-all text-gray-400"
          style={{ color: 'var(--ink-secondary)' }}
        >
          <div className="p-1.5 px-6 rounded-full transition-all">
             <Palette className="w-6 h-6" />
          </div>
          <span className="text-[10px] font-bold tracking-tight">Theme</span>
        </button>

        <button 
          onClick={() => onTabChange && onTabChange('Video News')}
          className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'Video News' ? 'text-black' : 'text-gray-400'}`}
          style={{ color: activeTab === 'Video News' ? 'var(--foreground)' : 'var(--ink-secondary)' }}
        >
          <div className={`p-1.5 px-6 rounded-full transition-all ${activeTab === 'Video News' ? 'bg-black/10' : ''}`}>
             <Video className={`w-6 h-6 ${activeTab === 'Video News' ? 'fill-current' : ''}`} />
          </div>
          <span className="text-[10px] font-bold tracking-tight text-center">Video<br/>News</span>
        </button>
      </div>
    </div>
  );
}
