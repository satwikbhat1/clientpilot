'use client';

import { useEffect, useState } from 'react';
import { useStore } from '@/lib/store';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Copy,
  FileWarning,
  GripVertical,
  MessageSquare,
  Plus,
  Sparkles,
  Trash2,
  XCircle,
  Wand2,
} from 'lucide-react';
import {
  PriorityBadge,
  StatusBadge,
  HealthBadge,
} from '@/components/ui/status-badges';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { Priority, TaskStatus, ProjectRisk } from '@/lib/types';
import {
  detectScopeCreep,
  detectProjectRisks,
  generateClientReply,
} from '@/lib/ai-service';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function ProjectDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const {
    getProjectById,
    getClientById,
    getTasksByProject,
    updateProject,
    addTask,
    updateTask,
    deleteTask,
    addChangeRequest,
    getChangeRequestsByProject,
  } = useStore();

  const project = getProjectById(params.id);
  if (!project) {
    return (
      <div className="space-y-4 text-center py-20">
        <p>Project not found.</p>
        <Link href="/projects">
          <Button variant="ghost">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to projects
          </Button>
        </Link>
      </div>
    );
  }

  const client = getClientById(project.clientId);
  const tasks = getTasksByProject(project.id);
  const changeRequests = getChangeRequestsByProject(project.id);
  const done = tasks.filter((t) => t.status === 'done').length;
  const progress = tasks.length ? (done / tasks.length) * 100 : 0;

  const [addTaskOpen, setAddTaskOpen] = useState(false);
  const [scopeCreepOpen, setScopeCreepOpen] = useState(false);
  const [replyOpen, setReplyOpen] = useState(false);
  const [risks, setRisks] = useState<ProjectRisk[] | null>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [status, setStatus] = useState<TaskStatus>('todo');
  const [deadline, setDeadline] = useState('');
  const [hours, setHours] = useState('');

  const [creepText, setCreepText] = useState('');
  const [creepResult, setCreepResult] = useState<Awaited<
    ReturnType<typeof detectScopeCreep>
  > | null>(null);
  const [loadingCreep, setLoadingCreep] = useState(false);

  const [replySituation, setReplySituation] = useState<
    'scope-creep' | 'follow-up' | 'deadline' | 'update' | 'general'
  >('general');
  const [replyTone, setReplyTone] = useState<
    'professional' | 'friendly' | 'firm' | 'short'
  >('professional');
  const [replyText, setReplyText] = useState('');
  const [replyContext, setReplyContext] = useState('');
  const [loadingReply, setLoadingReply] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    (async () => {
      const changeCount = changeRequests.length + 1;
      const budgetTotal = project.budget || 100000;
      const extraBudget = changeRequests.reduce(
        (s, cr) => s + cr.additionalCost,
        8000
      );
      const scopeIncreasePercent = Math.round(
        (extraBudget / Math.max(budgetTotal, 1)) * 100
      );
      const daysLeft = project.deadline
        ? Math.max(
            0,
            Math.ceil(
              (new Date(project.deadline).getTime() - Date.now()) / 86400000
            )
          )
        : 20;
      const result = await detectProjectRisks({
        recentChanges: changeCount,
        scopeIncreasePercent,
        daysToDeadline: daysLeft,
        pendingApprovals: changeRequests.filter((c) => c.status === 'pending')
          .length,
        sentimentTrend: 'stable',
      });
      setRisks(result);
    })();
  }, [project, changeRequests.length]);

  const createTask = () => {
    if (!title.trim()) return;
    addTask({
      projectId: project.id,
      title,
      description: description || undefined,
      priority,
      status,
      deadline: deadline || undefined,
      estimatedHours: hours ? parseInt(hours) : undefined,
    });
    setAddTaskOpen(false);
    setTitle('');
    setDescription('');
    setPriority('medium');
    setStatus('todo');
    setDeadline('');
    setHours('');
  };

  const runScopeCreep = async () => {
    if (!creepText.trim()) return;
    setLoadingCreep(true);
    const res = await detectScopeCreep(
      project.originalScope || [],
      creepText,
      project.budget || 0
    );
    setCreepResult(res);
    setLoadingCreep(false);
  };

  const acceptCreepAsCR = () => {
    if (!creepResult) return;
    const avg = (creepResult.additionalCostMin + creepResult.additionalCostMax) / 2;
    const avgH = (creepResult.additionalHoursMin + creepResult.additionalHoursMax) / 2;
    addChangeRequest({
      projectId: project.id,
      title: creepText.split('\n')[0].slice(0, 60) || 'Scope addition',
      reason: creepText,
      estimatedHours: Math.round(avgH),
      additionalCost: Math.round(avg),
      timelineImpact: Math.round(avgH / 4),
    });
    setScopeCreepOpen(false);
    setCreepResult(null);
    setCreepText('');
  };

  const runReply = async () => {
    setLoadingReply(true);
    const res = await generateClientReply(
      replyContext || creepText || project.description || '',
      replyTone,
      replySituation
    );
    setReplyText(res);
    setLoadingReply(false);
  };

  const copyReply = () => {
    if (!replyText) return;
    navigator.clipboard?.writeText(replyText);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Link href="/projects">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" /> Projects
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader className="p-6 pb-3">
          <div className="flex flex-wrap items-start gap-4 justify-between">
            <div>
              <CardTitle className="text-2xl flex items-center gap-2">
                {project.name}
                {project.health !== undefined && (
                  <HealthBadge health={project.health} />
                )}
                <StatusBadge status={project.status} />
              </CardTitle>
              <CardDescription className="mt-1">
                Client: <span className="text-foreground">{client?.name ?? 'Unknown'}</span>
                {' · '}
                {formatDate(project.createdAt)}
              </CardDescription>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button variant="outline" onClick={() => setReplyOpen(true)}>
                <MessageSquare className="w-4 h-4 mr-2" /> Reply to client
              </Button>
              <Button variant="outline" onClick={() => setScopeCreepOpen(true)}>
                <Wand2 className="w-4 h-4 mr-2" /> Check scope creep
              </Button>
              <Button onClick={() => setAddTaskOpen(true)}>
                <Plus className="w-4 h-4 mr-2" /> Add task
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 pt-3 space-y-5">
          {project.description && (
            <p className="text-sm text-muted-foreground">{project.description}</p>
          )}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-[10px] uppercase text-muted-foreground tracking-wide">
                Budget
              </p>
              <p className="text-lg font-semibold">
                {project.budget ? formatCurrency(project.budget) : '—'}
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase text-muted-foreground tracking-wide">
                Deadline
              </p>
              <p className="text-lg font-semibold">
                {project.deadline ? formatDate(project.deadline) : '—'}
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase text-muted-foreground tracking-wide">
                Tasks
              </p>
              <p className="text-lg font-semibold">
                {done}/{tasks.length}
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase text-muted-foreground tracking-wide">
                Change requests
              </p>
              <p className="text-lg font-semibold">{changeRequests.length}</p>
            </div>
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Overall progress</span>
              <span className="font-medium">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
          {project.originalScope && project.originalScope.length > 0 && (
            <div className="pt-2">
              <p className="text-xs uppercase text-muted-foreground tracking-wide font-semibold mb-2">
                Original scope (baseline for creep detection)
              </p>
              <div className="flex flex-wrap gap-1.5">
                {project.originalScope.map((s, i) => (
                  <Badge key={i} variant="outline">
                    {s}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="tasks">
        <TabsList>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="risks">AI Risks</TabsTrigger>
          <TabsTrigger value="change-requests">
            Change Requests ({changeRequests.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tasks" className="mt-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10"></TableHead>
                    <TableHead>Task</TableHead>
                    <TableHead className="w-[130px]">Priority</TableHead>
                    <TableHead className="w-[130px]">Status</TableHead>
                    <TableHead className="w-[130px]">Deadline</TableHead>
                    <TableHead className="w-[100px]">Est. hours</TableHead>
                    <TableHead className="w-[90px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tasks.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell>
                        <GripVertical className="w-4 h-4 text-muted-foreground" />
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{t.title}</p>
                          {t.description && (
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {t.description}
                            </p>
                          )}
                          {t.dependencies && t.dependencies.length > 0 && (
                            <div className="mt-1">
                              {t.dependencies.map((d, i) => (
                                <Badge
                                  key={i}
                                  variant="warning"
                                  className="text-[10px] mr-1"
                                >
                                  ⏸ {d}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <select
                          value={t.priority}
                          className="hidden"
                          onChange={(e) =>
                            updateTask(t.id, {
                              priority: e.target.value as Priority,
                            })
                          }
                        />
                        <PrioritySelect
                          value={t.priority}
                          onChange={(p) => updateTask(t.id, { priority: p })}
                        />
                      </TableCell>
                      <TableCell>
                        <StatusSelect
                          value={t.status}
                          onChange={(s) => updateTask(t.id, { status: s })}
                        />
                      </TableCell>
                      <TableCell className="text-sm">
                        {t.deadline ? formatDate(t.deadline) : '—'}
                      </TableCell>
                      <TableCell className="text-sm">
                        {t.estimatedHours ? `${t.estimatedHours}h` : '—'}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => deleteTask(t.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {tasks.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="py-10 text-center text-muted-foreground"
                      >
                        No tasks yet. Click "Add task" to get started.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="risks" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileWarning className="w-5 h-5 text-amber-500" />
                AI Project Risk Detection
              </CardTitle>
              <CardDescription>
                ClientPilot continuously analyzes project signals for risks.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {risks ? (
                risks.map((r, i) => {
                  const sev = {
                    high: 'destructive' as const,
                    medium: 'warning' as const,
                    low: 'success' as const,
                  };
                  return (
                    <Alert
                      key={i}
                      variant={
                        r.severity === 'high'
                          ? 'destructive'
                          : r.severity === 'medium'
                          ? 'warning'
                          : 'success'
                      }
                    >
                      <AlertTriangle className="w-4 h-4" />
                      <AlertTitle className="flex items-center gap-2">
                        {r.type.toUpperCase()}: {r.message}
                        <Badge variant={sev[r.severity]}>{r.severity}</Badge>
                      </AlertTitle>
                      {r.recommendedAction && (
                        <AlertDescription>
                          <span className="font-medium">Recommended action: </span>
                          {r.recommendedAction}
                        </AlertDescription>
                      )}
                    </Alert>
                  );
                })
              ) : (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  <Sparkles className="w-5 h-5 mx-auto mb-2 animate-pulse" />
                  Analyzing project for risks...
                </div>
              )}
            </CardContent>
          </Card>

          {client?.healthScore && (
            <Card>
              <CardHeader>
                <CardTitle>Client Health Score</CardTitle>
                <CardDescription>Based on payment, communication and scope history.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {[
                    { label: 'Overall', value: client.healthScore.overall, highlight: true },
                    { label: 'Payment reliability', value: client.healthScore.paymentReliability },
                    { label: 'Communication', value: client.healthScore.communication },
                    { label: 'Scope stability', value: client.healthScore.scopeStability },
                    { label: 'Approval speed', value: client.healthScore.approvalSpeed },
                  ].map((h) => (
                    <div key={h.label} className={h.highlight ? 'col-span-2 md:col-span-1' : ''}>
                      <p className="text-xs text-muted-foreground mb-1">{h.label}</p>
                      <div className="flex items-center gap-2">
                        <Progress
                          value={h.value}
                          className={cn(
                            'flex-1',
                            h.value >= 80
                              ? '[&>div]:bg-emerald-500'
                              : h.value >= 60
                              ? '[&>div]:bg-amber-500'
                              : '[&>div]:bg-red-500'
                          )}
                        />
                        <span className="text-sm font-semibold">{h.value}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="change-requests" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Change Requests</CardTitle>
              <CardDescription>Track out-of-scope work and approvals.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {changeRequests.length === 0 && (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  No change requests yet.
                </div>
              )}
              {changeRequests.map((cr) => (
                <div
                  key={cr.id}
                  className="p-4 rounded-lg border border-slate-200/70 dark:border-slate-800"
                >
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">{cr.title}</p>
                        <StatusBadge status={cr.status} />
                        <Badge variant="outline">#{cr.id.slice(-3).toUpperCase()}</Badge>
                      </div>
                      {cr.reason && (
                        <p className="text-sm text-muted-foreground mt-1">{cr.reason}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" disabled>
                        Copy secure link
                      </Button>
                    </div>
                  </div>
                  <Separator className="my-3" />
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-[10px] uppercase text-muted-foreground">
                        Effort
                      </p>
                      <p className="font-semibold">{cr.estimatedHours} hrs</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase text-muted-foreground">
                        Additional cost
                      </p>
                      <p className="font-semibold">
                        {formatCurrency(cr.additionalCost)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase text-muted-foreground">
                        Timeline impact
                      </p>
                      <p className="font-semibold">
                        {cr.timelineImpact ? `+${cr.timelineImpact} days` : '—'}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase text-muted-foreground">
                        Created
                      </p>
                      <p className="font-semibold">{formatDate(cr.createdAt)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={addTaskOpen} onOpenChange={setAddTaskOpen}>
        <DialogHeader>
          <DialogTitle>Add task to project</DialogTitle>
          <DialogDescription>
            Define a new task for "{project.name}".
          </DialogDescription>
        </DialogHeader>
        <DialogContent className="space-y-3">
          <div className="space-y-2">
            <Label>Title *</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Implement contact form"
            />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
              >
                <option value="low">🟢 Low</option>
                <option value="medium">🟡 Medium</option>
                <option value="high">🔴 High</option>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
              >
                <option value="todo">To do</option>
                <option value="in-progress">In progress</option>
                <option value="done">Done</option>
                <option value="blocked">Blocked</option>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Deadline</Label>
              <Input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Estimated hours</Label>
              <Input
                type="number"
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                placeholder="4"
              />
            </div>
          </div>
        </DialogContent>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setAddTaskOpen(false)}>
            Cancel
          </Button>
          <Button onClick={createTask}>Add task</Button>
        </DialogFooter>
      </Dialog>

      <Dialog open={scopeCreepOpen} onOpenChange={setScopeCreepOpen} className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Scope Creep Detector</DialogTitle>
          <DialogDescription>
            Paste new client requests and AI will compare against the original scope baseline.
          </DialogDescription>
        </DialogHeader>
        <DialogContent className="space-y-4">
          <div className="space-y-2">
            <Label>New client request</Label>
            <Textarea
              rows={5}
              placeholder='e.g. "Can you also add an admin dashboard?"'
              value={creepText}
              onChange={(e) => setCreepText(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={runScopeCreep} disabled={loadingCreep || !creepText.trim()}>
              {loadingCreep ? (
                <>
                  <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing scope...
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4 mr-2" /> Analyze request
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setCreepResult(null);
                setCreepText('');
              }}
            >
              Clear
            </Button>
          </div>

          {creepResult && (
            <div className="border border-amber-200 dark:border-amber-500/20 rounded-lg p-4 bg-amber-50/60 dark:bg-amber-500/5 space-y-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                <p className="font-semibold">⚠️ Possible Scope Creep</p>
                <Badge variant="warning" className="ml-auto">
                  {creepResult.risk.toUpperCase()} RISK
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                This request wasn't included in the original project scope.
              </p>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-white dark:bg-slate-900/60 p-3 rounded-md border border-slate-200/70 dark:border-slate-800">
                  <p className="text-[10px] uppercase text-muted-foreground">
                    Original budget
                  </p>
                  <p className="font-semibold">
                    {project.budget ? formatCurrency(project.budget) : '—'}
                  </p>
                </div>
                <div className="bg-white dark:bg-slate-900/60 p-3 rounded-md border border-slate-200/70 dark:border-slate-800">
                  <p className="text-[10px] uppercase text-muted-foreground">
                    Additional work
                  </p>
                  <p className="font-semibold">
                    {creepResult.additionalHoursMin}–{creepResult.additionalHoursMax} hrs
                  </p>
                </div>
              </div>
              <div className="bg-white dark:bg-slate-900/60 p-3 rounded-md border border-slate-200/70 dark:border-slate-800">
                <p className="text-[10px] uppercase text-muted-foreground">
                  Suggested additional charge
                </p>
                <p className="text-lg font-bold">
                  {formatCurrency(creepResult.additionalCostMin)} –{' '}
                  {formatCurrency(creepResult.additionalCostMax)}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setScopeCreepOpen(false)}>
            Close
          </Button>
          {creepResult && (
            <>
              <Button variant="outline">Ask client</Button>
              <Button onClick={acceptCreepAsCR}>Create Change Request</Button>
            </>
          )}
        </DialogFooter>
      </Dialog>

      <Dialog open={replyOpen} onOpenChange={setReplyOpen} className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            AI Client Reply Generator
          </DialogTitle>
          <DialogDescription>
            Generate a client-appropriate reply in the right tone.
          </DialogDescription>
        </DialogHeader>
        <DialogContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Situation</Label>
              <Select
                value={replySituation}
                onChange={(e) =>
                  setReplySituation(
                    e.target.value as typeof replySituation
                  )
                }
              >
                <option value="general">General</option>
                <option value="scope-creep">Scope change / Out of scope</option>
                <option value="follow-up">Follow-up on pending items</option>
                <option value="deadline">Timeline / Deadline update</option>
                <option value="update">Progress update</option>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Tone</Label>
              <div className="grid grid-cols-4 gap-1.5">
                {(['professional', 'friendly', 'firm', 'short'] as const).map((t) => (
                  <Button
                    key={t}
                    type="button"
                    size="sm"
                    variant={replyTone === t ? 'default' : 'outline'}
                    className="h-9 text-xs capitalize"
                    onClick={() => setReplyTone(t)}
                  >
                    {t}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Additional context (optional)</Label>
            <Textarea
              rows={2}
              placeholder="Any specific points to include..."
              value={replyContext}
              onChange={(e) => setReplyContext(e.target.value)}
            />
          </div>

          <Button onClick={runReply} disabled={loadingReply}>
            {loadingReply ? (
              <>
                <Sparkles className="w-4 h-4 mr-2 animate-spin" /> Generating reply...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" /> Generate reply
              </>
            )}
          </Button>

          {replyText && (
            <div className="rounded-lg border border-slate-200/70 dark:border-slate-800 p-4 bg-slate-50/60 dark:bg-slate-800/40 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase text-muted-foreground tracking-wide">
                  Generated reply
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={copyReply}
                  className="h-7 px-2"
                >
                  {copied ? (
                    <><CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-500" /> Copied</>
                  ) : (
                    <><Copy className="w-3.5 h-3.5 mr-1" /> Copy</>
                  )}
                </Button>
              </div>
              <p className="text-sm whitespace-pre-wrap leading-relaxed">
                {replyText}
              </p>
            </div>
          )}
        </DialogContent>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setReplyOpen(false)}>
            Close
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}

function cn(...a: any[]) {
  return a.filter(Boolean).join(' ');
}

function PrioritySelect({
  value,
  onChange,
}: {
  value: Priority;
  onChange: (p: Priority) => void;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as Priority)}
      className="text-sm bg-transparent focus:outline-none cursor-pointer"
    >
      <option value="low">🟢 Low</option>
      <option value="medium">🟡 Medium</option>
      <option value="high">🔴 High</option>
    </select>
  );
}

function StatusSelect({
  value,
  onChange,
}: {
  value: TaskStatus;
  onChange: (s: TaskStatus) => void;
}) {
  const map: Record<TaskStatus, { label: string; dot: string }> = {
    todo: { label: 'To do', dot: 'bg-slate-400' },
    'in-progress': { label: 'In progress', dot: 'bg-amber-500' },
    done: { label: 'Done', dot: 'bg-emerald-500' },
    blocked: { label: 'Blocked', dot: 'bg-red-500' },
  };
  return (
    <div className="flex items-center gap-2">
      <span className={`w-2 h-2 rounded-full ${map[value].dot}`} />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as TaskStatus)}
        className="text-sm bg-transparent focus:outline-none cursor-pointer"
      >
        <option value="todo">To do</option>
        <option value="in-progress">In progress</option>
        <option value="done">Done</option>
        <option value="blocked">Blocked</option>
      </select>
    </div>
  );
}
