'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Inbox,
  Plus,
  Mail,
  MessageSquare,
  MessageCircle,
  FileText,
  Video,
  PenLine,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Loader2,
  ChevronRight,
} from 'lucide-react';
import { cn, formatDate } from '@/lib/utils';
import type { ExtractedRequirements } from '@/lib/types';
import { extractRequirements } from '@/lib/ai-service';
import { PriorityBadge, StatusBadge } from '@/components/ui/status-badges';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import Link from 'next/link';

const sourceIcons: Record<string, any> = {
  email: Mail,
  whatsapp: MessageSquare,
  slack: MessageCircle,
  meeting: Video,
  pdf: FileText,
  manual: PenLine,
};

export default function InboxPage() {
  const { communications, clients, projects, addCommunication, updateCommunication, addProject, addTask } =
    useStore();
  const [selected, setSelected] = useState<string | null>(communications[0]?.id ?? null);
  const [extracting, setExtracting] = useState(false);
  const [extractMap, setExtractMap] = useState<Record<string, ExtractedRequirements>>({});
  const [openNew, setOpenNew] = useState(false);
  const [createProjectOpen, setCreateProjectOpen] = useState<string | null>(null);

  const [newMsg, setNewMsg] = useState('');
  const [newSource, setNewSource] = useState<string>('manual');
  const [newClientId, setNewClientId] = useState<string>('');

  const comm = communications.find((c) => c.id === selected);

  const runExtraction = async (id: string) => {
    const item = communications.find((c) => c.id === id);
    if (!item) return;
    setExtracting(true);
    try {
      const data = await extractRequirements(item.content, item.source);
      setExtractMap((m) => ({ ...m, [id]: data }));
      updateCommunication(id, { processed: true, extractedData: data });
    } finally {
      setExtracting(false);
    }
  };

  const handleCreateProject = (commId: string) => {
    const c = communications.find((x) => x.id === commId);
    const data = extractMap[commId] || c?.extractedData;
    if (!c || !data) return;
    const client = clients.find((cl) => cl.id === c.clientId) ?? clients[0];
    const newProj = addProject({
      name: data.clientRequest || `Project for ${client.name}`,
      clientId: client.id,
      description: data.summary,
      status: 'planning',
      budget: data.budget?.max,
      originalScope: data.tasks.map((t) => t.title),
      deadline: data.deadlines?.[0],
    });
    data.tasks.forEach((t) => {
      addTask({
        projectId: newProj.id,
        title: t.title,
        description: t.description,
        priority: t.priority,
        status: 'todo',
        deadline: t.deadline || data.deadlines?.[0],
        estimatedHours: t.estimatedHours,
      });
    });
    setCreateProjectOpen(null);
  };

  const handleNewMessage = () => {
    if (!newMsg.trim()) return;
    addCommunication({
      clientId: newClientId || undefined,
      source: newSource as any,
      content: newMsg,
      rawContent: newMsg,
      extractedData: undefined,
    });
    setNewMsg('');
    setOpenNew(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Inbox className="w-6 h-6" /> Client Inbox
          </h1>
          <p className="text-muted-foreground text-sm">
            One place for incoming client communication. AI extracts tasks, deadlines, and risks.
          </p>
        </div>
        <Button onClick={() => setOpenNew(true)}>
          <Plus className="w-4 h-4 mr-2" /> New message
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-[600px]">
        <Card className="lg:col-span-4 overflow-hidden">
          <CardHeader className="p-4 border-b">
            <CardTitle className="text-sm">Messages</CardTitle>
            <CardDescription className="text-xs">
              {communications.length} conversations
            </CardDescription>
          </CardHeader>
          <div className="divide-y max-h-[70vh] overflow-y-auto">
            {communications.map((c) => {
              const client = clients.find((cl) => cl.id === c.clientId);
              const Icon = sourceIcons[c.source] || PenLine;
              const data = extractMap[c.id] || c.extractedData;
              const active = selected === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => setSelected(c.id)}
                  className={cn(
                    'w-full text-left p-4 transition-colors',
                    active
                      ? 'bg-indigo-50/60 dark:bg-indigo-500/5 border-l-2 border-l-indigo-500'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 border-l-2 border-l-transparent'
                  )}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <Badge variant="secondary" className="text-[10px] gap-1 px-2 py-0 h-5">
                      <Icon className="w-3 h-3" />
                      {c.source}
                    </Badge>
                    <span className="text-xs text-muted-foreground ml-auto">
                      {formatDate(c.createdAt)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm truncate flex-1">
                      {client?.name ?? 'Unknown client'}
                    </p>
                    {!c.processed && !extractMap[c.id] && (
                      <Badge variant="warning" className="text-[10px] h-4 px-1.5">
                        New
                      </Badge>
                    )}
                    {(c.processed || extractMap[c.id]) && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {c.content}
                  </p>
                  {data && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      <Badge variant="outline" className="text-[10px] h-5">
                        {data.tasks.length} tasks
                      </Badge>
                      {data.deadlines && (
                        <Badge variant="outline" className="text-[10px] h-5">
                          {data.deadlines.length} deadline
                        </Badge>
                      )}
                      {data.risks && (
                        <Badge variant="warning" className="text-[10px] h-5">
                          risk
                        </Badge>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </Card>

        <Card className="lg:col-span-8 flex flex-col">
          {comm ? (
            <>
              <CardHeader className="p-5 border-b">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <CardTitle className="text-lg">
                        {clients.find((c) => c.id === comm.clientId)?.name ?? 'Client'}
                      </CardTitle>
                      <Badge variant="outline">
                        {comm.source.toUpperCase()}
                      </Badge>
                    </div>
                    <CardDescription>
                      Received {formatDate(comm.createdAt)}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    {!extractMap[comm.id] && !comm.extractedData ? (
                      <Button onClick={() => runExtraction(comm.id)} disabled={extracting}>
                        {extracting ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Sparkles className="w-4 h-4 mr-2" />
                        )}
                        {extracting ? 'Analyzing...' : 'Extract with AI'}
                      </Button>
                    ) : (
                      <Button variant="outline" onClick={() => runExtraction(comm.id)}>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Re-extract
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 p-5 overflow-y-auto space-y-5">
                <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {comm.content}
                  </p>
                </div>

                {(extractMap[comm.id] || comm.extractedData) && (
                  <ExtractedDataView
                    data={extractMap[comm.id] || comm.extractedData!}
                    onCreateProject={() => setCreateProjectOpen(comm.id)}
                    clientId={comm.clientId}
                  />
                )}
              </CardContent>
            </>
          ) : (
            <CardContent className="flex-1 flex items-center justify-center text-center p-8">
              <div>
                <Inbox className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                <p className="font-medium">Select a message to view</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Choose a conversation from the list
                </p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>

      <Dialog open={openNew} onOpenChange={setOpenNew}>
        <DialogHeader>
          <DialogTitle>Add client message</DialogTitle>
          <DialogDescription>
            Paste any client communication and let AI extract requirements.
          </DialogDescription>
        </DialogHeader>
        <DialogContent className="space-y-3 max-h-[60vh] overflow-y-auto">
          <div className="space-y-2">
            <Label>Client</Label>
            <Select value={newClientId} onChange={(e) => setNewClientId(e.target.value)}>
              <option value="">Select client (optional)</option>
              {clients.map((cl) => (
                <option key={cl.id} value={cl.id}>
                  {cl.name}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Source</Label>
            <Select value={newSource} onChange={(e) => setNewSource(e.target.value)}>
              <option value="manual">Manual / Pasted text</option>
              <option value="email">Email</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="slack">Slack</option>
              <option value="meeting">Meeting notes</option>
              <option value="pdf">PDF / Document</option>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Message content</Label>
            <Textarea
              rows={8}
              placeholder='Paste client message here... e.g. "Hey, can you change the homepage hero, make buttons blue, add testimonials, mobile responsive? Need by Monday."'
              value={newMsg}
              onChange={(e) => setNewMsg(e.target.value)}
            />
          </div>
        </DialogContent>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpenNew(false)}>
            Cancel
          </Button>
          <Button onClick={handleNewMessage}>
            Add to inbox
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </DialogFooter>
      </Dialog>

      <Dialog open={!!createProjectOpen} onOpenChange={(o) => !o && setCreateProjectOpen(null)}>
        <DialogHeader>
          <DialogTitle>Create project from this message?</DialogTitle>
          <DialogDescription>
            AI will create tasks, deadlines, and save the scope baseline for creep detection.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setCreateProjectOpen(null)}>
            Cancel
          </Button>
          <Link href="/projects">
            <Button onClick={() => createProjectOpen && handleCreateProject(createProjectOpen)}>
              Create project
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </DialogFooter>
      </Dialog>
    </div>
  );
}

function ExtractedDataView({
  data,
  onCreateProject,
}: {
  data: ExtractedRequirements;
  onCreateProject: () => void;
  clientId?: string;
}) {
  return (
    <div className="space-y-5 border rounded-xl p-5 bg-gradient-to-br from-indigo-50/60 via-white to-violet-50/60 dark:from-indigo-500/5 dark:via-slate-900/20 dark:to-violet-500/5 border-indigo-100 dark:border-indigo-500/10">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-600" />
          <h3 className="font-semibold">AI Extracted Requirements</h3>
          <Badge variant="outline">
            Sentiment: {data.sentiment}
          </Badge>
        </div>
        <Button size="sm" onClick={onCreateProject}>
          Create Project <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
      </div>

      <p className="text-sm text-muted-foreground">{data.summary}</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h4 className="text-xs uppercase text-muted-foreground font-semibold tracking-wide mb-2">
            Tasks detected ({data.tasks.length})
          </h4>
          <div className="space-y-2">
            {data.tasks.map((t, i) => (
              <div
                key={i}
                className="flex items-start gap-3 p-3 rounded-lg bg-white dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-800"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{t.title}</p>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <PriorityBadge priority={t.priority} />
                    {t.estimatedHours && (
                      <Badge variant="outline" className="text-[10px] h-5">
                        {t.estimatedHours}h est.
                      </Badge>
                    )}
                    {t.deadline && (
                      <Badge variant="outline" className="text-[10px] h-5">
                        {t.deadline}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {data.budget && (
            <div className="p-3 rounded-lg bg-white dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-800">
              <h4 className="text-xs uppercase text-muted-foreground font-semibold tracking-wide mb-1">
                Estimated budget
              </h4>
              <p className="text-lg font-bold">
                ₹{data.budget.min.toLocaleString('en-IN')} – ₹
                {data.budget.max.toLocaleString('en-IN')}
              </p>
            </div>
          )}
          {data.deadlines && (
            <div className="p-3 rounded-lg bg-white dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-800">
              <h4 className="text-xs uppercase text-muted-foreground font-semibold tracking-wide mb-1">
                Deadlines
              </h4>
              {data.deadlines.map((d, i) => (
                <Badge key={i} variant="warning" className="mr-1.5 mt-1">
                  {d}
                </Badge>
              ))}
            </div>
          )}
          {data.blockers && (
            <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-500/5 border border-amber-200 dark:border-amber-500/20">
              <h4 className="text-xs uppercase text-amber-700 dark:text-amber-400 font-semibold tracking-wide mb-1">
                ⚠️ Blockers / dependencies
              </h4>
              <ul className="text-sm list-disc pl-5 space-y-0.5 text-amber-800 dark:text-amber-300/80">
                {data.blockers.map((b, i) => (
                  <li key={i}>{b}</li>
                ))}
              </ul>
            </div>
          )}
          {data.risks && (
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-500/5 border border-red-200 dark:border-red-500/20">
              <h4 className="text-xs uppercase text-red-700 dark:text-red-400 font-semibold tracking-wide mb-1">
                ⚠️ Risks
              </h4>
              <ul className="text-sm list-disc pl-5 space-y-0.5 text-red-800 dark:text-red-300/80">
                {data.risks.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>
          )}
          {data.questions && (
            <div className="p-3 rounded-lg bg-sky-50 dark:bg-sky-500/5 border border-sky-200 dark:border-sky-500/20">
              <h4 className="text-xs uppercase text-sky-700 dark:text-sky-400 font-semibold tracking-wide mb-1">
                ❓ Questions for client
              </h4>
              <ul className="text-sm list-disc pl-5 space-y-0.5 text-sky-800 dark:text-sky-300/80">
                {data.questions.map((q, i) => (
                  <li key={i}>{q}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
