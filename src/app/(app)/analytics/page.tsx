'use client';

import { useEffect, useState } from 'react';
import { useStore } from '@/lib/store';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  AlertTriangle,
  BarChart3,
  FileWarning,
  Heart,
  IndianRupee,
  Sparkles,
  TrendingUp,
  Users,
} from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import type { ProjectRisk } from '@/lib/types';
import { detectProjectRisks, calculateClientHealthScore } from '@/lib/ai-service';

export default function AnalyticsPage() {
  const { projects, clients, tasks, changeRequests, dashboardStats } = useStore();
  const [allRisks, setAllRisks] = useState<Record<string, ProjectRisk[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const map: Record<string, ProjectRisk[]> = {};
      for (const p of projects) {
        const crForProject = changeRequests.filter((c) => c.projectId === p.id);
        const budgetTotal = p.budget || 100000;
        const extraBudget = crForProject.reduce(
          (s, cr) => s + cr.additionalCost,
          0
        );
        const scopeIncreasePercent = Math.round(
          (extraBudget / Math.max(budgetTotal, 1)) * 100
        );
        const daysLeft = p.deadline
          ? Math.max(
              0,
              Math.ceil(
                (new Date(p.deadline).getTime() - Date.now()) / 86400000
              )
            )
          : 20;
        const risks = await detectProjectRisks({
          recentChanges: crForProject.length + 1,
          scopeIncreasePercent,
          daysToDeadline: daysLeft,
          pendingApprovals: crForProject.filter((c) => c.status === 'pending')
            .length,
          sentimentTrend: 'stable',
        });
        map[p.id] = risks;
      }
      setAllRisks(map);
      setLoading(false);
    })();
  }, [projects, changeRequests.length]);

  const totalHoursEstimate = tasks.reduce(
    (s, t) => s + (t.estimatedHours || 0),
    0
  );
  const totalHoursDone = tasks
    .filter((t) => t.status === 'done')
    .reduce((s, t) => s + (t.estimatedHours || 0), 0);
  const scopeCreepCount = Object.values(allRisks).filter((risks) =>
    risks.some((r) => r.type === 'scope' && r.severity !== 'low')
  ).length;
  const atRiskProjects = Object.values(allRisks).filter((risks) =>
    risks.some((r) => r.severity === 'high')
  ).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <BarChart3 className="w-6 h-6" /> AI Insights
        </h1>
        <p className="text-muted-foreground text-sm">
          Actionable analytics and signals across your business.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          {
            label: 'Projects at risk',
            value: atRiskProjects.toString(),
            icon: AlertTriangle,
            color: 'from-red-500 to-rose-600',
          },
          {
            label: 'Scope creep incidents',
            value: scopeCreepCount.toString(),
            icon: FileWarning,
            color: 'from-amber-500 to-orange-500',
          },
          {
            label: 'Avg task completion',
            value:
              totalHoursEstimate > 0
                ? Math.round((totalHoursDone / totalHoursEstimate) * 100) + '%'
                : '—',
            icon: TrendingUp,
            color: 'from-emerald-500 to-teal-500',
          },
          {
            label: 'Pipeline revenue',
            value: formatCurrency(
              projects.reduce(
                (s, p) => s + (p.budget || 0),
                0
              )
            ),
            icon: IndianRupee,
            color: 'from-indigo-500 to-violet-600',
          },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">{s.label}</p>
                  <p className="text-2xl font-bold">{s.value}</p>
                </div>
                <div
                  className={cn(
                    'w-10 h-10 rounded-lg bg-gradient-to-br text-white flex items-center justify-center',
                    s.color
                  )}
                >
                  <s.icon className="w-5 h-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" /> Project Risk Radar
            </CardTitle>
            <CardDescription>
              AI-flagged issues across active projects.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                <Sparkles className="w-5 h-5 mx-auto mb-2 animate-pulse" />
                Analyzing project risks...
              </div>
            ) : (
              projects.map((p) => {
                const risks = allRisks[p.id] || [];
                const hasHigh = risks.some((r) => r.severity === 'high');
                const hasMed = risks.some((r) => r.severity === 'medium');
                return (
                  <div
                    key={p.id}
                    className={cn(
                      'p-3 rounded-lg border',
                      hasHigh
                        ? 'border-red-200 bg-red-50/60 dark:bg-red-500/5 dark:border-red-500/20'
                        : hasMed
                        ? 'border-amber-200 bg-amber-50/60 dark:bg-amber-500/5 dark:border-amber-500/20'
                        : 'border-emerald-200 bg-emerald-50/40 dark:bg-emerald-500/5 dark:border-emerald-500/20'
                    )}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium text-sm">{p.name}</p>
                      <div className="flex gap-1">
                        {hasHigh && <Badge variant="danger">High risk</Badge>}
                        {!hasHigh && hasMed && <Badge variant="warning">Medium</Badge>}
                        {!hasHigh && !hasMed && <Badge variant="success">On track</Badge>}
                      </div>
                    </div>
                    {risks.slice(0, 2).map((r, i) => (
                      <p key={i} className="text-xs text-muted-foreground">
                        • {r.message}
                      </p>
                    ))}
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-violet-500" /> Client Health Ranking
            </CardTitle>
            <CardDescription>
              Ranked by overall client health score.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {clients
              .slice()
              .sort(
                (a, b) =>
                  (b.healthScore?.overall ?? 0) - (a.healthScore?.overall ?? 0)
              )
              .map((c, i) => {
                const score = c.healthScore?.overall ?? 70;
                const color =
                  score >= 80
                    ? 'text-emerald-600 dark:text-emerald-400 [&>div]:bg-emerald-500'
                    : score >= 60
                    ? 'text-amber-600 dark:text-amber-400 [&>div]:bg-amber-500'
                    : 'text-red-600 dark:text-red-400 [&>div]:bg-red-500';
                const clientProjects = projects.filter(
                  (p) => p.clientId === c.id
                );
                return (
                  <div key={c.id} className="flex items-center gap-3">
                    <span className="w-6 text-xs text-muted-foreground text-center">
                      #{i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium truncate">{c.name}</p>
                        <span
                          className={cn(
                            'font-bold text-sm flex items-center gap-1',
                            color
                          )}
                        >
                          {score}
                          <Heart className="w-3 h-3" />
                        </span>
                      </div>
                      <Progress
                        value={score}
                        className={cn(
                          'h-1.5',
                          score >= 80
                            ? '[&>div]:bg-emerald-500'
                            : score >= 60
                            ? '[&>div]:bg-amber-500'
                            : '[&>div]:bg-red-500'
                        )}
                      />
                      <p className="text-[11px] text-muted-foreground mt-1">
                        {clientProjects.length} project
                        {clientProjects.length === 1 ? '' : 's'}
                      </p>
                    </div>
                  </div>
                );
              })}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Summary</CardTitle>
          <CardDescription>
            AI-powered business snapshot for the last 30 days.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Alert variant={atRiskProjects > 0 ? 'warning' : 'success'}>
            <Sparkles className="w-4 h-4" />
            <AlertTitle>
              {atRiskProjects > 0
                ? `Review needed for ${atRiskProjects} project(s)`
                : 'Great work — all projects are on track!'}
            </AlertTitle>
            <AlertDescription>
              {scopeCreepCount
                ? `${scopeCreepCount} scope creep incident(s) detected across portfolio. Consider consolidating changes into change requests to protect revenue.`
                : 'Scope is stable across projects. Continue enforcing baseline at kickoffs.'}
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-4 rounded-lg border">
              <p className="text-xs uppercase text-muted-foreground tracking-wide">
                Revenue
              </p>
              <p className="text-xl font-bold mt-0.5">
                {formatCurrency(dashboardStats.revenue)}
              </p>
              <p className="text-xs text-emerald-600 mt-1">↑ 12.4% this month</p>
            </div>
            <div className="p-4 rounded-lg border">
              <p className="text-xs uppercase text-muted-foreground tracking-wide">
                Pending payments
              </p>
              <p className="text-xl font-bold mt-0.5">
                {formatCurrency(dashboardStats.pendingPayments)}
              </p>
              <p className="text-xs text-amber-600 mt-1">Follow up with 2 clients</p>
            </div>
            <div className="p-4 rounded-lg border">
              <p className="text-xs uppercase text-muted-foreground tracking-wide">
                Pending approvals
              </p>
              <p className="text-xl font-bold mt-0.5">
                {formatCurrency(dashboardStats.pendingApprovals)}
              </p>
              <p className="text-xs text-indigo-600 mt-1">
                {dashboardStats.scopeChanges} scope change(s) tracked
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
