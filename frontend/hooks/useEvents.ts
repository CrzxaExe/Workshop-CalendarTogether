"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { EventInput, EventItem } from "@/lib/types";

function fetchEvents(ownerId?: string) {
  const qs = ownerId ? `?ownerId=${encodeURIComponent(ownerId)}` : "";
  return api<EventItem[]>(`/events${qs}`);
}


export function useEvents(ownerId?: string) {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    try {
      setEvents(await fetchEvents(ownerId));
      setError("");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [ownerId]);


  useEffect(() => {
    let cancelled = false;
    fetchEvents(ownerId)
      .then((data) => {
        if (cancelled) return;
        setEvents(data);
        setError("");
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [ownerId]);

  const createEvent = useCallback(
    async (input: EventInput) => {
      await api("/events", { method: "POST", body: JSON.stringify(input) });
      await refresh();
    },
    [refresh],
  );

  const updateEvent = useCallback(
    async (id: string, input: Partial<EventInput>) => {
      await api(`/events/${id}`, {
        method: "PATCH",
        body: JSON.stringify(input),
      });
      await refresh();
    },
    [refresh],
  );

  const removeEvent = useCallback(
    async (id: string) => {
      await api(`/events/${id}`, { method: "DELETE" });
      await refresh();
    },
    [refresh],
  );

  return {
    events,
    loading,
    error,
    refresh,
    createEvent,
    updateEvent,
    removeEvent,
  };
}