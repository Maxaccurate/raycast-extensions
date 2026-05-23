import type { Task } from "../types.js";

export function parseTaskDate(value?: string): Date | undefined {
  if (!value) {
    return undefined;
  }

  const normalized = value.replace(/([+-]\d{2})(\d{2})$/, "$1:$2");
  const date = new Date(normalized);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

export function isTodayTask(task: Task): boolean {
  const date = parseTaskDate(task.dueDate);
  return Boolean(date && isSameLocalDate(date, new Date()));
}

function isSameLocalDate(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}
