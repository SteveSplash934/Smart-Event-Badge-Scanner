'use client';

import { useState } from 'react';
import { Event } from '@/types/attendee';
import AuthGuard from '@/components/AuthGuard';
import EventSelector from '@/components/EventSelector';
import ScannerView from '@/components/ScannerView';

export default function ScanPage() {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  return (
    <AuthGuard>
      {selectedEvent ? (
        <ScannerView
          event={selectedEvent}
          onChangeEvent={() => setSelectedEvent(null)}
        />
      ) : (
        <EventSelector onSelect={setSelectedEvent} />
      )}
    </AuthGuard>
  );
}
