import { useState, useRef, useEffect } from 'react';
import { ExternalLink, Share2, Heart } from 'lucide-react';

export default function ReelsViewer({ articles }) {
  const containerRef = useRef(null);
  const [activeReel, setActiveReel] = useState(0);

  // Extract video ID from YouTube URLs
  const getVideoId = (url) => {
    try {
      const urlObj = new URL(url);
      if (urlObj.hostname.includes('youtube.com')) {
        return urlObj.searchParams.get('v');
      }
      if (urlObj.hostname.includes('youtu.be')) {
        return urlObj.pathname.slice(1);
      }
    } catch (e) {
      return null;
    }
    return null;
  };

  // Intersection Observer to detect which reel is in view
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = parseInt(entry.target.getAttribute('data-index') || '0', 10);
            setActiveReel(index);
          }
        });
      },
      {
        root: containerRef.current,
        threshold: 0.6, // When 60% of the reel is visible, consider it active
      }
    );

    const reels = containerRef.current?.querySelectorAll('.reel-item');
    reels?.forEach((reel) => observer.observe(reel));

    return () => observer.disconnect();
  }, [articles]);

  const handleShare = async (url, title) => {
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      navigator.clipboard.writeText(url);
      alert('Link copied to clipboard!');
    }
  };

  if (!articles || articles.length === 0) return null;

  return (
    <div className="w-full flex justify-center py-4 bg-black/95 min-h-[85vh]">
      {/* Container for the reels, styled like a mobile screen aspect ratio */}
      <div 
        ref={containerRef}
        className="relative w-full max-w-[420px] h-[80vh] md:h-[85vh] overflow-y-scroll snap-y snap-mandatory bg-[#09090b] rounded-[2rem] shadow-2xl overflow-hidden [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] border border-white/10"
      >
        {articles.map((article, index) => {
          const videoId = getVideoId(article.url);
          if (!videoId) return null;

          const isActive = index === activeReel;
          
          return (
            <div 
              key={`reel-${index}`} 
              className="reel-item relative w-full h-full snap-start snap-always flex flex-col items-center justify-center bg-black overflow-hidden group"
              data-index={index}
            >
              {/* Blurred Background from Image */}
              {article.image && (
                <div 
                  className="absolute inset-0 z-0 opacity-40 scale-125 blur-2xl transform transition-transform duration-[10s]"
                  style={{
                    backgroundImage: `url(${article.image || `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                />
              )}

              {/* Video Player */}
              <div className="relative z-10 w-full aspect-video shadow-2xl bg-black">
                {isActive ? (
                  <iframe
                    src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=0&controls=1&modestbranding=1&rel=0&showinfo=0&loop=1&playlist=${videoId}`}
                    title={article.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full border-0"
                  />
                ) : (
                  // Placeholder before activation to save network
                  <div className="w-full h-full bg-black/80 flex items-center justify-center">
                    <img 
                      src={article.image || `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`} 
                      alt="Thumbnail" 
                      className="w-full h-full object-cover opacity-50"
                    />
                    <div className="absolute w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
                       <div className="w-0 h-0 border-t-[10px] border-t-transparent border-l-[16px] border-l-white border-b-[10px] border-b-transparent ml-2" />
                    </div>
                  </div>
                )}
              </div>

              {/* Luxury Overlays */}
              
              {/* Top gradient for legibility */}
              <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-black/80 to-transparent z-20 pointer-events-none" />
              
              {/* Bottom gradient for text */}
              <div className="absolute bottom-0 inset-x-0 h-64 bg-gradient-to-t from-black/90 via-black/50 to-transparent z-20 pointer-events-none" />

              {/* Source Badge (Top Left) */}
              <div className="absolute top-6 left-5 z-30">
                <div className="px-3 py-1.5 bg-white/10 backdrop-blur-md border border-white/20 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg">
                  {article.source}
                </div>
              </div>

              {/* Information Text (Bottom Left) */}
              <div className="absolute bottom-6 left-5 right-16 z-30 flex flex-col gap-3">
                <h2 className="text-white font-serif font-black text-xl leading-tight drop-shadow-lg line-clamp-3">
                  {article.title}
                </h2>
                <p className="text-white/80 font-medium text-sm line-clamp-2 drop-shadow-md">
                  {article.description}
                </p>
                <div className="text-white/50 text-[10px] uppercase font-black tracking-widest mt-1">
                  {new Date(article.publishedAt).toLocaleDateString(undefined, {
                    month: 'long', day: 'numeric', year: 'numeric'
                  })}
                </div>
              </div>

              {/* Vertical Action Bar (Bottom Right) */}
              <div className="absolute bottom-6 right-3 z-30 flex flex-col items-center gap-6">
                
                <button 
                  onClick={() => alert('Saved to favorites')}
                  className="flex flex-col items-center gap-1 group/btn"
                >
                  <div className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-lg border border-white/20 flex items-center justify-center text-white group-hover/btn:bg-white group-hover/btn:text-black transition-colors">
                    <Heart className="w-5 h-5" />
                  </div>
                </button>

                <button 
                  onClick={() => handleShare(article.url, article.title)}
                  className="flex flex-col items-center gap-1 group/btn"
                >
                  <div className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-lg border border-white/20 flex items-center justify-center text-white group-hover/btn:bg-white group-hover/btn:text-black transition-colors">
                    <Share2 className="w-5 h-5" />
                  </div>
                </button>

                <a 
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center gap-1 group/btn"
                >
                  <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-lg border border-white/30 flex items-center justify-center text-white group-hover/btn:bg-[#C9A96E] group-hover/btn:border-[#C9A96E] transition-colors">
                    <ExternalLink className="w-5 h-5" />
                  </div>
                </a>

              </div>
              
              {/* Progress Bar (Visual decorative) */}
              {isActive && (
                <div className="absolute bottom-0 left-0 h-1 bg-white/20 w-full z-40">
                  <div className="h-full bg-[#C9A96E] animate-[shimmer_15s_linear_infinite]" style={{ width: '100%' }} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
