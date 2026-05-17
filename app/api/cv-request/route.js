export const runtime = 'nodejs';

export async function POST(request) {
  try {
    const { email, conversation } = await request.json();
    if (!email) return Response.json({ error: 'Email required' }, { status: 400 });

    const notifyRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'assistant@ilk-er.com',
        to: 'ilkerdege@gmail.com',
        subject: `CV Request from ${email}`,
        html: `
          <h2>New CV Request</h2>
          <p><strong>From:</strong> ${email}</p>
          <hr/>
          <h3>Conversation:</h3>
          <pre style="background:#f5f5f5;padding:12px;font-size:13px;">${conversation || 'No conversation data'}</pre>
          <hr/>
          <p>CV: <a href="https://www.ilk-er.com/ilker_dege_EN.pdf">Download</a></p>
        `,
      }),
    });

    if (notifyRes.ok) {
      return Response.json({ ok: true });
    } else {
      const err = await notifyRes.text();
      console.error('[/api/cv-request] Resend error:', err);
      return Response.json({ error: 'Failed to send' }, { status: 500 });
    }
  } catch (err) {
    console.error('[/api/cv-request]', err);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
