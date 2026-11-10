/* ============================================================
   DC — api/bookings.js  (P4 hardening · F10)
   Serverless booking intake for Vercel (zero-config /api dir).

   Replaces the client-side kvdb.io write that shipped in P1–P3:
   - the bucket id no longer ships in the public main JS bundle
     (it remains in admin.html, which needs direct read/write access)
   - server-side validation mirrors and enforces the client rules
   - per-IP rate limit (in-memory, per lambda instance — a documented
     limitation; a durable store would be a P5 candidate)
   - record schema stays byte-compatible with admin.html:
     12 fields, status "Pending", kvdb key prefix "appt_"

   No dependencies. Node 18+ (global fetch).
   ============================================================ */

const KVDB_BUCKET = 'GkHk1msDTVQ5uiHtMJStMn'; // pre-existing public bucket id (P1); rotation is a P5 candidate

const MIN_FILL_MS = 2500;              // time-trap: humans take longer to fill the form
const MAX_FILL_AGE_MS = 86400000;      // reject stale replays older than 24h
const RATE_WINDOW_MS = 3600000;        // 1 hour
const RATE_MAX = 20;                   // POSTs per IP per window (per instance)

const CAPS = { firstName: 60, phone: 20, email: 120, address: 240, notes: 500 };
const SERVICES = ['Essential Clean', 'Premium Detail', 'Elite Detail', 'Ceramic Pro'];
const VEHICLES = ['Hatchback', 'Sedan', 'SUV / MUV', 'Luxury / Exotic', 'Truck / Pickup', 'Van / Traveller', 'Commercial Fleet'];
const PHONE_RE = /^(\+?91[\s\-]?|0)?[6-9]\d{9}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

// ─── per-instance in-memory rate limiter ─────────────────────────────────────
const hits = new Map(); // ip -> [timestamps]
function rateLimited(ip) {
  const now = Date.now();
  if (hits.size > 5000) hits.clear(); // crude memory guard for a demo workload
  const list = (hits.get(ip) || []).filter(t => now - t < RATE_WINDOW_MS);
  if (list.length >= RATE_MAX) { hits.set(ip, list); return true; }
  list.push(now);
  hits.set(ip, list);
  return false;
}

function sanitizeText(v, maxLen) {
  return String(v == null ? '' : v)
    .replace(/[<>`]/g, '')
    .replace(/javascript:/gi, '')
    .trim()
    .slice(0, maxLen);
}

function ipOf(req) {
  const raw = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || 'unknown';
  return String(raw).split(',')[0].trim() || 'unknown';
}

function istToday() {
  // "today" on the business clock (Ahmedabad = UTC+5:30), as YYYY-MM-DD
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date());
}

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  if (rateLimited(ipOf(req))) {
    return res.status(429).json({ ok: false, error: 'Too many requests. Please try again later.' });
  }

  let b;
  try {
    b = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
  } catch (_) {
    return res.status(400).json({ ok: false, error: 'Invalid request body' });
  }

  // ─── bot gates: honeypot + time-trap + staleness ───────────────────────────
  if (String(b.company || '').trim() !== '') {
    return res.status(403).json({ ok: false, error: 'Submission rejected' });
  }
  const openedAt = Number(b.formOpenedAt);
  const age = Date.now() - openedAt;
  if (!Number.isFinite(openedAt) || age < MIN_FILL_MS || age > MAX_FILL_AGE_MS) {
    return res.status(403).json({ ok: false, error: 'Submission rejected' });
  }

  // ─── field validation (mirrors client rules) ───────────────────────────────
  const errors = [];
  const f = {
    firstName: sanitizeText(b.firstName, CAPS.firstName),
    phone: sanitizeText(b.phone, CAPS.phone),
    email: sanitizeText(b.email, CAPS.email),
    vehicleType: sanitizeText(b.vehicleType, 40),
    service: sanitizeText(b.service, 40),
    address: sanitizeText(b.address, CAPS.address),
    preferredDate: sanitizeText(b.preferredDate, 10),
    notes: sanitizeText(b.notes, CAPS.notes)
  };

  if (!f.firstName) errors.push('Name is required.');
  if (!PHONE_RE.test(f.phone.replace(/[\s\-()]/g, ''))) errors.push('Enter a valid Indian mobile number.');
  if (f.email && !EMAIL_RE.test(f.email)) errors.push('Enter a valid email address.');
  if (!VEHICLES.includes(f.vehicleType)) errors.push('Unknown vehicle type.');
  if (!SERVICES.includes(f.service)) errors.push('Unknown service.');
  if (!f.address) errors.push('Address is required.');
  if (!DATE_RE.test(f.preferredDate)) errors.push('Invalid date.');
  else if (f.preferredDate < istToday()) errors.push('Date cannot be in the past.');

  if (errors.length) {
    return res.status(400).json({ ok: false, error: errors[0], errors });
  }

  // ─── build the admin-compatible record ─────────────────────────────────────
  const id = 'APT-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6);
  const record = {
    id: id,
    firstName: f.firstName,
    lastName: '',
    phone: f.phone,
    email: f.email,
    vehicleType: f.vehicleType,
    service: f.service,
    address: f.address,
    preferredDate: f.preferredDate,
    notes: f.notes,
    status: 'Pending',
    createdAt: new Date().toISOString()
  };

  // ─── upstream write (server-side key use only) ─────────────────────────────
  try {
    const ac = new AbortController();
    const timer = setTimeout(() => ac.abort(), 8000);
    const up = await fetch('https://kvdb.io/' + KVDB_BUCKET + '/appt_' + id, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(record),
      signal: ac.signal
    });
    clearTimeout(timer);
    if (!up.ok) throw new Error('upstream ' + up.status);
  } catch (_) {
    return res.status(502).json({ ok: false, error: 'Could not save the booking. Please try again.' });
  }

  return res.status(200).json({ ok: true, id: id });
};
