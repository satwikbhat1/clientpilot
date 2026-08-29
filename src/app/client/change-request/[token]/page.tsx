'use client';

import { useParams, useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  CheckCircle2,
  XCircle,
  ShieldCheck,
  RefreshCw,
  Clock,
  Calendar,
  IndianRupee,
  ArrowLeft,
} from 'lucide-react';
import { formatCurrency, formatDate, cn } from '@/lib/utils';

export default function ClientChangeRequestPage() {
  const params = useParams<{ token: string }>();
  const router = useRouter();
  const { changeRequests, projects, clients, updateChangeRequest } = useStore();

  const cr = changeRequests.find((x) => x.secureToken === params.token);
  const [justApproved, setJustApproved] = useState<'approved' | 'rejected' | null>(
    null
  );

  const project = cr ? projects.find((p) => p.id === cr.projectId) : null;
  const client = project ? clients.find((c) => c.id === project.clientId) : null;

  const handleApprove = () => {
    if (!cr) return;
    updateChangeRequest(cr.id, { status: 'approved' });
    setJustApproved('approved');
  };
  const handleReject = () => {
    if (!cr) return;
    updateChangeRequest(cr.id, { status: 'rejected' });
    setJustApproved('rejected');
  };

  if (!cr) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-500" /> Invalid or expired link
            </CardTitle>
            <CardDescription>
              This change request link is not valid or has already been processed.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/')}>Go to ClientPilot</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 dark:from-slate-950 dark:to-slate-900">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-200/40 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-violet-200/40 rounded-full blur-3xl" />
      </div>
      <div className="relative max-w-2xl mx-auto p-4 sm:p-8 py-12">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/')}
          className="mb-6 text-muted-foreground"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white">
            <RefreshCw className="w-5 h-5" />
          </div>
          <div>
            <p className="font-bold text-xl tracking-tight">
              Change Request #{cr.id.slice(-4).toUpperCase()}
            </p>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <ShieldCheck className="w-3 h-3 text-emerald-500" /> Secure link ·{' '}
              {formatDate(cr.createdAt)}
            </div>
          </div>
        </div>

        {client && (
          <div className="flex items-center gap-3 p-3 mb-4 rounded-lg bg-white/70 dark:bg-slate-900/50 backdrop-blur border border-slate-200/70 dark:border-slate-800">
            <Avatar>
              <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-violet-600 text-white">
                {client.name
                  .split(' ')
                  .map((w) => w[0])
                  .slice(0, 2)
                  .join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">
                Prepared for: {client.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {client.company || client.email || ''}
              </p>
            </div>
          </div>
        )}

        <Card className="shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <CardTitle className="text-xl">{cr.title}</CardTitle>
                {project && (
                  <CardDescription className="mt-1">
                    Project: {project.name}
                  </CardDescription>
                )}
              </div>
              <Badge
                variant={
                  cr.status === 'approved'
                    ? 'success'
                    : cr.status === 'rejected'
                    ? 'danger'
                    : 'warning'
                }
                className="uppercase text-[11px] py-1 px-3"
              >
                {cr.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            {cr.reason && (
              <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800">
                <p className="text-[11px] uppercase text-muted-foreground font-semibold tracking-wide mb-1.5">
                  Reason for change
                </p>
                <p className="text-sm">{cr.reason}</p>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-4 rounded-lg border flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-sky-100 text-sky-600 dark:bg-sky-500/10 dark:text-sky-400 flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[11px] uppercase text-muted-foreground tracking-wide">
                    Effort
                  </p>
                  <p className="font-bold">{cr.estimatedHours} hours</p>
                </div>
              </div>
              <div className="p-4 rounded-lg border flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 flex items-center justify-center">
                  <IndianRupee className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[11px] uppercase text-muted-foreground tracking-wide">
                    Additional cost
                  </p>
                  <p className="font-bold">{formatCurrency(cr.additionalCost)}</p>
                </div>
              </div>
              <div className="p-4 rounded-lg border flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400 flex items-center justify-center">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[11px] uppercase text-muted-foreground tracking-wide">
                    Timeline
                  </p>
                  <p className="font-bold">
                    {cr.timelineImpact ? `+${cr.timelineImpact} days` : 'No change'}
                  </p>
                </div>
              </div>
            </div>

            {justApproved === 'approved' && (
              <div
                className={cn(
                  'flex items-center gap-3 p-4 rounded-lg border border-emerald-200 bg-emerald-50 dark:bg-emerald-500/10 dark:border-emerald-500/20'
                )}
              >
                <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0" />
                <div>
                  <p className="font-semibold text-emerald-700 dark:text-emerald-400">
                    Change request approved
                  </p>
                  <p className="text-sm text-emerald-600 dark:text-emerald-300/80">
                    Thank you! Your freelancer has been notified and will start on
                    the requested changes.
                  </p>
                </div>
              </div>
            )}

            {justApproved === 'rejected' && (
              <div
                className={cn(
                  'flex items-center gap-3 p-4 rounded-lg border border-red-200 bg-red-50 dark:bg-red-500/10 dark:border-red-500/20'
                )}
              >
                <XCircle className="w-6 h-6 text-red-500 shrink-0" />
                <div>
                  <p className="font-semibold text-red-700 dark:text-red-400">
                    Change request rejected
                  </p>
                  <p className="text-sm text-red-600 dark:text-red-300/80">
                    Your freelancer has been notified. They will follow up shortly
                    to discuss alternatives.
                  </p>
                </div>
              </div>
            )}

            {cr.status === 'pending' && !justApproved && (
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Button
                  size="lg"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                  onClick={handleApprove}
                >
                  <CheckCircle2 className="w-5 h-5 mr-2" /> Approve request
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="flex-1"
                  onClick={handleReject}
                >
                  <XCircle className="w-5 h-5 mr-2" /> Request changes
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-8">
          Powered by ClientPilot — a better way to manage client projects.
        </p>
      </div>
    </div>
  );
}
