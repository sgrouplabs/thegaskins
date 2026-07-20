/**
 * WarRoomBoard.tsx
 * Preact client island powering The War Room (The Memo Board).
 *
 * Full interactive engine:
 *  - Three-column Kanban: Raw Ideas / In Refinement / Ready to Film.
 *  - HTML5 drag-and-drop between columns.
 *  - Reactive memo-count indicators in each column header (update live
 *    as cards are dragged, added, or deleted).
 *  - CRUD: add new memos, edit a memo's title/summary/tags in-place,
 *    and delete memos.
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
// Component
// ---------------------------------------------------------------------------
export default function WarRoomBoard({ initialMemos, columns }: Props) {
  const [memos, setMemos] = useState<Memo[]>(() => loadMemos(initialMemos));
  const [dragId, setDragId] = useState<string | null>(null);
  const [dragOverCol, setDragOverCol] = useState<KanbanStatus | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [addingTo, setAddingTo] = useState<KanbanStatus | null>(null);
  const [newDraft, setNewDraft] = useState({ title: '', summary: '', tags: '' });
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

  // ----- Derived: memos grouped by column -----
  const memosByCol = (col: KanbanStatus) =>
    memos.filter((m) => m.status === col);

  // ----- Drag and drop -----
  const onDragStart = (id: string) => {
    setDragId(id);
  };
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

  // ----- CRUD -----
  const addMemo = () => {
    if (!addingTo) return;
    const id = `k${nextIdRef.current}`;
    const tags = newDraft.tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    const memo: Memo = {
      id,
      title: newDraft.title.trim() || 'Untitled Memo',
      tags: tags.length ? tags : ['memo'],
      summary: newDraft.summary.trim() || 'No summary yet.',
      status: addingTo,
    };
    setMemos((prev) => [...prev, memo]);
    setNewDraft({ title: '', summary: '', tags: '' });
    setAddingTo(null);
  };

  const deleteMemo = (id: string) => {
    setMemos((prev) => prev.filter((m) => m.id !== id));
    if (editingId === id) setEditingId(null);
  };

  const updateMemo = (id: string, patch: Partial<Memo>) => {
    setMemos((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...patch } : m))
    );
  };

  const parseTagsInput = (raw: string): string[] =>
    raw.split(',').map((t) => t.trim()).filter(Boolean);

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

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {columns.map((col) => {
          const colMemos = memosByCol(col.id);
          const isOver = dragOverCol === col.id;
          return (
            <section
              class={`warroom-col flex flex-col min-h-[60vh] transition-all duration-300 ${
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
                  onClick={() => {
                    setAddingTo(col.id);
                    setNewDraft({ title: '', summary: '', tags: '' });
                  }}
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
                    isEditing={editingId === memo.id}
                    onDragStart={() => onDragStart(memo.id)}
                    onDragEnd={onDragEnd}
                    onStartEdit={() => setEditingId(memo.id)}
                    onStopEdit={() => setEditingId(null)}
                    onUpdate={(patch) => updateMemo(memo.id, patch)}
                    onDelete={() => deleteMemo(memo.id)}
                  />
                ))}

                {colMemos.length === 0 && !addingTo && (
                  <div class="border border-dashed border-veil-600 rounded-[2px] p-6 text-center">
                    <p class="font-serif text-paper-400 text-sm">An empty drawer.</p>
                  </div>
                )}

                {/* Add-new form */}
                {addingTo === col.id && (
                  <div class="surface-stationery p-5 space-y-3">
                    <input
                      type="text"
                      placeholder="Memo title"
                      value={newDraft.title}
                      onInput={(e) =>
                        setNewDraft((d) => ({ ...d, title: (e.target as HTMLInputElement).value }))
                      }
                      class="w-full bg-transparent border-b border-[#d8c89c] pb-1 font-display text-lg text-[#1f1d1a] placeholder-[#a89968] outline-none"
                    />
                    <textarea
                      placeholder="Summary"
                      value={newDraft.summary}
                      onInput={(e) =>
                        setNewDraft((d) => ({ ...d, summary: (e.target as HTMLTextAreaElement).value }))
                      }
                      class="w-full bg-transparent border-b border-[#d8c89c] pb-1 font-serif text-[0.92rem] text-[#3a342a] placeholder-[#a89968] outline-none resize-none"
                      rows={2}
                    />
                    <input
                      type="text"
                      placeholder="Tags (comma separated)"
                      value={newDraft.tags}
                      onInput={(e) =>
                        setNewDraft((d) => ({ ...d, tags: (e.target as HTMLInputElement).value }))
                      }
                      class="w-full bg-transparent border-b border-[#d8c89c] pb-1 font-mono text-[0.7rem] text-[#6b5d3a] placeholder-[#a89968] outline-none"
                    />
                    <div class="flex items-center gap-3 pt-2">
                      <button
                        type="button"
                        class="text-[0.62rem] font-mono tracking-wide-luxe uppercase text-[#1f1d1a] bg-gold-400 px-3 py-1.5 hover:bg-gold-500 transition-colors"
                        onClick={addMemo}
                      >
                        Save Memo
                      </button>
                      <button
                        type="button"
                        class="text-[0.62rem] font-mono tracking-wide-luxe uppercase text-[#6b5d3a] px-2 py-1.5 hover:text-[#1f1d1a] transition-colors"
                        onClick={() => setAddingTo(null)}
                      >
                        Cancel
                      </button>
                    </div>
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
    </div>
  );
}

// ---------------------------------------------------------------------------
// MemoCard — a single cream stationery card with inline edit + delete.
// ---------------------------------------------------------------------------
function MemoCard({
  memo,
  isDragging,
  isEditing,
  onDragStart,
  onDragEnd,
  onStartEdit,
  onStopEdit,
  onUpdate,
  onDelete,
}: {
  memo: Memo;
  isDragging: boolean;
  isEditing: boolean;
  onDragStart: () => void;
  onDragEnd: () => void;
  onStartEdit: () => void;
  onStopEdit: () => void;
  onUpdate: (patch: Partial<Memo>) => void;
  onDelete: () => void;
}) {
  const [editTitle, setEditTitle] = useState(memo.title);
  const [editSummary, setEditSummary] = useState(memo.summary);
  const [editTags, setEditTags] = useState(memo.tags.join(', '));

  const saveEdit = () => {
    onUpdate({
      title: editTitle.trim() || memo.title,
      summary: editSummary.trim() || memo.summary,
      tags: parseTagsInput(editTags),
    });
    onStopEdit();
  };

  if (isEditing) {
    return (
      <article class="surface-stationery p-5 space-y-3">
        <input
          type="text"
          value={editTitle}
          onInput={(e) => setEditTitle((e.target as HTMLInputElement).value)}
          class="w-full bg-transparent border-b border-[#d8c89c] pb-1 font-display text-lg text-[#1f1d1a] outline-none"
        />
        <textarea
          value={editSummary}
          onInput={(e) => setEditSummary((e.target as HTMLTextAreaElement).value)}
          class="w-full bg-transparent border-b border-[#d8c89c] pb-1 font-serif text-[0.92rem] text-[#3a342a] outline-none resize-none"
          rows={3}
        />
        <input
          type="text"
          value={editTags}
          onInput={(e) => setEditTags((e.target as HTMLInputElement).value)}
          class="w-full bg-transparent border-b border-[#d8c89c] pb-1 font-mono text-[0.7rem] text-[#6b5d3a] outline-none"
        />
        <div class="flex items-center gap-3 pt-2">
          <button
            type="button"
            class="text-[0.62rem] font-mono tracking-wide-luxe uppercase text-[#1f1d1a] bg-gold-400 px-3 py-1.5 hover:bg-gold-500 transition-colors"
            onClick={saveEdit}
          >
            Save
          </button>
          <button
            type="button"
            class="text-[0.62rem] font-mono tracking-wide-luxe uppercase text-[#6b5d3a] px-2 py-1.5 hover:text-[#1f1d1a] transition-colors"
            onClick={onStopEdit}
          >
            Cancel
          </button>
        </div>
      </article>
    );
  }

  return (
    <article
      class="surface-stationery p-5 transition-transform duration-500 hover:-translate-y-0.5"
      draggable="true"
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      style={isDragging ? 'opacity: 0.5;' : ''}
      data-memo={memo.id}
    >
      <div class="flex items-start justify-between gap-3 mb-2">
        <h3 class="font-display text-lg leading-snug text-[#1f1d1a] flex-1">
          {memo.title}
        </h3>
        <div class="flex items-center gap-2 mt-1">
          <button
            type="button"
            class="text-[#7a6f4f] hover:text-[#1f1d1a] text-[0.65rem] font-mono tracking-wide-luxe uppercase transition-colors"
            onClick={onStartEdit}
            aria-label="Edit memo"
          >
            ✎
          </button>
          <button
            type="button"
            class="text-[#7a6f4f] hover:text-[#a03030] text-[0.65rem] font-mono tracking-wide-luxe uppercase transition-colors"
            onClick={onDelete}
            aria-label="Delete memo"
          >
            ✕
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
          ✎ Hold to drag
        </span>
      </div>
    </article>
  );
}
