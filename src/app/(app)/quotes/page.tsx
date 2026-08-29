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
  FileText,
  Plus,
  Sparkles,
  Loader2,
  CheckCircle2,
  Copy,
  Download,
  IndianRupee,
  Calendar,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import { generateQuote } from '@/lib/ai-service';
import type { QuoteLineItem } from '@/lib/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import jsPDF from 'jspdf';

const FEATURE_OPTIONS = [
  'Authentication',
  'User Profiles',
  'Payment Gateway',
  'Admin Dashboard',
  'Product Management',
  'Order Tracking',
  'Search & Filtering',
  'Email Notifications',
  'File Uploads',
  'Multi-language',
  'Analytics Dashboard',
  'Booking System',
  'Messaging / Chat',
  'Inventory Management',
  'Review & Ratings',
  'Push Notifications',
  'Social Login',
  'API Integrations',
  'CMS / Blog',
  'Reports & Export',
];

export default function QuotesPage() {
  const { clients, addProject, addTask } = useStore();
  const [openQuote, setOpenQuote] = useState(false);
  const [quoteResult, setQuoteResult] = useState<QuoteLineItem[] | null>(null);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [proposalOpen, setProposalOpen] = useState(false);

  const [projectName, setProjectName] = useState('E-commerce website');
  const [clientId, setClientId] = useState('');
  const [pages, setPages] = useState('12');
  const [features, setFeatures] = useState<string[]>([
    'Authentication',
    'Payment Gateway',
    'Admin Dashboard',
    'Product Management',
    'Order Tracking',
  ]);
  const [extras, setExtras] = useState<string[]>([]);
  const [newExtra, setNewExtra] = useState('');
  const [timelineWeeks, setTimelineWeeks] = useState('6');

  const toggleFeature = (f: string) => {
    setFeatures((prev) =>
      prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]
    );
  };

  const addExtra = () => {
    const e = newExtra.trim();
    if (!e) return;
    setExtras((prev) => [...prev, e]);
    setNewExtra('');
  };

  const doGenerate = async () => {
    setGenerating(true);
    const res = await generateQuote({
      projectName,
      pages: parseInt(pages) || 5,
      features,
      extras,
    });
    setQuoteResult(res);
    setGenerating(false);
  };

  const total = (quoteResult ?? []).reduce((s, l) => s + l.amount, 0);

  const client = clients.find((c) => c.id === clientId) ?? clients[0];

  const copyProposal = () => {
    const t = buildProposalText();
    navigator.clipboard?.writeText(t);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const buildProposalText = () => {
    const lines: string[] = [];
    lines.push('PROJECT PROPOSAL');
    lines.push(projectName);
    lines.push('');
    lines.push(`Prepared for: ${client?.name ?? 'Client'}`);
    if (client?.company) lines.push(client.company);
    lines.push('');
    lines.push('=== Project Overview ===');
    lines.push(
      `This proposal outlines the scope, timeline, and investment for the ${projectName} project, including ${pages} pages and ${features.length} core features.`
    );
    lines.push('');
    lines.push('=== Deliverables ===');
    (quoteResult ?? []).forEach((l) => {
      lines.push(`✓ ${l.name}`);
      if (l.description) lines.push(`    ${l.description}`);
    });
    features.forEach((f) => lines.push(`✓ Feature: ${f}`));
    extras.forEach((e) => lines.push(`✓ Add-on: ${e}`));
    lines.push('');
    lines.push(`=== Timeline: ${timelineWeeks} weeks ===`);
    lines.push('');
    lines.push(`=== Investment: ${formatCurrency(total)} ===`);
    (quoteResult ?? []).forEach((l) => {
      lines.push(`  ${l.name}: ${formatCurrency(l.amount)}`);
    });
    lines.push('');
    lines.push('=== Payment Terms ===');
    lines.push('  • 40% upfront');
    lines.push('  • 40% on mid-project milestone');
    lines.push('  • 20% on completion & acceptance');
    return lines.join('\n');
  };

  const exportPDF = () => {
    try {
      const doc = new jsPDF({ unit: 'pt', format: 'a4' });
      const marginX = 60;
      const width = doc.internal.pageSize.getWidth() - marginX * 2;
      let y = 70;

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(22);
      doc.text('PROJECT PROPOSAL', marginX, y);
      y += 32;
      doc.setFontSize(17);
      doc.text(projectName, marginX, y);
      y += 22;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      doc.text(`Prepared for: ${client?.name ?? 'Client'}`, marginX, y);
      y += 14;
      if (client?.company) {
        doc.text(client.company, marginX, y);
        y += 14;
      }
      if (client?.email) {
        doc.text(client.email, marginX, y);
        y += 20;
      } else {
        y += 6;
      }

      doc.setDrawColor(220);
      doc.line(marginX, y, marginX + width, y);
      y += 18;

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.text('Project Overview', marginX, y);
      y += 20;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      const overview = `This proposal outlines the scope, timeline, and investment for the ${projectName} project, including ${pages} pages and ${features.length} core features.`;
      const splitOverview = doc.splitTextToSize(overview, width);
      doc.text(splitOverview, marginX, y);
      y += splitOverview.length * 14 + 10;

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.text('Deliverables', marginX, y);
      y += 18;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      (quoteResult ?? []).forEach((l) => {
        doc.text(`✓  ${l.name}`, marginX, y);
        y += 14;
      });
      features.forEach((f) => {
        doc.text(`✓  Feature: ${f}`, marginX, y);
        y += 14;
      });
      extras.forEach((e) => {
        doc.text(`✓  Add-on: ${e}`, marginX, y);
        y += 14;
      });
      y += 8;

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.text('Timeline', marginX, y);
      y += 18;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      doc.text(`${timelineWeeks} weeks estimated delivery`, marginX, y);
      y += 22;

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.text('Investment', marginX, y);
      y += 18;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      (quoteResult ?? []).forEach((l) => {
        doc.text(`${l.name}`, marginX, y);
        doc.text(formatCurrency(l.amount), marginX + width - 120, y, { align: 'right' });
        y += 14;
      });
      y += 6;
      doc.setDrawColor(220);
      doc.line(marginX, y, marginX + width, y);
      y += 14;
      doc.setFont('helvetica', 'bold');
      doc.text('Total', marginX, y);
      doc.setFontSize(13);
      doc.setTextColor(79, 70, 229);
      doc.text(formatCurrency(total), marginX + width - 120, y, { align: 'right' });
      doc.setTextColor(0);
      y += 26;

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.text('Payment Terms', marginX, y);
      y += 18;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      doc.text('• 40% upfront to commence work', marginX, y);
      y += 14;
      doc.text('• 40% on mid-project milestone delivery', marginX, y);
      y += 14;
      doc.text('• 20% on completion and client acceptance', marginX, y);

      doc.save(`${projectName.replace(/\s+/g, '-')}-proposal.pdf`);
    } catch (e) {
      alert('PDF export failed. Try again or copy the proposal text.');
      console.error(e);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <FileText className="w-6 h-6" /> Quotes & Proposals
          </h1>
          <p className="text-muted-foreground text-sm">
            Generate quotes and professional proposals in seconds.
          </p>
        </div>
        <Button onClick={() => setOpenQuote(true)}>
          <Plus className="w-4 h-4 mr-2" /> Generate quote
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Smart Quote Generator</CardTitle>
            <CardDescription>
              AI-powered pricing based on scope and complexity.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Project name</Label>
              <Input value={projectName} onChange={(e) => setProjectName(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Client</Label>
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
                <Label>Pages</Label>
                <Input
                  type="number"
                  value={pages}
                  onChange={(e) => setPages(e.target.value)}
                  min={1}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Features</Label>
              <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto p-1 border rounded-md bg-slate-50/50 dark:bg-slate-800/40">
                {FEATURE_OPTIONS.map((f) => {
                  const selected = features.includes(f);
                  return (
                    <button
                      key={f}
                      type="button"
                      onClick={() => toggleFeature(f)}
                      className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                        selected
                          ? 'bg-indigo-500 text-white border-indigo-500'
                          : 'bg-background hover:bg-slate-100 dark:hover:bg-slate-700'
                      }`}
                    >
                      {selected && '✓ '}
                      {f}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Add-ons / extras</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="e.g. Custom dashboard theme"
                  value={newExtra}
                  onChange={(e) => setNewExtra(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addExtra())}
                />
                <Button variant="outline" onClick={addExtra} type="button">
                  Add
                </Button>
              </div>
              {extras.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {extras.map((e, i) => (
                    <Badge
                      key={i}
                      variant="secondary"
                      className="cursor-pointer"
                      onClick={() => setExtras(extras.filter((x, j) => j !== i))}
                    >
                      {e} ✕
                    </Badge>
                  ))}
                </div>
              )}
            </div>
            <Button onClick={doGenerate} disabled={generating} className="w-full">
              {generating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" /> Generate smart quote
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Project Estimate</CardTitle>
                <CardDescription>
                  {quoteResult
                    ? `${quoteResult.length} line items generated`
                    : 'Fill out the form and generate a quote to see results.'}
                </CardDescription>
              </div>
              {quoteResult && (
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setProposalOpen(true)}>
                    <FileText className="w-4 h-4 mr-2" /> View proposal
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {quoteResult ? (
              <div className="space-y-4">
                <div className="rounded-lg border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item</TableHead>
                        <TableHead className="w-[100px]">Hours</TableHead>
                        <TableHead className="w-[140px] text-right">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {quoteResult.map((l, i) => (
                        <TableRow key={i}>
                          <TableCell>
                            <p className="font-medium">{l.name}</p>
                            {l.description && (
                              <p className="text-xs text-muted-foreground">
                                {l.description}
                              </p>
                            )}
                          </TableCell>
                          <TableCell className="text-sm">
                            {l.hours ? `${l.hours}h` : '—'}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(l.amount)}
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow>
                        <TableCell colSpan={2} className="font-semibold text-right">
                          Total
                        </TableCell>
                        <TableCell className="text-right">
                          <p className="font-bold text-indigo-600 dark:text-indigo-400 text-lg">
                            {formatCurrency(total)}
                          </p>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-4 rounded-lg border border-indigo-100 dark:border-indigo-500/20 bg-indigo-50/60 dark:bg-indigo-500/5 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-indigo-500 text-white flex items-center justify-center">
                      <IndianRupee className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Suggested total
                      </p>
                      <p className="text-lg font-bold">{formatCurrency(total)}</p>
                    </div>
                  </div>
                  <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-violet-500 text-white flex items-center justify-center">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Timeline</p>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          value={timelineWeeks}
                          onChange={(e) => setTimelineWeeks(e.target.value)}
                          className="h-8 w-20 py-1 px-2 text-sm"
                        />
                        <p className="text-sm font-medium">weeks</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button onClick={() => setProposalOpen(true)}>
                    <FileText className="w-4 h-4 mr-2" /> Generate proposal
                  </Button>
                  <Button variant="outline" onClick={exportPDF}>
                    <Download className="w-4 h-4 mr-2" /> Export PDF
                  </Button>
                </div>
              </div>
            ) : (
              <div className="py-20 text-center">
                <Sparkles className="w-10 h-10 mx-auto text-muted-foreground mb-3 opacity-40" />
                <p className="text-sm text-muted-foreground">
                  No quote yet. Use the generator on the left to create one.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={openQuote} onOpenChange={setOpenQuote} className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Generate Smart Quote</DialogTitle>
          <DialogDescription>
            Fill details and AI will calculate pricing based on scope.
          </DialogDescription>
        </DialogHeader>
        <DialogContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Use the Smart Quote Generator on the Quotes page for full features.
          </p>
        </DialogContent>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpenQuote(false)}>
            Close
          </Button>
          <Button onClick={() => (setOpenQuote(false), setOpenQuote(false))}>
            Open generator
          </Button>
        </DialogFooter>
      </Dialog>

      <Dialog open={proposalOpen} onOpenChange={setProposalOpen} className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" /> Project Proposal
          </DialogTitle>
          <DialogDescription>
            Professional proposal ready. Copy to clipboard or export as PDF.
          </DialogDescription>
        </DialogHeader>
        <DialogContent>
          <div className="rounded-lg border p-6 bg-white dark:bg-slate-900 space-y-6 max-h-[60vh] overflow-y-auto">
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">
                Project Proposal
              </p>
              <h3 className="text-2xl font-bold mt-1">{projectName}</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Prepared for: <span className="text-foreground font-medium">{client?.name ?? 'Client'}</span>
                {client?.company && ` · ${client.company}`}
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold uppercase tracking-wide mb-2">
                Project Overview
              </h4>
              <p className="text-sm">
                This proposal outlines the scope, timeline, and investment for the{' '}
                {projectName} project, including {pages} pages and {features.length}{' '}
                core features.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold uppercase tracking-wide mb-2">
                Deliverables
              </h4>
              <ul className="text-sm space-y-1">
                {(quoteResult ?? []).map((l, i) => (
                  <li key={i}>✓ {l.name}</li>
                ))}
                {features.map((f, i) => (
                  <li key={'f' + i}>✓ Feature: {f}</li>
                ))}
                {extras.map((e, i) => (
                  <li key={'e' + i}>✓ Add-on: {e}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold uppercase tracking-wide mb-2">
                Timeline
              </h4>
              <p className="text-sm">{timelineWeeks} weeks</p>
            </div>
            <div>
              <h4 className="text-sm font-semibold uppercase tracking-wide mb-2">
                Investment
              </h4>
              <ul className="text-sm space-y-1">
                {(quoteResult ?? []).map((l, i) => (
                  <li key={i} className="flex justify-between py-0.5 border-b last:border-0">
                    <span>{l.name}</span>
                    <span className="font-medium tabular-nums">
                      {formatCurrency(l.amount)}
                    </span>
                  </li>
                ))}
                <li className="flex justify-between py-2 font-bold text-indigo-600 dark:text-indigo-400 text-base pt-3">
                  <span>Total</span>
                  <span>{formatCurrency(total)}</span>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold uppercase tracking-wide mb-2">
                Payment Terms
              </h4>
              <ul className="text-sm space-y-1">
                <li>• 40% upfront to commence work</li>
                <li>• 40% on mid-project milestone delivery</li>
                <li>• 20% on completion and client acceptance</li>
              </ul>
            </div>
          </div>
        </DialogContent>
        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="ghost" onClick={() => setProposalOpen(false)}>
            Close
          </Button>
          <Button variant="outline" onClick={copyProposal}>
            {copied ? (
              <>
                <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-500" /> Copied
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 mr-2" /> Copy to clipboard
              </>
            )}
          </Button>
          <Button onClick={exportPDF}>
            <Download className="w-4 h-4 mr-2" /> Export as PDF
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
