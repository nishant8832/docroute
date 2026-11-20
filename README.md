# DocRoute — Peer-to-Peer Smart Document Delivery Platform

> **Tagline:** *Your Document. Your Route. Faster Delivery.*

DocRoute is a peer-to-peer document delivery platform connecting senders who need urgent physical documents transported over long distances with verified individuals already traveling to that destination by train (e.g. Vande Bharat Express, Shatabdi), flights, intercity carpools, or buses.

---

## ⚡ Key Highlights & Core Capabilities

- **7x Faster than Traditional Couriers:** Transforms 48-hour standard courier wait times into 4 to 8 hour same-day deliveries along major intercity corridors (e.g., Delhi ➔ Lucknow, Mumbai ➔ Pune, Delhi ➔ Chandigarh).
- **Three Dedicated User Roles:**
  1. **Sender:** Create consignments, select categories, get AI traveller recommendations, compare ETAs, track live GPS telemetry, inspect digital tamper seals, issue Pickup OTP, and confirm delivery.
  2. **Traveller / Courier:** Submit Government ID KYC verification, post travel routes (mode, train/flight number, capacity, and desired payout), accept delivery requests, verify Pickup OTP at handover, log transit milestones, and receive instant wallet escrow payouts upon Receiver Dropoff OTP verification.
  3. **Operations & Admin Desk:** Platform KPI analytics, live fleet monitor across all Indian corridors, pending KYC verification queue with AI biometric match confidence scores, and chain-of-custody audit logs.
- **Digital Chain-of-Custody & Tamper-Evident Security:**
  - **Pickup OTP:** A 6-digit code held by the sender, validated by the traveller in-app at physical handover.
  - **Dropoff OTP:** A 6-digit code held by the recipient, entered by the traveller to confirm successful handover and automatically release escrow funds.
  - **Tamper Pouch Seal:** Unique alphanumeric barcode and cryptographic seal code (e.g. `SEAL-DEL-LKO-9941-TAMPER-SAFE`).
- **Smart AI Matching & Dynamic Pricing Engine:**
  - Evaluates Route Compatibility (40%), Traveller Trust Score (30%), Transport Speed / Mode (15%), Remaining Baggage Capacity (10%), and Courier Rating (5%).
  - Computes distance-based fares, urgency multipliers, security surcharges, and transparent escrow split (80% Traveller, 15% Platform, 5% Insurance Fund).
- **Interactive Route Visualizer:**
  - Live animated vehicle markers along the transit corridor with real-time progress percentages, estimated arrival times, speed indicators, and milestone checkpoints.
- **Embedded Demo Simulator:**
  - Floating toolbar to test the full lifecycle in seconds: fast-forward pickup OTP, midway telemetry, and destination handover.

---

## 🏗️ Architecture & Technology Stack

- **Frontend:** React 18, TypeScript, Tailwind CSS, Lucide Icons, Canvas Confetti, Web Audio API sound cues, and Vite.
- **Backend API:** Node.js, Express, CORS, RESTful API architecture, JSON state store with pre-seeded real-world Indian commuter routes and verified courier personas.
- **Build & Packaging:** Single unified server serving both the Express REST API and pre-compiled client assets on port 5000, with optional Vite hot-reloading dev server on port 5173.

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (v18 or higher)
- npm or pnpm

### 2. Start the Application

To run the unified server (serves both API & Frontend):
```bash
npm start
```
Open [http://localhost:5000](http://localhost:5000) in your browser.

Or to run in development mode with hot-reloading:
```bash
# Terminal 1: Start Express API
node server/index.js

# Terminal 2: Start Vite Dev Client
npm run dev:frontend
```
Open [http://localhost:5173](http://localhost:5173).

---

## 👥 Demo Personas Pre-Configured

- **Sender:** `Arjun Verma` (Legal Counsel in New Delhi sending urgent writ petition to Lucknow High Court Bench).
- **Traveller 1:** `Vikramaditya Rao` (Verified commuter travelling on Delhi-Lucknow Vande Bharat Express #22436, 99% Trust Score).
- **Traveller 2:** `Priya Sen` (Consultant flying Delhi-Lucknow on IndiGo 6E-204, 98% Trust Score).
- **Traveller 3:** `Rohit Nair` (Commuter on Mumbai-Pune Expressway, 95% Trust Score).
- **Traveller (Pending KYC):** `Karan Mehra` (Bengaluru-Hyderabad commuter awaiting admin KYC verification).
- **Admin:** `DocRoute Operations Command` (Full administrative oversight and KYC approval rights).

Use the persona dropdown in the top-right corner or the role pill switcher in the navigation bar to switch between views anytime.
