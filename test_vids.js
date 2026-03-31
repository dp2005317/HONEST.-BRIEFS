import Parser from 'rss-parser';
const parser = new Parser();

async function testVids() {
  const channels = [
    { name: 'ABP News', id: 'UCRWFSbif-RFENbBrSiez1DA' },
    { name: 'Zee News', id: 'UCxZn4XGQmnsQYn-XnK2DqAA' }
  ];

  for (const channel of channels) {
    try {
      const feed = await parser.parseURL(`https://www.youtube.com/feeds/videos.xml?channel_id=${channel.id}`);
      console.log(`\n--- ${channel.name} ---`);
      feed.items.slice(0, 3).forEach(item => {
        console.log(`Title: ${item.title}`);
        console.log(`Link: ${item.link}`);
      });
    } catch (e) {
      console.error(`Failed ${channel.name}: ${e.message}`);
    }
  }
}

testVids();
