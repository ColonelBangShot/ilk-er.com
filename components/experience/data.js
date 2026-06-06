// Real career content for İlker DEGE — drives both the 3D scene and the
// scrollable right-hand panel. Coordinates are used by the 3D globe.
// `logo` is a simple-icons slug when an official mark exists, otherwise null
// (a typographic monogram is shown instead).

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
    chips: [],
    halo: null,
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
    chips: [],
    halo: null,
  },
  {
    id: 'career',
    kind: 'career',
    eyebrow: '02 — Career',
    title: 'Career',
    lead: '16 years in luxury & resort hospitality.',
    hotels: [
      { name: 'TUI Blue Maviss', role: 'Front Office Manager', period: '05/2026 — Present', location: 'Antalya, Turkey', brand: 'TUI', status: '5★ · TUI', logo: 'tui', lat: 36.90, lng: 30.70 },
      { name: 'Siam Elegance', role: 'Front Office Manager', period: '2025 — 2026', location: 'Belek, Antalya', brand: 'Independent', status: '5★ · Independent', logo: null, lat: 36.86, lng: 31.05 },
      { name: 'Radisson Blu Kaş', role: 'Front Office Manager', period: '08/2023 — 10/2023', location: 'Kaş, Antalya', brand: 'Radisson', status: '5★ · Radisson', logo: 'radissonhotelgroup', lat: 36.20, lng: 29.64 },
      { name: 'Venezia Palace', role: 'Front Office Manager', period: '07/2021 — 06/2022', location: 'Kundu, Antalya', brand: 'Independent', status: '5★ · Independent', logo: null, lat: 36.86, lng: 30.86 },
      { name: 'Crowne Plaza Antalya', role: 'Front Office Manager', period: '09/2020 — 03/2021', location: 'Antalya, Turkey', brand: 'IHG', status: '5★ · IHG', logo: 'ihg', lat: 36.85, lng: 30.75 },
      { name: 'Avantgarde Hotel & Resort', role: 'Front Office Manager', period: '06/2015 — 06/2018', location: 'Kemer, Antalya', brand: 'Independent', status: '5★ · Independent', logo: null, lat: 36.55, lng: 30.50 },
    ],
    focus: ANTALYA,
    // Antalya pin on the map + hotels orbit as a logo carousel
    get chips() {
      return [
        { lat: ANTALYA.lat, lng: ANTALYA.lng, name: 'Antalya', status: 'Turkey · 16 yrs', logo: null },
        ...this.hotels.map((h) => ({ name: h.name, status: h.status, logo: h.logo })),
      ];
    },
    markers: [],
    halo: { hue: '#c9a14a' },
  },
  {
    id: 'pms',
    kind: 'pms',
    eyebrow: '03 — PMS Systems',
    title: 'Property Management Architecture',
    lead: 'Hotel automation platforms I operate, end to end.',
    systems: [
      { name: 'OPERA PMS', vendor: 'Oracle Hospitality', tag: 'v5.6 · REST API · 2015 – Present', logo: 'oracle' },
      { name: 'ELEKTRAWEB', vendor: 'Elektraweb Software', tag: 'v3.4 · On-Premise · 2021 – 2025', logo: null },
      { name: 'FIDELIO', vendor: 'Micros / Oracle', tag: 'v8.9 · On-Premise · 2010 – 2015', logo: null },
      { name: 'SÉJOUR', vendor: 'Séjour Hospitality', tag: 'v2.1 · Local DB · 2015 – 2020', logo: null },
      { name: 'SEDNA', vendor: 'Sedna Hotel Software', tag: 'Cloud PMS', logo: null },
      { name: 'WEBONI', vendor: 'Weboni', tag: 'Cloud PMS', logo: null },
    ],
    focus: null,
    markers: [],
    // halo carousel: each system orbits the globe with its logo / monogram
    get chips() {
      return this.systems.map((s) => ({ name: s.name, status: s.vendor, logo: s.logo }));
    },
    halo: { hue: '#c9a14a' },
  },
  {
    id: 'ai',
    kind: 'ai',
    eyebrow: '04 — AI Toolchain',
    title: 'Intelligence Stack',
    lead: 'Augmenting hospitality operations with AI.',
    tools: [
      { name: 'Claude', maker: 'Anthropic', role: 'Primary AI Assistant', logo: 'anthropic' },
      { name: 'Gemini', maker: 'Google', role: 'Research & Analysis', logo: 'googlegemini' },
      { name: 'ChatGPT', maker: 'OpenAI', role: 'Code & Content Generation', logo: 'openai' },
      { name: 'Grok', maker: 'X / xAI', role: 'Real-time Intelligence', logo: 'x' },
    ],
    focus: null,
    markers: [],
    get chips() {
      return this.tools.map((t) => ({ name: t.name, status: t.maker, logo: t.logo }));
    },
    halo: { hue: '#e0b86a' },
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
    get chips() {
      return this.langs.map((l) => ({ lat: l.lat, lng: l.lng, name: l.name, status: l.level, mono: l.code, logo: null }));
    },
    markers: [],
    halo: null,
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
    get chips() {
      return [{ lat: ANTALYA.lat, lng: ANTALYA.lng, name: 'Antalya', status: 'GMT+3', logo: null }];
    },
    markers: [],
    halo: null,
  },
];
