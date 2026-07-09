// app/api/nightaudit/route.js
// Next.js App Router route — ilk-er.com üzerinde Claude proxy (night audit aracı için)
//
// Vercel ortam değişkenleri (Project Settings → Environment Variables):
//   ANTHROPIC_API_KEY = sk-ant-...        (Anthropic anahtarınız — asla client'a inmez)
//   AUDIT_TOKEN       = uzun-rastgele-pin (aracı açanların gireceği erişim kodu)
//
// Pages Router kullanıyorsanız: bu dosyayı pages/api/nightaudit.js yapıp
// alttaki App Router export'u yerine "export default async function handler(req,res)"
// kalıbına çevirin — mantık aynı.

export const maxDuration = 60; // Vercel: uzun PDF analizleri için süre limiti (Pro planda 60 sn)

const ALLOWED_MODELS = ['claude-sonnet-4-6', 'claude-haiku-4-5-20251001'];
const MAX_TOKENS_CAP = 6000;
const MAX_BODY_BYTES = 4 * 1024 * 1024; // Vercel serverless gövde limiti ~4.5MB, güvenli pay

export async function POST(req) {
  // ---- 1) Erişim token kontrolü ----
  const token = req.headers.get('x-audit-token') || '';
  if (!process.env.AUDIT_TOKEN || token !== process.env.AUDIT_TOKEN) {
    return json({ error: { message: 'Yetkisiz: erişim kodu hatalı' } }, 401);
  }

  // ---- 2) Origin kontrolü (yalnızca kendi siteniz) ----
  const origin = req.headers.get('origin') || '';
  const allowedOrigins = ['https://ilk-er.com', 'https://www.ilk-er.com', 'http://localhost:3000'];
  if (origin && !allowedOrigins.includes(origin)) {
    return json({ error: { message: 'Yetkisiz origin' } }, 403);
  }

  // ---- 3) Gövde boyutu ve şema kontrolü ----
  const raw = await req.text();
  if (raw.length > MAX_BODY_BYTES) {
    return json({ error: { message: 'İstek çok büyük (PDF toplamı ~3 MB altında olmalı)' } }, 413);
  }
  let body;
  try { body = JSON.parse(raw); } catch { return json({ error: { message: 'Geçersiz JSON' } }, 400); }

  // ---- 4) Sunucu tarafı sabitleme: model, max_tokens ve tools client'a bırakılmaz ----
  // web_search: TCMB günlük kurunu doğrulamak için (para birimi çakışması durumunda) —
  // model kur uydurmak yerine gerçek TCMB kaydını arar.
  const payload = {
    model: ALLOWED_MODELS.includes(body.model) ? body.model : ALLOWED_MODELS[0],
    max_tokens: Math.min(Number(body.max_tokens) || 4000, MAX_TOKENS_CAP),
    messages: body.messages,
    tools: [{ type: 'web_search_20250305', name: 'web_search', max_uses: 3 }],
  };
  if (!Array.isArray(payload.messages) || payload.messages.length === 0) {
    return json({ error: { message: 'messages alanı zorunlu' } }, 400);
  }

  // ---- 5) Anthropic'e ilet ----
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
