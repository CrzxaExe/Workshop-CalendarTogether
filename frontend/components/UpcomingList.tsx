import { Lock, MapPin } from "lucide-react";
import type { EventItem } from "@/lib/types";
import { formatDateTime } from "@/lib/date";

export default function UpcomingList({
  events,
  onEventClick,
}: {
  events: EventItem[];
  onEventClick: (e: EventItem) => void;
}) {
  const now = new Date().getTime();
  const upcoming = events
    .filter((e) => new Date(e.endAt).getTime() > now)
    .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime())
    .slice(0, 6);

  return (
    <div className="flex h-full flex-col">
      <h3 className="mb-3 text-lg font-bold">Event terdekat</h3>

      {upcoming.length === 0 ? (
        <p className="mt-2 text-sm text-[#52677f]">
          Belum ada event mendatang.
        </p>
      ) : (
        <div className="space-y-2.5">
          {upcoming.map((e) => (
            <button
              key={e.id}
              onClick={() => onEventClick(e)}
              className="block w-full rounded-2xl border-l-4 bg-white p-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              style={{ borderColor: e.color }}
            >
              <p className="flex items-center gap-1.5 font-semibold">
                <span className="truncate">{e.title}</span>
                {!e.isPublic && <Lock className="size-3 shrink-0 text-[#9b6900]" />}
              </p>
              <p className="text-xs text-[#52677f]">{formatDateTime(e.startAt)}</p>
              {e.location && (
                <p className="mt-0.5 flex items-center gap-1 text-xs text-[#52677f]">
                  <MapPin className="size-3" />
                  <span className="truncate">{e.location}</span>
                </p>
              )}
              {e.owner && (
                <p className="mt-0.5 text-xs text-[#52677f]">oleh {e.owner.name}</p>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}