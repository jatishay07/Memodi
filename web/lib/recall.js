const NAME_RE_CACHE = new WeakMap();
const EVENT_RE_CACHE = new WeakMap();

export function detectPeopleMentioned(text, peopleIndex) {
  if (!text || !peopleIndex || peopleIndex.size === 0) return [];

  const re = getRegex(peopleIndex);
  if (!re) return [];

  const seen = new Set();
  const ids = [];
  let match;

  re.lastIndex = 0;
  while ((match = re.exec(text)) !== null) {
    const id = findIdByAlias(peopleIndex, match[1]);
    if (id && !seen.has(id)) {
      seen.add(id);
      ids.push(id);
    }
  }

  return ids;
}

function getRegex(peopleIndex) {
  const cached = NAME_RE_CACHE.get(peopleIndex);
  if (cached) return cached;

  const aliases = [...peopleIndex.values()]
    .flatMap(person => getAliases(person))
    .filter(Boolean)
    .sort((a, b) => b.length - a.length)
    .map(escapeRe);

  if (aliases.length === 0) return null;

  const re = new RegExp(`\\b(${aliases.join('|')})\\b`, 'gi');
  NAME_RE_CACHE.set(peopleIndex, re);
  return re;
}

function findIdByAlias(peopleIndex, value) {
  const target = value.toLowerCase();
  for (const [id, person] of peopleIndex) {
    const aliases = getAliases(person).map(alias => alias.toLowerCase());
    if (aliases.includes(target)) return id;
  }
  return null;
}

function getAliases(person) {
  const aliases = new Set();
  if (person?.name) aliases.add(person.name.trim());
  if (person?.fullName) aliases.add(person.fullName.trim());
  if (person?.nickname) aliases.add(person.nickname.trim());

  const firstName = person?.fullName?.trim()?.split(/\s+/)?.[0];
  if (firstName) aliases.add(firstName);

  return [...aliases].filter(Boolean);
}

function escapeRe(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function detectEventsMentioned(text, events) {
  if (!text || !events?.length) return [];
  const photoed = events.filter(e => e.photoUrl);
  if (!photoed.length) return [];

  let re = EVENT_RE_CACHE.get(photoed);
  if (!re) {
    const keywords = photoed
      .map(e => e.description.trim().split(/\s+/).filter(w => w.length > 3).slice(0, 4).join('\\s+\\w*\\s*'))
      .filter(Boolean)
      .sort((a, b) => b.length - a.length)
      .map(escapeRe);
    if (!keywords.length) return [];
    re = new RegExp(`(${keywords.join('|')})`, 'gi');
    EVENT_RE_CACHE.set(photoed, re);
  }

  const found = [];
  re.lastIndex = 0;
  let m;
  while ((m = re.exec(text)) !== null) {
    const matched = m[1].toLowerCase();
    for (const ev of photoed) {
      const kw = ev.description.trim().split(/\s+/).filter(w => w.length > 3).slice(0, 2).join(' ').toLowerCase();
      if (!found.includes(ev) && matched.includes(kw.split(' ')[0])) found.push(ev);
    }
  }
  return found;
}
