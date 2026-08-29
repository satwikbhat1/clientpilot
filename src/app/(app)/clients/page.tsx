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
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Users,
  Plus,
  Search,
  ArrowUpRight,
  Mail,
  Phone,
  Building2,
} from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export default function ClientsPage() {
  const { clients, projects, addClient } = useStore();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');

  const filtered = clients.filter((c) =>
    [c.name, c.email, c.company, c.phone]
      .filter(Boolean)
      .some((v) => v!.toLowerCase().includes(query.toLowerCase()))
  );

  const createClient = () => {
    if (!name.trim()) return;
    addClient({ name, email, phone, company });
    setOpen(false);
    setName('');
    setEmail('');
    setPhone('');
    setCompany('');
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6" /> Clients
          </h1>
          <p className="text-muted-foreground text-sm">
            Manage clients, health scores, and contact details.
          </p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Plus className="w-4 h-4 mr-2" /> Add client
        </Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Search clients..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((c) => {
          const clientProjects = projects.filter((p) => p.clientId === c.id);
          const initials = c.name
            .split(' ')
            .map((w) => w[0])
            .slice(0, 2)
            .join('')
            .toUpperCase();
          const score = c.healthScore ?? {
            overall: 75,
            paymentReliability: 80,
            communication: 75,
            scopeStability: 70,
            approvalSpeed: 75,
          };
          const overallColor =
            score.overall >= 80
              ? 'text-emerald-600 dark:text-emerald-400'
              : score.overall >= 60
              ? 'text-amber-600 dark:text-amber-400'
              : 'text-red-600 dark:text-red-400';
          const overallDot =
            score.overall >= 80
              ? 'bg-emerald-500'
              : score.overall >= 60
              ? 'bg-amber-500'
              : 'bg-red-500';
          return (
            <Card key={c.id} className="overflow-hidden">
              <CardHeader className="p-5 pb-3">
                <div className="flex items-start gap-3">
                  <Avatar className="w-12 h-12">
                    <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-violet-600 text-white">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 justify-between">
                      <div>
                        <CardTitle className="text-base">{c.name}</CardTitle>
                        {c.company && (
                          <CardDescription className="flex items-center gap-1 mt-0.5">
                            <Building2 className="w-3 h-3" /> {c.company}
                          </CardDescription>
                        )}
                      </div>
                      <div
                        className={cn(
                          'text-right flex items-center gap-1.5 font-bold',
                          overallColor
                        )}
                      >
                        <span
                          className={cn('w-2 h-2 rounded-full', overallDot)}
                        />
                        {score.overall}/100
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-5 pt-2 space-y-4">
                <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                  {c.email && (
                    <span className="flex items-center gap-1">
                      <Mail className="w-3 h-3" /> {c.email}
                    </span>
                  )}
                  {c.phone && (
                    <span className="flex items-center gap-1">
                      <Phone className="w-3 h-3" /> {c.phone}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-muted-foreground">Payment</span>
                      <span className="font-semibold">
                        {score.paymentReliability}
                      </span>
                    </div>
                    <Progress
                      value={score.paymentReliability}
                      className="h-1.5 [&>div]:bg-emerald-500"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-muted-foreground">Comm</span>
                      <span className="font-semibold">
                        {score.communication}
                      </span>
                    </div>
                    <Progress
                      value={score.communication}
                      className="h-1.5 [&>div]:bg-indigo-500"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-muted-foreground">Scope</span>
                      <span className="font-semibold">
                        {score.scopeStability}
                      </span>
                    </div>
                    <Progress
                      value={score.scopeStability}
                      className="h-1.5 [&>div]:bg-amber-500"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-muted-foreground">Approvals</span>
                      <span className="font-semibold">
                        {score.approvalSpeed}
                      </span>
                    </div>
                    <Progress
                      value={score.approvalSpeed}
                      className="h-1.5 [&>div]:bg-violet-500"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t">
                  <Badge variant="outline" className="text-[11px]">
                    {clientProjects.length} project
                    {clientProjects.length === 1 ? '' : 's'}
                  </Badge>
                  <Link href={`/projects?client=${c.id}`}>
                    <Button variant="ghost" size="sm">
                      View projects
                      <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogHeader>
          <DialogTitle>Add new client</DialogTitle>
          <DialogDescription>
            Client health score will be calculated based on project activity.
          </DialogDescription>
        </DialogHeader>
        <DialogContent className="space-y-3">
          <div className="space-y-2">
            <Label>Client name *</Label>
            <Input
              placeholder="e.g. ABC Corp"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Company</Label>
            <Input
              placeholder="Company name"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                placeholder="contact@client.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input
                placeholder="+91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>
        </DialogContent>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={createClient}>Add client</Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
