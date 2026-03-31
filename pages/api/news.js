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
  General: ['https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml', 'http://rss.cnn.com/rss/edition.rss', 'https://feeds.bbci.co.uk/news/rss.xml'],
  Technology: ['https://www.theverge.com/rss/index.xml', 'https://techcrunch.com/feed/', 'https://feeds.bbci.co.uk/news/technology/rss.xml'],
  Education: ['https://feeds.bbci.co.uk/news/education/rss.xml', 'https://rss.nytimes.com/services/xml/rss/nyt/Education.xml'],
  Business: ['https://rss.nytimes.com/services/xml/rss/nyt/Business.xml', 'https://feeds.bbci.co.uk/news/business/rss.xml', 'https://moxie.foxbusiness.com/google-publisher/business.xml'],
  Sports: ['https://www.espn.com/espn/rss/news', 'https://sports.yahoo.com/rss/', 'https://feeds.bbci.co.uk/sport/rss.xml'],
  Entertainment: ['https://www.polygon.com/rss/index.xml', 'https://variety.com/feed/', 'https://feeds.bbci.co.uk/news/entertainment_and_arts/rss.xml'],
  Science: ['https://www.space.com/feeds/all', 'https://rss.nytimes.com/services/xml/rss/nyt/Science.xml', 'https://feeds.bbci.co.uk/news/science_and_environment/rss.xml'],
  Health: ['https://rss.nytimes.com/services/xml/rss/nyt/Health.xml', 'https://feeds.bbci.co.uk/news/health/rss.xml'],
  India: ['https://www.thehindu.com/news/national/feeder/default.rss', 'https://timesofindia.indiatimes.com/rssfeedstopstories.cms'],
  World: ['https://www.aljazeera.com/xml/rss/all.xml', 'http://rss.cnn.com/rss/edition_world.rss', 'https://feeds.bbci.co.uk/news/world/rss.xml']
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

  // 3. Check media:thumbnail
  if (item.mediaThumbnail && item.mediaThumbnail.$ && item.mediaThumbnail.$.url) {
    return item.mediaThumbnail.$.url;
  }

  // 4. Check CNN style media:group
  if (item.mediaGroup && item.mediaGroup['media:content']) {
    const groupMedia = Array.isArray(item.mediaGroup['media:content']) ? item.mediaGroup['media:content'][0] : item.mediaGroup['media:content'];
    if (groupMedia.$ && groupMedia.$.url) return groupMedia.$.url;
  }

  // 5. Regex fallback from content or description (finding first <img> tag)
  const content = item.contentEncoded || item.content || item.description || '';
  const imgRegex = /<img[^>]+src=["']([^"']+)["']/i;
  const match = content.match(imgRegex);
  if (match && match[1]) {
    return match[1];
  }

  return null;
}

export default async function handler(req, res) {
  const { category = 'General', page = 1 } = req.query;
  const apiKey = process.env.GNEWS_API_KEY;

  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=120');

  try {
    // 1. If we have a GNEWS API Key, prioritize it for the best quality
    if (apiKey) {
      const gnewsCategory = category.toLowerCase() === 'general' ? 'general' : category.toLowerCase();
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

        const fifteenDaysAgo = new Date(Date.now() - 15 * 24 * 60 * 60 * 1000);
        gnewsArticles = gnewsArticles.filter(a => new Date(a.publishedAt) >= fifteenDaysAgo);
        gnewsArticles.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));

        const pageNum = parseInt(page, 10) || 1;
        const limit = 15;
        const startIndex = (pageNum - 1) * limit;
        const endIndex = startIndex + limit;
        const paginated = gnewsArticles.slice(startIndex, endIndex);
        const hasMore = endIndex < gnewsArticles.length;

        return res.status(200).json({ articles: paginated, hasMore });
      }
    }

    // 2. RSS Fallback (Free, No API Key required)
    let feeds = [];
    if (category.startsWith('Local_')) {
      const countryCode = category.replace('Local_', '');
      feeds = [`https://news.google.com/rss/headlines/section/geo/${countryCode}`];
    } else {
      feeds = CATEGORY_FEEDS[category] || CATEGORY_FEEDS['General'];
    }

    const allArticles = [];

    for (const url of feeds) {
      try {
        const feed = await parser.parseURL(url);
        const articles = feed.items.map(item => ({
          title: item.title,
          description: item.contentSnippet || item.description || '',
          image: extractImage(item) || null,
          url: item.link,
          source: feed.title || 'News',
          publishedAt: item.isoDate || new Date().toISOString()
        }));
        allArticles.push(...articles);
      } catch (err) {
        console.error(`Error parsing feed ${url}:`, err.message);
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
