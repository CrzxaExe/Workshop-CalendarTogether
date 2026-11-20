"use client";

import { useMemo, useState } from "react";
import { Loader2, Plus, Search } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useEvents } from "@/hooks/useEvents";
import { useToast } from "@/components/Toast";
import StatCards from "@/components/StatCards";
import BentoCalendar from "@/components/BentoCalendar";
import UpcomingList from "@/components/UpcomingList";
import DayPanel from "@/components/DayPanel";
import EventModal from "@/components/EventModal";
import { formatDateLong } from "@/lib/date";
import type { EventInput, EventItem } from "@/lib/types";

type ModalState = { event?: EventItem; start?: Date; end?: Date } | null;

const card =
  "rounded-3xl border border-[#79d7fd]/35 bg-white/95 p-5 text-[#001736] shadow-[0_8px_24px_-14px_rgba(0,0,0,0.3)]";

export default function DashboardView() {
  const { user } = useAuth();
  const toast = useToast();

  const [scope, setScope] = useState<"all" | "mine">("all");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(() => new Date());
  const [modal, setModal] = useState<ModalState>(null);


  const { events, loading, error, refresh, createEvent, updateEvent, removeEvent } =
    useEvents(scope === "mine" ? user?.id : undefined);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return events;
    return events.filter(
      (e) =>
        e.title.toLowerCase().includes(q) ||
        (e.location ?? "").toLowerCase().includes(q) ||
        (e.owner?.name ?? "").toLowerCase().includes(q),
    );
  }, [events, query]);

  function openCreateOnSelected() {
    const start = new Date(selected);
    start.setHours(9, 0, 0, 0);
    setModal({ start, end: new Date(start.getTime() + 60 * 60 * 1000) });
  }

  async function handleSave(input: EventInput, id?: string) {
    if (id) {
      await updateEvent(id, input);
      toast.success("Event diperbarui");
    } else {
      await createEvent(input);
      toast.success("Event ditambahkan");
    }
    setModal(null);
  }

  async function handleDelete(id: string) {
    await removeEvent(id);
    toast.success("Event dihapus");
    setModal(null);
  }

  const firstName = user?.name.split(" ")[0] ?? "";

  return (
    <>
      {error && (
        <div className="mb-4 flex items-center justify-between rounded-2xl border border-[#f74031]/30 bg-[#fff0ee] px-4 py-3 text-sm text-[#98261c]">
          <span>{error}</span>
          <button onClick={refresh} className="font-semibold underline">
            Coba lagi
          </button>
        </div>
      )}

      <div className="grid auto-rows-[minmax(120px,auto)] grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-5">
        {/* Hero */}
        <div className="col-span-2 flex flex-col justify-between rounded-3xl border border-[#79d7fd]/25 bg-gradient-to-br from-[#00183e] to-[#001736] p-6 text-white shadow-[0_10px_24px_-14px_rgba(0,0,0,0.45)]">
          <div>
            <p className="text-sm text-[#79d7fd]">{formatDateLong(new Date())}</p>
            <h1 className="mt-1 text-2xl font-bold">Halo, {firstName}!</h1>
            <p className="mt-1 text-sm text-white/80">
              Atur jadwal bareng tim dalam satu kalender.
            </p>
          </div>
          <button
            onClick={() => setModal({})}
            className="mt-4 flex w-fit items-center gap-2 rounded-xl bg-[#ffc54a] px-4 py-2 text-sm font-semibold text-[#001736] transition hover:bg-[#ffda7e]"
          >
            <Plus className="size-4" /> Tambah event
          </button>
        </div>

        <StatCards events={events} />

        {/* Filter */}
        <div className={`${card} col-span-2 flex flex-col justify-center gap-3`}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#52677f]" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari judul, lokasi, atau pemilik..."
              className="w-full rounded-xl border border-[#b6dcea] bg-white py-2 pl-9 pr-3 text-sm text-[#001736] outline-none placeholder:text-[#52677f] focus:border-[#087ba2] focus:ring-1 focus:ring-[#087ba2]/45"
            />
          </div>
          <div className="flex rounded-xl bg-zinc-100 p-1 text-sm font-medium">
            {(
              [
                ["all", "Semua event"],
                ["mine", "Event saya"],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setScope(key)}
                className={`flex-1 rounded-lg py-1.5 transition ${
                  scope === key ? "bg-white text-[#001736] shadow-sm" : "text-[#52677f] hover:text-[#001736]"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Kalender 3D */}
        <div className="relative col-span-2 overflow-hidden rounded-3xl border border-[#79d7fd]/35 bg-gradient-to-b from-white to-[#eaf9ff] p-5 text-[#001736] shadow-[0_8px_24px_-14px_rgba(0,0,0,0.3)] lg:col-span-3">
          {loading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60">
              <Loader2 className="size-8 animate-spin text-[#00bbfa]" />
            </div>
          )}
          <BentoCalendar
            events={visible}
            selected={selected}
            onSelect={setSelected}
            onEventClick={(e) => setModal({ event: e })}
          />
        </div>

        {/* Upcoming: kolom kanan, memanjang ke bawah */}
        <div className={`${card} col-span-2 lg:col-span-1 lg:row-span-2`}>
          <UpcomingList events={visible} onEventClick={(e) => setModal({ event: e })} />
        </div>

        {/* Agenda tanggal terpilih */}
        <div className={`${card} col-span-2 lg:col-span-3`}>
          <DayPanel
            date={selected}
            events={visible}
            onEventClick={(e) => setModal({ event: e })}
            onCreate={openCreateOnSelected}
          />
        </div>
      </div>

      {modal && user && (
        <EventModal
          key={modal.event?.id ?? "new"}
          event={modal.event}
          defaultStart={modal.start}
          defaultEnd={modal.end}
          canEdit={!modal.event || modal.event.ownerId === user.id}
          onClose={() => setModal(null)}
          onSave={handleSave}
          onDelete={handleDelete}
        />
      )}
    </>
  );
}