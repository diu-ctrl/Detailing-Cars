/* ============================================================
   DC — middleware.js  (P5 · F13 real admin auth)
   Edge Middleware: HTTP Basic-Auth gate in front of /admin.html.

   - Credentials come from Vercel env vars when set
     (ADMIN_USER / ADMIN_PASS — recommended), with a build-time
     fallback below so the demo works zero-config.
   - The client-side gate inside admin.html stays in place as a
     second layer; this middleware is the real boundary.
   - Only /admin.html is matched. The public site and
     /api/bookings are untouched.

   Edge runtime: Web APIs only (no Node modules).
   ============================================================ */

const ADMIN_USER = process.env.ADMIN_USER || 'divyaraj';
const ADMIN_PASS = process.env.ADMIN_PASS || 'u6-XZ0xWr9gF_0gjrh7l';

function safeEqual(a, b) {
  const ab = new TextEncoder().encode(a);
  const bb = new TextEncoder().encode(b);
  if (ab.length !== bb.length) return false;
  let diff = 0;
  for (let i = 0; i < ab.length; i++) diff |= ab[i] ^ bb[i];
  return diff === 0;
}

export default function middleware(req) {
  const header = req.headers.get('authorization') || '';
  const expected = 'Basic ' + btoa(ADMIN_USER + ':' + ADMIN_PASS);
  if (!header || !safeEqual(header, expected)) {
    return new Response('Authentication required.', {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="DC Admin", charset="UTF-8"',
        'Cache-Control': 'no-store'
      }
    });
  }
  // authenticated → fall through to the static admin.html
}

export const config = {
  matcher: '/admin.html'
};
