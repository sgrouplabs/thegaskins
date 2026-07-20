/**
 * ItineraryDrawer.tsx
 * Preact client island powering the Itinerary's interactive engine.
 *
 * Responsibilities:
 *  - Track local status state for every shoot, persisted to localStorage.
 *  - Track interactive deliverables checklist state per shoot (unchecked
 *    by default), persisted to localStorage.
 *  - Render the side itinerary drawer: shoot title, vibe, deliverables
 *    checklist (interactive checkboxes), and an interactive status
 *    selector (button row).
 *  - When the user clicks a calendar date, the parent page calls
 *    `drawerRef.open(day)` to reveal the detail panel.
 *  - Changing the status or checking off deliverables reactively updates
 *    the UI and auto-saves to localStorage.
 *
 * Exposed globally on `window.__itinerary__` so the Astro-rendered
 * calendar grid (which is static HTML) can drive the island without
 * needing Preact to own the entire calendar DOM.
 */
import { useEffect, useState, useCallback, useRef } from 'preact/hooks';
import type { Shoot, ShootStatus } from '../../config/site';

type Props = {
  shoots: Shoot[];
  monthLabel: string;
};

const STATUS_ORDER: ShootStatus[] = ['pending', 'filmed', 'edited'];
const STATUS_META: Record<
  ShootStatus,
  { label: string; dot: string; tone: string; ring: string }
> = {
  pending: {
    label: 'Pending',
    dot: 'bg-status-pending',
    tone: 'text-status-pending',
    ring: 'border-status-pending',
  },
  filmed: {
    label: 'Filmed',
    dot: 'bg-status-filmed',
    tone: 'text-status-filmed',
    ring: 'border-status-filmed',
  },
  edited: {
    label: 'Edited',
    dot: 'bg-status-edited',
    tone: 'text-status-edited',
    ring: 'border-status-edited',
  },
};

// Deliverables per shoot — kept here as the schedule's detail contract.
// (The Itinerary detail block must state the deliverables checklist.)
const DELIVERABLES: Record<string, string[]> = {
  s1: ['1x IG Reel', '3 stills', '1 voice memo'],
  s2: ['1x TikTok', '1x IG Reel', '6 stills'],
  s3: ['1x TikTok', '1x IG Reel', '8 B-roll stills'],
  s4: ['1x TikTok', '1x IG Reel', '4 stills'],
};

const STATUS_KEY = 'thegaskins_itinerary_statuses';
const CHECKLIST_KEY = 'thegaskins_itinerary_checklist';

// Load persisted status map, falling back to the data defaults.
function loadStatuses(shoots: Shoot[]): Record<string, ShootStatus> {
  const fallback = Object.fromEntries(shoots.map((s) => [s.id, s.status]));
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(STATUS_KEY);
    if (raw) return { ...fallback, ...JSON.parse(raw) };
  } catch (e) { /* ignore */ }
  return fallback;
}

// Load persisted checklist map. Format: { [shootId]: { [deliverableIndex]: boolean } }
// Defaults to all unchecked (false) for every deliverable of every shoot.
function loadChecklist(shoots: Shoot[]): Record<string, Record<number, boolean>> {
  const fallback: Record<string, Record<number, boolean>> = {};
  shoots.forEach((s) => {
    const dels = DELIVERABLES[s.id] ?? [];
    fallback[s.id] = Object.fromEntries(dels.map((_, i) => [i, false]));
  });
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(CHECKLIST_KEY);
    if (raw) {
      const stored = JSON.parse(raw);
      // Merge stored over defaults so new deliverables start unchecked.
      const merged: Record<string, Record<number, boolean>> = {};
      shoots.forEach((s) => {
        merged[s.id] = { ...fallback[s.id], ...(stored[s.id] ?? {}) };
      });
      return merged;
    }
  } catch (e) { /* ignore */ }
  return fallback;
}

export default function ItineraryDrawer({ shoots, monthLabel }: Props) {
  // Clean frontend state persisted to localStorage.
  const [statuses, setStatuses] = useState<Record<string, ShootStatus>>(() =>
    loadStatuses(shoots)
  );
  // Deliverables checklist — unchecked by default, persisted.
  const [checklist, setChecklist] = useState<Record<string, Record<number, boolean>>>(() =>
    loadChecklist(shoots)
  );
  const [activeId, setActiveId] = useState<string | null>(null);
  const drawerRef = useRef<HTMLElement | null>(null);

  const active = shoots.find((s) => s.id === activeId) ?? null;
  const activeStatus = active ? statuses[active.id] : 'pending';

  // Auto-save status to localStorage.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(STATUS_KEY, JSON.stringify(statuses));
    } catch (e) { /* ignore */ }
  }, [statuses]);

  // Auto-save checklist to localStorage.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(CHECKLIST_KEY, JSON.stringify(checklist));
    } catch (e) { /* ignore */ }
  }, [checklist]);

  // Apply the active status color to the matching calendar cell indicator.
  useEffect(() => {
    shoots.forEach((s) => {
      const cell = document.querySelector(
        `[data-status-cell="${s.id}"]`
      ) as HTMLElement | null;
      if (!cell) return;
      const dot = cell.querySelector('[data-cell-dot]') as HTMLElement | null;
      const meta = STATUS_META[statuses[s.id]];
      if (dot) dot.className = `w-1.5 h-1.5 rounded-full ${meta.dot}`;
      cell.setAttribute('data-current-status', statuses[s.id]);
    });
  }, [statuses, shoots]);

  // Register a global control handle so the static calendar can open the drawer.
  useEffect(() => {
    const control = {
      open: (day: number) => {
        const shoot = shoots.find((s) => s.day === day);
        if (shoot) setActiveId(shoot.id);
      },
      close: () => setActiveId(null),
    };
    (window as any).__itinerary__ = control;
    return () => {
      if ((window as any).__itinerary__ === control) {
        delete (window as any).__itinerary__;
      }
    };
  }, [shoots]);

  // Smooth slide-in when a shoot is selected.
  useEffect(() => {
    if (drawerRef.current) {
      drawerRef.current.classList.toggle('is-open', !!activeId);
    }
  }, [activeId]);

  const setStatus = useCallback(
    (status: ShootStatus) => {
      if (!active) return;
      setStatuses((prev) => ({ ...prev, [active.id]: status }));
    },
    [active]
  );

  const toggleDeliverable = useCallback(
    (deliverableIndex: number) => {
      if (!active) return;
      setChecklist((prev) => ({
        ...prev,
        [active.id]: {
          ...(prev[active.id] ?? {}),
          [deliverableIndex]: !prev[active.id]?.[deliverableIndex],
        },
      }));
    },
    [active]
  );

  // Completion progress for the active shoot's checklist.
  const activeDeliverables = active ? DELIVERABLES[active.id] ?? [] : [];
  const activeCheckedCount = active
    ? activeDeliverables.filter((_, i) => checklist[active.id]?.[i]).length
    : 0;
  const allChecked = activeDeliverables.length > 0 && activeCheckedCount === activeDeliverables.length;

  return (
    <aside
      ref={drawerRef}
      id="itinerary-drawer"
      class="itinerary-drawer surface-card p-6 sm:p-7 self-start sticky top-8"
      aria-live="polite"
    >
      {/* Mobile drag handle indicator */}
      <div class="drawer-drag-handle"></div>

      {active ? (
        <div class="drawer-content animate-fade-rise">
          <div class="flex items-start justify-between gap-4 mb-1">
            <p class="eyebrow">Shoot Brief</p>
            <span class="font-mono text-gold-muted text-sm">
              {active.weekdayLabel} · {active.dateLabel}
            </span>
          </div>
          <h3 class="font-display text-xl sm:text-2xl text-paper-50 leading-tight mt-2">
            {active.title}
          </h3>

          <div class="rule-gold my-5 w-full max-w-[80px]"></div>

          <p class="eyebrow mb-2">Location / Vibe Profile</p>
          <p class="font-serif  text-paper-200 leading-relaxed mb-6">
            {active.vibe}
          </p>

          <p class="eyebrow mb-3">Deliverables Checklist</p>
          <ul class="space-y-2 mb-3">
            {activeDeliverables.map((d, i) => {
              const checked = !!checklist[active.id]?.[i];
              return (
                <li>
                  <button
                    type="button"
                    class="flex items-center gap-3 text-sm sm:text-base text-paper-200 w-full text-left group/del cursor-pointer py-1.5"
                    onClick={() => toggleDeliverable(i)}
                    aria-pressed={checked}
                  >
                    <span
                      class={`w-6 h-6 border rounded-[2px] flex items-center justify-center text-sm transition-all duration-300 shrink-0 ${
                        checked
                          ? 'border-gold-400 bg-gold-400 text-onyx-900'
                          : 'border-veil-500 text-transparent group-hover/del:border-gold-muted'
                      }`}
                    >
                      ✓
                    </span>
                    <span class={checked ? 'line-through text-paper-400' : ''}>
                      {d}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
          {/* Progress indicator */}
          <div class="flex items-center gap-3 mb-7">
            <div class="flex-1 h-[2px] bg-veil-700 rounded-full overflow-hidden">
              <div
                class="h-full bg-gold-400 transition-all duration-500"
                style={`width: ${activeDeliverables.length ? (activeCheckedCount / activeDeliverables.length) * 100 : 0}%;`}
              ></div>
            </div>
            <span class="font-mono text-[0.62rem] text-paper-400 tracking-wide-luxe uppercase">
              {activeCheckedCount}/{activeDeliverables.length}
              {allChecked ? ' · Complete' : ''}
            </span>
          </div>

          {/* Interactive status selector — reactive button row */}
          <p class="eyebrow mb-3">Status</p>
          <div
            class="flex flex-col gap-3"
            role="radiogroup"
            aria-label="Shoot status"
          >
            <div class="flex items-center gap-3">
              <span
                class={`w-2.5 h-2.5 rounded-full ${STATUS_META[activeStatus].dot}`}
              ></span>
              <span
                class={`font-sans tracking-luxe uppercase text-sm ${STATUS_META[activeStatus].tone}`}
              >
                {STATUS_META[activeStatus].label}
              </span>
            </div>

            <div class="grid grid-cols-3 gap-2">
              {STATUS_ORDER.map((st) => {
                const meta = STATUS_META[st];
                const selected = st === activeStatus;
                return (
                  <button
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    data-status={st}
                    class={`status-btn px-3 py-3 sm:py-2.5 border text-xs sm:text-[0.68rem] font-sans tracking-luxe uppercase transition-all duration-300 rounded-[2px] ${
                      selected
                        ? `${meta.ring} ${meta.tone} bg-onyx-800`
                        : 'border-veil-700 text-paper-400 hover:text-paper-100 hover:border-veil-500'
                    }`}
                    onClick={() => setStatus(st)}
                  >
                    {meta.label}
                  </button>
                );
              })}
            </div>
            <p class="text-[0.62rem] text-paper-400 mt-1 tracking-wide-luxe uppercase">
              Changes auto-save · persists across reloads
            </p>
          </div>
        </div>
      ) : (
        <div id="drawer-empty">
          <p class="eyebrow mb-3">Detail</p>
          <h3 class="font-display text-xl sm:text-2xl text-paper-50 leading-tight">
            Select a dated shoot.
          </h3>
          <div class="rule-hair my-5"></div>
          <p class="font-serif  text-paper-300 leading-relaxed">
            Tap any glowing date on the calendar to reveal its shoot brief —
            location, vibe, deliverables, and a live status selector.
          </p>
          <div class="mt-8 grid grid-cols-2 gap-px bg-veil-700 border border-veil-700">
            {shoots.map((s) => (
              <div
                key={s.id}
                class="bg-onyx-900 p-3 text-center"
                data-status-cell={s.id}
              >
                <p class="font-mono text-xs text-gold-muted">
                  {String(s.day).padStart(2, '0')}
                </p>
                <p class="text-[0.6rem] text-paper-400 mt-1 tracking-luxe uppercase">
                  {s.weekdayLabel.slice(0, 3)}
                </p>
              </div>
            ))}
          </div>
          <p class="mt-6 text-[0.62rem] text-paper-400 font-mono tracking-wide-luxe uppercase">
            {monthLabel}
          </p>
        </div>
      )}
    </aside>
  );
}
