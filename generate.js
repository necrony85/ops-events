const fs = require('fs');
const https = require('https');

const API_URL = 'https://metaforge.app/api/arc-raiders/events-schedule';

function fetchData() {
  return new Promise((resolve, reject) => {
    https.get(API_URL, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

function extractPattern(events) {
  const map = new Map();

  for (const e of events) {
    const name = e.name;
    const zone = e.map;

    const start = new Date(e.startTime);
    const hour = start.getHours();

    const key = `${name}__${zone}`;

    if (!map.has(key)) {
      map.set(key, {
        id: name.toLowerCase().replace(/\s+/g, ''),
        name,
        zoneName: zone,
        hours: new Set(),
      });
    }

    map.get(key).hours.add(hour);
  }

  const result = [];

  for (const entry of map.values()) {
    result.push({
      id: entry.id,
      name: entry.name,
      zoneName: entry.zoneName,
      hours: Array.from(entry.hours).sort((a, b) => a - b),
    });
  }

  return result;
}

async function main() {
  const data = await fetchData();
  const pattern = extractPattern(data);

  fs.writeFileSync('pattern.json', JSON.stringify(pattern, null, 2));
}

main();
