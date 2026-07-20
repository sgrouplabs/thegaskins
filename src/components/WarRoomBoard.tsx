/**
 * WarRoomBoard.tsx
 * Preact client island powering The War Room (The Memo Board).
 *
 * Full interactive engine:
 *  - Three-column Kanban: Raw Ideas / In Refinement / Ready to Film.
 *  - HTML5 drag-and-drop between columns.
 *  - Reactive memo-count indicators in each column header (update live
 *    as cards are dragged, added, or deleted).
 *  - CRUD via a luxury modal overlay: Add and Edit both open a centered
 *    modal with backdrop blur, form fields, and Save/Cancel actions.
 *  - Accessibility: Edit/Delete icons are 32px touch targets with high
 *    contrast — designed for older clients to easily tap.
 *  - Auto-save: all memo state persists to localStorage on every change
 *    and rehydrates on reload.
 *
 * Column headers render in the prominent serif font (Playfair Display),
 * and memo cards are textured cream digital stationery against the dark
 * backdrop.
 */
import { useState, useEffect, useCallback, useRef } from 'preact/hooks';
import type { Memo, KanbanStatus } from '../../config/site';

type Props = {
  initialMemos: Memo[];
  columns: { id: KanbanStatus; label: string; numeral: string }[];
};

const STORAGE_KEY = 'thegaskins_warroom_memos';

// ---------------------------------------------------------------------------
// localStorage helpers
// ---------------------------------------------------------------------------
function loadMemos(initial: Memo[]): Memo[] {
  if (typeof window === 'undefined') return initial;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    // fall through to initial
  }
  return initial;
}

function saveMemos(memos: Memo[]) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(memos));
  } catch (e) {
    // storage might be full or disabled — fail silently
  }
}

// ---------------------------------------------------------------------------
// Modal state type
// ---------------------------------------------------------------------------
type ModalState =
  | { mode: 'add'; col: KanbanStatus; draft: MemoDraft }
  | { mode: 'edit'; col: KanbanStatus; memoId: string; draft: MemoDraft }
  | null;

type MemoDraft = { title: string; summary: string; tags: string };

const emptyDraft: MemoDraft = { title: '', summary: '', tags: '' };

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function WarRoomBoard({ initialMemos, columns }: Props) {
  const [memos, setMemos] = useState<Memo[]>(() => loadMemos(initialMemos));
  const [dragId, setDragId] = useState<string | null>(null);
  const [dragOverCol, setDragOverCol] = useState<KanbanStatus | null>(null);
  const [modal, setModal] = useState<ModalState>(null);
  const nextIdRef = useRef(0);

  // Auto-save: persist to localStorage whenever memos change.
  useEffect(() => {
    saveMemos(memos);
  }, [memos]);

  // Compute next id from existing memos.
  useEffect(() => {
    const maxId = memos.reduce((max, m) => {
      const n = parseInt(m.id.replace(/\D/g, ''), 10);
      return isNaN(n) ? max : Math.max(max, n);
    }, 0);
    nextIdRef.current = maxId + 1;
  }, [memos]);

  // Close modal on ESC key.
  useEffect(() => {
    if (!modal) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setModal(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [modal]);

  // ----- Derived: memos grouped by column -----
  const memosByCol = (col: KanbanStatus) =>
    memos.filter((m) => m.status === col);

  // ----- Drag and drop -----
  const onDragStart = (id: string) => setDragId(id);
  const onDragEnd = () => {
    setDragId(null);
    setDragOverCol(null);
  };
  const onDragOver = (e: Event, col: KanbanStatus) => {
    e.preventDefault();
    setDragOverCol(col);
  };
  const onDragLeave = (col: KanbanStatus) => {
    if (dragOverCol === col) setDragOverCol(null);
  };
  const onDrop = (e: Event, col: KanbanStatus) => {
    e.preventDefault();
    setDragOverCol(null);
    if (!dragId) return;
    setMemos((prev) =>
      prev.map((m) => (m.id === dragId ? { ...m, status: col } : m))
    );
    setDragId(null);
  };

  // ----- CRUD via modal -----
  const openAddModal = (col: KanbanStatus) => {
    setModal({ mode: 'add', col, draft: { ...emptyDraft } });
  };

  const openEditModal = (memo: Memo) => {
    setModal({
      mode: 'edit',
      col: memo.status,
      memoId: memo.id,
      draft: {
        title: memo.title,
        summary: memo.summary,
        tags: memo.tags.join(', '),
      },
    });
  };

  const closeModal = () => setModal(null);

  const commitModal = () => {
    if (!modal) return;
    const draft = modal.draft;
    const tags = draft.tags.split(',').map((t) => t.trim()).filter(Boolean);
    if (modal.mode === 'add') {
      const id = `k${nextIdRef.current}`;
      const memo: Memo = {
        id,
        title: draft.title.trim() || 'Untitled Memo',
        tags: tags.length ? tags : ['memo'],
        summary: draft.summary.trim() || 'No summary yet.',
        status: modal.col,
      };
      setMemos((prev) => [...prev, memo]);
    } else {
      setMemos((prev) =>
        prev.map((m) =>
          m.id === modal.memoId
            ? {
                ...m,
                title: draft.title.trim() || m.title,
                summary: draft.summary.trim() || m.summary,
                tags: tags.length ? tags : m.tags,
              }
            : m
        )
      );
    }
    setModal(null);
  };

  const deleteMemo = (id: string) => {
    setMemos((prev) => prev.filter((m) => m.id !== id));
  };

  // ----- Save indicator -----
  const [savedFlash, setSavedFlash] = useState(false);
  useEffect(() => {
    if (memos.length === 0) return;
    setSavedFlash(true);
    const t = setTimeout(() => setSavedFlash(false), 1200);
    return () => clearTimeout(t);
  }, [memos]);

  return (
    <div class="warroom-board">
      {/* Save indicator */}
      <div class="flex items-center justify-between mb-6">
        <p class="eyebrow text-paper-400">
          Drag memos between columns · changes auto-save
        </p>
        <span
          class={`font-mono text-[0.6rem] tracking-wide-luxe uppercase transition-opacity duration-500 ${
            savedFlash ? 'text-gold-300 opacity-100' : 'text-paper-400 opacity-0'
          }`}
        >
          ✓ Saved
        </span>
      </div>

      <div class="warroom-columns flex gap-6 lg:gap-8 overflow-x-auto lg:overflow-visible snap-x snap-mandatory lg:grid lg:grid-cols-3 pb-4 lg:pb-0 -mx-5 px-5 sm:mx-0 sm:px-0">
        {columns.map((col) => {
          const colMemos = memosByCol(col.id);
          const isOver = dragOverCol === col.id;
          return (
            <section
              class={`warroom-col flex flex-col min-h-[60vh] w-[85vw] sm:w-auto lg:min-h-[60vh] shrink-0 lg:shrink snap-start transition-all duration-300 ${
                isOver ? 'ring-1 ring-gold-500/30' : ''
              }`}
              data-col={col.id}
              onDragOver={(e) => onDragOver(e, col.id)}
              onDragLeave={() => onDragLeave(col.id)}
              onDrop={(e) => onDrop(e, col.id)}
            >
              {/* Column header — serif font, reactive count */}
              <header class="mb-5 pb-4 border-b border-veil-700 flex items-baseline gap-3">
                <span class="font-mono text-gold-muted text-sm w-6">{col.numeral}</span>
                <div class="flex-1">
                  <h2 class="font-display text-lg text-paper-50">{col.label}</h2>
                  <p class="eyebrow mt-1 text-paper-400">
                    <span class="warroom-count" data-col-count={col.id}>
                      {colMemos.length}
                    </span>{' '}
                    memos
                  </p>
                </div>
                <button
                  type="button"
                  class="text-paper-400 hover:text-gold-300 text-xs tracking-luxe uppercase border border-veil-700 hover:border-veil-500 px-2 py-1 transition-colors duration-300"
                  onClick={() => openAddModal(col.id)}
                  aria-label={`Add memo to ${col.label}`}
                >
                  + Add
                </button>
              </header>

              {/* Memo cards */}
              <div class="space-y-5 flex-1">
                {colMemos.map((memo) => (
                  <MemoCard
                    key={memo.id}
                    memo={memo}
                    isDragging={dragId === memo.id}
                    onDragStart={() => onDragStart(memo.id)}
                    onDragEnd={onDragEnd}
                    onEdit={() => openEditModal(memo)}
                    onDelete={() => deleteMemo(memo.id)}
                  />
                ))}

                {colMemos.length === 0 && (
                  <div class="border border-dashed border-veil-600 rounded-[2px] p-6 text-center">
                    <p class="font-serif text-paper-400 text-sm">An empty drawer.</p>
                  </div>
                )}
              </div>
            </section>
          );
        })}
      </div>

      {/* Footer note */}
      <div class="mt-14 rule-gold w-full max-w-[120px] mb-5"></div>
      <p class="font-serif text-paper-300 text-base max-w-xl">
        Drag a memo across columns when its shape has settled. The system
        does not enforce the move — you do.
      </p>

      {/* Luxury modal overlay for Add / Edit */}
      {modal && (
        <MemoModal
          mode={modal.mode}
          colLabel={columns.find((c) => c.id === modal.col)?.label ?? ''}
          draft={modal.draft}
          onDraftChange={(d) => setModal((m) => (m ? { ...m, draft: d } : m))}
          onSave={commitModal}
          onClose={closeModal}
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// MemoCard — cream stationery card with accessible 32px action icons.
// ---------------------------------------------------------------------------
function MemoCard({
  memo,
  isDragging,
  onDragStart,
  onDragEnd,
  onEdit,
  onDelete,
}: {
  memo: Memo;
  isDragging: boolean;
  onDragStart: () => void;
  onDragEnd: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <article
      class="surface-stationery p-5 transition-transform duration-500 hover:-translate-y-0.5"
      draggable="true"
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      style={isDragging ? 'opacity: 0.5;' : ''}
      data-memo={memo.id}
    >
      {/* Header row: title + large accessible action icons (32px targets) */}
      <div class="flex items-start justify-between gap-3 mb-2">
        <h3 class="font-display text-lg leading-snug text-[#1f1d1a] flex-1">
          {memo.title}
        </h3>
        <div class="flex items-center gap-1.5 mt-0.5 shrink-0">
          {/* Edit — 32px touch target, high-contrast charcoal icon */}
          <button
            type="button"
            class="flex items-center justify-center h-8 w-8 rounded-[3px] text-[#1f1d1a] bg-[#e8dfc4] hover:bg-gold-400 transition-colors duration-200 border border-[#c9b88a]"
            onClick={onEdit}
            aria-label={`Edit memo: ${memo.title}`}
            title="Edit memo"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>
          {/* Delete — 32px touch target, high-contrast deep-red icon */}
          <button
            type="button"
            class="flex items-center justify-center h-8 w-8 rounded-[3px] text-[#a02828] bg-[#f0d8d0] hover:bg-[#e0b0a0] transition-colors duration-200 border border-[#c98888]"
            onClick={onDelete}
            aria-label={`Delete memo: ${memo.title}`}
            title="Delete memo"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              <line x1="10" y1="11" x2="10" y2="17" />
              <line x1="14" y1="11" x2="14" y2="17" />
            </svg>
          </button>
        </div>
      </div>

      <div class="flex flex-wrap gap-1.5 mb-3">
        {memo.tags.map((tag) => (
          <span class="text-[0.62rem] font-mono tracking-luxe uppercase text-[#6b5d3a] border border-[#d8c89c] px-2 py-0.5 rounded-full">
            {tag}
          </span>
        ))}
      </div>

      <p class="font-serif text-[0.92rem] leading-relaxed text-[#3a342a]">
        {memo.summary}
      </p>

      <div class="mt-4 pt-3 border-t border-[#e0d8c4] flex items-center justify-between">
        <span class="text-[0.6rem] font-mono tracking-wide-luxe uppercase text-[#8a7d57]">
          {memo.id.toUpperCase()}
        </span>
        <span class="text-[0.6rem] font-mono tracking-wide-luxe uppercase text-[#8a7d57]">
          ⠿ Drag to move
        </span>
      </div>
    </article>
  );
}

// ---------------------------------------------------------------------------
// MemoModal — luxury modal overlay for Add / Edit memo flows.
// ---------------------------------------------------------------------------
function MemoModal({
  mode,
  colLabel,
  draft,
  onDraftChange,
  onSave,
  onClose,
}: {
  mode: 'add' | 'edit';
  colLabel: string;
  draft: MemoDraft;
  onDraftChange: (d: MemoDraft) => void;
  onSave: () => void;
  onClose: () => void;
}) {
  const titleVerb = mode === 'add' ? 'New Memo' : 'Edit Memo';

  // Submit on Enter when focused in title field.
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
      {/* Modal panel — onyx luxury card with gold hairline */}
      <div
        class="relative w-full max-w-lg rounded-[4px] border border-gold-500/40 bg-[#1A1A1A] shadow-[0_24px_80px_-20px_rgba(0,0,0,0.9)]"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={titleVerb}
      >
        {/* Modal header */}
        <div class="flex items-start justify-between gap-4 px-7 pt-6 pb-5 border-b border-veil-700">
          <div>
            <p class="eyebrow text-gold-muted">{colLabel}</p>
            <h2 class="font-display text-2xl text-paper-50 mt-1">{titleVerb}</h2>
          </div>
          {/* Close button — 32px touch target */}
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

        {/* Modal body — form fields */}
        <form onSubmit={onSubmit} class="px-7 py-6 space-y-5">
          {/* Title */}
          <div>
            <label
              for="memo-title"
              class="block eyebrow text-paper-400 mb-2"
            >
              Title
            </label>
            <input
              id="memo-title"
              type="text"
              placeholder="Memo title"
              value={draft.title}
              onInput={(e) =>
                onDraftChange({ ...draft, title: (e.target as HTMLInputElement).value })
              }
              class="w-full bg-[#121212] border border-veil-700 rounded-[3px] px-4 py-3 font-display text-lg text-paper-50 placeholder-paper-500/40 outline-none focus:border-gold-500/60 transition-colors duration-300"
              autocomplete="off"
            />
          </div>

          {/* Summary */}
          <div>
            <label
              for="memo-summary"
              class="block eyebrow text-paper-400 mb-2"
            >
              Summary
            </label>
            <textarea
              id="memo-summary"
              placeholder="What's the idea or note?"
              value={draft.summary}
              onInput={(e) =>
                onDraftChange({ ...draft, summary: (e.target as HTMLTextAreaElement).value })
              }
              class="w-full bg-[#121212] border border-veil-700 rounded-[3px] px-4 py-3 font-serif text-[0.95rem] leading-relaxed text-paper-100 placeholder-paper-500/40 outline-none focus:border-gold-500/60 transition-colors duration-300 resize-none"
              rows={4}
            />
          </div>

          {/* Tags */}
          <div>
            <label
              for="memo-tags"
              class="block eyebrow text-paper-400 mb-2"
            >
              Tags <span class="text-paper-500 normal-case tracking-normal">(comma separated)</span>
            </label>
            <input
              id="memo-tags"
              type="text"
              placeholder="hook, broll, concept"
              value={draft.tags}
              onInput={(e) =>
                onDraftChange({ ...draft, tags: (e.target as HTMLInputElement).value })
              }
              class="w-full bg-[#121212] border border-veil-700 rounded-[3px] px-4 py-3 font-mono text-[0.75rem] text-paper-100 placeholder-paper-500/40 outline-none focus:border-gold-500/60 transition-colors duration-300"
              autocomplete="off"
            />
          </div>

          {/* Actions */}
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
              {mode === 'add' ? 'Save Memo' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
