const fs = require('fs');

const API_URL = 'https://metaforge.app/api/arc-raiders/events-schedule';

async function fetchData() {
  const res = await fetch(API_URL);
  return await res.json();
}

function extractPattern(events) {
  const map = new Map();

  for (const e of events) {
    const name = e.name;
    const zone = e.map; // важно: metaforge ползва "map"

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
