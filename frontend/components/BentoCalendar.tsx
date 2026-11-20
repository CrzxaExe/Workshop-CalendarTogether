"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { EventItem } from "@/lib/types";
import { getReadableTextColor } from "@/lib/colors";
import {
  HARI_PENDEK,
  addDays,
  eventOnDay,
  sameDay,
  startOfWeek,
} from "@/lib/date";

type Props = {
  events: EventItem[];
  selected: Date;
  onSelect: (d: Date) => void;
  onEventClick: (e: EventItem) => void;
};


function depthFor(count: number) {
  return 10 + Math.min(count, 5) * 11;
}

export default function BentoCalendar({
  events,
  selected,
  onSelect,
  onEventClick,
}: Props) {
  const [cursor, setCursor] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });


  const days = useMemo(() => {
    const start = startOfWeek(new Date(cursor.getFullYear(), cursor.getMonth(), 1));
    return Array.from({ length: 42 }, (_, i) => addDays(start, i));
  }, [cursor]);

  const today = new Date();

  function moveMonth(step: number) {
    setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + step, 1));
  }

  function goToday() {
    const d = new Date();
    setCursor(new Date(d.getFullYear(), d.getMonth(), 1));
    onSelect(d);
  }

  return (
    <div>
      <div className="relative z-20 mb-2 flex items-center justify-between">
        <h3 className="text-xl font-bold capitalize">
          {cursor.toLocaleDateString("id-ID", { month: "long", year: "numeric" })}
        </h3>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => moveMonth(-1)}
            className="rounded-full bg-white p-2 text-[#001736] hover:bg-[#dff5ff]"
            aria-label="Bulan sebelumnya"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            onClick={goToday}
            className="rounded-full bg-white px-3 py-1.5 text-sm font-medium text-[#001736] hover:bg-[#dff5ff]"
          >
            Hari ini
          </button>
          <button
            onClick={() => moveMonth(1)}
            className="rounded-full bg-white p-2 text-[#001736] hover:bg-[#dff5ff]"
            aria-label="Bulan berikutnya"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>

      {/* Sudut pandang dari atas: papan dimiringkan ke belakang */}
      <div
        className="bento-stage -mb-10 -mt-12 pb-4 sm:-mb-14 sm:-mt-[76px] sm:pb-8"
        style={{ perspective: "2600px", perspectiveOrigin: "50% 50%" }}
      >
        <div
          className="bento-board mx-auto grid w-[90%] grid-cols-7 gap-x-1.5 gap-y-7 sm:gap-x-2.5 sm:gap-y-9"
          style={{
            transform: "rotateX(40deg)",
            transformOrigin: "50% 50%",
            transformStyle: "preserve-3d",
          }}
        >
          {HARI_PENDEK.map((h) => (
            <div
              key={h}
              className="pb-1 text-center text-xs font-semibold uppercase tracking-wide text-[#52677f]"
            >
              {h}
            </div>
          ))}

          {days.map((d) => {
            const list = events
              .filter((e) => eventOnDay(e, d))
              .sort(
                (a, b) =>
                  new Date(a.startAt).getTime() - new Date(b.startAt).getTime(),
              );
            const depth = depthFor(list.length);
            const inMonth = d.getMonth() === cursor.getMonth();
            const isToday = sameDay(d, today);
            const isSel = sameDay(d, selected);
            const sideColor = list[0]?.color ?? "#79d7fd";

            return (
              <div
                key={d.toISOString()}
                role="button"
                tabIndex={0}
                aria-label={d.toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "long",
                })}
                onClick={() => onSelect(d)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onSelect(d);
                  }
                }}
                className="relative h-[68px] cursor-pointer outline-none transition-transform duration-200 hover:[transform:translateZ(16px)] focus-visible:[transform:translateZ(16px)] sm:h-[96px]"
                style={{
                  transformStyle: "preserve-3d",
                  opacity: inMonth ? 1 : 0.5,
                }}
              >
                {/* Bayangan di lantai */}
                <div
                  className="absolute inset-0 rounded-lg bg-[#001736]/20 blur-[4px] sm:rounded-xl"
                  style={{ transform: "translateZ(0)" }}
                />

                {/* Permukaan atas balok: tempat angka tanggal */}
                <div
                  className={`absolute inset-0 overflow-hidden rounded-lg border p-1 sm:rounded-xl sm:p-2 ${
                    isSel
                      ? "border-[#087ba2] bg-[#eaf9ff] ring-1 ring-[#087ba2]/50"
                      : "border-[#d7eaf3] bg-white shadow-sm"
                  }`}
                  style={{ transform: `translateZ(${depth}px)` }}
                >
                  <span
                    className={`inline-flex min-w-6 items-center justify-center rounded-full px-1 text-sm font-bold sm:text-base ${
                      isToday ? "bg-[#00183e] text-white" : "text-[#001736]"
                    }`}
                  >
                    {d.getDate()}
                  </span>

                  {/* Desktop: chip judul event */}
                  <div className="mt-0.5 hidden space-y-0.5 sm:block">
                    {list.slice(0, 2).map((e) => (
                      <p
                        key={e.id}
                        onClick={(ev) => {
                          ev.stopPropagation();
                          onEventClick(e);
                        }}
                        className="truncate rounded px-1 text-[10px] leading-4"
                        style={{
                          background: e.color,
                          color: getReadableTextColor(e.color),
                        }}
                      >
                        {e.title}
                      </p>
                    ))}
                    {list.length > 2 && (
                      <p className="text-[10px] text-[#52677f]">
                        +{list.length - 2} lagi
                      </p>
                    )}
                  </div>

                  {/* Mobile: titik warna */}
                  <div className="mt-1 flex flex-wrap gap-0.5 sm:hidden">
                    {list.slice(0, 4).map((e) => (
                      <span
                        key={e.id}
                        className="size-1.5 rounded-full"
                        style={{ background: e.color }}
                      />
                    ))}
                  </div>
                </div>

                {/* Sisi depan balok: tampak "turun ke bawah" */}
                <div
                  className="absolute left-0 top-full w-full rounded-b-lg sm:rounded-b-xl"
                  style={{
                    height: depth,
                    background: sideColor,
                    filter: "brightness(0.78)",
                    transformOrigin: "top",
                    transform: "rotateX(90deg)",
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}