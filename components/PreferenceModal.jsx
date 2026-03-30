import { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const CATEGORIES = [
  'General', 'Video News', 'India', 'Technology', 'Business', 'Sports', 'Entertainment', 'Science', 'Health', 'World'
];

export default function PreferenceModal({ isOpen, onClose }) {
  const { preferences, updatePreferences } = useAuth();
  const [selectedTopics, setSelectedTopics] = useState([]);

  useEffect(() => {
    if (preferences?.interestedTopics) {
      setSelectedTopics(preferences.interestedTopics);
    }
  }, [preferences]);

  if (!isOpen) return null;

  const toggleTopic = (topic) => {
    if (selectedTopics.includes(topic)) {
      setSelectedTopics(selectedTopics.filter(t => t !== topic));
    } else {
      setSelectedTopics([...selectedTopics, topic]);
    }
  };

  const handleSave = async () => {
    await updatePreferences(selectedTopics);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-lg border-2 p-8 md:p-12" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--accent)', boxShadow: `12px 12px 0px var(--accent)`, borderRadius: 'var(--border-radius)', color: 'var(--foreground)' }}>
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 transition-all hover:opacity-60"
          style={{ color: 'var(--foreground)' }}
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-10 border-b-4 pb-6" style={{ borderColor: 'var(--accent)' }}>
          <h2 className="font-serif font-black text-4xl md:text-5xl italic tracking-tighter mb-2">Tailor Your Edition</h2>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Choose your preferred beats for the morning bulletin</p>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-12">
          {CATEGORIES.map(category => {
            const isSelected = selectedTopics.includes(category);
            return (
              <button
                key={category}
                onClick={() => toggleTopic(category)}
                className="flex items-center justify-between px-4 py-4 border-2 transition-all font-bold text-xs uppercase tracking-widest"
                style={isSelected ? {
                  backgroundColor: 'var(--accent)',
                  color: 'var(--btn-color)',
                  borderColor: 'var(--accent)',
                  borderRadius: 'var(--pill-radius)'
                } : {
                  backgroundColor: 'var(--card-bg)',
                  color: 'var(--foreground)',
                  borderColor: 'var(--border-ink)',
                  borderRadius: 'var(--pill-radius)'
                }}
              >
                {category}
                {isSelected && <Check className="w-4 h-4" />}
              </button>
            );
          })}
        </div>

        <div className="flex flex-col gap-4">
           <button 
             onClick={handleSave}
             className="w-full py-5 font-black uppercase tracking-[0.3em] text-xs transition-colors"
             style={{ backgroundColor: 'var(--btn-bg)', color: 'var(--btn-color)', borderRadius: 'var(--pill-radius)' }}
           >
             Save Preferences
           </button>
           <button 
             onClick={onClose}
             className="w-full py-4 text-[10px] font-bold uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity"
           >
             Dismiss for now
           </button>
        </div>
      </div>
    </div>
  );
}
