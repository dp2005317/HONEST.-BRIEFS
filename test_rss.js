import Parser from 'rss-parser';
const parser = new Parser();

(async () => {
    try {
        const url = 'https://techcrunch.com/feed/';
        const feed = await parser.parseURL(url);
        console.log("ITEM 0 TITLE:", feed.items[0].title);
        // TechCrunch usually has images in content or sometimes encoded media.
        // Let's check most fields.
        console.log("ITEM 0 FIELDS:", Object.keys(feed.items[0]));
        console.log("ITEM 0 ENCLOSURE:", feed.items[0].enclosure);
    } catch (e) {
        console.error(e);
    }
})();
