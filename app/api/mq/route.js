// app/api/mq/route.js
// Block Math Quest class backend: picture-password logins, progress sync,
// class leaderboard and the teacher/parent dashboard.
//
// Vercel environment variables:
//   BLOB_READ_WRITE_TOKEN  set automatically when a PRIVATE Blob store is connected to the project
//   MQ_SECRET              long random string, used to sign logins and hash picture passwords
//   MQ_ADMIN_TOKEN         admin key for creating classes and editing class lists
//
// Storage layout (private Blob store):
//   mq/index.json                          list of class codes
//   mq/classes/{CODE}/config.json          { code, name, teacherPin (hash), roster:[{id,name}] }
//   mq/classes/{CODE}/s/{ID}/auth.json     { pic (hash), fails, lockUntil }
//   mq/classes/{CODE}/s/{ID}/progress.json full game state
//   mq/classes/{CODE}/s/{ID}/summary.json  small summary for leaderboard and dashboard

import { put, get, list, del } from '@vercel/blob';
import crypto from 'crypto';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_BODY = 900 * 1024;
const TOKEN_DAYS = 60;
const LOCK_AFTER = 5;
const LOCK_MS = 5 * 60 * 1000;
const PICS = 9;

const P = (...a) => 'mq/' + a.join('/');
const okCode = (c) => typeof c === 'string' && /^[A-Z0-9-]{3,20}$/.test(c);
const okId = (i) => typeof i === 'string' && /^\d{1,3}$/.test(i);
const okPics = (p) => Array.isArray(p) && p.length === 3 && p.every((x) => Number.isInteger(x) && x >= 0 && x < PICS);
const cleanName = (n) => String(n || '').replace(/[<>"'&]/g, '').trim().slice(0, 24);

function hmac(s) {
  return crypto.createHmac('sha256', process.env.MQ_SECRET || '').update(s).digest('hex');
}
function same(a, b) {
  const x = Buffer.from(String(a)), y = Buffer.from(String(b));
  return x.length === y.length && crypto.timingSafeEqual(x, y);
}
function makeToken(code, id) {
  const exp = Date.now() + TOKEN_DAYS * 864e5;
  const body = Buffer.from(`${code}|${id}|${exp}`).toString('base64url');
  return body + '.' + hmac('tok|' + body);
}
function readToken(t) {
  if (typeof t !== 'string' || !t.includes('.')) return null;
  const [body, sig] = t.split('.');
  if (!same(sig, hmac('tok|' + body))) return null;
  const [code, id, exp] = Buffer.from(body, 'base64url').toString().split('|');
  if (!okCode(code) || !okId(id) || Number(exp) < Date.now()) return null;
  return { code, id };
}

async function readJSON(path) {
  try {
    const r = await get(path, { access: 'private', useCache: false });
    if (!r || r.statusCode !== 200) return null;
    return JSON.parse(await new Response(r.stream).text());
  } catch (e) {
    if (String(e && e.message).match(/not.?found/i)) return null;
    throw e;
  }
}
async function writeJSON(path, obj, overwrite = true) {
  await put(path, JSON.stringify(obj), {
    access: 'private',
    contentType: 'application/json',
    addRandomSuffix: false,
    allowOverwrite: overwrite,
    cacheControlMaxAge: 60,
  });
}

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });
const fail = (msg, status = 400) => json({ error: msg }, status);

function originOk(req) {
  const o = req.headers.get('origin') || '';
  if (!o) return true;
  try {
    const h = new URL(o).hostname;
    return h === 'ilk-er.com' || h === 'www.ilk-er.com' || h === 'localhost' || h.endsWith('.vercel.app');
  } catch {
    return false;
  }
}

const boardCache = new Map();

async function summaries(code) {
  const out = [];
  let cursor;
  do {
    const r = await list({ prefix: P('classes', code, 's', ''), cursor, limit: 1000 });
    for (const b of r.blobs) if (b.pathname.endsWith('/summary.json')) out.push(b.pathname);
    cursor = r.hasMore ? r.cursor : undefined;
  } while (cursor);
  const rows = await Promise.all(out.map((p) => readJSON(p).catch(() => null)));
  return rows.filter(Boolean);
}

async function isTeacher(body, code) {
  const admin = process.env.MQ_ADMIN_TOKEN;
  if (admin && body.admin && same(body.admin, admin)) return true;
  if (!body.pin) return false;
  const cfg = await readJSON(P('classes', code, 'config.json'));
  return !!(cfg && cfg.teacherPin && same(cfg.teacherPin, hmac(`tpin|${code}|${body.pin}`)));
}
const isAdmin = (body) => !!(process.env.MQ_ADMIN_TOKEN && body.admin && same(body.admin, process.env.MQ_ADMIN_TOKEN));

export async function POST(req) {
  if (!process.env.MQ_SECRET || !process.env.BLOB_READ_WRITE_TOKEN) return fail('Server is not set up yet (missing MQ_SECRET or Blob store).', 503);
  if (!originOk(req)) return fail('Not allowed', 403);
  const raw = await req.text();
  if (raw.length > MAX_BODY) return fail('Too big', 413);
  let b;
  try { b = JSON.parse(raw); } catch { return fail('Bad JSON'); }
  const code = typeof b.code === 'string' ? b.code.toUpperCase().trim() : '';

  try {
    switch (b.action) {
      // ---------- children ----------
      case 'roster': {
        if (!okCode(code)) return fail('Class code not found', 404);
        const cfg = await readJSON(P('classes', code, 'config.json'));
        if (!cfg) return fail('Class code not found', 404);
        return json({ code, name: cfg.name, students: cfg.roster.map((s) => ({ id: s.id, name: s.name })) });
      }
      case 'who': {
        const id = String(b.id || '');
        if (!okCode(code) || !okId(id)) return fail('Bad request');
        const auth = await readJSON(P('classes', code, 's', id, 'auth.json'));
        return json({ setup: !auth, locked: !!(auth && auth.lockUntil > Date.now()) });
      }
      case 'login':
      case 'setup': {
        const id = String(b.id || '');
        if (!okCode(code) || !okId(id) || !okPics(b.pics)) return fail('Bad request');
        const cfg = await readJSON(P('classes', code, 'config.json'));
        const me = cfg && cfg.roster.find((s) => s.id === id);
        if (!me) return fail('Student not found', 404);
        const authPath = P('classes', code, 's', id, 'auth.json');
        const auth = await readJSON(authPath);
        const picHash = hmac(`pic|${code}|${id}|${b.pics.join(',')}`);
        if (b.action === 'setup') {
          if (auth) return fail('Pictures already chosen', 409);
          try { await writeJSON(authPath, { pic: picHash, fails: 0, lockUntil: 0 }, false); } catch { return fail('Pictures already chosen', 409); }
        } else {
          if (!auth) return json({ setup: true });
          if (auth.lockUntil > Date.now()) return fail('locked', 423);
          if (!same(auth.pic, picHash)) {
            const fails = (auth.fails || 0) + 1;
            await writeJSON(authPath, { ...auth, fails, lockUntil: fails >= LOCK_AFTER ? Date.now() + LOCK_MS : 0 });
            return fail(fails >= LOCK_AFTER ? 'locked' : 'wrong', fails >= LOCK_AFTER ? 423 : 401);
          }
          if (auth.fails) await writeJSON(authPath, { ...auth, fails: 0, lockUntil: 0 });
        }
        const state = await readJSON(P('classes', code, 's', id, 'progress.json'));
        return json({ token: makeToken(code, id), name: me.name, className: cfg.name, state });
      }
      case 'load': {
        const t = readToken(b.token);
        if (!t) return fail('Please log in again', 401);
        return json({ state: await readJSON(P('classes', t.code, 's', t.id, 'progress.json')) });
      }
      case 'save': {
        const t = readToken(b.token);
        if (!t) return fail('Please log in again', 401);
        if (!b.state || typeof b.state !== 'object') return fail('No state');
        const cfg = await readJSON(P('classes', t.code, 'config.json'));
        const me = cfg && cfg.roster.find((s) => s.id === t.id);
        if (!me) return fail('Student not found', 404);
        const s = b.summary && typeof b.summary === 'object' ? b.summary : {};
        const summary = {
          id: t.id, name: me.name, at: Date.now(),
          stars: +s.stars || 0, gems: +s.gems || 0, total: +s.total || 0, week: +s.week || 0, weekRight: +s.weekRight || 0,
          streak: +s.streak || 0, bosses: +s.bosses || 0, lvl1: s.lvl1 ?? null, lvl2: s.lvl2 ?? null, rank: cleanName(s.rank),
          skills: s.skills && typeof s.skills === 'object' ? s.skills : {}, weak: Array.isArray(s.weak) ? s.weak.slice(0, 8).map(String) : [],
          minutesWeek: +s.minutesWeek || 0, realm: +s.realm || 1, passed: +s.passed || 0,
          slow: Array.isArray(s.slow) ? s.slow.slice(0, 8).map(String) : [], pace: s.pace && typeof s.pace === 'object' ? s.pace : {},
        };
        await Promise.all([
          writeJSON(P('classes', t.code, 's', t.id, 'progress.json'), b.state),
          writeJSON(P('classes', t.code, 's', t.id, 'summary.json'), summary),
        ]);
        boardCache.delete(t.code);
        return json({ ok: true, at: summary.at });
      }
      case 'board': {
        const t = readToken(b.token);
        if (!t) return fail('Please log in again', 401);
        const c = boardCache.get(t.code);
        if (c && c.at > Date.now() - 60000) return json({ rows: c.rows, me: t.id });
        const rows = (await summaries(t.code))
          .map((r) => ({ id: r.id, name: r.name, weekRight: r.weekRight, stars: r.stars, bosses: r.bosses, streak: r.streak }))
          .sort((a, b2) => b2.weekRight - a.weekRight || b2.stars - a.stars);
        boardCache.set(t.code, { at: Date.now(), rows });
        return json({ rows, me: t.id });
      }

      // ---------- teacher / parent ----------
      case 'dash': {
        if (!okCode(code)) return fail('Class code not found', 404);
        if (!(await isTeacher(b, code))) return fail('Wrong teacher PIN', 401);
        const cfg = await readJSON(P('classes', code, 'config.json'));
        if (!cfg) return fail('Class code not found', 404);
        const sums = await summaries(code);
        const byId = Object.fromEntries(sums.map((s) => [s.id, s]));
        return json({ code, name: cfg.name, roster: cfg.roster.map((r) => ({ ...r, summary: byId[r.id] || null })) });
      }
      case 'student': {
        const id = String(b.id || '');
        if (!okCode(code) || !okId(id)) return fail('Bad request');
        if (!(await isTeacher(b, code))) return fail('Wrong teacher PIN', 401);
        return json({ state: await readJSON(P('classes', code, 's', id, 'progress.json')) });
      }
      case 'resetPics': {
        const id = String(b.id || '');
        if (!okCode(code) || !okId(id)) return fail('Bad request');
        if (!(await isTeacher(b, code))) return fail('Wrong teacher PIN', 401);
        await del(P('classes', code, 's', id, 'auth.json')).catch(() => {});
        return json({ ok: true });
      }

      // ---------- admin ----------
      case 'classes': {
        if (!isAdmin(b)) return fail('Wrong admin key', 401);
        return json({ classes: (await readJSON(P('index.json'))) || [] });
      }
      case 'saveClass': {
        if (!isAdmin(b)) return fail('Wrong admin key', 401);
        if (!okCode(code)) return fail('Class code: 3 to 20 letters, numbers or dashes');
        const roster = [];
        const seen = new Set();
        for (const r of Array.isArray(b.roster) ? b.roster : []) {
          const id = String(r.id || '').trim(), name = cleanName(r.name);
          if (!okId(id) || !name || seen.has(id)) continue;
          seen.add(id);
          roster.push({ id, name });
        }
        if (!roster.length) return fail('Add at least one student, for example: 7 Recep');
        roster.sort((x, y) => +x.id - +y.id);
        const old = await readJSON(P('classes', code, 'config.json'));
        const cfg = {
          code, name: cleanName(b.name) || code, roster,
          teacherPin: b.teacherPin ? hmac(`tpin|${code}|${String(b.teacherPin)}`) : (old && old.teacherPin) || null,
          updated: Date.now(), created: (old && old.created) || Date.now(),
        };
        await writeJSON(P('classes', code, 'config.json'), cfg);
        const idx = (await readJSON(P('index.json'))) || [];
        if (!idx.find((c) => c.code === code)) idx.push({ code, name: cfg.name });
        else idx.forEach((c) => { if (c.code === code) c.name = cfg.name; });
        await writeJSON(P('index.json'), idx);
        return json({ ok: true, count: roster.length, hasTeacherPin: !!cfg.teacherPin });
      }
      case 'getClass': {
        if (!isAdmin(b)) return fail('Wrong admin key', 401);
        const cfg = await readJSON(P('classes', code, 'config.json'));
        if (!cfg) return fail('Class code not found', 404);
        return json({ code: cfg.code, name: cfg.name, roster: cfg.roster, hasTeacherPin: !!cfg.teacherPin });
      }
      default:
        return fail('Unknown action');
    }
  } catch (e) {
    console.error('mq error', b.action, e);
    return fail('Server error, please try again', 500);
  }
}
