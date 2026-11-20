"use client";

import { useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import idLocale from "@fullcalendar/core/locales/id";
import type { EventDropArg } from "@fullcalendar/core";
import type { EventResizeDoneArg } from "@fullcalendar/interaction";
import { Loader2, Lock } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useEvents } from "@/hooks/useEvents";
import { useToast } from "@/components/Toast";
import EventModal from "@/components/EventModal";
import type { EventInput, EventItem } from "@/lib/types";
import { getReadableTextColor } from "@/lib/colors";

type ModalState = { event?: EventItem; start?: Date; end?: Date } | null;

export default function CalendarView() {
  const { user } = useAuth();
  const toast = useToast();
  const { events, loading, error, refresh, createEvent, updateEvent, removeEvent } =
    useEvents();
  const [modal, setModal] = useState<ModalState>(null);


  async function saveTime(info: EventDropArg | EventResizeDoneArg) {
    const { event } = info;
    if (!event.start) return info.revert();
    const end = event.end ?? new Date(event.start.getTime() + 60 * 60 * 1000);
    try {
      await updateEvent(event.id, {
        startAt: event.start.toISOString(),
        endAt: end.toISOString(),
      });
      toast.success("Jadwal dipindahkan");
    } catch (err) {
      info.revert();
      toast.error((err as Error).message);
    }
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

      <div className="relative rounded-3xl border border-[#79d7fd]/35 bg-white/95 p-4 text-[#001736] shadow-[0_8px_24px_-14px_rgba(0,0,0,0.3)] sm:p-6">
        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center rounded-3xl bg-white/60">
            <Loader2 className="size-8 animate-spin text-[#00bbfa]" />
          </div>
        )}

        <p className="mb-3 text-sm text-zinc-500">
          Tarik event untuk memindahkan jadwal, tarik tepi bawah untuk mengubah
          durasi. Hanya event milikmu yang bisa digeser. Klik/seret area kosong
          untuk membuat event baru.
        </p>

        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          locale={idLocale}
          firstDay={1}
          initialView="dayGridMonth"
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay",
          }}
          buttonText={{
            today: "Hari ini",
            month: "Bulan",
            week: "Minggu",
            day: "Hari",
          }}
          height="auto"
          nowIndicator
          dayMaxEvents={3}
          selectable
          selectMirror
          events={events.map((e) => ({
            id: e.id,
            title: e.title,
            start: e.startAt,
            end: e.endAt,
            color: e.color,
            textColor: getReadableTextColor(e.color),
            editable: e.ownerId === user?.id,
            extendedProps: { raw: e },
          }))}
          eventContent={({ event }) => {
            const raw = event.extendedProps.raw as EventItem;
            return (
              <span className="flex items-center gap-1 overflow-hidden px-0.5">
                {!raw.isPublic && <Lock className="size-3 shrink-0" />}
                <span className="truncate">{event.title}</span>
              </span>
            );
          }}
          eventDrop={saveTime}
          eventResize={saveTime}
          eventClick={(info) => {
            const raw = info.event.extendedProps.raw as EventItem;
            setModal({ event: raw });
          }}
          select={(info) => {
            let start = info.start;
            let end = info.end;
   
            if (info.allDay) {
              start = new Date(info.start);
              start.setHours(9, 0, 0, 0);
              end = new Date(start.getTime() + 60 * 60 * 1000);
            }
            setModal({ start, end });
          }}
        />
      </div>

      {modal && user && (
        <EventModal
          key={modal.event?.id ?? `new-${modal.start?.getTime() ?? 0}`}
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