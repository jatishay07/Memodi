'use client';

import { useState } from 'react';
import ChatBubble from './ChatBubble';
import PersonCardChat from './PersonCardChat';
import EventCardChat from './EventCardChat';
import { detectPeopleMentioned, detectEventsMentioned } from '../lib/recall';

export default function AiTurn({
  text,
  partial,
  t,
  live = false,
  showVolume = true,
  textScale = 1,
  reducedMotion = false,
  peopleIndex,
  eventsIndex,
}) {
  const body = text || partial || '';
  const peopleIds = detectPeopleMentioned(body, peopleIndex);
  const resolvedPeople = peopleIds.map(id => peopleIndex?.get(id)).filter(Boolean);
  const mentionNames = resolvedPeople.map(person => person.name).filter(Boolean);
  const resolvedEvents = detectEventsMentioned(body, eventsIndex);
  const [activeName, setActiveName] = useState(null);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', width: '100%' }}>
      <ChatBubble
        role="ai"
        text={text}
        partial={partial}
        t={t}
        showVolume={showVolume}
        textScale={textScale}
        reducedMotion={reducedMotion}
        mentions={mentionNames}
        activeName={activeName}
        peopleIndex={peopleIndex}
      />
      {resolvedPeople.length > 0 && (
        <div style={{ width: 'min(620px, 86%)', marginTop: -8 }}>
          <PersonCardChat
            people={resolvedPeople}
            live={live}
            textScale={textScale}
            reducedMotion={reducedMotion}
            onActiveChange={setActiveName}
          />
        </div>
      )}
      {resolvedEvents.length > 0 && (
        <div style={{ width: 'min(620px, 86%)', marginTop: resolvedPeople.length > 0 ? 8 : -8 }}>
          <EventCardChat
            events={resolvedEvents}
            textScale={textScale}
            reducedMotion={reducedMotion}
          />
        </div>
      )}
    </div>
  );
}
