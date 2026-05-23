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

export function isOverdueTask(task: Task): boolean {
  const date = parseTaskDate(task.dueDate);

  if (!date) {
    return false;
  }

  return (
    startOfLocalDay(date).getTime() < startOfLocalDay(new Date()).getTime()
  );
}

export function isUpcomingTask(task: Task, days = 7): boolean {
  const date = parseTaskDate(task.dueDate);

  if (!date) {
    return false;
  }

  const today = startOfLocalDay(new Date()).getTime();
  const target = startOfLocalDay(date).getTime();
  const limit = today + days * 24 * 60 * 60 * 1000;

  return target >= today && target <= limit;
}

function isSameLocalDate(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function startOfLocalDay(date: Date): Date {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}
