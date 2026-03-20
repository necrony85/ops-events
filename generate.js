const fs = require('fs');

function extractValidHours(hours) {
  if (!hours || hours.length < 2) return hours || [];

  const sorted = [...hours].sort((a, b) => a - b);

  // compute deltas
  const deltas = [];
  for (let i = 1; i < sorted.length; i++) {
    deltas.push(sorted[i] - sorted[i - 1]);
  }

  // frequency map
  const freq = {};
  for (const d of deltas) {
    freq[d] = (freq[d] || 0) + 1;
  }

  // dominant delta
  const dominantEntry = Object.entries(freq).sort((a, b) => b[1] - a[1])[0];

  if (!dominantEntry) return sorted;

  const delta = parseInt(dominantEntry[0]);

  // rebuild consistent sequence
  const result = [sorted[0]];

  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i] - result[result.length - 1] === delta) {
      result.push(sorted[i]);
    }
  }

  return result;
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
    const rawHours = Array.from(entry.hours);
    const cleanHours = extractValidHours(rawHours);

    if (cleanHours.length === 0) continue;

    result.push({
      id: entry.id,
      name: entry.name,
      zoneName: entry.zoneName,
      hours: cleanHours,
    });
  }

  return result;
}

function main() {
  const raw = fs.readFileSync('raw.json', 'utf-8');
  const data = JSON.parse(raw);

  const events =
    Array.isArray(data) ? data :
    data.events ?? data.data ?? [];

  if (!Array.isArray(events)) {
    throw new Error('Invalid API structure');
  }

  const pattern = extractPattern(events);

  fs.writeFileSync('pattern.json', JSON.stringify(pattern, null, 2));
}

main();
