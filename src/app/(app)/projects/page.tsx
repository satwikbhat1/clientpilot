'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import {
  FolderKanban,
  Plus,
  Search,
  ArrowUpRight,
  Filter,
  MoreHorizontal,
  Trash2,
} from 'lucide-react';
import { HealthBadge, StatusBadge } from '@/components/ui/status-badges';
import { Progress } from '@/components/ui/progress';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { ProjectStatus } from '@/lib/types';

export default function ProjectsPage() {
  const { projects, clients, tasks, addProject, deleteProject } = useStore();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'all' | ProjectStatus>('all');
  const [open, setOpen] = useState(false);

  const [name, setName] = useState('');
  const [clientId, setClientId] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<ProjectStatus>('planning');
  const [budget, setBudget] = useState('');
  const [deadline, setDeadline] = useState('');

  const filtered = projects.filter((p) => {
    const client = clients.find((c) => c.id === p.clientId);
    const matchesQuery =
      query.trim() === '' ||
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      (client?.name.toLowerCase().includes(query.toLowerCase()) ?? false);
    const matchesFilter = filter === 'all' || p.status === filter;
    return matchesQuery && matchesFilter;
  });

  const onCreate = () => {
    if (!name || !clientId) return;
    addProject({
      name,
      clientId,
      description: description || undefined,
      status,
      budget: budget ? parseInt(budget) : undefined,
      deadline: deadline || undefined,
      originalScope: [],
    });
    setOpen(false);
    setName('');
    setClientId('');
    setDescription('');
    setStatus('planning');
    setBudget('');
    setDeadline('');
  };

  const filters: Array<{ label: string; value: 'all' | ProjectStatus }> = [
    { label: 'All', value: 'all' },
    { label: 'Planning', value: 'planning' },
    { label: 'Active', value: 'active' },
    { label: 'Review', value: 'review' },
    { label: 'Completed', value: 'completed' },
    { label: 'On hold', value: 'on-hold' },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <FolderKanban className="w-6 h-6" /> Projects
          </h1>
          <p className="text-muted-foreground text-sm">
            Manage projects, track tasks, and monitor scope.
          </p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Plus className="w-4 h-4 mr-2" /> New project
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
        <div className="relative sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search projects or clients..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-1 overflow-x-auto">
          {filters.map((f) => (
            <Button
              key={f.value}
              size="sm"
              variant={filter === f.value ? 'default' : 'outline'}
              onClick={() => setFilter(f.value)}
              className="whitespace-nowrap"
            >
              {f.label}
            </Button>
          ))}
        </div>
        <div className="sm:ml-auto">
          <Button variant="ghost" size="sm">
            <Filter className="w-4 h-4 mr-2" /> More filters
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((p) => {
          const client = clients.find((c) => c.id === p.clientId);
          const projectTasks = tasks.filter((t) => t.projectId === p.id);
          const done = projectTasks.filter((t) => t.status === 'done').length;
          const progress = projectTasks.length
            ? (done / projectTasks.length) * 100
            : 0;
          return (
            <Card key={p.id} className="overflow-hidden flex flex-col">
              <CardHeader className="p-5 pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <Link
                      href={`/projects/${p.id}`}
                      className="font-semibold hover:underline truncate flex items-center gap-1.5"
                    >
                      {p.name}
                      <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground" />
                    </Link>
                    <CardDescription className="mt-0.5">
                      {client?.name ?? 'Unknown client'}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {p.health !== undefined && <HealthBadge health={p.health} />}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-5 pt-0 flex-1 flex flex-col gap-4">
                {p.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {p.description}
                  </p>
                )}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">
                      {done}/{projectTasks.length} tasks
                    </span>
                  </div>
                  <Progress value={progress} className="h-1.5" />
                </div>
                <div className="mt-auto grid grid-cols-2 gap-3 pt-2 border-t">
                  <div>
                    <p className="text-[10px] uppercase text-muted-foreground tracking-wide">
                      Budget
                    </p>
                    <p className="font-semibold text-sm">
                      {p.budget ? formatCurrency(p.budget) : '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase text-muted-foreground tracking-wide">
                      Deadline
                    </p>
                    <p className="font-semibold text-sm">
                      {p.deadline ? formatDate(p.deadline) : '—'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <StatusBadge status={p.status} />
                  <div className="flex items-center gap-1">
                    <Link href={`/projects/${p.id}`}>
                      <Button variant="ghost" size="sm">
                        Open
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => deleteProject(p.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
        {filtered.length === 0 && (
          <Card className="md:col-span-2 xl:col-span-3">
            <CardContent className="py-16 text-center">
              <FolderKanban className="w-10 h-10 mx-auto text-muted-foreground mb-2" />
              <p className="font-medium">No projects found</p>
              <p className="text-sm text-muted-foreground mt-1 mb-4">
                Try adjusting filters or create a new project.
              </p>
              <Button onClick={() => setOpen(true)}>
                <Plus className="w-4 h-4 mr-2" /> New project
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogHeader>
          <DialogTitle>Create new project</DialogTitle>
          <DialogDescription>
            Set up a new client project. AI will help you manage tasks and scope.
          </DialogDescription>
        </DialogHeader>
        <DialogContent className="space-y-3 max-h-[60vh] overflow-y-auto">
          <div className="space-y-2">
            <Label>Project name *</Label>
            <Input
              placeholder="e.g. Corporate Website Redesign"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Client *</Label>
            <Select value={clientId} onChange={(e) => setClientId(e.target.value)}>
              <option value="">Select client</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Input
              placeholder="Short description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={status}
                onChange={(e) => setStatus(e.target.value as ProjectStatus)}
              >
                <option value="planning">Planning</option>
                <option value="active">Active</option>
                <option value="review">Review</option>
                <option value="completed">Completed</option>
                <option value="on-hold">On hold</option>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Budget (₹)</Label>
              <Input
                type="number"
                placeholder="80000"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Deadline</Label>
            <Input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
            />
          </div>
        </DialogContent>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={onCreate}>Create project</Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
