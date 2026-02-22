import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import { DndContext, DragEndEvent } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { PdfReader } from "./components/PdfReader";

type CategoryId = "differential" | "labs" | "diagnostics" | "management";

type BoardItem = {
  id: string;
  label: string;
  createdAt: number;
};

type BoardState = Record<CategoryId, BoardItem[]>;

type DraftState = Record<CategoryId, string>;

const categoryConfig: Record<
  CategoryId,
  {
    title: string;
    description: string;
    placeholder: string;
    accent: string;
    guidance: string;
  }
> = {
  differential: {
    title: "Differential Diagnoses",
    description: "Capture every hypothesis as you work line-by-line.",
    placeholder: "e.g. Acute myopericarditis",
    accent: "from-rose-500 to-orange-400",
    guidance: "Drag to re-order from most to least likely as the story evolves.",
  },
  labs: {
    title: "Laboratory Priorities",
    description: "Record the labs that would meaningfully change management.",
    placeholder: "e.g. High-sensitivity troponin",
    accent: "from-sky-500 to-cyan-400",
    guidance: "Think about screening vs. confirmatory tests.",
  },
  diagnostics: {
    title: "Imaging & Diagnostics",
    description: "List advanced diagnostics, imaging, or procedures.",
    placeholder: "e.g. Transthoracic echocardiogram",
    accent: "from-indigo-500 to-blue-500",
    guidance: "Prioritize highest-yield tests first.",
  },
  management: {
    title: "Management Considerations",
    description: "Outline immediate interventions or future planning.",
    placeholder: "e.g. Start guideline-directed HF therapy",
    accent: "from-emerald-500 to-lime-500",
    guidance: "Pairs beautifully with evolving differential and labs.",
  },
};

export function App() {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfName, setPdfName] = useState<string>("");
  const [caseDx, setCaseDx] = useState("");
  const [teachingNotes, setTeachingNotes] = useState("");
  const [board, setBoard] = useState<BoardState>(() => ({
    differential: [],
    labs: [],
    diagnostics: [],
    management: [],
  }));
  const [drafts, setDrafts] = useState<DraftState>(() => ({
    differential: "",
    labs: "",
    diagnostics: "",
    management: "",
  }));

  const objectUrlRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
    };
  }, []);

  const leadingDiagnosis = board.differential[0]?.label ?? "Awaiting input";
  const totalHypotheses = board.differential.length;

  const certaintyScore = useMemo(() => {
    if (!totalHypotheses) return 0;
    return Math.max(0, 100 - (totalHypotheses - 1) * 8);
  }, [totalHypotheses]);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
    }
    const url = URL.createObjectURL(file);
    objectUrlRef.current = url;
    setPdfUrl(url);
    setPdfName(file.name);
  };

  const handleDraftChange = (id: CategoryId, value: string) => {
    setDrafts((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleAddItem = (id: CategoryId) => {
    const value = drafts[id].trim();
    if (!value) return;
    setBoard((prev) => ({
      ...prev,
      [id]: [
        ...prev[id],
        {
          id: crypto.randomUUID(),
          label: value,
          createdAt: Date.now(),
        },
      ],
    }));
    setDrafts((prev) => ({
      ...prev,
      [id]: "",
    }));
  };

  const handleRemoveItem = (categoryId: CategoryId, itemId: string) => {
    setBoard((prev) => ({
      ...prev,
      [categoryId]: prev[categoryId].filter((item) => item.id !== itemId),
    }));
  };

  const handleReorder = (
    categoryId: CategoryId,
    activeId: string,
    overId: string | undefined
  ) => {
    if (!overId || activeId === overId) return;
    setBoard((prev) => {
      const items = prev[categoryId];
      const oldIndex = items.findIndex((item) => item.id === activeId);
      const newIndex = items.findIndex((item) => item.id === overId);
      if (oldIndex === -1 || newIndex === -1) return prev;
      const reordered = arrayMove(items, oldIndex, newIndex);
      return {
        ...prev,
        [categoryId]: reordered,
      };
    });
  };

  const resetBoard = () => {
    setBoard({
      differential: [],
      labs: [],
      diagnostics: [],
      management: [],
    });
    setDrafts({
      differential: "",
      labs: "",
      diagnostics: "",
      management: "",
    });
    setCaseDx("");
    setTeachingNotes("");
  };

  return (
    <div className="min-h-screen bg-slate-50/80">
      <main className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-10">
        <header className="rounded-3xl border border-slate-100 bg-white/80 p-6 shadow-lg shadow-slate-200/60 lg:p-10">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-indigo-400">
                NEJM Case Companion
              </p>
              <h1 className="mt-2 text-3xl font-bold text-slate-900 sm:text-4xl">
                Teach the differential in real time.
              </h1>
              <p className="mt-2 text-base text-slate-600 sm:text-lg">
                Upload a case PDF, read line-by-line, and co-create the diagnostic
                reasoning pathway with your learner.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={resetBoard}
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
              >
                <span>Start New Session</span>
              </button>
            </div>
          </div>
        </header>

        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.9fr]">
          <section className="space-y-6">
            <div className="rounded-[28px] border border-slate-100 bg-white/90 p-6 shadow-xl shadow-slate-200/60">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-500">
                    Case Source
                  </p>
                  <h2 className="text-2xl font-semibold text-slate-900">
                    Upload the NEJM PDF
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Drag & drop or browse to anchor the left panel with the official case.
                  </p>
                </div>
                <label className="cursor-pointer rounded-2xl border border-dashed border-indigo-200 bg-indigo-50/80 px-5 py-3 text-sm font-semibold text-indigo-700 transition hover:border-indigo-300 hover:bg-indigo-50">
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  Upload Case PDF
                </label>
              </div>
              <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-900/5">
                {pdfUrl ? (
                  <PdfReader fileUrl={pdfUrl} />
                ) : (
                  <div className="flex h-[70vh] flex-col items-center justify-center gap-4 text-center text-slate-500">
                    <div className="rounded-2xl bg-white p-4 shadow-sm">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        className="h-10 w-10 text-indigo-500"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 6v12m-6-6h12"
                        />
                      </svg>
                    </div>
                    <div className="space-y-1">
                      <p className="text-base font-semibold text-slate-700">
                        Waiting for your NEJM PDF
                      </p>
                      <p className="text-sm text-slate-500">
                        The viewer supports native text selection so you can highlight key lines.
                      </p>
                    </div>
                  </div>
                )}
              </div>
              {pdfName && (
                <p className="mt-3 text-xs font-medium uppercase tracking-[0.3em] text-slate-400">
                  Viewing: <span className="font-semibold text-slate-600">{pdfName}</span>
                </p>
              )}
            </div>
          </section>

          <section className="space-y-6">
            <div className="rounded-[28px] border border-slate-100 bg-white p-6 shadow-xl shadow-slate-200/60">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-500">
                    Session Snapshot
                  </p>
                  <h2 className="text-2xl font-semibold text-slate-900">
                    How confident is the team?
                  </h2>
                </div>
                <div className="text-right">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                    Certainty Gauge
                  </p>
                  <p className="text-3xl font-black text-indigo-600">{certaintyScore}%</p>
                </div>
              </div>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-[0.4em] text-slate-400">
                    Leading Dx
                  </p>
                  <p className="mt-1 text-lg font-semibold text-slate-900">
                    {leadingDiagnosis}
                  </p>
                  <p className="text-sm text-slate-500">
                    Keep the most likely option at the top of the list.
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <label className="flex flex-col text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                    Case Diagnosis
                    <input
                      type="text"
                      value={caseDx}
                      onChange={(event) => setCaseDx(event.target.value)}
                      placeholder="Document once revealed"
                      className="mt-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-normal text-slate-700 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                    />
                  </label>
                </div>
              </div>
              <div className="mt-4">
                <label className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-400">
                  Teaching Pearls
                  <textarea
                    value={teachingNotes}
                    onChange={(event) => setTeachingNotes(event.target.value)}
                    placeholder="Capture clinical reasoning or follow-up assignments."
                    className="mt-2 h-28 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                  />
                </label>
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              {(Object.keys(categoryConfig) as CategoryId[]).map((categoryId) => (
                <CategoryCard
                  key={categoryId}
                  categoryId={categoryId}
                  items={board[categoryId]}
                  draft={drafts[categoryId]}
                  onDraftChange={handleDraftChange}
                  onAddItem={handleAddItem}
                  onRemoveItem={handleRemoveItem}
                  onReorder={handleReorder}
                />
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

type CategoryCardProps = {
  categoryId: CategoryId;
  items: BoardItem[];
  draft: string;
  onDraftChange: (categoryId: CategoryId, value: string) => void;
  onAddItem: (categoryId: CategoryId) => void;
  onRemoveItem: (categoryId: CategoryId, itemId: string) => void;
  onReorder: (
    categoryId: CategoryId,
    activeId: string,
    overId: string | undefined
  ) => void;
};

function CategoryCard({
  categoryId,
  items,
  draft,
  onDraftChange,
  onAddItem,
  onRemoveItem,
  onReorder,
}: CategoryCardProps) {
  const config = categoryConfig[categoryId];

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onAddItem(categoryId);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    onReorder(categoryId, event.active.id as string, event.over?.id as string | undefined);
  };

  return (
    <div className="flex h-full flex-col rounded-[26px] border border-slate-100 bg-white/90 p-5 shadow-lg shadow-slate-200/50">
      <div className="flex items-start gap-4">
        <div className={`rounded-2xl bg-gradient-to-br ${config.accent} p-3 text-white shadow-lg`}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className="h-6 w-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 6v12m-6-6h12"
            />
          </svg>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-400">
            {config.title}
          </p>
          <p className="mt-1 text-sm text-slate-500">{config.description}</p>
          <p className="mt-2 text-xs font-medium text-slate-400">{config.guidance}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
        <input
          type="text"
          value={draft}
          onChange={(event) => onDraftChange(categoryId, event.target.value)}
          placeholder={config.placeholder}
          className="flex-1 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
        />
        <button
          type="submit"
          className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          Add
        </button>
      </form>

      <div className="mt-4 flex-1">
        {items.length ? (
          <DndContext onDragEnd={handleDragEnd}>
            <SortableContext items={items.map((item) => item.id)} strategy={verticalListSortingStrategy}>
              <ul className="space-y-3">
                {items.map((item, index) => (
                  <SortableListItem
                    key={item.id}
                    item={item}
                    index={index}
                    onRemove={() => onRemoveItem(categoryId, item.id)}
                  />
                ))}
              </ul>
            </SortableContext>
          </DndContext>
        ) : (
          <div className="flex h-full flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 p-6 text-center text-sm text-slate-400">
            <p>Nothing recorded yet.</p>
            <p>Start typing to populate this column.</p>
          </div>
        )}
      </div>
    </div>
  );
}

type SortableListItemProps = {
  item: BoardItem;
  index: number;
  onRemove: () => void;
};

function SortableListItem({ item, index, onRemove }: SortableListItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={`group flex items-center justify-between rounded-2xl border border-slate-100 bg-white px-4 py-3 shadow-sm transition ${
        isDragging ? "ring-2 ring-indigo-200" : ""
      }`}
    >
      <div className="flex items-start gap-3">
        <button
          type="button"
          className="mt-1 rounded-xl bg-slate-100 p-1 text-slate-500 transition hover:bg-slate-200"
          {...attributes}
          {...listeners}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="h-4 w-4"
          >
            <path d="M9 5h.01M15 5h.01M9 12h.01M15 12h.01M9 19h.01M15 19h.01" />
          </svg>
        </button>
        <div>
          <p className="text-sm font-semibold text-slate-800">
            {index + 1}. {item.label}
          </p>
          <p className="text-xs text-slate-400">
            Added {new Date(item.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={onRemove}
        className="rounded-xl bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500 opacity-0 transition hover:bg-slate-200 hover:text-slate-700 group-hover:opacity-100"
      >
        Clear
      </button>
    </li>
  );
}
