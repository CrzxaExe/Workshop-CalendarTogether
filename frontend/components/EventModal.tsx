"use client";

import { useState } from "react";
import { Globe, Loader2, Lock, MapPin, Trash2, User, X } from "lucide-react";
import type { EventInput, EventItem } from "@/lib/types";
import { fromInputValue, toInputValue } from "@/lib/date";

const COLORS = [
  "#79d7fd",
  "#00bbfa",
  "#001736",
  "#00183e",
  "#ffc54a",
  "#f74031",
];

type Props = {

  event?: EventItem | null;

  defaultStart?: Date;
  defaultEnd?: Date;

  canEdit: boolean;
  onClose: () => void;
  onSave: (input: EventInput, id?: string) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
};

function defaultRange(start?: Date, end?: Date): [Date, Date] {
  if (start) return [start, end ?? new Date(start.getTime() + 60 * 60 * 1000)];
  const s = new Date();
  s.setMinutes(0, 0, 0);
  s.setHours(s.getHours() + 1);
  return [s, new Date(s.getTime() + 60 * 60 * 1000)];
}

export default function EventModal({
  event,
  defaultStart,
  defaultEnd,
  canEdit,
  onClose,
  onSave,
  onDelete,
}: Props) {
  const isNew = !event;
  const [dStart, dEnd] = defaultRange(defaultStart, defaultEnd);

  const [title, setTitle] = useState(event?.title ?? "");
  const [description, setDescription] = useState(event?.description ?? "");
  const [location, setLocation] = useState(event?.location ?? "");
  const [startAt, setStartAt] = useState(toInputValue(event?.startAt ?? dStart));
  const [endAt, setEndAt] = useState(toInputValue(event?.endAt ?? dEnd));
  const [color, setColor] = useState(event?.color ?? COLORS[0]);
  const [isPublic, setIsPublic] = useState(event?.isPublic ?? true);

  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!title.trim()) return setError("Judul wajib diisi");
    if (!startAt || !endAt) return setError("Waktu mulai dan selesai wajib diisi");
    if (new Date(startAt) >= new Date(endAt))
      return setError("Waktu selesai harus setelah waktu mulai");

    setSaving(true);
    try {
      await onSave(
        {
          title: title.trim(),
          description: description.trim() || null,
          location: location.trim() || null,
          color,
          startAt: fromInputValue(startAt),
          endAt: fromInputValue(endAt),
          isPublic,
        },
        event?.id,
      );
    } catch (err) {
      setError((err as Error).message);
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!event || !onDelete) return;
    if (!confirmDelete) return setConfirmDelete(true);
    setSaving(true);
    try {
      await onDelete(event.id);
    } catch (err) {
      setError((err as Error).message);
      setSaving(false);
    }
  }

  const inputCls =
    "w-full rounded-xl border border-[#b6dcea] bg-white px-3 py-2 text-sm text-[#001736] outline-none placeholder:text-[#52677f] focus:border-[#087ba2] focus:ring-1 focus:ring-[#087ba2]/45 disabled:bg-[#f2f8fb] disabled:text-[#52677f]";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#001736]/55 p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <form
        onSubmit={handleSubmit}
        className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl"
      >
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold">
              {isNew ? "Tambah event" : canEdit ? "Edit event" : "Detail event"}
            </h2>
            {!isNew && event?.owner && (
              <p className="mt-0.5 flex items-center gap-1 text-xs text-[#52677f]">
                <User className="size-3" /> Dibuat oleh {event.owner.name}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-[#52677f] hover:bg-[#eaf9ff]"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Judul</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={!canEdit}
              maxLength={255}
              placeholder="Contoh: Rapat kelompok"
              className={inputCls}
              autoFocus={canEdit}
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">Mulai</label>
              <input
                type="datetime-local"
                value={startAt}
                onChange={(e) => setStartAt(e.target.value)}
                disabled={!canEdit}
                className={inputCls}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Selesai</label>
              <input
                type="datetime-local"
                value={endAt}
                onChange={(e) => setEndAt(e.target.value)}
                disabled={!canEdit}
                className={inputCls}
              />
            </div>
          </div>

          <div>
            <label className="mb-1 flex items-center gap-1 text-sm font-medium">
              <MapPin className="size-3.5" /> Lokasi
            </label>
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              disabled={!canEdit}
              maxLength={255}
              placeholder="Opsional"
              className={inputCls}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Deskripsi</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={!canEdit}
              rows={3}
              maxLength={5000}
              placeholder="Opsional"
              className={inputCls}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Warna</label>
            <div className="flex flex-wrap items-center gap-2">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  disabled={!canEdit}
                  onClick={() => setColor(c)}
                  className={`size-7 rounded-full transition ${
                    color.toLowerCase() === c.toLowerCase()
                      ? "scale-110 ring-2 ring-offset-2 ring-zinc-700"
                      : "hover:scale-110"
                  }`}
                  style={{ background: c }}
                  aria-label={`Warna ${c}`}
                />
              ))}
              {canEdit && (
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="size-7 cursor-pointer rounded-full border-0 bg-transparent p-0"
                  title="Warna lain"
                />
              )}
            </div>
          </div>

          <button
            type="button"
            disabled={!canEdit}
            onClick={() => setIsPublic(!isPublic)}
            className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left text-sm transition ${
              isPublic
                ? "border-[#00bbfa]/40 bg-[#eaf9ff] text-[#001736]"
                : "border-[#ffc54a]/70 bg-[#fff7e2] text-[#624400]"
            }`}
          >
            {isPublic ? <Globe className="size-4" /> : <Lock className="size-4" />}
            <span className="flex-1">
              <span className="font-semibold">
                {isPublic ? "Publik" : "Privat"}
              </span>
              <span className="block text-xs opacity-80">
                {isPublic
                  ? "Semua pengguna bisa melihat event ini"
                  : "Hanya kamu yang bisa melihat event ini"}
              </span>
            </span>
          </button>

          {error && (
            <p className="rounded-lg border border-[#f74031]/30 bg-[#fff0ee] px-3 py-2 text-sm text-[#98261c]">
              {error}
            </p>
          )}
        </div>

        <div className="mt-6 flex items-center justify-between gap-2">
          {!isNew && canEdit && onDelete ? (
            <button
              type="button"
              onClick={handleDelete}
              disabled={saving}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium transition ${
                confirmDelete
                  ? "bg-[#f74031] text-white"
                  : "text-[#c42e22] hover:bg-[#fff0ee]"
              }`}
            >
              <Trash2 className="size-4" />
              {confirmDelete ? "Klik lagi untuk hapus" : "Hapus"}
            </button>
          ) : (
            <span />
          )}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2 text-sm font-medium text-[#52677f] hover:bg-[#eaf9ff]"
            >
              {canEdit ? "Batal" : "Tutup"}
            </button>
            {canEdit && (
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 rounded-xl bg-[#00183e] px-5 py-2 text-sm font-semibold text-white hover:bg-[#087ba2] disabled:opacity-60"
              >
                {saving && <Loader2 className="size-4 animate-spin" />}
                Simpan
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}