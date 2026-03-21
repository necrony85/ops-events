const fs = require('fs');

function main() {
  const raw = fs.readFileSync('raw.json', 'utf-8');
  const parsed = JSON.parse(raw);

  const events =
    Array.isArray(parsed)
      ? parsed
      : Array.isArray(parsed?.data)
          ? parsed.data
          : Array.isArray(parsed?.events)
              ? parsed.events
              : [];

  if (!Array.isArray(events)) {
    throw new Error('Invalid API structure: expected an array of events');
  }

  const cleaned = events
    .filter((event) => {
      return (
        event &&
        typeof event.name === 'string' &&
        event.name.trim().length > 0 &&
        typeof event.map === 'string' &&
        event.map.trim().length > 0 &&
        event.startTime != null &&
        event.endTime != null
      );
    })
    .map((event) => ({
      name: event.name,
      map: event.map,
      icon: typeof event.icon === 'string' ? event.icon : null,
      startTime: event.startTime,
      endTime: event.endTime,
    }));

  fs.writeFileSync('events.json', JSON.stringify(cleaned, null, 2));
}

main();
