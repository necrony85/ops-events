const fs = require('fs');

function main() {
  const raw = fs.readFileSync('raw.json', 'utf-8');
  const data = JSON.parse(raw);

  const events =
    Array.isArray(data) ? data :
    data.data ?? data.events ?? [];

  if (!Array.isArray(events)) {
    throw new Error('Invalid API structure');
  }

  // минимален sanitize (по желание)
  const cleaned = events.filter(
    e => e.name && e.map && e.startTime && e.endTime
  );

  fs.writeFileSync('events.json', JSON.stringify(cleaned, null, 2));
}

main();
