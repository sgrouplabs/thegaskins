/**
 * ReelDesk.tsx
 * Preact client island powering "The Reel Desk" in The Vault.
 *
 * A horizontal filmstrip of saved reel links the user can curate themselves.
 * Creative concept: a "35mm filmstrip" metaphor — each saved reel is a frame
 * on the strip, with sprocket-hole perforations top and bottom, a play-glyph
 * thumbnail, and a short note. Hovering reveals the full URL and a delete
 * control. New reels are added via a luxury modal overlay (matching the
 * War Room's modal language) — the user pastes a reel URL, gives it a title
 * and an optional note, and it appends to the strip instantly.
 *
 * State is persisted to localStorage so the curated filmstrip survives
 * reloads. Seeded with two example reels on first visit (cleared if the
 * user deletes them all).
 *
 * Accessibility: all interactive controls are 32px+ touch targets with
 * high-contrast icons, consistent with the War Room modal standard.
 */
import { useState, useEffect } from 'preact/hooks';
import type { SavedReel } from '../config/site';

type Props = {
  seedReels: SavedReel[];
};

const STORAGE_KEY = 'thegaskins_reel_desk';

// ---------------------------------------------------------------------------
// localStorage helpers
// ---------------------------------------------------------------------------
function loadReels(seed: SavedReel[]): SavedReel[] {
  if (typeof window === 'undefined') return seed;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    // fall through to seed
  }
  return seed;
}

function saveReels(reels: SavedReel[]) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(reels));
  } catch (e) {
    // storage full or disabled — fail silently
  }
}

// ---------------------------------------------------------------------------
// Platform detection — derive a marker + handle + tint from any reel URL.
// ---------------------------------------------------------------------------
type ReelPlatform = {
  label: string;
  mark: string;
  handle: string;
  tint: string; // radial gradient tint for the thumbnail
};

function detectPlatform(url: string): ReelPlatform {
  const u = url.toLowerCase();
  if (u.includes('instagram.com')) {
    const handle = extractHandle(url, 'instagram');
    return {
      label: 'Instagram',
      mark: 'IG',
      handle: handle || 'instagram reel',
      tint: 'rgba(212,175,55,0.18)',
    };
  }
  if (u.includes('tiktok.com')) {
    const handle = extractHandle(url, 'tiktok');
    return {
      label: 'TikTok',
      mark: 'TT',
      handle: handle || 'tiktok reel',
      tint: 'rgba(159,176,196,0.18)',
    };
  }
  if (u.includes('youtube.com') || u.includes('youtu.be')) {
    const handle = extractHandle(url, 'youtube');
    return {
      label: 'YouTube',
      mark: 'YT',
      handle: handle || 'youtube reel',
      tint: 'rgba(200,90,90,0.18)',
    };
  }
  return {
    label: 'Reel',
    mark: '▶',
    handle: extractHandle(url) || 'external reel',
    tint: 'rgba(180,180,180,0.14)',
  };
}

function extractHandle(url: string, platform?: string): string | null {
  try {
    const path = new URL(url).pathname.replace(/^\/+|\/+$/g, '');
    if (!path) return null;
    if (platform === 'instagram' && path.startsWith('reel')) {
      // /reel/CxYzAbC1234/ → return the shortcode
      return path.split('/')[1] || path;
    }
    // Return the first meaningful segment.
    return path.split('/')[0];
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
type ModalDraft = { url: string; title: string; note: string };
const emptyDraft: ModalDraft = { url: '', title: '', note: '' };

export default function ReelDesk({ seedReels }: Props) {
  const [reels, setReels] = useState<SavedReel[]>(() => loadReels(seedReels));
  const [modal, setModal] = useState<ModalDraft | null>(null);
  const [savedFlash, setSavedFlash] = useState(false);

  // Auto-save
  useEffect(() => {
    saveReels(reels);
  }, [reels]);

  // Save flash
  useEffect(() => {
    setSavedFlash(true);
    const t = setTimeout(() => setSavedFlash(false), 1200);
    return () => clearTimeout(t);
  }, [reels]);

  // ESC closes modal
  useEffect(() => {
    if (!modal) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setModal(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [modal]);

  const openAddModal = () => setModal({ ...emptyDraft });

  const closeModal = () => setModal(null);

  const commitModal = () => {
    if (!modal) return;
    const url = modal.url.trim();
    if (!url) return; // require a URL
    // Basic URL normalization — prepend https:// if the user omitted scheme.
    const normalized = /^https?:\/\//i.test(url) ? url : `https://${url}`;
    const id = `r${Date.now()}`;
    const reel: SavedReel = {
      id,
      url: normalized,
      title: modal.title.trim() || 'Untitled Reel',
      note: modal.note.trim(),
    };
    setReels((prev) => [...prev, reel]);
    setModal(null);
  };

  const deleteReel = (id: string) => {
    setReels((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <section class="reel-desk">
      {/* Section header — stacks on mobile */}
      <div class="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
        <div>
          <p class="eyebrow text-gold-muted">The Reel Desk</p>
          <h2 class="font-display text-2xl sm:text-3xl text-paper-50 mt-1 leading-tight">
            Saved Reels
          </h2>
          <p class="font-serif text-paper-300 text-sm sm:text-base mt-2 max-w-xl leading-relaxed">
            Pin the reels worth studying. Each frame holds a link and a note —
            your personal filmstrip of reference work.
          </p>
        </div>
        <div class="flex items-center gap-4 shrink-0">
          <span
            class={`font-mono text-[0.6rem] tracking-wide-luxe uppercase transition-opacity duration-500 ${
              savedFlash ? 'text-gold-300 opacity-100' : 'text-paper-400 opacity-0'
            }`}
          >
            ✓ Saved
          </span>
          <button
            type="button"
            class="flex items-center gap-2 text-[0.7rem] font-mono tracking-wide-luxe uppercase text-[#1f1d1a] bg-gold-400 hover:bg-gold-300 px-4 py-2.5 rounded-[3px] transition-colors duration-300 font-semibold shrink-0"
            onClick={openAddModal}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
              stroke-linecap="round"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add Reel
          </button>
        </div>
      </div>

      {/* Filmstrip — horizontal scroll of reel frames */}
      {reels.length === 0 ? (
        <div class="border border-dashed border-veil-600 rounded-[3px] py-14 px-6 text-center">
          <p class="font-serif text-paper-400 text-lg">
            The filmstrip is empty.
          </p>
          <p class="font-mono text-[0.65rem] tracking-wide-luxe uppercase text-paper-500 mt-2">
            Click "Add Reel" to pin your first reference
          </p>
        </div>
      ) : (
        <div class="relative -mx-2 px-2">
          {/* Sprocket perforations — top rail */}
          <div class="reel-sprockets-top pointer-events-none absolute top-0 left-0 right-0 flex justify-between px-3 z-10">
            {Array.from({ length: 24 }).map((_, i) => (
              <span class="reel-sprocket" style={`background:#0a0a0a;`}></span>
            ))}
          </div>
          {/* Sprocket perforations — bottom rail */}
          <div class="reel-sprockets-bottom pointer-events-none absolute bottom-0 left-0 right-0 flex justify-between px-3 z-10">
            {Array.from({ length: 24 }).map((_, i) => (
              <span class="reel-sprocket" style={`background:#0a0a0a;`}></span>
            ))}
          </div>

          <div class="reel-strip flex gap-4 overflow-x-auto py-6 px-2">
            {reels.map((reel) => (
              <ReelFrame
                key={reel.id}
                reel={reel}
                onDelete={() => deleteReel(reel.id)}
              />
            ))}

            {/* Add tile at end of strip */}
            <button
              type="button"
              class="reel-frame-add flex flex-col items-center justify-center shrink-0"
              onClick={openAddModal}
              aria-label="Add a new reel to the filmstrip"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
                class="text-gold-muted"
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              <span class="font-mono text-[0.6rem] tracking-wide-luxe uppercase text-gold-muted mt-3">
                Add Frame
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Luxury modal overlay for adding a reel */}
      {modal && (
        <ReelModal
          draft={modal}
          onDraftChange={setModal}
          onSave={commitModal}
          onClose={closeModal}
        />
      )}
    </section>
  );
}

// ---------------------------------------------------------------------------
// ReelFrame — a single filmstrip frame.
// ---------------------------------------------------------------------------
function ReelFrame({
  reel,
  onDelete,
}: {
  reel: SavedReel;
  onDelete: () => void;
}) {
  const platform = detectPlatform(reel.url);
  const monogram = reel.title
    .replace(/[^A-Za-z\s]/g, '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase() || '◉';

  // Avatar src — base-path aware for the /tg subpath deployment.
  const rawBase = import.meta.env.BASE_URL as string;
  const baseUrl = rawBase.endsWith('/') ? rawBase : `${rawBase}/`;
  const avatarSrc = reel.avatar
    ? `${baseUrl}${reel.avatar.replace(/^\//, '')}`
    : null;
  const [imgError, setImgError] = useState(false);
  const showAvatar = avatarSrc && !imgError;

  return (
    <article class="reel-frame group relative shrink-0 flex flex-col">
      {/* Thumbnail — avatar + play glyph + platform marker */}
      <a
        href={reel.url}
        target="_blank"
        rel="noopener noreferrer"
        class="reel-thumb relative block aspect-[9/16] w-[150px] overflow-hidden"
        aria-label={`Open reel: ${reel.title}`}
      >
        {/* Layered gradient base */}
        <div
          class="absolute inset-0"
          style={`background:
            radial-gradient(120% 90% at 50% 12%, ${platform.tint}, transparent 60%),
            radial-gradient(80% 60% at 50% 88%, rgba(245,245,247,0.05), transparent 55%),
            linear-gradient(180deg, #1a1a1d 0%, #121214 55%, #0e0e10 100%);
          `}
        ></div>

        {/* Avatar as a full-bleed cover image (when available) */}
        {showAvatar && (
          <img
            src={avatarSrc}
            alt={`${reel.title} thumbnail`}
            loading="lazy"
            decoding="async"
            class="absolute inset-0 h-full w-full object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-500"
            onError={() => setImgError(true)}
          />
        )}
        {/* Darkening overlay so the platform marker + play glyph read on top */}
        {showAvatar && (
          <div class="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/55 pointer-events-none"></div>
        )}

        {/* Top: platform marker */}
        <div class="absolute top-2 left-2 right-2 flex items-center justify-between">
          <span class="font-mono text-[0.55rem] tracking-wide-luxe uppercase text-paper-100 border border-gold-500/30 px-1.5 py-0.5 backdrop-blur-sm">
            {platform.label}
          </span>
          <span class="font-mono text-[0.55rem] tracking-wide-luxe uppercase text-paper-400">
            {platform.mark}
          </span>
        </div>

        {/* Center: monogram crest (fallback) + play glyph overlay */}
        <div class="absolute inset-0 flex flex-col items-center justify-center gap-2">
          {!showAvatar && (
            <div
              class="flex h-12 w-12 items-center justify-center border border-gold-500/25 font-display text-base tracking-luxe text-paper-100 group-hover:border-gold-400/60 transition-colors duration-500"
              style="background: linear-gradient(160deg, rgba(255,255,255,0.03), rgba(0,0,0,0.2));"
            >
              {monogram}
            </div>
          )}
          {/* Play glyph */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="text-gold-300/70 group-hover:text-gold-300 transition-colors duration-500"
          >
            <circle cx="12" cy="12" r="10" />
            <polygon points="10 8 16 12 10 16 10 8" fill="currentColor" stroke="none" />
          </svg>
        </div>

        {/* Bottom: handle */}
        <div class="absolute bottom-2 left-2 right-2">
          <p class="font-mono text-[0.58rem] text-paper-300 truncate text-center">
            {platform.handle}
          </p>
        </div>

        {/* Hairline frame */}
        <div class="absolute inset-0 border border-white/[0.04] pointer-events-none"></div>
      </a>

      {/* Caption — title + note + delete control */}
      <div class="reel-caption mt-3 w-[150px]">
        <div class="flex items-start justify-between gap-2">
          <h3 class="font-display text-[0.95rem] leading-tight text-paper-50 flex-1">
            {reel.title}
          </h3>
          {/* Delete — 32px touch target, high contrast */}
          <button
            type="button"
            class="flex items-center justify-center h-8 w-8 rounded-[3px] text-[#a02828] bg-[#f0d8d0]/90 hover:bg-[#e0b0a0] transition-colors duration-200 border border-[#c98888] shrink-0"
            onClick={onDelete}
            aria-label={`Delete reel: ${reel.title}`}
            title="Delete reel"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.2"
              stroke-linecap="round"
            >
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
          </button>
        </div>
        {reel.note && (
          <p class="font-serif text-[0.78rem] leading-snug text-paper-300 mt-2">
            {reel.note}
          </p>
        )}
        <a
          href={reel.url}
          target="_blank"
          rel="noopener noreferrer"
          class="block mt-2 font-mono text-[0.58rem] text-paper-400 hover:text-gold-300 transition-colors duration-300 truncate"
          title={reel.url}
        >
          ↗ {reel.url.replace(/^https?:\/\//, '')}
        </a>
      </div>
    </article>
  );
}

// ---------------------------------------------------------------------------
// ReelModal — luxury modal overlay for adding a reel.
// ---------------------------------------------------------------------------
function ReelModal({
  draft,
  onDraftChange,
  onSave,
  onClose,
}: {
  draft: ModalDraft;
  onDraftChange: (d: ModalDraft) => void;
  onSave: () => void;
  onClose: () => void;
}) {
  const onSubmit = (e: Event) => {
    e.preventDefault();
    onSave();
  };

  return (
    <div
      class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      style="background: rgba(8, 8, 8, 0.72); backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px);"
      onClick={onClose}
    >
      <div
        class="relative w-full max-w-lg rounded-[4px] border border-gold-500/40 bg-[#1A1A1A] shadow-[0_24px_80px_-20px_rgba(0,0,0,0.9)]"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Add Reel"
      >
        {/* Header */}
        <div class="flex items-start justify-between gap-4 px-7 pt-6 pb-5 border-b border-veil-700">
          <div>
            <p class="eyebrow text-gold-muted">The Reel Desk</p>
            <h2 class="font-display text-2xl text-paper-50 mt-1">Add Reel</h2>
          </div>
          <button
            type="button"
            class="flex items-center justify-center h-8 w-8 rounded-[3px] text-paper-300 hover:text-paper-50 hover:bg-veil-800 transition-colors duration-200 shrink-0"
            onClick={onClose}
            aria-label="Close modal"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <form onSubmit={onSubmit} class="px-7 py-6 space-y-5">
          <div>
            <label for="reel-url" class="block eyebrow text-paper-400 mb-2">
              Reel URL <span class="text-gold-muted normal-case tracking-normal">*</span>
            </label>
            <input
              id="reel-url"
              type="url"
              required
              placeholder="https://www.tiktok.com/@handle/video/..."
              value={draft.url}
              onInput={(e) =>
                onDraftChange({ ...draft, url: (e.target as HTMLInputElement).value })
              }
              class="w-full bg-[#121212] border border-veil-700 rounded-[3px] px-4 py-3 font-mono text-[0.82rem] text-paper-100 placeholder-paper-500/40 outline-none focus:border-gold-500/60 transition-colors duration-300"
              autocomplete="off"
            />
          </div>

          <div>
            <label for="reel-title" class="block eyebrow text-paper-400 mb-2">
              Title
            </label>
            <input
              id="reel-title"
              type="text"
              placeholder="Short label for this reference"
              value={draft.title}
              onInput={(e) =>
                onDraftChange({ ...draft, title: (e.target as HTMLInputElement).value })
              }
              class="w-full bg-[#121212] border border-veil-700 rounded-[3px] px-4 py-3 font-display text-lg text-paper-50 placeholder-paper-500/40 outline-none focus:border-gold-500/60 transition-colors duration-300"
              autocomplete="off"
            />
          </div>

          <div>
            <label for="reel-note" class="block eyebrow text-paper-400 mb-2">
              Note <span class="text-paper-500 normal-case tracking-normal">(optional)</span>
            </label>
            <textarea
              id="reel-note"
              placeholder="What's worth studying about this reel?"
              value={draft.note}
              onInput={(e) =>
                onDraftChange({ ...draft, note: (e.target as HTMLTextAreaElement).value })
              }
              class="w-full bg-[#121212] border border-veil-700 rounded-[3px] px-4 py-3 font-serif text-[0.95rem] leading-relaxed text-paper-100 placeholder-paper-500/40 outline-none focus:border-gold-500/60 transition-colors duration-300 resize-none"
              rows={3}
            />
          </div>

          <div class="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              class="text-[0.7rem] font-mono tracking-wide-luxe uppercase text-paper-400 hover:text-paper-100 px-4 py-2.5 transition-colors duration-300"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              class="text-[0.7rem] font-mono tracking-wide-luxe uppercase text-[#1f1d1a] bg-gold-400 hover:bg-gold-300 px-5 py-2.5 rounded-[3px] transition-colors duration-300 font-semibold"
            >
              Pin to Filmstrip
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
