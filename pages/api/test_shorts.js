export default async function handler(req, res) {
  try {
    const channelId = 'UCRWFSbif-RFENbBrSiez1DA';
    const fetchRes = await fetch(`https://www.youtube.com/channel/${channelId}/shorts`, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
    });
    const text = await fetchRes.text();
    const match = text.match(/ytInitialData = (.*?);<\/script>/);
    if (!match) return res.status(200).json({ error: 'No ytInitialData match' });
    const json = JSON.parse(match[1]);
    const author = json.metadata?.channelMetadataRenderer?.title || 'News Channel';
    const tabs = json.contents?.twoColumnBrowseResultsRenderer?.tabs;
    const shortsTab = tabs?.find(t => t.tabRenderer?.title === 'Shorts')?.tabRenderer;
    const items = shortsTab?.content?.richGridRenderer?.contents || [];
    
    const results = items.slice(0, 15).map(item => {
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
        publishedText: '1 hour ago',
        videoThumbnails: [{ url: urlInfo }]
      };
    }).filter(Boolean);
    
    res.status(200).json({ success: true, shorts: results, length: results.length });
  } catch (error) {
    res.status(500).json({ error: error.message, stack: error.stack });
  }
}
