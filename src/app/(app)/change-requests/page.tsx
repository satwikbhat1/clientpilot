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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { RefreshCw, Plus, Copy, CheckCircle2, XCircle, Clock, Link2, Calendar, IndianRupee } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatDate, cn } from '@/lib/utils';
import type { ChangeRequestStatus } from '@/lib/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function ChangeRequestsPage() {
  const { projects, clients, changeRequests, addChangeRequest, updateChangeRequest } =
    useStore();
  const [open, setOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | ChangeRequestStatus>('all');

  const [projectId, setProjectId] = useState('');
  const [title, setTitle] = useState('');
  const [reason, setReason] = useState('');
  const [estimatedHours, setEstimatedHours] = useState('');
  const [additionalCost, setAdditionalCost] = useState('');
  const [timelineImpact, setTimelineImpact] = useState('');

  const filtered = changeRequests.filter(
    (cr) => filter === 'all' || cr.status === filter
  );

  const pendingCount = changeRequests.filter((c) => c.status === 'pending').length;

  const onCreate = () => {
    if (!projectId || !title.trim()) return;
    addChangeRequest({
      projectId,
      title,
      reason: reason || undefined,
      estimatedHours: parseInt(estimatedHours) || 0,
      additionalCost: parseInt(additionalCost) || 0,
      timelineImpact: timelineImpact ? parseInt(timelineImpact) : undefined,
    });
    setOpen(false);
    setProjectId('');
    setTitle('');
    setReason('');
    setEstimatedHours('');
    setAdditionalCost('');
    setTimelineImpact('');
  };

  const copyLink = (id: string, token: string) => {
    const url = `${
      process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    }/client/change-request/${token}`;
    navigator.clipboard?.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const statusIcon = (s: ChangeRequestStatus) => {
    if (s === 'approved') return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
    if (s === 'rejected') return <XCircle className="w-4 h-4 text-red-500" />;
    return <Clock className="w-4 h-4 text-amber-500" />;
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <RefreshCw className="w-6 h-6" /> Change Requests
          </h1>
          <p className="text-muted-foreground text-sm">
            Out-of-scope work tracking with secure client approval links.
          </p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Plus className="w-4 h-4 mr-2" /> New change request
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { label: 'Pending approval', value: pendingCount, color: 'from-amber-500 to-orange-500' },
          { label: 'Approved', value: changeRequests.filter(c => c.status === 'approved').length, color: 'from-emerald-500 to-teal-500' },
          { label: 'Total change requests', value: changeRequests.length, color: 'from-indigo-500 to-violet-500' },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-5 flex items-center gap-4">
              <div className={cn('w-11 h-11 rounded-lg bg-gradient-to-br text-white flex items-center justify-center', s.color)}>
                <RefreshCw className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className="text-2xl font-bold">{s.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex gap-2 flex-wrap">
        {[
          { label: 'All', value: 'all' as const },
          { label: 'Pending', value: 'pending' as const },
          { label: 'Approved', value: 'approved' as const },
          { label: 'Rejected', value: 'rejected' as const },
        ].map((f) => (
          <Button
            key={f.value}
            size="sm"
            variant={filter === f.value ? 'default' : 'outline'}
            onClick={() => setFilter(f.value)}
          >
            {f.label}
          </Button>
        ))}
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Request</TableHead>
                <TableHead>Project</TableHead>
                <TableHead className="w-[110px]">Effort</TableHead>
                <TableHead className="w-[140px]">Additional cost</TableHead>
                <TableHead className="w-[120px]">Impact</TableHead>
                <TableHead className="w-[120px]">Status</TableHead>
                <TableHead className="w-[160px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="py-14 text-center text-muted-foreground">
                    <RefreshCw className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    No change requests in this view.
                  </TableCell>
                </TableRow>
              )}
              {filtered.map((cr) => {
                const project = projects.find((p) => p.id === cr.projectId);
                const client = project ? clients.find((c) => c.id === project.clientId) : null;
                return (
                  <TableRow key={cr.id}>
                    <TableCell>
                      <Badge variant="outline">#{cr.id.slice(-4).toUpperCase()}</Badge>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{cr.title}</p>
                        {cr.reason && (
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                            {cr.reason}
                          </p>
                        )}
                        <p className="text-[11px] text-muted-foreground mt-1">
                          {formatDate(cr.createdAt)}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm">{project?.name ?? 'Unknown'}</p>
                        <p className="text-[11px] text-muted-foreground">
                          {client?.name}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{cr.estimatedHours} hrs</TableCell>
                    <TableCell className="text-sm font-medium">
                      {formatCurrency(cr.additionalCost)}
                    </TableCell>
                    <TableCell className="text-sm">
                      {cr.timelineImpact ? `+${cr.timelineImpact} days` : '—'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        {statusIcon(cr.status)}
                        <span className="capitalize text-sm">{cr.status}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 px-2"
                          onClick={() => copyLink(cr.id, cr.secureToken)}
                        >
                          {copiedId === cr.id ? (
                            <><CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-500" /> Sent</>
                          ) : (
                            <><Link2 className="w-3.5 h-3.5 mr-1" /> Link</>
                          )}
                        </Button>
                        {cr.status === 'pending' && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-500/10"
                              onClick={() => updateChangeRequest(cr.id, { status: 'approved' })}
                              title="Mark approved"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-500/10"
                              onClick={() => updateChangeRequest(cr.id, { status: 'rejected' })}
                              title="Mark rejected"
                            >
                              <XCircle className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogHeader>
          <DialogTitle>New Change Request</DialogTitle>
          <DialogDescription>
            Create a formal record for out-of-scope work to share with the client.
          </DialogDescription>
        </DialogHeader>
        <DialogContent className="space-y-3 max-h-[60vh] overflow-y-auto">
          <div className="space-y-2">
            <Label>Project *</Label>
            <Select value={projectId} onChange={(e) => setProjectId(e.target.value)}>
              <option value="">Select project</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Title *</Label>
            <Input
              placeholder="e.g. Admin Analytics Dashboard"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Reason / description</Label>
            <Input
              placeholder="Why is this being added?"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label>
                <Clock className="w-3 h-3 inline mr-1" /> Hours
              </Label>
              <Input
                type="number"
                value={estimatedHours}
                onChange={(e) => setEstimatedHours(e.target.value)}
                placeholder="20"
              />
            </div>
            <div className="space-y-2">
              <Label>
                <IndianRupee className="w-3 h-3 inline mr-1" /> Cost
              </Label>
              <Input
                type="number"
                value={additionalCost}
                onChange={(e) => setAdditionalCost(e.target.value)}
                placeholder="18000"
              />
            </div>
            <div className="space-y-2">
              <Label>
                <Calendar className="w-3 h-3 inline mr-1" /> Days +
              </Label>
              <Input
                type="number"
                value={timelineImpact}
                onChange={(e) => setTimelineImpact(e.target.value)}
                placeholder="5"
              />
            </div>
          </div>
        </DialogContent>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={onCreate}>Create change request</Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
