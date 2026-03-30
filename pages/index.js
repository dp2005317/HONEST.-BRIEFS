import { useState } from 'react';
import useSWR from 'swr';
import Layout from '@/components/Layout';
import CategoryBar from '@/components/CategoryBar';
import NewsCard from '@/components/NewsCard';
import Sidebar from '@/components/Sidebar';
import MagazineView from '@/components/MagazineView';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useEffect } from 'react';

const fetcher = url => fetch(url).then(r => r.json());

const LIVE_CHANNELS = [
  { name: 'NDTV 24x7', id: 'UCZFMm1mMw0F81Z37aaEzTUA' },
  { name: 'Times Now', id: 'UC6RJ7-PaXg6TIH2BzZfTV7w' },
  { name: 'Al Jazeera English', id: 'UCNye-wNBqNL5ZzHSJj3l8Bg' },
  { name: 'DW News', id: 'UCknLrEdhRCp1aegoMqRaCZg' },
  { name: 'France 24 English', id: 'UCQfwfsi5VrQ8yKZ-UWmAEFg' }
];

export default function Home() {
  const { user, preferences } = useAuth();
  const { theme } = useTheme();
  const [category, setCategory] = useState('General');
  const [userCity, setUserCity] = useState(null);
  const [weather, setWeather] = useState('FOGGY');

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

  useEffect(() => {
    if (preferences?.interestedTopics?.length > 0 && category === 'General') {
      setCategory(preferences.interestedTopics[0]);
    }
  }, [preferences, category]);
  
  const { data, error, isLoading } = useSWR(category === 'Video News' ? null : `/api/news?category=${category}`, fetcher);

  const articles = data?.articles || [];
  const featuredNews = articles.slice(0, 2);
  const trendingNews = [...articles].reverse().slice(0, 5); 
  const gridNews = articles.slice(2);

  const isMagazine = theme === 'magazine';

  // ════════════════════════════════════════════
  // MAGAZINE THEME — Completely different layout
  // ════════════════════════════════════════════
  if (isMagazine) {
    return (
      <Layout>
        {/* Slim category bar at top */}
        <div className="mb-0">
          <CategoryBar activeCategory={category} onCategoryChange={setCategory} />
        </div>

        {category === 'Video News' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-px pb-16" style={{ backgroundColor: '#333' }}>
            {LIVE_CHANNELS.map((channel, i) => (
              <div key={`live-${i}`} className="md:col-span-2" style={{ backgroundColor: '#1a1a1a' }}>
                <div className="p-4 flex items-center justify-between border-b" style={{ borderColor: '#333' }}>
                  <h2 className="font-magazine text-2xl font-bold uppercase tracking-tight text-[#f0ece4]">{channel.name}</h2>
                  <span className="text-[10px] uppercase font-black tracking-widest px-3 py-1 animate-pulse" style={{ backgroundColor: '#C9A96E', color: '#111' }}>Live</span>
                </div>
                <div className="w-full relative" style={{ paddingBottom: '56.25%', backgroundColor: '#111' }}>
                  <iframe
                    className="absolute top-0 left-0 w-full h-full"
                    src={`https://www.youtube.com/embed/live_stream?channel=${channel.id}`}
                    title={`${channel.name} Live Stream`}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              </div>
            ))}
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
            category={category}
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
    <Layout>
      {/* Newspaper Header */}
      <div className="mb-12 pt-6 pb-10 relative group" style={{ borderBottom: `4px solid var(--accent)` }}>
         <div className="flex justify-between items-end mb-8">
           <div className="flex flex-col">
             <span className="text-[10px] font-black uppercase tracking-[0.4em] mb-4 opacity-40">
               Weather: {weather} • {userCity ? `${userCity} EDITION` : 'LONDON EDITION'} • Early Morning Bulletin
             </span>
             <h1 className="text-6xl md:text-9xl font-serif font-black tracking-tighter leading-none group-hover:opacity-75 transition-opacity" style={{ color: 'var(--foreground)' }}>
               HONEST. Briefs
             </h1>
           </div>
           <div className="hidden lg:flex flex-col text-right">
             <span className="font-serif italic text-2xl border-b-2 pb-1" style={{ borderColor: 'var(--accent)', color: 'var(--foreground)' }}>Vol. CXXIV — No. 382</span>
             <span className="text-[10px] font-black uppercase tracking-widest pt-2" style={{ color: 'var(--foreground)' }}>Price: Two Pence</span>
           </div>
         </div>

         <div className="flex items-center gap-6 border-t pt-6" style={{ borderColor: 'var(--border-ink)' }}>
           <p className="font-black uppercase tracking-[0.3em] text-[11px]" style={{ color: 'var(--foreground)' }}>Publishing House</p>
           <div className="w-2 h-2 rotate-45" style={{ backgroundColor: 'var(--accent)' }} />
           <p className="font-black uppercase tracking-[0.3em] text-[11px]" style={{ color: 'var(--foreground)' }}>{category}</p>
           <div className="flex-1 border-t border-dashed" style={{ borderColor: 'var(--border-ink)' }} />
           <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-40">{new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
         </div>
      </div>

      <CategoryBar activeCategory={category} onCategoryChange={setCategory} />

      <div className="flex flex-col lg:flex-row gap-16 pb-32">
        <div className="flex-1 w-full min-w-0">
          
          {category === 'Video News' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 w-full">
              {LIVE_CHANNELS.map((channel, i) => (
                <div key={`live-${i}`} className="md:col-span-2 p-2" style={{ border: `4px solid var(--accent)`, backgroundColor: 'var(--card-bg)', borderRadius: 'var(--border-radius)' }}>
                  <div className="mb-4 pt-2 px-2 border-b-2 pb-2 flex items-center justify-between" style={{ borderColor: 'var(--accent)' }}>
                    <h2 className="font-serif font-black text-2xl italic tracking-tight" style={{ color: 'var(--foreground)' }}>{channel.name}</h2>
                    <span className="text-white text-[10px] uppercase font-black tracking-widest px-2 py-1 animate-pulse" style={{ backgroundColor: 'var(--live-badge)', borderRadius: 'var(--pill-radius)' }}>Live</span>
                  </div>
                  <div className="w-full relative" style={{ paddingBottom: '56.25%', backgroundColor: 'var(--skeleton-bg)', borderRadius: 'var(--border-radius)' }}>
                    <iframe
                      className="absolute top-0 left-0 w-full h-full"
                      style={{ borderRadius: 'var(--border-radius)' }}
                      src={`https://www.youtube.com/embed/live_stream?channel=${channel.id}`}
                      title={`${channel.name} Live Stream`}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  </div>
                </div>
              ))}
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

        <div className="lg:w-80 flex-shrink-0">
           <Sidebar trendingNews={trendingNews} />
        </div>
      </div>
    </Layout>
  );
}
