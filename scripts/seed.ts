/**
 * Seed script — populates Firestore with 2 demo events and 20 realistic attendees.
 *
 * If Firebase Admin credentials are present in .env.local, it writes to Cloud Firestore.
 * If credentials are not present, it generates a visual demo test page (demo-badges.html)
 * with 20 printable/scannable QR codes for immediate testing!
 */

import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

// ─── Demo data ───────────────────────────────────────────────────────────────

const EVENTS = [
  {
    id: 'tech-summit-2026',
    name: 'Tech Summit 2026',
    date: '2026-11-15',
    venue: 'Moscone Center, San Francisco',
    description: 'The largest annual technology conference on the West Coast.',
  },
  {
    id: 'ux-world-2026',
    name: 'UX World 2026',
    date: '2026-12-03',
    venue: 'Javits Center, New York',
    description: 'A premier gathering for UX designers, researchers, and product leaders.',
  },
];

type TicketType = 'General' | 'VIP' | 'Speaker' | 'Staff';

interface AttendeeData {
  id: string;
  fullName: string;
  email: string;
  ticketType: TicketType;
  company: string;
  sessions: string[];
  checkedIn: boolean;
  checkedInAt: null;
  checkedInBy: null;
  photoURL?: string;
}

const TECH_SUMMIT_ATTENDEES: AttendeeData[] = [
  {
    id: 'TECH-VIP-01',
    fullName: 'Amara Osei',
    email: 'amara.osei@techcorp.io',
    ticketType: 'VIP',
    company: 'TechCorp',
    sessions: ['Keynote', 'AI & ML Workshop', 'Startup Fireside'],
    checkedIn: false, checkedInAt: null, checkedInBy: null,
  },
  {
    id: 'TECH-SPK-02',
    fullName: 'Liam Nakamura',
    email: 'liam.n@cloudbase.dev',
    ticketType: 'Speaker',
    company: 'CloudBase',
    sessions: ['Keynote', 'Serverless at Scale'],
    checkedIn: false, checkedInAt: null, checkedInBy: null,
  },
  {
    id: 'TECH-GEN-03',
    fullName: 'Priya Sharma',
    email: 'priya.sharma@devstudio.in',
    ticketType: 'General',
    company: 'DevStudio',
    sessions: ['AI & ML Workshop', 'Open Source Panel'],
    checkedIn: false, checkedInAt: null, checkedInBy: null,
  },
  {
    id: 'TECH-VIP-04',
    fullName: 'Carlos Mendes',
    email: 'carlos.mendes@fintech.com',
    ticketType: 'VIP',
    company: 'FinTech Labs',
    sessions: ['Keynote', 'Fintech & Blockchain', 'Startup Fireside'],
    checkedIn: false, checkedInAt: null, checkedInBy: null,
  },
  {
    id: 'TECH-SPK-05',
    fullName: 'Sophie Beaumont',
    email: 's.beaumont@neuralworks.fr',
    ticketType: 'Speaker',
    company: 'NeuralWorks',
    sessions: ['AI & ML Workshop', 'Ethics in AI'],
    checkedIn: false, checkedInAt: null, checkedInBy: null,
  },
  {
    id: 'TECH-GEN-06',
    fullName: 'Jordan Lee',
    email: 'jordan.lee@bytedrift.co',
    ticketType: 'General',
    company: 'ByteDrift',
    sessions: ['Open Source Panel'],
    checkedIn: false, checkedInAt: null, checkedInBy: null,
  },
  {
    id: 'TECH-STF-07',
    fullName: 'Fatima Al-Hassan',
    email: 'fatima@devnation.ae',
    ticketType: 'Staff',
    company: 'DevNation',
    sessions: [],
    checkedIn: false, checkedInAt: null, checkedInBy: null,
  },
  {
    id: 'TECH-GEN-08',
    fullName: 'Ethan Brooks',
    email: 'ebrooks@quantumloop.io',
    ticketType: 'General',
    company: 'QuantumLoop',
    sessions: ['Keynote', 'Serverless at Scale'],
    checkedIn: false, checkedInAt: null, checkedInBy: null,
  },
  {
    id: 'TECH-VIP-09',
    fullName: 'Mei Lin',
    email: 'mei.lin@pixelcraft.cn',
    ticketType: 'VIP',
    company: 'PixelCraft',
    sessions: ['Keynote', 'AI & ML Workshop', 'Startup Fireside', 'Fintech & Blockchain'],
    checkedIn: false, checkedInAt: null, checkedInBy: null,
  },
  {
    id: 'TECH-SPK-10',
    fullName: 'David Okonkwo',
    email: 'david.o@infranode.ng',
    ticketType: 'Speaker',
    company: 'InfraNode',
    sessions: ['Keynote', 'Open Source Panel', 'Serverless at Scale'],
    checkedIn: false, checkedInAt: null, checkedInBy: null,
  },
];

const UX_WORLD_ATTENDEES: AttendeeData[] = [
  {
    id: 'UX-VIP-11',
    fullName: 'Anya Petrova',
    email: 'anya.p@designlabs.ru',
    ticketType: 'VIP',
    company: 'DesignLabs',
    sessions: ['Opening Keynote', 'Design Systems Deep Dive'],
    checkedIn: false, checkedInAt: null, checkedInBy: null,
  },
  {
    id: 'UX-SPK-12',
    fullName: 'Marcus Delgado',
    email: 'mdelgado@userflow.co',
    ticketType: 'Speaker',
    company: 'UserFlow',
    sessions: ['Opening Keynote', 'Prototyping for Accessibility'],
    checkedIn: false, checkedInAt: null, checkedInBy: null,
  },
  {
    id: 'UX-GEN-13',
    fullName: 'Isabella Rossi',
    email: 'i.rossi@cognitiveux.it',
    ticketType: 'General',
    company: 'CognitiveUX',
    sessions: ['Research Methods Workshop'],
    checkedIn: false, checkedInAt: null, checkedInBy: null,
  },
  {
    id: 'UX-GEN-14',
    fullName: 'Jamal Carter',
    email: 'jamal.c@sprinthq.com',
    ticketType: 'General',
    company: 'SprintHQ',
    sessions: ['Opening Keynote', 'Design Systems Deep Dive'],
    checkedIn: false, checkedInAt: null, checkedInBy: null,
  },
  {
    id: 'UX-SPK-15',
    fullName: 'Nadia Volkov',
    email: 'n.volkov@motioncraft.io',
    ticketType: 'Speaker',
    company: 'MotionCraft',
    sessions: ['Motion & Microinteractions', 'Opening Keynote'],
    checkedIn: false, checkedInAt: null, checkedInBy: null,
  },
  {
    id: 'UX-VIP-16',
    fullName: 'Oliver Kim',
    email: 'oliver.k@usertesting.kr',
    ticketType: 'VIP',
    company: 'UserTesting KR',
    sessions: ['Opening Keynote', 'Research Methods Workshop', 'Design Systems Deep Dive'],
    checkedIn: false, checkedInAt: null, checkedInBy: null,
  },
  {
    id: 'UX-STF-17',
    fullName: 'Sara Johansson',
    email: 'sara.j@nordux.se',
    ticketType: 'Staff',
    company: 'NordUX',
    sessions: [],
    checkedIn: false, checkedInAt: null, checkedInBy: null,
  },
  {
    id: 'UX-GEN-18',
    fullName: 'Kwame Asante',
    email: 'kwame.a@prodcraft.gh',
    ticketType: 'General',
    company: 'ProdCraft',
    sessions: ['Prototyping for Accessibility'],
    checkedIn: false, checkedInAt: null, checkedInBy: null,
  },
  {
    id: 'UX-GEN-19',
    fullName: 'Elena Popescu',
    email: 'elena.p@uxromania.ro',
    ticketType: 'General',
    company: 'UX Romania',
    sessions: ['Research Methods Workshop', 'Motion & Microinteractions'],
    checkedIn: false, checkedInAt: null, checkedInBy: null,
  },
  {
    id: 'UX-VIP-20',
    fullName: 'Ryan Fitzgerald',
    email: 'ryan.f@clearview.ie',
    ticketType: 'VIP',
    company: 'ClearView Design',
    sessions: ['Opening Keynote', 'Design Systems Deep Dive', 'Prototyping for Accessibility'],
    checkedIn: false, checkedInAt: null, checkedInBy: null,
  },
];

async function seedToFirestore() {
  const admin = await import('firebase-admin');
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!admin.default.apps.length) {
    admin.default.initializeApp({
      credential: admin.default.credential.cert({
        projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
        clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
        privateKey,
      }),
    });
  }

  const db = admin.default.firestore();

  for (const event of EVENTS) {
    const attendees =
      event.id === 'tech-summit-2026' ? TECH_SUMMIT_ATTENDEES : UX_WORLD_ATTENDEES;

    console.log(`\n📅 Seeding event to Firestore: ${event.name}`);
    const eventRef = db.collection('events').doc(event.id);
    const { id, ...eventFields } = event;
    await eventRef.set(eventFields);

    const batch = db.batch();
    const attendeesRef = eventRef.collection('attendees');
    for (const attendee of attendees) {
      const docRef = attendeesRef.doc(attendee.id);
      batch.set(docRef, { ...attendee, eventId: event.id });
    }
    await batch.commit();
    console.log(`   ✅ Wrote ${attendees.length} attendees to events/${event.id}/attendees`);
  }
}

function generateHtmlBadges() {
  const allAttendees = [
    { event: EVENTS[0], list: TECH_SUMMIT_ATTENDEES },
    { event: EVENTS[1], list: UX_WORLD_ATTENDEES },
  ];

  let cardsHtml = '';
  for (const group of allAttendees) {
    cardsHtml += `
      <div style="grid-column: 1 / -1; margin-top: 30px; margin-bottom: 10px;">
        <h2 style="color: #6366f1; margin: 0; font-size: 22px;">📅 ${group.event.name}</h2>
        <p style="color: #94a3b8; margin: 4px 0 0; font-size: 14px;">${group.event.date} · ${group.event.venue}</p>
      </div>
    `;

    for (const a of group.list) {
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
        a.id
      )}`;
      const tierColor =
        a.ticketType === 'VIP'
          ? '#eab308'
          : a.ticketType === 'Speaker'
          ? '#a855f7'
          : a.ticketType === 'Staff'
          ? '#3b82f6'
          : '#94a3b8';

      cardsHtml += `
        <div style="background: #1e293b; border: 1px solid #334155; border-radius: 16px; padding: 18px; text-align: center; box-shadow: 0 4px 12px rgba(0,0,0,0.3);">
          <img src="${qrUrl}" alt="${a.id}" style="width: 140px; height: 140px; border-radius: 12px; background: white; padding: 6px; margin: 0 auto 12px; display: block;" />
          <div style="font-family: monospace; font-size: 13px; font-weight: bold; color: #e2e8f0; margin-bottom: 6px;">${a.id}</div>
          <div style="font-size: 16px; font-weight: 700; color: #ffffff;">${a.fullName}</div>
          <div style="font-size: 12px; color: #94a3b8; margin-bottom: 8px;">${a.company}</div>
          <span style="display: inline-block; padding: 3px 10px; border-radius: 9999px; font-size: 11px; font-weight: 700; color: ${tierColor}; border: 1px solid ${tierColor}40; background: ${tierColor}15;">
            ${a.ticketType}
          </span>
        </div>
      `;
    }
  }

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Event Badges — Ready for Scanning</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0f172a; color: #f8fafc; padding: 30px; margin: 0; }
    .container { max-width: 1100px; margin: 0 auto; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div style="text-align: center; margin-bottom: 24px;">
      <h1 style="margin: 0; font-size: 28px;">🎫 Printable & On-Screen Event Badges</h1>
      <p style="color: #94a3b8; margin-top: 8px;">
        Point your phone or webcam at any QR code on this page, or type the Badge ID into the scanner.
      </p>
    </div>
    <div class="grid">
      ${cardsHtml}
    </div>
  </div>
</body>
</html>`;

  const outputPath = path.resolve(__dirname, '../public/demo-badges.html');
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, html, 'utf-8');
  console.log(`\n📄 Generated printable test badges: public/demo-badges.html`);
}

async function main() {
  console.log('🚀 Smart Event Badge Scanner — Seeding\n');

  const hasAdminCreds = Boolean(
    process.env.FIREBASE_ADMIN_PROJECT_ID &&
    process.env.FIREBASE_ADMIN_CLIENT_EMAIL &&
    process.env.FIREBASE_ADMIN_PRIVATE_KEY
  );

  if (hasAdminCreds) {
    console.log('🔐 Firebase Admin credentials found in .env.local.');
    console.log('   Writing events and attendees to Cloud Firestore…');
    await seedToFirestore();
    console.log('\n✅ Firestore cloud seed complete!');
  } else {
    console.log('ℹ️  No Cloud Firebase Admin credentials in .env.local.');
    console.log('   Using built-in local demo mode (20 attendees pre-configured).');
  }

  generateHtmlBadges();

  console.log('\n📋 Ready Test Badges Summary:');
  console.log('───────────────────────────────────────────────────────────────────');
  console.log(' [Tech Summit 2026]');
  for (const a of TECH_SUMMIT_ATTENDEES.slice(0, 5)) {
    console.log(`   ${a.id.padEnd(14)} ${a.fullName.padEnd(20)} [${a.ticketType}]`);
  }
  console.log('   ... and 5 more');
  console.log('\n [UX World 2026]');
  for (const a of UX_WORLD_ATTENDEES.slice(0, 5)) {
    console.log(`   ${a.id.padEnd(14)} ${a.fullName.padEnd(20)} [${a.ticketType}]`);
  }
  console.log('   ... and 5 more');
  console.log('───────────────────────────────────────────────────────────────────');
  console.log('\n💡 You can scan these badges on screen or at: http://localhost:3000/demo-badges.html\n');
}

main().catch((err) => {
  console.error('Seed error:', err);
  process.exit(1);
});
