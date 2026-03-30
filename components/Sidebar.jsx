import { TrendingUp, Flame, Newspaper } from 'lucide-react';

export default function Sidebar({ trendingNews = [] }) {
  return (
    <div className="space-y-10 h-full">
      <div className="news-panel p-6 sticky top-28" style={{ borderLeft: '4px solid var(--accent)', borderTop: 'none', borderRight: 'none', borderBottom: '2px solid var(--border-ink)' }}>
        <div className="flex items-center gap-3 mb-8 border-b-2 pb-4" style={{ borderColor: 'var(--accent)' }}>
          <TrendingUp className="w-5 h-5" style={{ color: 'var(--accent)' }} />
          <h3 className="font-serif font-black text-2xl italic tracking-tight" style={{ color: 'var(--foreground)' }}>The Hot List</h3>
        </div>
        
        <div className="space-y-8">
          {trendingNews.length > 0 ? trendingNews.slice(0, 5).map((article, i) => (
            <a 
              key={i} 
              href={article.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex gap-4 group border-b pb-4 last:border-0 last:pb-0"
              style={{ borderColor: 'var(--border-ink)' }}
            >
              <div className="w-8 text-3xl font-serif font-black opacity-10 group-hover:opacity-100 transition-all transform group-hover:-translate-y-1 pt-1 italic" style={{ color: 'var(--foreground)' }}>
                {i + 1}
              </div>
              <div className="flex-1">
                <h4 className="font-serif font-bold text-[1rem] leading-[1.3] group-hover:underline underline-offset-4 transition-all line-clamp-2 mb-2" style={{ color: 'var(--foreground)' }}>
                  {article.title}
                </h4>
                <div className="news-meta flex items-center gap-2">
                  {i < 1 && <Flame className="w-3 h-3" style={{ color: 'var(--accent)' }} />}
                  {article.source}
                </div>
              </div>
            </a>
          )) : (
            <div className="space-y-6">
               {[1, 2, 3, 4, 5].map(i => (
                 <div key={i} className="flex gap-5">
                   <div className="w-8 h-8 animate-pulse" style={{ backgroundColor: 'var(--skeleton-bg)' }} />
                   <div className="flex-1 space-y-2">
                     <div className="h-4 animate-pulse w-full" style={{ backgroundColor: 'var(--skeleton-bg)' }} />
                     <div className="h-3 animate-pulse w-2/3" style={{ backgroundColor: 'var(--skeleton-bg)' }} />
                   </div>
                 </div>
               ))}
            </div>
          )}
        </div>
      </div>
      
    </div>
  );
}
