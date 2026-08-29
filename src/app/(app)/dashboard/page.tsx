'use client';

import { useStore } from '@/lib/store';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  IndianRupee,
  FolderKanban,
  AlertTriangle,
  CheckCircle2,
  ArrowUpRight,
  Clock,
  FileWarning,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { HealthBadge } from '@/components/ui/status-badges';
import Link from 'next/link';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export default function DashboardPage() {
  const { projects, dashboardStats, dashboardAlerts, tasks, clients } = useStore();

  const cards = [
    {
      title: 'Revenue',
      value: formatCurrency(dashboardStats.revenue),
      icon: IndianRupee,
      delta: '+12.4% this month',
      href: '/analytics',
      color: 'from-indigo-500 to-violet-600',
    },
    {
      title: 'Active Projects',
      value: dashboardStats.activeProjects.toString(),
      icon: FolderKanban,
      delta: `${tasks.filter((t) => t.status === 'in-progress').length} in progress`,
      href: '/projects',
      color: 'from-emerald-500 to-teal-600',
    },
    {
      title: 'Pending Payments',
      value: formatCurrency(dashboardStats.pendingPayments),
      icon: Clock,
      delta: 'Follow up with 2 clients',
      href: '/clients',
      color: 'from-amber-500 to-orange-600',
    },
    {
      title: 'Pending Approvals',
      value: formatCurrency(dashboardStats.pendingApprovals),
      icon: CheckCircle2,
      delta: `${dashboardStats.scopeChanges} scope changes tracked`,
      href: '/change-requests',
      color: 'from-rose-500 to-pink-600',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Good evening, Satwik 👋
        </h1>
        <p className="text-muted-foreground">
          Here's what's happening across your projects today.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {cards.map((c) => (
          <Link key={c.title} href={c.href} className="block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <Card className="h-full transition-colors hover:border-primary/50">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="space-y-1.5">
                  <p className="text-sm text-muted-foreground">{c.title}</p>
                  <p className="text-2xl font-bold tracking-tight">{c.value}</p>
                  <p className="text-xs text-muted-foreground">{c.delta}</p>
                </div>
                <div
                  className={cn(
                    'w-10 h-10 rounded-lg bg-gradient-to-br text-white flex items-center justify-center',
                    c.color
                  )}
                >
                  <c.icon className="w-5 h-5" />
                </div>
              </div>
            </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Project Health</CardTitle>
              <CardDescription>Current status across active projects</CardDescription>
            </div>
            <Link href="/projects">
              <Button variant="ghost" size="sm">
                View all
                <ArrowUpRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-4">
            {projects.slice(0, 5).map((p) => {
              const client = clients.find((c) => c.id === p.clientId);
              const projectTasks = tasks.filter((t) => t.projectId === p.id);
              const done = projectTasks.filter((t) => t.status === 'done').length;
              const progress = projectTasks.length
                ? (done / projectTasks.length) * 100
                : 0;
              return (
                <div
                  key={p.id}
                  className="flex items-center gap-4 p-3 rounded-lg border border-slate-200/60 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/projects/${p.id}`}
                        className="font-medium truncate hover:underline"
                      >
                        {p.name}
                      </Link>
                      {p.health !== undefined && <HealthBadge health={p.health} />}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {client?.name ?? 'Unknown client'} · {projectTasks.length} tasks
                    </p>
                    <div className="mt-2 flex items-center gap-3">
                      <Progress value={progress} className="h-1.5 max-w-[200px]" />
                      <span className="text-xs text-muted-foreground">
                        {done}/{projectTasks.length} done
                      </span>
                    </div>
                  </div>
                  <div className="hidden sm:block text-right text-xs text-muted-foreground">
                    {p.deadline
                      ? `Due ${new Date(p.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`
                      : 'No deadline'}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileWarning className="w-4 h-4 text-amber-500" />
              AI Alerts
            </CardTitle>
            <CardDescription>Proactive project risk insights</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {dashboardAlerts.map((a, i) => {
              const color =
                a.severity === 'high'
                  ? 'border-red-200 bg-red-50/60 dark:bg-red-500/5 dark:border-red-500/20'
                  : a.severity === 'medium'
                  ? 'border-amber-200 bg-amber-50/60 dark:bg-amber-500/5 dark:border-amber-500/20'
                  : 'border-emerald-200 bg-emerald-50/60 dark:bg-emerald-500/5 dark:border-emerald-500/20';
              const Icon = a.severity === 'high' ? AlertTriangle : FileWarning;
              return (
                <div
                  key={i}
                  className={cn(
                    'p-3 rounded-lg border text-sm space-y-1',
                    color
                  )}
                >
                  <div className="flex items-center gap-2 font-medium">
                    <Icon className="w-4 h-4" />
                    {a.title}
                  </div>
                  <p className="text-xs text-muted-foreground">{a.message}</p>
                  <div className="pt-1">
                    <Badge variant="outline" className="text-[10px] uppercase tracking-wide">
                      {a.type}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
