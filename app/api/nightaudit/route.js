// app/api/nightaudit/route.js
// Next.js App Router route — ilk-er.com üzerinde Claude proxy (night audit aracı için)
// Vercel ortam değişkenleri: ANTHROPIC_API_KEY, AUDIT_TOKEN

export const maxDuration = 60;

const ALLOWED_MODELS = ['claude-sonnet-4-6', 'claude-haiku-4-5-20251001'];
const MAX_TOKENS_CAP = 4096;
const MAX_BODY_BYTES = 4 * 1024 * 1024;

export async function POST(req) {
    const token = req.headers.get('x-audit-token') || '';
    if (!process.env.AUDIT_TOKEN || token !== process.env.AUDIT_TOKEN) {
          return json({ error: { message: 'Yetkisiz: erişim kodu hatalı' } }, 401);
    }

  const origin = req.headers.get('origin') || '';
    const allowedOrigins = ['https://ilk-er.com', 'https://www.ilk-er.com', 'https://ilk-er-com.vercel.app', 'http://localhost:3000'];
    if (origin && !allowedOrigins.includes(origin)) {
          return json({ error: { message: 'Yetkisiz origin' } }, 403);
    }

  const raw = await req.text();
    if (raw.length > MAX_BODY_BYTES) {
          return json({ error: { message: 'İstek çok büyük (PDF toplamı ~3 MB altında olmalı)' } }, 413);
    }
    let body;
    try { body = JSON.parse(raw); } catch { return json({ error: { message: 'Geçersiz JSON' } }, 400); }

  const payload = {
        model: ALLOWED_MODELS.includes(body.model) ? body.model : ALLOWED_MODELS[0],
        max_tokens: Math.min(Number(body.max_tokens) || 4000, MAX_TOKENS_CAP),
        messages: body.messages,
  };
    if (!Array.isArray(payload.messages) || payload.messages.length === 0) {
          return json({ error: { message: 'messages alanı zorunlu' } }, 400);
    }

  const r = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
                'x-api-key': process.env.ANTHROPIC_API_KEY,
                'anthropic-version': '2023-06-01',
                'content-type': 'application/json',
        },
        body: JSON.stringify(payload),
  });

  const text = await r.text();
    return new Response(text, {
          status: r.status,
          headers: { 'content-type': 'application/json' },
    });
}

function json(obj, status) {
    return new Response(JSON.stringify(obj), { status, headers: { 'content-type': 'application/json' } });
}
