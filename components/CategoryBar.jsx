import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const DEFAULT_CATEGORIES = [
  { id: 'General', label: 'General' },
  { id: 'Video News', label: 'Video News' },
  { id: 'India', label: 'India' },
  { id: 'Technology', label: 'Technology' },
  { id: 'Education', label: 'Education' },
  { id: 'Business', label: 'Business' },
  { id: 'Sports', label: 'Sports' },
  { id: 'Film & Entertainment', label: 'Film & Entertainment' },
  { id: 'Science', label: 'Science' },
  { id: 'Health', label: 'Health' },
  { id: 'World', label: 'World' }
];

export default function CategoryBar({ activeCategory, onCategoryChange }) {
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="relative mb-8 w-full group border-b-2 pb-4" style={{ borderColor: 'var(--border-ink)' }}>
      {/* Scroll Left Button */}
      <button 
        onClick={() => scroll('left')}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 border opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0 shadow-sm"
        style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-ink)', color: 'var(--foreground)' }}
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {/* Categories container */}
      <div 
        ref={scrollRef}
        className="flex gap-2 overflow-x-auto no-scrollbar scroll-smooth px-2 py-2 w-full snap-x"
      >
        
        {DEFAULT_CATEGORIES.map(category => (
          <button
            key={category.id}
            onClick={() => onCategoryChange(category.id)}
            className={`news-pill snap-start ${activeCategory === category.id ? 'active' : ''}`}
          >
            {category.label}
          </button>
        ))}
      </div>

      {/* Scroll Right Button */}
      <button 
        onClick={() => scroll('right')}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2 border opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
        style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-ink)', color: 'var(--foreground)' }}
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}
