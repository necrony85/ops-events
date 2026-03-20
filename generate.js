const fs = require('fs');

function normalizeEvent(e) {
  return {
    id: `${e.name}_${e.map}_${e.startTime}`,
    name: e.name,
    zoneName: e.map,
    startTime: e.startTime,
    endTime: e.endTime,
  };
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

  const normalized = events
    .filter(e => e.startTime && e.endTime)
    .map(normalizeEvent);

  fs.writeFileSync('events.json', JSON.stringify(normalized, null, 2));
}

main();
