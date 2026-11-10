/* ============================================================
   DC — api/bookings.js v2-lite  (P5 · F11 multi-vehicle)

   Changes vs P4 (v1):
   - Bucket: STAYS on the existing kvdb bucket.
     (F12 rotation deferred to P6 — kvdb.io account creation is now
     paywalled ($19) and anonymous bucket creation is rejected.
     process.env.KVDB_BUCKET overrides, if ever set.)
   - F11: accepts an optional `vehicles` array (1..10 entries of
     {vehicleType, service}). Legacy single-vehicle POSTs without
     the array keep working (backward compatible with cached
     clients during rolling deploy). Top-level vehicleType/service
     in the stored record are always derived from vehicles[0].
   - F11: server computes authoritative priceEstimate per vehicle
     and estimateTotal for the booking.
   - Durable per-IP rate limiting via kvdb counter keys on the same
     existing bucket (prefix rl_, excluded from the admin dashboard's
     appt_ list), hashed IPs, fail-open on kvdb errors. In-memory
     limiter kept as the fast path.

   Record schema (admin.html contract):
   { id, firstName, lastName, phone, email, vehicleType, service,
     vehicles[], estimateTotal, address, preferredDate, notes,
     status: "Pending", createdAt }

   No dependencies. Node 18+ (global fetch, crypto).
   ============================================================ */

const crypto = require('crypto');

const KVDB_BUCKET = process.env.KVDB_BUCKET || 'GkHk1msDTVQ5uiHtMJStMn';

const MIN_FILL_MS = 2500;              // time-trap: humans take longer
const MAX_FILL_AGE_MS = 86400000;      // reject stale replays older than 24h
const MEM_WINDOW_MS = 3600000;         // in-memory window: 1 hour
const MEM_MAX = 20;                    // fast path, per instance per IP
const DUR_MAX = 30;                    // durable kvdb-backed limit, per IP per hour
const MAX_VEHICLES = 10;

const CAPS = { firstName: 60, phone: 20, email: 120, address: 240, notes: 500 };
const PRICING = {
  'Essential Clean': {
    'Hatchback': 999,  'Sedan': 1199,  'SUV / MUV': 1299,  'Luxury / Exotic': 1599,
    'Truck / Pickup': 1499, 'Van / Traveller': 1699, 'Commercial Fleet': 899
  },
  'Premium Detail':  {
    'Hatchback': 2499, 'Sedan': 2799,  'SUV / MUV': 3199,  'Luxury / Exotic': 3999,
    'Truck / Pickup': 3499, 'Van / Traveller': 3799,  'Commercial Fleet': 2199
  },
  'Elite Detail':    {
    'Hatchback': 4499, 'Sedan': 4999,  'SUV / MUV': 5499,  'Luxury / Exotic': 6499,
    'Truck / Pickup': 6499, 'Van / Traveller': 6999,  'Commercial Fleet': 3999
  },
  'Ceramic Pro':     {
    'Hatchback': 12999,'Sedan': 13999, 'SUV / MUV': 15999, 'Luxury / Exotic': 19999,
    'Truck / Pickup': 17999,'Van / Traveller': 19999, 'Commercial Fleet': 11499
  }
};
const SERVICES = Object.keys(PRICING);
const VEHICLES = ['Hatchback', 'Sedan', 'SUV / MUV', 'Luxury / Exotic', 'Truck / Pickup', 'Van / Traveller', 'Commercial Fleet'];
const PHONE_RE = /^(\+?91[\s\-]?|0)?[6-9]\d{9}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

// ─── fast path: per-instance in-memory limiter ───────────────────────────────
const hits = new Map();
function memLimited(ip) {
  const now = Date.now();
  if (hits.size > 5000) hits.clear();
  const list = (hits.get(ip) || []).filter(t => now - t < MEM_WINDOW_MS);
  if (list.length >= MEM_MAX) { hits.set(ip, list); return true; }
  list.push(now);
  hits.set(ip, list);
  return false;
}

// ─── durable path: kvdb-backed hourly counter (fail-open) ────────────────────
function hourBucket() {
  const d = new Date();
  const p = n => String(n).padStart(2, '0');
  return '' + d.getUTCFullYear() + p(d.getUTCMonth() + 1) + p(d.getUTCDate()) + p(d.getUTCHours());
}
function ipHash(ip) {
  const day = new Date().getUTCDate();
  return crypto.createHash('sha256').update(ip + '|' + day).digest('hex').slice(0, 10);
}
async function durableLimited(ip) {
  const key = 'rl_' + ipHash(ip) + '_' + hourBucket();
  try {
    const ac = new AbortController();
    const t = setTimeout(() => ac.abort(), 2500);
    const r = await fetch('https://kvdb.io/' + KVDB_BUCKET + '/' + key, { signal: ac.signal });
    clearTimeout(t);
    const cur = r.ok ? (parseInt((await r.text()).trim(), 10) || 0) : 0;
    const next = cur + 1;
    try {
      const ac2 = new AbortController();
      const t2 = setTimeout(() => ac2.abort(), 2500);
      await fetch('https://kvdb.io/' + KVDB_BUCKET + '/' + key, {
        method: 'PUT',
        headers: { 'Content-Type': 'text/plain' },
        body: String(next),
        signal: ac2.signal
      });
      clearTimeout(t2);
    } catch (_) { /* count write lost; next request re-reads */ }
    return next > DUR_MAX;
  } catch (_) {
    return false; // fail-open: kvdb unavailable → in-memory limiter still active
  }
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
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date());
}

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  if (memLimited(ipOf(req))) {
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

  // ─── durable rate limit (counts every POST, incl. invalid ones) ────────────
  if (await durableLimited(ipOf(req))) {
    return res.status(429).json({ ok: false, error: 'Too many requests. Please try again later.' });
  }

  // ─── F11: normalize the vehicle list ───────────────────────────────────────
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

  let vehiclesRaw = Array.isArray(b.vehicles) ? b.vehicles.slice(0, MAX_VEHICLES + 1) : [];
  if (!vehiclesRaw.length) {
    vehiclesRaw = [{ vehicleType: f.vehicleType, service: f.service }]; // legacy single-vehicle contract
  }

  const errors = [];
  const vehicles = [];
  vehiclesRaw.forEach((v, i) => {
    const vt = sanitizeText(v && v.vehicleType, 40);
    const sv = sanitizeText(v && v.service, 40);
    if (!VEHICLES.includes(vt)) { errors.push('Vehicle ' + (i + 1) + ': unknown vehicle type.'); return; }
    if (!SERVICES.includes(sv)) { errors.push('Vehicle ' + (i + 1) + ': unknown service.'); return; }
    vehicles.push({ vehicleType: vt, service: sv, priceEstimate: PRICING[sv][vt] });
  });
  if (vehicles.length > MAX_VEHICLES) errors.push('Maximum ' + MAX_VEHICLES + ' vehicles per booking.');
  if (!vehicles.length && !errors.length) errors.push('At least one vehicle is required.');

  // ─── remaining field validation ────────────────────────────────────────────
  if (!f.firstName) errors.push('Name is required.');
  if (!PHONE_RE.test(f.phone.replace(/[\s\-()]/g, ''))) errors.push('Enter a valid Indian mobile number.');
  if (f.email && !EMAIL_RE.test(f.email)) errors.push('Enter a valid email address.');
  if (!f.address) errors.push('Address is required.');
  if (!DATE_RE.test(f.preferredDate)) errors.push('Invalid date.');
  else if (f.preferredDate < istToday()) errors.push('Date cannot be in the past.');

  if (errors.length) {
    return res.status(400).json({ ok: false, error: errors[0], errors });
  }

  // ─── build the admin-compatible record ─────────────────────────────────────
  const estimateTotal = vehicles.reduce((s, v) => s + v.priceEstimate, 0);
  const id = 'APT-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6);
  const record = {
    id: id,
    firstName: f.firstName,
    lastName: '',
    phone: f.phone,
    email: f.email,
    vehicleType: vehicles[0].vehicleType,   // derived: first vehicle
    service: vehicles[0].service,           // derived: first vehicle
    vehicles: vehicles,
    estimateTotal: estimateTotal,
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

  return res.status(200).json({ ok: true, id: id, estimateTotal: estimateTotal, vehicles: vehicles.length });
};
