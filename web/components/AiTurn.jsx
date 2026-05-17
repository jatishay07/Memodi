'use client';

import { useMemo, useState } from 'react';
import ChatBubble from './ChatBubble';
import PersonCardChat from './PersonCardChat';
import { detectPeopleMentioned } from '../lib/recall';

export default function AiTurn({
  text,
  partial,
  t,
  live = false,
  showVolume = true,
  textScale = 1,
  reducedMotion = false,
  peopleIndex,
}) {
  const body = text || partial || '';

  const peopleIds = useMemo(
    () => detectPeopleMentioned(body, peopleIndex),
    [body, peopleIndex]
  );

  const mentionNames = useMemo(
    () => peopleIds.map(id => peopleIndex?.get(id)?.name).filter(Boolean),
    [peopleIds, peopleIndex]
  );

  const resolvedPeople = useMemo(
    () => peopleIds.map(id => peopleIndex?.get(id)).filter(Boolean),
    [peopleIds, peopleIndex]
  );

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
    </div>
  );
}
