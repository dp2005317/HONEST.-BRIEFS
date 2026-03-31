import Parser from 'rss-parser';

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
  'Video News': [
    'https://www.youtube.com/feeds/videos.xml?channel_id=UCRWFSbif-RFENbBrSiez1DA', // ABP
    'https://www.youtube.com/feeds/videos.xml?channel_id=UCxZn4XGQmnsQYn-XnK2DqAA', // Zee
    'https://www.youtube.com/feeds/videos.xml?channel_id=UCQfwfsi5VrQ8yKZ-UWmAEFg'  // France24
  ]
};

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

  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=120');

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
      if (category.startsWith('Local_')) {
        const countryCode = category.replace('Local_', '');
        feeds = [`https://news.google.com/rss/headlines/section/geo/${countryCode}`];
      } else {
        feeds = CATEGORY_FEEDS[category] || CATEGORY_FEEDS['General'];
      }

      for (const url of feeds) {
        try {
          const feed = await parser.parseURL(url);
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
          console.error(`Error parsing feed ${url}:`, err.message);
        }
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
