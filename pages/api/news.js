import Parser from 'rss-parser';
import ytch from 'yt-channel-info';

const parser = new Parser({
  customFields: {
    item: [
      ['media:content', 'mediaContent', { keepArray: true }],
      ['media:thumbnail', 'mediaThumbnail'],
      ['media:group', 'mediaGroup'],
      ['enclosure', 'enclosure'],
      ['content:encoded', 'contentEncoded'],
    ],
  }
});

const CATEGORY_FEEDS = {
  General: ['https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml', 'https://feeds.bbci.co.uk/news/rss.xml', 'https://timesofindia.indiatimes.com/rssfeedstopstories.cms'],
  Technology: ['https://www.theverge.com/rss/index.xml', 'https://techcrunch.com/feed/', 'https://feeds.bbci.co.uk/news/technology/rss.xml', 'https://timesofindia.indiatimes.com/rssfeeds/66949542.cms'],
  Education: ['https://feeds.bbci.co.uk/news/education/rss.xml', 'https://rss.nytimes.com/services/xml/rss/nyt/Education.xml', 'https://timesofindia.indiatimes.com/rssfeeds/9131688468.cms'],
  Business: ['https://rss.nytimes.com/services/xml/rss/nyt/Business.xml', 'https://feeds.bbci.co.uk/news/business/rss.xml', 'https://moxie.foxbusiness.com/google-publisher/business.xml', 'https://timesofindia.indiatimes.com/rssfeeds/1898055.cms'],
  Sports: ['https://www.espn.com/espn/rss/news', 'https://sports.yahoo.com/rss/', 'https://feeds.bbci.co.uk/sport/rss.xml', 'https://timesofindia.indiatimes.com/rssfeeds/4719148.cms'],
  'Film & Entertainment': ['https://www.polygon.com/rss/index.xml', 'https://variety.com/feed/', 'https://feeds.bbci.co.uk/news/entertainment_and_arts/rss.xml', 'https://timesofindia.indiatimes.com/rssfeeds/1081479906.cms'],
  Science: ['https://www.space.com/feeds/all', 'https://rss.nytimes.com/services/xml/rss/nyt/Science.xml', 'https://feeds.bbci.co.uk/news/science_and_environment/rss.xml', 'https://timesofindia.indiatimes.com/rssfeeds/-2128672765.cms'],
  Health: ['https://rss.nytimes.com/services/xml/rss/nyt/Health.xml', 'https://feeds.bbci.co.uk/news/health/rss.xml', 'https://timesofindia.indiatimes.com/rssfeeds/3908999.cms'],
  India: ['https://www.thehindu.com/news/national/feeder/default.rss', 'https://timesofindia.indiatimes.com/rssfeedstopstories.cms'],
  World: ['https://www.aljazeera.com/xml/rss/all.xml', 'https://feeds.bbci.co.uk/news/world/rss.xml', 'https://timesofindia.indiatimes.com/rssfeeds/296589292.cms'],
  'Video News': [] // Handled custom by yt-channel-info
};

function parseYTDate(text) {
  if (!text) return new Date().toISOString();
  const lower = text.toLowerCase();
  let msToSubtract = 0;
  
  const extractNum = (str) => parseInt(str.match(/\d+/)?.[0] || '1', 10);
  const num = extractNum(lower);
  
  if (lower.includes('second')) msToSubtract = num * 1000;
  else if (lower.includes('minute')) msToSubtract = num * 60000;
  else if (lower.includes('hour')) msToSubtract = num * 3600000;
  else if (lower.includes('day')) msToSubtract = num * 86400000;
  else if (lower.includes('week')) msToSubtract = num * 604800000;
  else if (lower.includes('month')) msToSubtract = num * 2592000000;
  else if (lower.includes('year')) msToSubtract = num * 31536000000;
  
  return new Date(Date.now() - msToSubtract).toISOString();
}

function extractImage(item) {
  // 1. Check enclosure
  if (item.enclosure && item.enclosure.url && item.enclosure.type?.includes('image')) {
    return item.enclosure.url;
  }

  // 2. Check media:content
  if (item.mediaContent) {
    const media = Array.isArray(item.mediaContent) ? item.mediaContent[0] : item.mediaContent;
    if (media.$ && media.$.url) return media.$.url;
    if (media.url) return media.url;
  }

  // 3. Check media:thumbnail (Common in YouTube RSS)
  if (item.mediaThumbnail) {
    if (item.mediaThumbnail.$ && item.mediaThumbnail.$.url) return item.mediaThumbnail.$.url;
    if (item.mediaThumbnail.url) return item.mediaThumbnail.url;
  }

  // 4. Check media:group (YouTube specific)
  if (item.mediaGroup) {
     const mg = item.mediaGroup;
     // Sometimes it is flattened, sometimes nested
     const thumb = mg['media:thumbnail'] || mg.mediaThumbnail || (mg.$ && mg.$['media:thumbnail']);
      if (thumb) {
        if (thumb.$ && thumb.$.url) return thumb.$.url;
        if (thumb.url) return thumb.url;
        if (Array.isArray(thumb) && thumb[0].$) return thumb[0].$.url;
      }
  }

  // 4b. Check media:content (nested)
  if (item.mediaGroup && item.mediaGroup['media:content']) {
    const mc = item.mediaGroup['media:content'];
    const media = Array.isArray(mc) ? mc[0] : mc;
    if (media.$ && media.$.url) return media.$.url;
  }


   // 5. Check enclosure (Standard RSS images)
   if (item.enclosure && item.enclosure.url) {
     return item.enclosure.url;
   }
 
    // 6. Regex fallback from content or description (finding first <img> tag)
    const combinedContent = (item.contentEncoded || '') + (item.content || '') + (item.description || '') + (item.contentSnippet || '');
    const imgMatch = combinedContent.match(/<img[^>]+src=["']([^"']+)["']/i);
    if (imgMatch && imgMatch[1]) {
      // Clean up relative URLs if any
      let url = imgMatch[1];
      if (url.startsWith('//')) url = 'https:' + url;
      return url;
    }

  return null;
}

function getFallbackImage(articleUrl) {
  try {
    const domain = new URL(articleUrl).hostname;
    // Use Google's high-res favicon service (sz=128 for luxury look)
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
  } catch (e) {
    return null;
  }
}

export default async function handler(req, res) {
  const { category = 'General', page = 1, q = '' } = req.query;
  const apiKey = process.env.GNEWS_API_KEY;

  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');

  try {
    const allArticles = [];

    // 1. If we have a Search Query (q), prioritize search
    if (q) {
      if (apiKey) {
        try {
          const response = await fetch(`https://gnews.io/api/v4/search?q=${encodeURIComponent(q)}&lang=en&token=${apiKey}`);
          const data = await response.json();
          if (data.articles) {
            let searchArticles = data.articles.map(a => ({
              title: a.title,
              description: a.description,
              image: a.image,
              url: a.url,
              source: a.source.name,
              publishedAt: a.publishedAt
            }));
            allArticles.push(...searchArticles);
          }
        } catch (err) {
          console.error("GNews Search failed:", err);
        }
      }
      
      // Also add RSS Search fallback for maximum coverage (especially Indian results)
      try {
        const rssSearchUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(q)}&hl=en-IN&gl=IN&ceid=IN:en`;
        const feed = await parser.parseURL(rssSearchUrl);
        const articles = feed.items.map(item => ({
          title: item.title,
          description: item.contentSnippet || item.description || '',
          image: extractImage(item) || getFallbackImage(item.link),
          url: item.link,
          source: feed.title || 'News',
          publishedAt: item.isoDate || new Date().toISOString()
        }));
        allArticles.push(...articles);
      } catch (err) {
        console.error("RSS Search failed:", err);
      }
    } else {
      // 2. Existing Category-based logic
      // GNEWS Integration for Categories
      if (apiKey && category !== 'General') {
        const gnewsCategory = category.toLowerCase() === 'general' ? 'general' : category.toLowerCase();
        try {
          const response = await fetch(`https://gnews.io/api/v4/top-headlines?category=${gnewsCategory}&lang=en&token=${apiKey}`);
          const data = await response.json();
          
          if (data.articles) {
            let gnewsArticles = data.articles.map(a => ({
              title: a.title,
              description: a.description,
              image: a.image,
              url: a.url,
              source: a.source.name,
              publishedAt: a.publishedAt
            }));
            allArticles.push(...gnewsArticles);
          }
        } catch (err) {
          console.error("GNews API failed:", err);
        }
      }

      // RSS Fallback/Integration
      let feeds = [];
      if (category === 'Video News') {
        const channelIds = [
          'UCRWFSbif-RFENbBrSiez1DA', // ABP
          'UCxZn4XGQmnsQYn-XnK2DqAA', // Zee
          'UCXBD5iG5cr4ZYZ99K-fmDHg', // NDTV
          'UCYPvAwZP8pZhSMW8qs7cVCw', // India Today
          'UCKwucPzHZ7zCUIf7If-Wo1g'  // DD News
        ];

        const mapVideo = (v, type) => ({
           title: v.title,
           description: `YouTube ${type}${v.isLiveNow ? " (LIVE)" : ""}`,
           image: v.videoThumbnails?.[v.videoThumbnails.length - 1]?.url || getFallbackImage(`https://youtube.com`),
           url: `https://www.youtube.com/watch?v=${v.videoId}`,
           source: v.author,
           publishedAt: parseYTDate(v.publishedText)
        });

        async function fetchChannelShorts(channelId) {
          try {
            const res = await fetch(`https://www.youtube.com/channel/${channelId}/shorts`, {
              headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
              signal: AbortSignal.timeout(5000)
            });
            const text = await res.text();
            const match = text.match(/ytInitialData = (.*?);<\/script>/);
            if (!match) return [];
            const json = JSON.parse(match[1]);
            const author = json.metadata?.channelMetadataRenderer?.title || 'News Channel';
            const tabs = json.contents?.twoColumnBrowseResultsRenderer?.tabs;
            const shortsTab = tabs?.find(t => t.tabRenderer?.title === 'Shorts')?.tabRenderer;
            const items = shortsTab?.content?.richGridRenderer?.contents || [];
            
            return items.slice(0, 15).map(item => {
              const lockup = item.richItemRenderer?.content?.shortsLockupViewModel;
              if (!lockup) return null;
              const videoId = lockup.entityId?.replace('shorts-shelf-item-', '');
              const title = lockup.overlayMetadata?.primaryText?.content || 'YouTube Short';
              const thumbnailInfo = lockup.thumbnailViewModel?.thumbnailViewModel?.image?.sources;
              const urlInfo = thumbnailInfo?.[thumbnailInfo.length - 1]?.url;
              if (!videoId) return null;
              return {
                title,
                author,
                videoId,
                publishedText: `${Math.floor(Math.random() * 59) + 1} minutes ago`, // Interleaves shorts with recent videos
                videoThumbnails: [{ url: urlInfo }]
              };
            }).filter(Boolean);
          } catch (e) {
            console.error(`Shorts fetch failed for ${channelId}:`, e.message);
            return [];
          }
        }

        const channelPromises = channelIds.map(async (channelId) => {
          try {
            const [streamRes, videoRes, shorts] = await Promise.all([
              ytch.getChannelVideos({ channelId, sortBy: 'newest', videoType: 'streams' }).catch(() => ({ items: [] })),
              ytch.getChannelVideos({ channelId, channelIdType: 0 }).catch(() => ({ items: [] })),
              fetchChannelShorts(channelId)
            ]);

            const streams = (streamRes.items || []).slice(0, 5); // Take up to 5 latest streams (including live)
            let videos = videoRes.items || [];
            // Filter videos for the past 48 hours
            videos = videos.filter(v => {
              const dateIso = parseYTDate(v.publishedText);
              return (Date.now() - new Date(dateIso).getTime()) <= (48 * 3600000); // 48 hours
            });

            return [
              ...streams.map(v => mapVideo(v, 'Stream')),
              ...videos.map(v => mapVideo(v, 'Video')),
              ...shorts.map(v => mapVideo(v, 'Shorts'))
            ];
          } catch (e) {
            console.error(`YT scraping failed for ${channelId}:`, e);
            return [];
          }
        });

        const channelResults = await Promise.all(channelPromises);
        channelResults.forEach(articles => allArticles.push(...articles));
      } else {
        if (category.startsWith('Local_')) {
          const countryCode = category.replace('Local_', '');
          feeds = [`https://news.google.com/rss/headlines/section/geo/${countryCode}`];
        } else {
          feeds = [...(CATEGORY_FEEDS[category] || CATEGORY_FEEDS['General'])];
        }
        
        // Dynamically include DD News in every section via Google News RSS Search
        const ddQuery = category === 'General' ? 'site:ddnews.gov.in' : `site:ddnews.gov.in ${category}`;
        feeds.push(`https://news.google.com/rss/search?q=${encodeURIComponent(ddQuery)}&hl=en-IN&gl=IN&ceid=IN:en`);

        const feedPromises = feeds.map(async (url) => {
          try {
            const feed = await parser.parseURL(url);
            return feed.items.map(item => ({
              title: item.title,
              description: item.contentSnippet || item.description || '',
              image: extractImage(item) || getFallbackImage(item.link),
              url: item.link,
              source: feed.title || 'News',
              publishedAt: item.isoDate || new Date().toISOString()
            }));
          } catch (err) {
            console.error(`Error parsing feed ${url}:`, err.message);
            return [];
          }
        });

        const feedResults = await Promise.all(feedPromises);
        feedResults.forEach(articles => allArticles.push(...articles));
      }
    }

    // Filter for past 15 days
    const fifteenDaysAgo = new Date(Date.now() - 15 * 24 * 60 * 60 * 1000);
    let filteredArticles = allArticles.filter(a => new Date(a.publishedAt) >= fifteenDaysAgo);

    // Sort by latest
    filteredArticles.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));

    // Pagination
    const pageNum = parseInt(page, 10) || 1;
    const limit = 15;
    const startIndex = (pageNum - 1) * limit;
    const endIndex = startIndex + limit;
    const paginated = filteredArticles.slice(startIndex, endIndex);
    const hasMore = endIndex < filteredArticles.length;

    res.status(200).json({ articles: paginated, hasMore });

  } catch (error) {
    console.error("API Error:", error);
    res.status(500).json({ error: "Failed to fetch news", details: error.message });
  }
}
