import { ExternalLink, Bookmark, ArrowUpRight, Star, Clock } from 'lucide-react';
import Image from 'next/image';

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString(undefined, {
    month: 'short', day: 'numeric'
  });
}

// Full-bleed cover hero card with overlay text
function CoverHero({ article }) {
  if (!article) return null;
  return (
    <a href={article.url} target="_blank" rel="noopener noreferrer" className="block relative w-full group cursor-pointer overflow-hidden" style={{ minHeight: '80vh' }}>
      {/* Background Image */}
      <div className="absolute inset-0">
        {article.image ? (
          <Image
            src={article.image}
            alt={article.title}
            fill
            className="object-cover transition-transform duration-[1.5s] group-hover:scale-105"
            sizes="100vw"
            priority
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#1a1a1a] to-[#333]" />
        )}
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
      </div>

      {/* Content Overlay */}
      <div className="relative z-10 h-full flex flex-col justify-end p-8 md:p-16" style={{ minHeight: '80vh' }}>
        {/* Issue Badge */}
        <div className="flex items-center gap-3 mb-6">
          <span className="px-3 py-1 text-[10px] font-black uppercase tracking-[0.3em] border" style={{ color: '#C9A96E', borderColor: '#C9A96E' }}>
            Cover Story
          </span>
          <span className="text-white/50 text-[10px] font-bold uppercase tracking-widest">{article.source}</span>
        </div>
        
        <h1 className="font-magazine text-5xl md:text-7xl lg:text-8xl font-bold text-white leading-[0.95] mb-6 max-w-4xl uppercase tracking-tight">
          {article.title}
        </h1>
        
        <p className="text-white/60 text-lg md:text-xl max-w-2xl leading-relaxed mb-8 line-clamp-3">
          {article.description}
        </p>

        <div className="flex items-center gap-6">
          <span className="inline-flex items-center gap-2 px-6 py-3 text-xs font-black uppercase tracking-[0.2em] transition-all group-hover:gap-4" style={{ backgroundColor: '#C9A96E', color: '#111' }}>
            Read Full Story <ArrowUpRight className="w-4 h-4" />
          </span>
          <span className="text-white/30 text-xs font-bold uppercase tracking-widest">{formatDate(article.publishedAt)}</span>
        </div>
      </div>
    </a>
  );
}

// Featured strip card with image overlay
function FeatureCard({ article, index }) {
  if (!article) return null;
  return (
    <a href={article.url} target="_blank" rel="noopener noreferrer" className="block relative group overflow-hidden cursor-pointer" style={{ aspectRatio: '3/4' }}>
      <div className="absolute inset-0">
        {article.image ? (
          <Image
            src={article.image}
            alt={article.title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#222] to-[#444]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
      </div>

      {/* Number Badge */}
      <div className="absolute top-4 left-4 z-10">
        <span className="text-6xl font-black opacity-20 text-white font-magazine">{String(index + 1).padStart(2, '0')}</span>
      </div>

      <div className="relative z-10 h-full flex flex-col justify-end p-6">
        <span className="text-[9px] font-black uppercase tracking-[0.3em] mb-2" style={{ color: '#C9A96E' }}>{article.source}</span>
        <h3 className="text-white font-bold text-lg md:text-xl leading-tight mb-2 line-clamp-3 group-hover:underline underline-offset-4 decoration-[#C9A96E]">
          {article.title}
        </h3>
        <span className="text-white/40 text-[10px] uppercase tracking-widest font-bold">{formatDate(article.publishedAt)}</span>
      </div>
    </a>
  );
}

// Editorial text-heavy card (no image)
function EditorialCard({ article }) {
  if (!article) return null;
  return (
    <a href={article.url} target="_blank" rel="noopener noreferrer" className="block p-6 md:p-8 group cursor-pointer border-b" style={{ borderColor: '#333' }}>
      <div className="flex items-start gap-6">
        <div className="flex-1">
          <span className="text-[9px] font-black uppercase tracking-[0.3em] mb-3 block" style={{ color: '#C9A96E' }}>{article.source}</span>
          <h3 className="font-serif font-black text-xl md:text-2xl leading-tight mb-3 group-hover:underline underline-offset-4 decoration-[#C9A96E] text-[#f0ece4]">
            {article.title}
          </h3>
          <p className="text-[#9a9083] text-sm leading-relaxed line-clamp-2">{article.description}</p>
        </div>
        {article.image && (
          <div className="hidden md:block w-24 h-24 flex-shrink-0 relative overflow-hidden">
            <Image src={article.image} alt="" fill className="object-cover group-hover:scale-110 transition-transform duration-500" sizes="96px" />
          </div>
        )}
      </div>
    </a>
  );
}

// Full-width cinematic card
function CinematicCard({ article }) {
  if (!article) return null;
  return (
    <a href={article.url} target="_blank" rel="noopener noreferrer" className="block relative group overflow-hidden cursor-pointer" style={{ aspectRatio: '21/9' }}>
      <div className="absolute inset-0">
        {article.image ? (
          <Image src={article.image} alt={article.title} fill className="object-cover transition-transform duration-[1.5s] group-hover:scale-105" sizes="100vw" />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-[#1a1a1a] to-[#333]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/50 to-transparent" />
      </div>
      <div className="relative z-10 h-full flex flex-col justify-center p-8 md:p-16 max-w-2xl">
        <span className="text-[10px] font-black uppercase tracking-[0.3em] mb-4" style={{ color: '#C9A96E' }}>Feature</span>
        <h2 className="font-magazine text-3xl md:text-5xl font-bold text-white leading-[1] mb-4 uppercase tracking-tight">
          {article.title}
        </h2>
        <p className="text-white/50 text-sm leading-relaxed line-clamp-2 mb-4">{article.description}</p>
        <span className="text-white/30 text-[10px] uppercase tracking-widest font-bold">{article.source} · {formatDate(article.publishedAt)}</span>
      </div>
    </a>
  );
}

// Grid card with image top
function GridCard({ article }) {
  if (!article) return null;
  return (
    <a href={article.url} target="_blank" rel="noopener noreferrer" className="block group cursor-pointer overflow-hidden" style={{ backgroundColor: '#222' }}>
      <div className="relative overflow-hidden" style={{ aspectRatio: '16/10' }}>
        {article.image ? (
          <Image src={article.image} alt={article.title} fill className="object-cover transition-transform duration-700 group-hover:scale-110" sizes="(max-width: 768px) 100vw, 33vw" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#222] to-[#444]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#222] via-transparent to-transparent opacity-60" />
      </div>
      <div className="p-5 md:p-6">
        <span className="text-[9px] font-black uppercase tracking-[0.3em] mb-2 block" style={{ color: '#C9A96E' }}>{article.source}</span>
        <h3 className="font-bold text-base md:text-lg leading-tight mb-2 line-clamp-3 text-[#f0ece4] group-hover:text-[#C9A96E] transition-colors">{article.title}</h3>
        <p className="text-[#9a9083] text-xs line-clamp-2 leading-relaxed">{article.description}</p>
        <div className="mt-4 pt-3 border-t flex items-center justify-between" style={{ borderColor: '#333' }}>
          <span className="text-[10px] text-[#666] uppercase tracking-widest font-bold">{formatDate(article.publishedAt)}</span>
          <ArrowUpRight className="w-3 h-3 text-[#666] group-hover:text-[#C9A96E] transition-colors" />
        </div>
      </div>
    </a>
  );
}


export default function MagazineView({ articles, category, weather, userCity, searchQuery }) {
  if (!articles || articles.length === 0) {
    return (
      <div className="p-20 text-center font-magazine text-3xl uppercase tracking-widest opacity-20">
        {searchQuery ? `No results found for "${searchQuery}".` : "No stories for this edition."}
      </div>
    );
  }

  const coverArticle = articles[0];
  const featuredArticles = articles.slice(1, 4);
  const editorialArticles = articles.slice(4, 8);
  const cinematicArticle = articles[8];
  const gridArticles = articles.slice(9);
  const date = new Date().toLocaleDateString(undefined, { month: 'long', year: 'numeric' }).toUpperCase();

  return (
    <div className="space-y-0">
      
      {/* ═══ MAGAZINE MASTHEAD ═══ */}
      <div className="text-center py-12 border-b" style={{ borderColor: '#C9A96E' }}>
        <p className="text-[10px] font-bold uppercase tracking-[0.5em] mb-4" style={{ color: '#C9A96E' }}>
          {date} · {userCity || 'INTERNATIONAL'} EDITION · {weather}
        </p>
        <h1 className="font-magazine text-6xl md:text-8xl lg:text-[10rem] font-bold uppercase tracking-tight leading-[0.85]" style={{ color: '#f0ece4' }}>
          HONEST.
        </h1>
        <h2 className="font-serif italic text-2xl md:text-4xl mt-2 tracking-wide" style={{ color: '#C9A96E' }}>
          Briefs Magazine
        </h2>
        <div className="flex items-center justify-center gap-6 mt-6">
          <div className="w-16 h-px" style={{ backgroundColor: '#C9A96E' }} />
          <span className="text-[9px] font-black uppercase tracking-[0.4em]" style={{ color: '#666' }}>{category} · Vol. CXXIV</span>
          <div className="w-16 h-px" style={{ backgroundColor: '#C9A96E' }} />
        </div>
      </div>

      {/* ═══ COVER HERO ═══ */}
      <CoverHero article={coverArticle} />

      {/* ═══ SECTION DIVIDER ═══ */}
      <div className="flex items-center gap-4 px-6 md:px-16 py-8" style={{ backgroundColor: '#111' }}>
        <Star className="w-4 h-4" style={{ color: '#C9A96E' }} />
        <span className="text-[10px] font-black uppercase tracking-[0.4em]" style={{ color: '#C9A96E' }}>Featured In This Issue</span>
        <div className="flex-1 h-px" style={{ backgroundColor: '#333' }} />
      </div>

      {/* ═══ FEATURED 3-COLUMN STRIP ═══ */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-px" style={{ backgroundColor: '#333' }}>
        {featuredArticles.map((article, i) => (
          <FeatureCard key={`feat-${i}`} article={article} index={i} />
        ))}
      </div>

      {/* ═══ EDITORIAL SECTION ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-px" style={{ backgroundColor: '#333' }}>
        {/* Left: Main editorial stack */}
        <div className="lg:col-span-7" style={{ backgroundColor: '#1a1a1a' }}>
          <div className="p-6 md:p-10 border-b" style={{ borderColor: '#333' }}>
            <div className="flex items-center gap-3 mb-2">
              <Bookmark className="w-4 h-4" style={{ color: '#C9A96E' }} />
              <span className="text-[10px] font-black uppercase tracking-[0.3em]" style={{ color: '#C9A96E' }}>Editor&apos;s Picks</span>
            </div>
          </div>
          {editorialArticles.map((article, i) => (
            <EditorialCard key={`ed-${i}`} article={article} />
          ))}
        </div>

        {/* Right: Table of Contents style */}
        <div className="lg:col-span-5" style={{ backgroundColor: '#161616' }}>
          <div className="p-6 md:p-10 sticky top-24">
            <div className="flex items-center gap-3 mb-8">
              <Clock className="w-4 h-4" style={{ color: '#C9A96E' }} />
              <span className="text-[10px] font-black uppercase tracking-[0.3em]" style={{ color: '#C9A96E' }}>In This Issue</span>
            </div>
            <div className="space-y-6">
              {articles.slice(0, 8).map((article, i) => (
                <a key={`toc-${i}`} href={article.url} target="_blank" rel="noopener noreferrer" className="flex items-start gap-4 group">
                  <span className="font-magazine text-3xl font-bold leading-none" style={{ color: i === 0 ? '#C9A96E' : '#333' }}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div className="flex-1 border-b pb-4" style={{ borderColor: '#2a2a2a' }}>
                    <h4 className="text-sm font-bold leading-tight text-[#f0ece4] group-hover:text-[#C9A96E] transition-colors line-clamp-2">
                      {article.title}
                    </h4>
                    <span className="text-[9px] uppercase tracking-widest font-bold text-[#555] mt-1 block">{article.source}</span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ═══ CINEMATIC FULL-BLEED ═══ */}
      {cinematicArticle && <CinematicCard article={cinematicArticle} />}

      {/* ═══ GRID SECTION ═══ */}
      {gridArticles.length > 0 && (
        <>
          <div className="flex items-center gap-4 px-6 md:px-16 py-8" style={{ backgroundColor: '#111' }}>
            <span className="text-[10px] font-black uppercase tracking-[0.4em]" style={{ color: '#C9A96E' }}>More Stories</span>
            <div className="flex-1 h-px" style={{ backgroundColor: '#333' }} />
            <span className="text-[10px] uppercase tracking-widest font-bold text-[#555]">{gridArticles.length} Articles</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px" style={{ backgroundColor: '#333' }}>
            {gridArticles.map((article, i) => (
              <GridCard key={`grid-${i}`} article={article} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
