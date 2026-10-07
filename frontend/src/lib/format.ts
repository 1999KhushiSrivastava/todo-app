import type { Todo } from "./types";

const pad = (n: number) => String(n).padStart(2, "0");
const toISO = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const fromISO = (s: string) => {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
};

export const todayISO = () => toISO(new Date());
export const nowHHMM = () => {
  const d = new Date();
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

export const isOverdue = (t: Todo) => !t.completed && !!t.dueDate && t.dueDate < todayISO();

/** "2026-12-31" -> "31 Dec 2026" (parsed as a local date, so no timezone shift) */
export const formatDate = (date: string) =>
  fromISO(date).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });

/** "14:30" -> "2:30 PM" (depends on the user's locale) */
export const formatTime = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return new Date(2000, 0, 1, h, m).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
};

/** Today / Tomorrow / "Wed, 7 Oct" */
export function relativeDay(date: string): string {
  const today = fromISO(todayISO());
  const diff = Math.round((fromISO(date).getTime() - today.getTime()) / 86_400_000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  if (diff === -1) return "Yesterday";
  return fromISO(date).toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" });
}

export const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString(undefined, { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

/** Sort key: due date, then due time (untimed tasks last within a day) */
export const dueKey = (t: Todo) => `${t.dueDate ?? "9999-99-99"} ${t.dueTime ?? "99:99"}`;
export const byDue = (a: Todo, b: Todo) => dueKey(a).localeCompare(dueKey(b));
