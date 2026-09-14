"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

const WEEKDAY_LABELS = ["D", "S", "T", "Q", "Q", "S", "S"];
const MONTH_LABELS = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

function toDateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function buildMonthGrid(viewMonth: Date): (Date | null)[] {
  const year = viewMonth.getFullYear();
  const month = viewMonth.getMonth();
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (Date | null)[] = Array(firstDay.getDay()).fill(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
  return cells;
}

export function DateRangeCalendar({ initialStart, initialEnd }: { initialStart?: string; initialEnd?: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [viewMonth, setViewMonth] = useState(() => {
    const base = initialEnd ? new Date(`${initialEnd}T00:00:00`) : new Date();
    return new Date(base.getFullYear(), base.getMonth(), 1);
  });
  const [rangeStart, setRangeStart] = useState<Date | null>(
    initialStart ? new Date(`${initialStart}T00:00:00`) : null
  );
  const [rangeEnd, setRangeEnd] = useState<Date | null>(initialEnd ? new Date(`${initialEnd}T00:00:00`) : null);
  const containerRef = useRef<HTMLDivElement>(null);

  function handleDayClick(day: Date) {
    if (!rangeStart || (rangeStart && rangeEnd)) {
      setRangeStart(day);
      setRangeEnd(null);
      return;
    }
    if (day < rangeStart) {
      setRangeEnd(rangeStart);
      setRangeStart(day);
    } else {
      setRangeEnd(day);
    }
  }

  function handleApply() {
    if (!rangeStart) return;
    const end = rangeEnd ?? rangeStart;
    router.push(`/?start=${toDateKey(rangeStart)}&end=${toDateKey(end)}`);
    setOpen(false);
  }

  function changeMonth(delta: number) {
    setViewMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + delta, 1));
  }

  const cells = buildMonthGrid(viewMonth);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  function isInRange(day: Date): boolean {
    if (!rangeStart) return false;
    const end = rangeEnd ?? rangeStart;
    return day >= rangeStart && day <= end;
  }
  function isEndpoint(day: Date): boolean {
    return Boolean(
      (rangeStart && day.getTime() === rangeStart.getTime()) || (rangeEnd && day.getTime() === rangeEnd.getTime())
    );
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 rounded px-3 py-1 text-sm text-muted hover:bg-bg"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <path d="M16 2v4M8 2v4M3 10h18" />
        </svg>
        {initialStart && initialEnd ? "Período personalizado" : "Personalizado"}
      </button>

      {open && (
        <div className="absolute right-0 z-20 mt-2 w-72 rounded-lg border border-border bg-surface p-4 shadow-lg">
          <div className="mb-3 flex items-center justify-between">
            <button type="button" onClick={() => changeMonth(-1)} className="px-1 text-muted hover:text-ink">
              ‹
            </button>
            <div className="text-sm font-semibold text-ink">
              {MONTH_LABELS[viewMonth.getMonth()]} {viewMonth.getFullYear()}
            </div>
            <button type="button" onClick={() => changeMonth(1)} className="px-1 text-muted hover:text-ink">
              ›
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-[11px] text-muted">
            {WEEKDAY_LABELS.map((w, i) => (
              <div key={i} className="py-1">
                {w}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {cells.map((day, i) => {
              if (!day) return <div key={i} />;
              const future = day > today;
              return (
                <button
                  key={i}
                  type="button"
                  disabled={future}
                  onClick={() => handleDayClick(day)}
                  className={`rounded py-1 text-xs transition-colors ${
                    future
                      ? "cursor-not-allowed text-muted/30"
                      : isEndpoint(day)
                        ? "bg-accent font-semibold text-white"
                        : isInRange(day)
                          ? "bg-accent/15 text-ink"
                          : "text-ink hover:bg-bg"
                  }`}
                >
                  {day.getDate()}
                </button>
              );
            })}
          </div>

          <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
            <span className="text-xs text-muted">
              {rangeStart ? toDateKey(rangeStart) : "início"} → {rangeEnd ? toDateKey(rangeEnd) : rangeStart ? toDateKey(rangeStart) : "fim"}
            </span>
            <div className="flex gap-2">
              <button type="button" onClick={() => setOpen(false)} className="rounded px-2 py-1 text-xs text-muted hover:bg-bg">
                Cancelar
              </button>
              <button
                type="button"
                disabled={!rangeStart}
                onClick={handleApply}
                className="rounded bg-accent px-3 py-1 text-xs font-semibold text-white disabled:opacity-50"
              >
                Aplicar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
