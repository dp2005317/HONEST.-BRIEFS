import { useState, useEffect } from 'react';
import useSWRInfinite from 'swr/infinite';
import Layout from '@/components/Layout';
import CategoryBar from '@/components/CategoryBar';
import NewsCard from '@/components/NewsCard';
import Sidebar from '@/components/Sidebar';
import MagazineView from '@/components/MagazineView';
import ReelsViewer from '@/components/ReelsViewer';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
const fetcher = url => fetch(url).then(r => r.json());

const LIVE_CHANNELS = [
  { name: 'ABP News', id: 'UCRWFSbif-RFENbBrSiez1DA' },
  { name: 'Zee News', id: 'UCxZn4XGQmnsQYn-XnK2DqAA' },
  { name: 'NDTV', id: 'UCXBD5iG5cr4ZYZ99K-fmDHg' },
  { name: 'India Today', id: 'UCYPvAwZP8pZhSMW8qs7cVCw' }
];

export default function Home() {
  const { user, preferences } = useAuth();
  const { theme } = useTheme();
  const [category, setCategory] = useState('General');
  const [searchQuery, setSearchQuery] = useState('');
  const [userCity, setUserCity] = useState(null);
  const [weather, setWeather] = useState('FOGGY');
  const activeCategory =
    !searchQuery && category === 'General' && preferences?.interestedTopics?.length > 0
      ? preferences.interestedTopics[0]
      : category;

  useEffect(() => {
    fetch('https://ipinfo.io/json')
      .then(res => res.json())
      .then(data => {
        if (data.city) {
          setUserCity(data.city.toUpperCase());
        }
        if (data.loc) {
          const [lat, lon] = data.loc.split(',');
          fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`)
            .then(res => res.json())
            .then(weatherData => {
               if (weatherData?.current_weather) {
                 const { temperature, weathercode } = weatherData.current_weather;
                 let condition = 'CLEAR';
                 if (weathercode > 0 && weathercode <= 3) condition = 'CLOUDY';
                 else if (weathercode > 3 && weathercode <= 48) condition = 'FOGGY';
                 else if (weathercode > 48 && weathercode <= 67) condition = 'RAINY';
                 else if (weathercode > 67 && weathercode <= 77) condition = 'SNOWY';
                 else if (weathercode > 77) condition = 'STORMY';
                 setWeather(`${temperature}°C, ${condition}`);
               }
            })
            .catch(console.error);
        }
      })
      .catch(console.error);
  }, []);

  const getKey = (pageIndex, previousPageData) => {
    if (previousPageData && !previousPageData.hasMore) return null;
    
    // If we have a Search Query, use it
    if (searchQuery) {
      return `/api/news?q=${encodeURIComponent(searchQuery)}&page=${pageIndex + 1}`;
    }
    
    return `/api/news?category=${activeCategory}&page=${pageIndex + 1}`;
  };

  const { data, error, size, setSize, isValidating } = useSWRInfinite(getKey, fetcher);

  const isLoading = !data && !error;
  const articles = data ? data.map(page => page.articles).flat() : [];
  const hasMore = data ? data[data.length - 1]?.hasMore : false;
  const isLoadingMore = isLoading || (size > 0 && data && typeof data[size - 1] === "undefined");

  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 800) {
        if (hasMore && !isLoadingMore && !isValidating) {
          setSize(size + 1);
        }
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasMore, isLoadingMore, isValidating, setSize, size]);

  const featuredNews = articles.slice(0, 2);
  const trendingNews = [...articles].slice(0, 50).reverse().slice(0, 5); // Limit reversing to first page to avoid shifting on scroll
  const gridNews = articles.slice(2);

  const handleTabChange = (tab) => {
    if (tab === 'home') {
      setCategory('General');
      setSearchQuery('');
    } else {
      setCategory(tab);
      setSearchQuery('');
    }
  };

  const handleSearch = (q) => {
    if (q.trim()) {
      setSearchQuery(q);
      setCategory('Search'); // Optional: change category to Search for visual clarity
    } else {
      setSearchQuery('');
      setCategory('General');
    }
  };

  const isMagazine = theme === 'magazine';

  // ════════════════════════════════════════════
  // MAGAZINE THEME — Asymmetric editorial layout
  // ════════════════════════════════════════════
  if (isMagazine) {
    return (
      <Layout activeTab={activeCategory === 'Video News' ? 'Video News' : 'home'} onSearch={handleSearch} onTabChange={handleTabChange} hideUIOnMobile={activeCategory === 'Video News'}>
        {/* Slim category bar at top */}
        <div className={`mb-0 ${activeCategory === 'Video News' ? 'hidden md:block' : ''}`}>
          <CategoryBar activeCategory={activeCategory} onCategoryChange={setCategory} />
        </div>

        {activeCategory === 'Video News' ? (
          <div className="w-full">
            <ReelsViewer articles={articles} />
          </div>
        ) : isLoading ? (
          <div className="space-y-0 animate-pulse">
            <div className="w-full" style={{ height: '80vh', backgroundColor: '#222' }} />
            <div className="grid grid-cols-3 gap-px" style={{ backgroundColor: '#333' }}>
              <div style={{ aspectRatio: '3/4', backgroundColor: '#222' }} />
              <div style={{ aspectRatio: '3/4', backgroundColor: '#222' }} />
              <div style={{ aspectRatio: '3/4', backgroundColor: '#222' }} />
            </div>
          </div>
        ) : error ? (
          <div className="p-20 text-center" style={{ backgroundColor: '#111' }}>
            <h3 className="font-magazine text-4xl font-bold uppercase text-[#f0ece4] mb-4">Press Halted</h3>
            <p className="text-[#666] text-xs uppercase tracking-widest">Error connecting to sources.</p>
          </div>
        ) : (
          <MagazineView
            articles={articles}
            category={activeCategory}
            weather={weather}
            userCity={userCity}
          />
        )}
      </Layout>
    );
  }

  // ════════════════════════════════════════════
  // DAY & DARK THEMES — Standard newspaper layout
  // ════════════════════════════════════════════
  return (
    <Layout activeTab={activeCategory === 'Video News' ? 'Video News' : 'home'} onSearch={handleSearch} onTabChange={handleTabChange} hideUIOnMobile={activeCategory === 'Video News'}>
      {/* Newspaper Header */}
      <div className={`mb-12 pt-6 pb-10 relative group ${activeCategory === 'Video News' ? 'hidden md:block' : ''}`} style={{ borderBottom: `4px solid var(--accent)` }}>
         <div className="flex justify-between items-end mb-8">
           <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-[0.4em] mb-4 opacity-40">
                Weather: {weather} • {userCity ? `${userCity} EDITION` : 'LONDON EDITION'}
              </span>
             <h1 className="text-6xl md:text-9xl font-serif font-black tracking-tighter leading-none group-hover:opacity-75 transition-opacity" style={{ color: 'var(--foreground)' }}>
               HONEST. Briefs
             </h1>
           </div>
           <div className="hidden lg:flex flex-col text-right">
           </div>
         </div>

         <div className="flex items-center gap-6 border-t pt-6" style={{ borderColor: 'var(--border-ink)' }}>
           <p className="font-black uppercase tracking-[0.3em] text-[11px]" style={{ color: 'var(--foreground)' }}>Publishing House</p>
           <div className="w-2 h-2 rotate-45" style={{ backgroundColor: 'var(--accent)' }} />
           <p className="font-black uppercase tracking-[0.3em] text-[11px]" style={{ color: 'var(--foreground)' }}>{activeCategory}</p>
           <div className="flex-1 border-t border-dashed" style={{ borderColor: 'var(--border-ink)' }} />
           <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-40">{new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
         </div>
          
          {searchQuery && (
            <div className="mt-6 flex items-center justify-between bg-black/5 p-4 border-l-4 border-black" style={{ borderColor: 'var(--accent)' }}>
              <div>
                <h2 className="text-sm font-black uppercase tracking-widest opacity-40 mb-1">Search Dispatch</h2>
                <p className="text-2xl font-serif italic text-black" style={{ color: 'var(--foreground)' }}>Bulletins tagged with <span className="font-bold underline italic">&quot;{searchQuery}&quot;</span></p>
              </div>
              <button 
                onClick={() => { setSearchQuery(''); setCategory('General'); }}
                className="text-xs font-black uppercase tracking-widest border-2 px-4 py-2 hover:bg-black hover:text-white transition-all"
                style={{ borderColor: 'var(--accent)' }}
              >
                Reset Feed
              </button>
            </div>
          )}
      </div>

      <div className={activeCategory === 'Video News' ? 'hidden md:block' : ''}>
        <CategoryBar activeCategory={activeCategory} onCategoryChange={(cat) => { setCategory(cat); setSearchQuery(''); }} />
      </div>

      <div className={`flex flex-col lg:flex-row gap-16 pb-32 ${activeCategory === 'Video News' ? 'pb-0' : ''}`}>
        <div className="flex-1 w-full min-w-0">
          
          {activeCategory === 'Video News' ? (
            <div className="w-full">
              <ReelsViewer articles={articles} />
            </div>
          ) : isLoading ? (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-12 animate-pulse">
               <div className="aspect-video md:col-span-2 border" style={{ backgroundColor: 'var(--skeleton-bg)', borderColor: 'var(--border-ink)' }} />
               <div className="aspect-video border" style={{ backgroundColor: 'var(--skeleton-bg)', borderColor: 'var(--border-ink)' }} />
               <div className="aspect-video border" style={{ backgroundColor: 'var(--skeleton-bg)', borderColor: 'var(--border-ink)' }} />
               <div className="aspect-video border" style={{ backgroundColor: 'var(--skeleton-bg)', borderColor: 'var(--border-ink)' }} />
               <div className="aspect-video border" style={{ backgroundColor: 'var(--skeleton-bg)', borderColor: 'var(--border-ink)' }} />
             </div>
          ) : error ? (
            <div className="p-16 text-center border-4 border-double" style={{ borderColor: 'var(--accent)', backgroundColor: 'var(--card-bg)' }}>
              <h3 className="text-3xl font-serif font-black mb-4 italic underline underline-offset-8" style={{ color: 'var(--foreground)' }}>Press Execution Halted</h3>
              <p className="font-black uppercase tracking-widest text-xs opacity-40">Error connecting to regional telegraph wires.</p>
            </div>
          ) : articles.length === 0 ? (
            <div className="p-20 text-center italic font-serif text-3xl border-2 border-dashed opacity-20" style={{ borderColor: 'var(--border-ink)' }}>
              No bulletins filed for this evening&apos;s edition.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 w-full h-full auto-rows-[auto]">
              {featuredNews.map((article, i) => (
                <NewsCard key={`featured-${i}`} article={article} featured={true} />
              ))}
              {gridNews.map((article, i) => (
                <NewsCard key={`grid-${i}`} article={article} featured={false} />
              ))}
            </div>
          )}
          
        </div>

        <div className={`lg:w-80 flex-shrink-0 ${activeCategory === 'Video News' ? 'hidden md:block' : ''}`}>
           <Sidebar trendingNews={trendingNews} />
        </div>
      </div>
    </Layout>
  );
}
