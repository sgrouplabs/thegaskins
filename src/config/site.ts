/**
 * The Gaskins — Central data layer.
 * Single source of truth for all dashboard copy and sample content.
 * Components iterate over these exports; no hardcoded content lives in views.
 */

export const BRAND = {
  name: 'The Gaskins',
  tagline: 'Brand Command Center',
  monogram: 'TG',
} as const;

export type NavItem = {
  id: string;
  label: string;
  href: string;
  numeral: string; // editorial roman/number marker
  subtitle: string;
};

export const NAV: NavItem[] = [
  {
    id: 'home',
    label: 'Concierge',
    href: '/',
    numeral: 'I',
    subtitle: 'Welcome',
  },
  {
    id: 'vault',
    label: 'The Vault',
    href: '/vault',
    numeral: 'II',
    subtitle: 'Inspiration Hub',
  },
  {
    id: 'war-room',
    label: 'War Room',
    href: '/war-room',
    numeral: 'III',
    subtitle: 'Memo Board',
  },
  {
    id: 'itinerary',
    label: 'Itinerary',
    href: '/itinerary',
    numeral: 'IV',
    subtitle: 'Filming Schedule',
  },
];

/** Immediate filming tasks shown on the home dashboard. */
export type GlanceTask = {
  id: string;
  title: string;
  vibe: string;
  date: string; // ISO date
  dateLabel: string; // pretty label
};

export const GLANCE_TASKS: GlanceTask[] = [
  {
    id: 'g1',
    title: 'Morning Routine — "Slow Sunday Prep"',
    vibe: 'Home Studio · Natural Light · Casual Luxe',
    date: '2026-07-21',
    dateLabel: 'Tue · Jul 21',
  },
  {
    id: 'g2',
    title: 'Product Story — "The Brushed Gold Edit"',
    vibe: 'Studio B · Tungsten · Editorial',
    date: '2026-07-23',
    dateLabel: 'Thu · Jul 23',
  },
  {
    id: 'g3',
    title: 'Voice Memo — "On Rest as Strategy"',
    vibe: 'Lounge · Candlelight · Intimate',
    date: '2026-07-25',
    dateLabel: 'Sat · Jul 25',
  },
];

export type Metric = {
  id: string;
  label: string;
  value: string;
  unit: string;
  note: string;
};

export const METRICS: Metric[] = [
  {
    id: 'm1',
    label: 'Target Reach',
    value: '420',
    unit: 'K',
    note: 'cumulative monthly impressions',
  },
  {
    id: 'm2',
    label: 'Monthly Deliverables',
    value: '12',
    unit: 'films',
    note: '3 reels · 6 shorts · 3 voice memos',
  },
  {
    id: 'm3',
    label: 'Retention',
    value: '68',
    unit: '%',
    note: 'rolling 30-day watch-through',
  },
  {
    id: 'm4',
    label: 'Engagement',
    value: '4.9',
    unit: '%',
    note: 'avg. per published piece',
  },
];

/** The Vault — inspiration cards. */
export type VaultCategory = 'All' | 'Reels' | 'Hooks' | 'Aesthetics';

export const VAULT_CATEGORIES: VaultCategory[] = [
  'All',
  'Reels',
  'Hooks',
  'Aesthetics',
];

export type VaultCard = {
  id: string;
  title: string;
  url: string;
  category: Exclude<VaultCategory, 'All'>;
  strategy: string;
  source: string;
};

export const VAULT_CARDS: VaultCard[] = [
  {
    id: 'v1',
    title: 'The 3-Second Rule Hook',
    url: 'https://www.instagram.com/reel/example-3sec',
    category: 'Hooks',
    strategy:
      'Study how the first frame is composed before a single word is spoken. The eye lands on the brushed-gold product in negative space — a lesson in staged restraint, not loudness.',
    source: '@editorial.room',
  },
  {
    id: 'v2',
    title: 'Silent Reel, Loud Composition',
    url: 'https://www.tiktok.com/@example/video/silent-comp',
    category: 'Reels',
    strategy:
      'No audio, no captions — the cut drives the rhythm. Useful for the "Slow Sunday Prep" piece where silence itself becomes a luxury signal.',
  },
  {
    id: 'v3',
    title: 'Tungsten as Character',
    url: 'https://www.pinterest.com/pin/example-tungsten',
    category: 'Aesthetics',
    strategy:
      'Lighting is treated like a supporting cast member. Note the warm wrap-around falloff that flatters skin without grading — a model for the Brushed Gold Edit.',
  },
  {
    id: 'v4',
    title: 'The Whisper-to-Shout Arc',
    url: 'https://www.youtube.com/shorts/example-whisper',
    category: 'Hooks',
    strategy:
      'Opens at near-silence and crescendos by second seven. Borrow the pacing curve — not the volume — for the "Rest as Strategy" voice memo.',
  },
  {
    id: 'v5',
    title: 'Negative Space as Logo',
    url: 'https://www.are.na/example/negative-space',
    category: 'Aesthetics',
    strategy:
      'The brand mark is never shown — only implied by where the frame is empty. A clinic in restraint worth re-watching before every shoot.',
  },
  {
    id: 'v6',
    title: 'The One-Take Reel',
    url: 'https://www.instagram.com/reel/example-one-take',
    category: 'Reels',
    strategy:
      'Single locked-off shot, no cuts, no transitions. The discipline of one take forces the subject to carry the piece — exactly the energy the home-studio vignettes need.',
  },
  {
    id: 'v7',
    title: 'Color as a Hook',
    url: 'https://www.behance.net/example/color-hook',
    category: 'Hooks',
    strategy:
      'The first frame is a single dominant hue that resolves into a product reveal. Consider opening the Brushed Gold Edit on pure champagne gold, then pulling focus.',
  },
  {
    id: 'v8',
    title: 'Texture in Motion',
    url: 'https://www.pinterest.com/pin/example-texture',
    category: 'Aesthetics',
    strategy:
      'Fabric, metal, and stone filmed at macro distance. The movement of light across texture reads as luxury without ever saying the word.',
  },
];

/** War Room — Kanban memos. */
export type KanbanStatus = 'raw' | 'refining' | 'ready';
export type Memo = {
  id: string;
  title: string;
  tags: string[];
  summary: string;
  status: KanbanStatus;
};

export const KANBAN_COLUMNS: { id: KanbanStatus; label: string; numeral: string }[] = [
  { id: 'raw', label: 'Raw Ideas', numeral: 'I' },
  { id: 'refining', label: 'In Refinement', numeral: 'II' },
  { id: 'ready', label: 'Ready to Film', numeral: 'III' },
];

export const MEMOS: Memo[] = [
  {
    id: 'k1',
    title: 'Slow Sunday Prep — Part II',
    tags: ['reel', 'lifestyle'],
    summary:
      'Extend the morning ritual series. Add a coffee pour-over beat and a handwritten agenda insert.',
    status: 'raw',
  },
  {
    id: 'k2',
    title: 'The Brushed Gold Edit — BTS',
    tags: ['short', 'product'],
    summary:
      'Behind-the-scenes cut for the product story. Cover the lighting setup and the single-take philosophy.',
    status: 'raw',
  },
  {
    id: 'k3',
    title: 'Voice Memo: On Rest as Strategy',
    tags: ['audio', 'monologue'],
    summary:
      'Three-minute voice memo on deliberate rest. Candlelight backdrop, single close-up.',
    status: 'refining',
  },
  {
    id: 'k4',
    title: 'Wardrobe Capsule — Three Pieces',
    tags: ['aesthetic', 'wardrobe'],
    summary:
      'Three garments, one chair, natural light. Test the negative-space-as-logo approach.',
    status: 'refining',
  },
  {
    id: 'k5',
    title: 'The Whisper-to-Shout Arc — Teaser',
    tags: ['hook', 'short'],
    summary:
      'Tease the new series with the seven-second crescendo. Final script locked.',
    status: 'ready',
  },
  {
    id: 'k6',
    title: 'Evening Light, Empty Room',
    tags: ['reel', 'mood'],
    summary:
      'Locked-off shot of an empty studio as the sun sets. Scored, captioned, and ready to roll.',
    status: 'ready',
  },
];

/** Itinerary — monthly filming schedule. */
export type ShootStatus = 'pending' | 'filmed' | 'edited';
export type Shoot = {
  id: string;
  day: number; // day of current month
  title: string;
  vibe: string;
  deliverables: string[];
  status: ShootStatus;
};

export const ITINERARY_YEAR = 2026;
export const ITINERARY_MONTH = 6; // July (0-indexed in JS, but we treat 1-12 here)
export const ITINERARY_MONTH_LABEL = 'July 2026';
// July 2026 starts on a Wednesday (2026-07-01)
export const ITINERARY_MONTH_STARTS_ON = 3; // 0=Sun ... 6=Sat
export const ITINERARY_MONTH_DAYS = 31;

export const SHOOTS: Shoot[] = [
  {
    id: 's1',
    day: 3,
    title: 'Morning Routine — "Slow Sunday Prep"',
    vibe: 'Home Studio · Natural Light · Casual Luxe',
    deliverables: ['1 reel (60s)', '3 stills', '1 voice memo'],
    status: 'filmed',
  },
  {
    id: 's2',
    day: 7,
    title: 'Wardrobe Capsule — Three Pieces',
    vibe: 'Lounge · Soft Tungsten · Editorial',
    deliverables: ['1 short (45s)', '6 stills'],
    status: 'edited',
  },
  {
    id: 's3',
    day: 11,
    title: 'Voice Memo — "On Rest as Strategy"',
    vibe: 'Lounge · Candlelight · Intimate',
    deliverables: ['1 voice memo (3m)'],
    status: 'pending',
  },
  {
    id: 's4',
    day: 15,
    title: 'Product Story — "The Brushed Gold Edit"',
    vibe: 'Studio B · Tungsten · Editorial',
    deliverables: ['1 short (90s)', '8 stills', '1 BTS clip'],
    status: 'pending',
  },
  {
    id: 's5',
    day: 21,
    title: 'Morning Routine — "Slow Sunday Prep"',
    vibe: 'Home Studio · Natural Light · Casual Luxe',
    deliverables: ['1 reel (60s)', '3 stills'],
    status: 'pending',
  },
  {
    id: 's6',
    day: 23,
    title: 'The Brushed Gold Edit — BTS',
    vibe: 'Studio B · Tungsten · Behind the Scenes',
    deliverables: ['1 short (30s)'],
    status: 'pending',
  },
  {
    id: 's7',
    day: 25,
    title: 'Voice Memo — "On Rest as Strategy"',
    vibe: 'Lounge · Candlelight · Intimate',
    deliverables: ['1 voice memo (3m)'],
    status: 'pending',
  },
  {
    id: 's8',
    day: 29,
    title: 'Evening Light, Empty Room',
    vibe: 'Studio A · Sunset · Mood Piece',
    deliverables: ['1 reel (45s)', '4 stills'],
    status: 'pending',
  },
];

export const STATUS_LABELS: Record<ShootStatus, string> = {
  pending: 'Pending',
  filmed: 'Filmed',
  edited: 'Edited',
};
