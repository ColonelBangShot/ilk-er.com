export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { email, conversation } = req.body;
  if (!email) return res.status(400).json({ error: 'Email required' });

  // Send notification email via Resend (free tier)
  const notifyRes = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.RESEND_API_KEY}`
    },
    body: JSON.stringify({
      from: 'assistant@ilk-er.com',
      to: 'ilkerdege@gmail.com',
      subject: `CV Request from ${email}`,
      html: `
        <h2>New CV Request</h2>
        <p><strong>From:</strong> ${email}</p>
        <hr/>
        <h3>Conversation Summary:</h3>
        <pre style="background:#f5f5f5;padding:12px;font-size:13px;">${conversation || 'No conversation data'}</pre>
        <hr/>
        <p>CV: <a href="https://www.ilk-er.com/ilker_dege_EN.pdf">Download</a></p>
        <p><em>Sent by ilk-er.com assistant</em></p>
      `
    })
  });

  if (notifyRes.ok) {
    res.status(200).json({ ok: true });
  } else {
    const err = await notifyRes.text();
    console.error('Email error:', err);
    res.status(500).json({ error: 'Failed to send notification' });
  }
}
