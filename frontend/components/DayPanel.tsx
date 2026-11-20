import { Lock, MapPin, Plus } from "lucide-react";
import type { EventItem } from "@/lib/types";
import { eventOnDay, formatDateLong, formatTime } from "@/lib/date";

export default function DayPanel({
  date,
  events,
  onEventClick,
  onCreate,
}: {
  date: Date;
  events: EventItem[];
  onEventClick: (e: EventItem) => void;
  onCreate: () => void;
}) {
  const list = events
    .filter((e) => eventOnDay(e, date))
    .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime());

  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-2">
        <div>
          <h3 className="text-lg font-bold">Agenda</h3>
          <p className="text-sm text-zinc-500">{formatDateLong(date)}</p>
        </div>
        <button
          onClick={onCreate}
          className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow hover:bg-indigo-700"
        >
          <Plus className="size-4" /> Tambah
        </button>
      </div>

      {list.length === 0 ? (
        <p className="rounded-2xl bg-zinc-50 p-4 text-center text-sm text-zinc-500">
          Tidak ada event di tanggal ini.
        </p>
      ) : (
        <div className="grid gap-2.5 sm:grid-cols-2">
          {list.map((e) => (
            <button
              key={e.id}
              onClick={() => onEventClick(e)}
              className="rounded-2xl border-l-4 bg-white p-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              style={{ borderColor: e.color }}
            >
              <p className="flex items-center gap-1.5 font-semibold">
                <span className="truncate">{e.title}</span>
                {!e.isPublic && <Lock className="size-3 shrink-0 text-amber-500" />}
              </p>
              <p className="text-xs text-zinc-500">
                {formatTime(e.startAt)} – {formatTime(e.endAt)}
              </p>
              {e.location && (
                <p className="mt-0.5 flex items-center gap-1 text-xs text-zinc-400">
                  <MapPin className="size-3" />
                  <span className="truncate">{e.location}</span>
                </p>
              )}
              {e.owner && (
                <p className="mt-0.5 text-xs text-zinc-400">oleh {e.owner.name}</p>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}