// Real career content for İlker DEGE — drives both the 3D scene and the
// scrollable right-hand panel. Coordinates are used by the 3D globe.

export const ANTALYA = { lat: 36.8969, lng: 30.7133 };

export const SECTIONS = [
  {
    id: 'intro',
    kind: 'intro',
    eyebrow: 'Front Office Manager',
    title: 'İlker DEGE',
    lead: '25+ years shaping guest experience across luxury & resort hospitality.',
    meta: 'TR · EN · DE · RU — Antalya, Turkey',
    focus: null,
    markers: [],
    ring: null,
  },
  {
    id: 'philosophy',
    kind: 'quote',
    eyebrow: '01 — Philosophy',
    quote:
      'Excellence is not a destination — it is the standard from which every guest interaction is measured.',
    stats: [
      { v: '95%', l: 'Guest Satisfaction', d: 'Consistent TripAdvisor top-tier ratings' },
      { v: '+20%', l: 'RevPAR Growth', d: 'Average across managed properties' },
      { v: '−30%', l: 'Check-in Time', d: 'Process re-engineering with Opera PMS' },
      { v: '−30%', l: 'Staff Turnover', d: 'Culture & mentorship programme' },
    ],
    focus: null,
    markers: [],
    ring: null,
  },
  {
    id: 'career',
    kind: 'career',
    eyebrow: '02 — Career',
    title: 'Career',
    lead: '16 years in luxury & resort hospitality.',
    hotels: [
      { name: 'TUI Blue Maviss', role: 'Front Office Manager', period: '05/2026 — Present', location: 'Antalya, Turkey', brand: 'TUI' },
      { name: 'Siam Elegance', role: 'Front Office Manager', period: '2025 — 2026', location: 'Antalya, Turkey', brand: 'Independent' },
      { name: 'Radisson Blu Kaş', role: 'Front Office Manager', period: '08/2023 — 10/2023', location: 'Antalya, Turkey', brand: 'Radisson' },
      { name: 'Venezia Palace', role: 'Front Office Manager', period: '07/2021 — 06/2022', location: 'Antalya, Turkey', brand: 'Independent' },
      { name: 'Crowne Plaza Antalya', role: 'Front Office Manager', period: '09/2020 — 03/2021', location: 'Antalya, Turkey', brand: 'IHG' },
      { name: 'Avantgarde Hotel & Resort', role: 'Front Office Manager', period: '06/2015 — 06/2018', location: 'Antalya, Turkey', brand: 'Independent' },
    ],
    focus: ANTALYA,
    markers: [{ ...ANTALYA, label: 'Antalya', primary: true }],
    ring: null,
  },
  {
    id: 'pms',
    kind: 'pms',
    eyebrow: '03 — PMS Systems',
    title: 'Property Management Architecture',
    lead: 'Hotel automation platforms operated across four hotel generations.',
    systems: [
      { name: 'OPERA PMS', vendor: 'Oracle Hospitality', version: 'v5.6 · REST API', years: '2015 – Present' },
      { name: 'ELEKTRAWEB', vendor: 'Elektraweb Software', version: 'v3.4 · On-Premise', years: '2021 – 2025' },
      { name: 'FIDELIO', vendor: 'Micros / Oracle', version: 'v8.9 · On-Premise', years: '2010 – 2015' },
      { name: 'SÉJOUR', vendor: 'Séjour Hospitality', version: 'v2.1 · Local DB', years: '2015 – 2020' },
    ],
    focus: null,
    markers: [],
    ring: { count: 4, hue: '#c9a14a' },
  },
  {
    id: 'ai',
    kind: 'ai',
    eyebrow: '04 — AI Toolchain',
    title: 'Intelligence Stack',
    lead: 'Augmenting hospitality operations with AI.',
    tools: [
      { name: 'Claude', maker: 'Anthropic', role: 'Primary AI Assistant' },
      { name: 'Gemini', maker: 'Google', role: 'Research & Analysis' },
      { name: 'ChatGPT', maker: 'OpenAI', role: 'Code & Content Generation' },
      { name: 'Grok', maker: 'X / xAI', role: 'Real-time Intelligence' },
    ],
    focus: null,
    markers: [],
    ring: { count: 4, hue: '#e0b86a' },
  },
  {
    id: 'languages',
    kind: 'languages',
    eyebrow: '05 — Languages',
    title: 'Multilingual Communication',
    langs: [
      { code: 'TR', name: 'Turkish', level: 'Native', pct: 100, lat: 39.0, lng: 35.0 },
      { code: 'EN', name: 'English', level: 'Advanced', pct: 88, lat: 51.5074, lng: -0.1278 },
      { code: 'DE', name: 'German', level: 'Professional', pct: 75, lat: 52.52, lng: 13.405 },
      { code: 'RU', name: 'Russian', level: 'Elementary', pct: 35, lat: 55.7558, lng: 37.6173 },
    ],
    focus: { lat: 46, lng: 22 },
    get markers() {
      return this.langs.map((l) => ({ lat: l.lat, lng: l.lng, label: l.code, primary: l.pct >= 80 }));
    },
    ring: null,
  },
  {
    id: 'contact',
    kind: 'contact',
    eyebrow: '06 — Contact',
    title: 'Speak with my assistant.',
    lead: 'My AI assistant is available 24/7 to answer questions about my experience, share my CV, or schedule a conversation.',
    email: 'ilker@ilk-er.com',
    meta: 'Antalya, Turkey · GMT+3 · CV available via assistant',
    focus: ANTALYA,
    markers: [{ ...ANTALYA, label: 'Antalya', primary: true }],
    ring: null,
  },
];
