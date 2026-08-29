"use client";

import { Badge } from "./badge";
import type {
  Priority,
  TaskStatus,
  ProjectStatus,
  ChangeRequestStatus,
} from "@/lib/types";
import { cn } from "@/lib/utils";

export function PriorityBadge({ priority }: { priority: Priority }) {
  const map = {
    high: { label: "🔴 High", variant: "danger" as const },
    medium: { label: "🟡 Medium", variant: "warning" as const },
    low: { label: "🟢 Low", variant: "success" as const },
  };
  return <Badge variant={map[priority].variant}>{map[priority].label}</Badge>;
}

export function StatusBadge({
  status,
}: {
  status: TaskStatus | ProjectStatus | ChangeRequestStatus;
}) {
  const map: Record<
    string,
    {
      label: string;
      variant:
        | "success"
        | "warning"
        | "secondary"
        | "danger"
        | "outline"
        | "default";
    }
  > = {
    todo: { label: "To do", variant: "secondary" },
    "in-progress": { label: "In progress", variant: "warning" },
    done: { label: "Done", variant: "success" },
    blocked: { label: "Blocked", variant: "danger" },
    planning: { label: "Planning", variant: "secondary" },
    active: { label: "Active", variant: "warning" },
    review: { label: "Review", variant: "outline" },
    completed: { label: "Completed", variant: "success" },
    "on-hold": { label: "On hold", variant: "danger" },
    pending: { label: "Pending", variant: "warning" },
    approved: { label: "Approved", variant: "success" },
    rejected: { label: "Rejected", variant: "danger" },
  };
  const m = map[status] ?? { label: status, variant: "secondary" };
  return <Badge variant={m.variant}>{m.label}</Badge>;
}

export function HealthBadge({ health }: { health: number }) {
  const color =
    health >= 80
      ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
      : health >= 60
        ? "bg-amber-500/15 text-amber-700 dark:text-amber-400"
        : "bg-red-500/15 text-red-700 dark:text-red-400";
  const dot =
    health >= 80
      ? "bg-emerald-500"
      : health >= 60
        ? "bg-amber-500"
        : "bg-red-500";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold border-transparent",
        color,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", dot)} />
      {health}%
    </span>
  );
}
