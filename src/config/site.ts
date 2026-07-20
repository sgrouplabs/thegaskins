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

// ---------------------------------------------------------------------------
// The Itinerary — the monthly filming schedule.
// Exactly four core shoots, spread across two weeks starting Wed July 22, 2026.
// July 2026: day 1 is a Wednesday, 31 days. All weekday math verified.
// ---------------------------------------------------------------------------

export type ShootStatus = 'pending' | 'filmed' | 'edited';

export type Shoot = {
  id: string;
  day: number; // day-of-month (July 2026)
  date: string; // ISO date
  dateLabel: string; // pretty label
  weekdayLabel: string;
  title: string;
  vibe: string;
  status: ShootStatus;
};

export const ITINERARY_MONTH_LABEL = 'July 2026';
// July 1, 2026 is a Wednesday → index 3 (0=Sun ... 6=Sat)
export const ITINERARY_MONTH_STARTS_ON = 3;
export const ITINERARY_MONTH_DAYS = 31;

export const SHOOTS: Shoot[] = [
  {
    id: 's1',
    day: 22,
    date: '2026-07-22',
    dateLabel: 'Jul 22',
    weekdayLabel: 'Wednesday',
    title: 'The Morning Synergy Routine',
    vibe: 'High-End Home Studio',
    status: 'pending',
  },
  {
    id: 's2',
    day: 24,
    date: '2026-07-24',
    dateLabel: 'Jul 24',
    weekdayLabel: 'Friday',
    title: 'The Creative Direction Breakdown',
    vibe: 'Office',
    status: 'pending',
  },
  {
    id: 's3',
    day: 28,
    date: '2026-07-28',
    dateLabel: 'Jul 28',
    weekdayLabel: 'Tuesday',
    title: 'The Premium Asset Vibe Check',
    vibe: 'Outdoor / Exotic Automotive',
    status: 'pending',
  },
  {
    id: 's4',
    day: 31,
    date: '2026-07-31',
    dateLabel: 'Jul 31',
    weekdayLabel: 'Friday',
    title: 'The Shared Boardroom Vision',
    vibe: 'Corporate Luxury Suite',
    status: 'pending',
  },
];

export const STATUS_LABELS: Record<ShootStatus, string> = {
  pending: 'Pending',
  filmed: 'Filmed',
  edited: 'Edited',
};

// "At a Glance" — the next three immediate filming tasks, derived from the
// schedule so the home dashboard always tracks the real itinerary.
export type GlanceTask = {
  id: string;
  title: string;
  vibe: string;
  dateLabel: string;
};

export const GLANCE_TASKS: GlanceTask[] = SHOOTS.slice(0, 3).map((s) => ({
  id: s.id,
  title: s.title,
  vibe: s.vibe,
  dateLabel: `${s.weekdayLabel} · ${s.dateLabel}`,
}));

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
    value: '4',
    unit: 'films',
    note: 'core shoots across two weeks',
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

// ---------------------------------------------------------------------------
// The Vault — curated inspiration references (exact client-provided set).
// ---------------------------------------------------------------------------

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
    title: 'Dayna Bolden',
    url: 'https://www.tiktok.com/@daynabolden',
    category: 'Hooks',
    strategy:
      'Focus on the tight aesthetic transitions from personal morning wellness directly into high-level strategy execution.',
    source: '@daynabolden',
  },
  {
    id: 'v2',
    title: 'Christin Sherise',
    url: 'https://www.tiktok.com/@christinsherise',
    category: 'Aesthetics',
    strategy:
      "Analyze her hyper-clean home aesthetics and relatable lifestyle vlogging pacing.",
    source: '@christinsherise',
  },
  {
    id: 'v3',
    title: 'David Omari',
    url: 'https://www.tiktok.com/@davidomari',
    category: 'Hooks',
    strategy:
      'Study his direct-to-camera authority on monetization and business scaling.',
    source: '@davidomari',
  },
  {
    id: 'v4',
    title: 'Life w Jibran',
    url: 'https://www.tiktok.com/@lifewjibran',
    category: 'Reels',
    strategy:
      "Examine his relatable 'Day in the Life' pacing for modern tech/professional routines.",
    source: '@lifewjibran',
  },
  {
    id: 'v5',
    title: 'GoGo & Mo',
    url: 'https://www.tiktok.com/@gogoandmo',
    category: 'Aesthetics',
    strategy:
      'Examine the balance of dual-frame focus where both partners bring aligned energy to the business narrative.',
    source: '@gogoandmo',
  },
  {
    id: 'v6',
    title: 'Ms. Preschool Owner',
    url: 'https://www.tiktok.com/@ms.preschoolowner',
    category: 'Reels',
    strategy:
      'Note how she breaks down the granular, B2B operational side of running a brick-and-mortar facility.',
    source: '@ms.preschoolowner',
  },
  {
    id: 'v7',
    title: 'Ronne Brown',
    url: 'https://www.instagram.com/ronnebrown/reels/',
    category: 'Reels',
    strategy:
      'Emulate the raw behind-the-scenes cuts—shifting smoothly between high-profile operations and warehouse management.',
    source: '@ronnebrown',
  },
  {
    id: 'v8',
    title: 'DonYe Taylor',
    url: 'https://www.instagram.com/donyetaylor/reels/',
    category: 'Hooks',
    strategy:
      'Analyze how she uses rapid typographic overlays and bold text callouts within the first 3 seconds to command attention.',
    source: '@donyetaylor',
  },
  {
    id: 'v9',
    title: 'Kameron Monet',
    url: 'https://www.instagram.com/kameronmonet/reels/',
    category: 'Reels',
    strategy:
      'Study her flawless voiceovers detailing her corporate-to-creator workflow.',
    source: '@kameronmonet',
  },
  {
    id: 'v10',
    title: 'Detailz Matter',
    url: 'https://www.tiktok.com/@detailz.matter',
    category: 'Aesthetics',
    strategy:
      'Incorporate satisfying, close-up sensory B-roll of premium assets and high-end vehicle maintenance.',
    source: '@detailz.matter',
  },
  {
    id: 'v11',
    title: 'Bliss Auto Detailing',
    url: 'https://www.tiktok.com/@blissautodetailing',
    category: 'Aesthetics',
    strategy:
      "Study the ASMR-style audio hooks and visually satisfying 'before and after' transitions.",
    source: '@blissautodetailing',
  },
];

// ---------------------------------------------------------------------------
// The War Room — Kanban memos (pre-populated strategy blocks).
// ---------------------------------------------------------------------------

export type KanbanStatus = 'raw' | 'refining' | 'ready';
export type Memo = {
  id: string;
  title: string;
  tags: string[];
  summary: string;
  status: KanbanStatus;
};

export const KANBAN_COLUMNS: {
  id: KanbanStatus;
  label: string;
  numeral: string;
}[] = [
  { id: 'raw', label: 'Raw Ideas', numeral: 'I' },
  { id: 'refining', label: 'In Refinement', numeral: 'II' },
  { id: 'ready', label: 'Ready to Film', numeral: 'III' },
];

export const MEMOS: Memo[] = [
  {
    id: 'k1',
    title: 'Morning Synergy — Cold Open Beat',
    tags: ['reel', 'lifestyle'],
    summary:
      'Open on the 5 AM wake at the home studio. Borrow the wellness→strategy transition arc from the Dayna Bolden framework.',
    status: 'raw',
  },
  {
    id: 'k2',
    title: 'Creative Direction Breakdown — Type Hooks',
    tags: ['short', 'direction'],
    summary:
      'Rapid typographic overlays in the first 3 seconds, modelled on the DonYe Taylor reel treatment.',
    status: 'raw',
  },
  {
    id: 'k3',
    title: 'Premium Asset Vibe Check — B-roll Pass',
    tags: ['aesthetic', 'automotive'],
    summary:
      'Close-up sensory B-roll of exotic vehicles. Study Detailz Matter for the elite, detail-oriented standard.',
    status: 'refining',
  },
  {
    id: 'k4',
    title: 'Shared Boardroom Vision — Dual-Frame Test',
    tags: ['direction', 'narrative'],
    summary:
      'Test the dual-frame focus from GoGo & Mo — both partners carrying aligned but distinct energy in the suite.',
    status: 'refining',
  },
  {
    id: 'k5',
    title: 'Transparent Hustle — BTS Cut',
    tags: ['reel', 'bts'],
    summary:
      'Raw warehouse → boardroom cuts in the Ronne Brown style. Script locked, ready to roll on July 31.',
    status: 'ready',
  },
];

// ---------------------------------------------------------------------------
// THE REEL DESK — saved reel links (user-curated, localStorage-backed).
// Seeded with two examples so the filmstrip reads on first visit; the user
// can delete these and add their own via the in-page modal.
// ---------------------------------------------------------------------------
export type SavedReel = {
  id: string;
  url: string;
  title: string;
  note: string;
};

export const SEED_REELS: SavedReel[] = [
  {
    id: 'r1',
    url: 'https://www.tiktok.com/@donyetaylor/video/7250000000000000000',
    title: '3-Second Type Hook Reference',
    note: 'Rapid typographic overlay pattern — study the cadence of the text callouts.',
  },
  {
    id: 'r2',
    url: 'https://www.instagram.com/reel/CxYzAbC1234/',
    title: 'Voiceover Workflow Study',
    note: 'Flawless corporate-to-creator voiceover pacing. Borrow the transition timing.',
  },
];
