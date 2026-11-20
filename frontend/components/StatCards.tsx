import { CalendarDays, CalendarRange, Lock, Sun } from "lucide-react";
import type { EventItem } from "@/lib/types";
import { addDays, eventOnDay, startOfWeek } from "@/lib/date";

function Card({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  tone: string;
}) {
  return (
    <div className="group flex flex-col justify-between rounded-3xl border border-[#79d7fd]/35 bg-white/95 p-5 text-[#001736] shadow-[0_8px_24px_-14px_rgba(0,0,0,0.3)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_26px_-16px_rgba(0,0,0,0.4)]">
      <div className={`flex size-10 items-center justify-center rounded-2xl ${tone}`}>
        <Icon className="size-5" />
      </div>
      <div>
        <p className="text-3xl font-bold">{value}</p>
        <p className="text-sm text-[#52677f]">{label}</p>
      </div>
    </div>
  );
}

export default function StatCards({ events }: { events: EventItem[] }) {
  const now = new Date();
  const weekStart = startOfWeek(now);

  const today = events.filter((e) => eventOnDay(e, now)).length;
  const thisWeek = events.filter((e) =>
    Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)).some((d) =>
      eventOnDay(e, d),
    ),
  ).length;
  const privateCount = events.filter((e) => !e.isPublic).length;

  return (
    <>
      <Card
        label="Total event"
        value={events.length}
        icon={CalendarDays}
        tone="bg-[#79d7fd]/50 text-[#001736]"
      />
      <Card
        label="Hari ini"
        value={today}
        icon={Sun}
        tone="bg-[#ffc54a]/60 text-[#001736]"
      />
      <Card
        label="Minggu ini"
        value={thisWeek}
        icon={CalendarRange}
        tone="bg-[#00bbfa]/25 text-[#001736]"
      />
      <Card
        label="Event privat"
        value={privateCount}
        icon={Lock}
        tone="bg-[#00183e] text-[#79d7fd]"
      />
    </>
  );
}