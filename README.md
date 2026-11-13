# Smart Event Badge Scanner

A fast, mobile-friendly web app for event check-in staff. Point any phone camera at an attendee's badge QR code to pull up their profile, check ticket tier, and record their check-in with duplicate prevention.

Works straight out of the box with zero external dependencies in **demo mode**, or connects to **Firebase Firestore** for cloud sync across multiple gates.

---

## What It Does

- **In-Browser QR Scanner**: Uses device camera via WebRTC with an overlay viewfinder and active laser animation. No native app install required.
- **Instant Profile Lookup**: Pulls up name, company, email, ticket tier (VIP, Speaker, Staff, General), and registered breakout sessions.
- **Duplicate Prevention**: Re-scanning an already admitted badge immediately flags a warning with the exact time they entered.
- **Manual Lookup Fallback**: Text box for typing badge IDs directly if a guest's QR code is damaged or unreadable.
- **Multi-Event Support**: Staff can toggle between active events (e.g., *Tech Summit 2026*, *UX World 2026*) on the fly.
- **Staff Auth Guard**: Protected routes with email/password login and a 1-click bypass for local testing.

---

## Tech Stack

- **Framework**: Next.js 16 (App Router) + TypeScript
- **Styling**: Tailwind CSS v4 + Lucide React Icons
- **QR Engine**: `@zxing/browser` (using `BrowserMultiFormatReader`)
- **Backend**: Firebase Firestore & Firebase Auth (with automatic local in-memory fallback)

---

## Getting Started

### 1. Install dependencies
```bash
npm install
```

### 2. Generate local test badges
The project comes with a seeding script that generates 20 realistic attendee records across 2 events and builds a printable HTML test page:
```bash
npm run seed
```
This writes `public/demo-badges.html`, giving you instant QR codes to scan on-screen or print.

### 3. Run the development server
```bash
npm run dev
```
Open **[http://localhost:3001](http://localhost:3001)** (or your local network IP on mobile).

---

## Testing on Mobile (Same Wi-Fi)

Mobile browsers (Safari on iOS and Chrome on Android) require **HTTPS** to grant camera permissions to web pages.

1. Start the dev server (it automatically binds with SSL certs):
   ```bash
   npm run dev
   ```
2. Find your local IP via `ipconfig` (e.g. `192.168.18.9`).
3. Open `https://<YOUR-IP>:3001` on your phone.
4. Accept the self-signed SSL certificate notice in your browser:
   - **iOS Safari**: Tap *Show Details* &rarr; *visit this website*.
   - **Android Chrome**: Tap *Advanced* &rarr; *Proceed*.
5. Tap **One-Click Demo Staff Login** and start scanning badges.

---

## Connecting to Production Firebase (Optional)

To sync check-ins across multiple devices using Google Cloud Firestore:

1. Copy `.env.local.example` to `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```
2. Paste your Firebase project configuration keys:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```
3. Deploy the included security rules:
   ```bash
   firebase deploy --only firestore:rules
   ```

---

## Branching Workflow

- `main` &mdash; Production releases. Protected and stable.
- `dev` &mdash; Active integration branch. All feature work merges here first.
- `feat/*`, `fix/*`, `dep/*` &mdash; Local working branches. Kept local until merged into `dev`.

---

## License

MIT
