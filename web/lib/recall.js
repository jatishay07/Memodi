// Detects which Memory Bank people are mentioned in a given piece of text.
// Used by AiTurn to decide whether to surface a PersonCardChat below an
// assistant bubble.
//
// peopleIndex: Map<id, Person> — pre-filtered upstream to entries with
// both a portrait/mediaUrl and a non-empty description.

const NAME_RE_CACHE = new WeakMap();

/**
 * @param {string} text
 * @param {Map<string, object>} peopleIndex
 * @returns {string[]} ordered, deduped list of mentioned person ids
 */
export function detectPeopleMentioned(text, peopleIndex) {
  if (!text || !peopleIndex || peopleIndex.size === 0) return [];
  const re = getRegex(peopleIndex);
  if (!re) return [];
  const seen = new Set();
  const out = [];
  let m;
  re.lastIndex = 0;
  while ((m = re.exec(text)) !== null) {
    const id = findIdByName(peopleIndex, m[1]);
    if (id && !seen.has(id)) { seen.add(id); out.push(id); }
  }
  return out;
}

function getRegex(peopleIndex) {
  const cached = NAME_RE_CACHE.get(peopleIndex);
  if (cached) return cached;
  const names = [...peopleIndex.values()].map(p => escapeRe(p.name)).filter(Boolean);
  if (names.length === 0) return null;
  const re = new RegExp(`\\b(${names.join('|')})\\b`, 'gi');
  NAME_RE_CACHE.set(peopleIndex, re);
  return re;
}

function findIdByName(peopleIndex, name) {
  const target = name.toLowerCase();
  for (const [id, p] of peopleIndex) {
    if (p.name && p.name.toLowerCase() === target) return id;
  }
  return null;
}

function escapeRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
