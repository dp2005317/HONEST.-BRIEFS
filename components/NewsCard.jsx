import { ExternalLink, Flame } from 'lucide-react';
import Image from 'next/image';

export default function NewsCard({ article, featured = false }) {
  const { title, description, image, source, url, publishedAt } = article;

  const date = new Date(publishedAt).toLocaleDateString(undefined, {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  return (
    <a 
      href={url} 
      target="_blank" 
      rel="noopener noreferrer" 
      className={`news-panel group flex flex-col p-5 md:p-8 relative h-full ${featured ? 'md:col-span-2 md:row-span-2' : ''}`}
      style={featured ? { borderBottom: `4px solid var(--accent)` } : {}}
    >
      {/* Editorial Marker */}
      {featured && (
        <div className="absolute top-0 left-0 w-full h-1" style={{ backgroundColor: 'var(--accent)' }} />
      )}

      {/* Image Container */}
      <div className={`relative w-full overflow-hidden border mb-6 ${featured ? 'aspect-[21/9] sm:aspect-[16/6]' : 'aspect-video'}`} style={{ borderColor: 'var(--border-ink)', backgroundColor: 'var(--skeleton-bg)', borderRadius: 'var(--border-radius)' }}>
        {image ? (
          <div className="w-full h-full relative flex items-center justify-center">
            {image.includes('favicons?domain=') ? (
              <>
                <div className="absolute inset-0 opacity-10 blur-xl scale-150" style={{ background: `url(${image}) center/cover no-repeat` }} />
                <div className="relative z-10 w-16 h-16 md:w-20 md:h-20 p-4 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl flex items-center justify-center">
                   <img 
                    src={image} 
                    alt={source} 
                    className="w-full h-full object-contain filter drop-shadow-md"
                   />
                </div>
              </>
            ) : (
              <Image
                src={image}
                alt={title}
                fill
                className="object-cover transition-all duration-700 group-hover:scale-[1.03]"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                priority={featured}
              />
            )}
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-neutral-800 to-neutral-900">
            <span className="font-serif italic text-sm opacity-20">Streamly Global</span>
          </div>
        )}
        
        {/* Source Badge */}
        <div className="absolute bottom-4 left-4 px-3 py-1 text-[9px] font-black uppercase tracking-widest z-20" style={{ backgroundColor: 'var(--badge-bg)', border: `2px solid var(--badge-border)`, color: 'var(--badge-color)', boxShadow: 'var(--badge-shadow)', borderRadius: 'var(--pill-radius)' }}>
          {source}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 flex flex-col">
        <h2 className={`font-serif font-black leading-[1.1] mb-4 group-hover:opacity-70 transition-opacity tracking-tight ${featured ? 'text-4xl lg:text-5xl' : 'text-xl lg:text-2xl line-clamp-3'}`} style={{ color: 'var(--foreground)' }}>
          {title}
        </h2>
        
        <p className={`font-medium leading-[1.6] mb-8 ${featured ? 'text-xl lg:text-2xl' : 'text-sm line-clamp-3'}`} style={{ color: 'var(--ink-secondary)' }}>
          {description}
        </p>
        
        {/* Meta Footer */}
        <div className="mt-auto pt-6 border-t-2 flex items-center justify-between" style={{ borderColor: 'var(--border-ink)' }}>
          <div className="flex items-center gap-4">
             <span className="news-meta">{date}</span>
          </div>
          
          <div className="p-1.5 border transition-all transform group-hover:rotate-12" style={{ borderColor: 'var(--border-ink)', color: 'var(--foreground)' }}>
            <ExternalLink className="w-4 h-4" />
          </div>
        </div>
      </div>
    </a>
  );
}
