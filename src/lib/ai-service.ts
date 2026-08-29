'use server';

import type {
  ExtractedRequirements,
  ScopeCreepDetection,
  QuoteLineItem,
  ProjectRisk,
} from '@/lib/types';

const RATE_PER_HOUR = 800;

function simulateAIResponse<T>(mockData: T, delay: number = 800): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(mockData), delay));
}

export async function extractRequirements(
  content: string,
  source: string
): Promise<ExtractedRequirements> {
  const lowerContent = content.toLowerCase();

  const hasHighPriority =
    lowerContent.includes('urgent') ||
    lowerContent.includes('asap') ||
    lowerContent.includes('critical') ||
    lowerContent.includes('as soon as') ||
    lowerContent.includes('by monday') ||
    lowerContent.includes('by tomorrow');

  const keywords: Record<string, string> = {
    homepage: 'Update homepage',
    hero: 'Update hero section',
    button: 'Change button styling',
    testimonial: 'Add testimonials section',
    responsive: 'Mobile responsiveness',
    mobile: 'Mobile responsiveness',
    contact: 'Contact form integration',
    auth: 'Authentication system',
    login: 'Login/Registration flow',
    payment: 'Payment gateway integration',
    dashboard: 'Admin dashboard',
    analytics: 'Analytics dashboard',
    product: 'Product management system',
    cart: 'Shopping cart functionality',
    checkout: 'Checkout flow',
    about: 'About page content',
    blog: 'Blog section',
    gallery: 'Image gallery',
    nav: 'Navigation updates',
    footer: 'Footer updates',
    seo: 'SEO optimization',
    speed: 'Performance optimization',
  };

  const detectedTasks: ExtractedRequirements['tasks'] = [];
  Object.entries(keywords).forEach(([key, title]) => {
    if (lowerContent.includes(key)) {
      detectedTasks.push({
        title,
        priority: hasHighPriority ? 'high' : 'medium',
        estimatedHours: Math.floor(Math.random() * 6) + 2,
      });
    }
  });

  if (detectedTasks.length === 0) {
    detectedTasks.push({
      title: 'Review and implement client requirements',
      priority: hasHighPriority ? 'high' : 'medium',
      estimatedHours: 4,
    });
    detectedTasks.push({
      title: 'Follow up with client on details',
      priority: 'low',
      estimatedHours: 1,
    });
  }

  let deadline: string | undefined;
  if (lowerContent.includes('by monday')) deadline = 'Next Monday';
  else if (lowerContent.includes('by friday')) deadline = 'This Friday';
  else if (lowerContent.includes('tomorrow')) deadline = 'Tomorrow';
  else if (lowerContent.includes('next week')) deadline = 'Next week';
  else if (lowerContent.includes('end of month')) deadline = 'End of month';

  let sentiment: ExtractedRequirements['sentiment'] = 'neutral';
  if (
    lowerContent.includes('love') ||
    lowerContent.includes('great') ||
    lowerContent.includes('excellent') ||
    lowerContent.includes('thanks') ||
    lowerContent.includes('perfect')
  ) {
    sentiment = 'positive';
  } else if (
    lowerContent.includes('bad') ||
    lowerContent.includes('urgent') ||
    lowerContent.includes('disappointed') ||
    lowerContent.includes('wrong') ||
    lowerContent.includes('broken')
  ) {
    sentiment = 'negative';
  }

  const blockers: string[] = [];
  if (lowerContent.includes('testimonial') && !lowerContent.includes('provided')) {
    blockers.push('Testimonials content required from client');
  }
  if (lowerContent.includes('image') || lowerContent.includes('gallery')) {
    blockers.push('Images/assets required from client');
  }
  if (lowerContent.includes('content')) {
    blockers.push('Content copy required from client');
  }
  if (blockers.length === 0 && detectedTasks.length > 2) {
    blockers.push('Awaiting client clarification on some requirements');
  }

  const minBudget = detectedTasks.reduce((s, t) => s + (t.estimatedHours || 4) * RATE_PER_HOUR * 0.9, 0);
  const maxBudget = detectedTasks.reduce((s, t) => s + (t.estimatedHours || 4) * RATE_PER_HOUR * 1.1, 0);

  const risks: string[] = [];
  if (hasHighPriority) risks.push('Tight deadline may impact quality');
  if (detectedTasks.length > 4) risks.push('Multiple features requested - consider splitting into milestones');
  if (blockers.length > 0) risks.push('Client dependencies may cause delays');

  const questions: string[] = [];
  if (lowerContent.includes('testimonial')) questions.push('Do you have the testimonials copy ready?');
  if (lowerContent.includes('button') || lowerContent.includes('color')) {
    questions.push('Can you share the exact HEX color code for the buttons?');
  }
  if (questions.length === 0) {
    questions.push('Would you like to schedule a quick call to clarify these requirements?');
  }

  const originalScope = detectedTasks.map((t) => t.title);

  return simulateAIResponse({
    tasks: detectedTasks,
    deadlines: deadline ? [deadline] : undefined,
    budget: {
      min: Math.round(minBudget),
      max: Math.round(maxBudget),
    },
    dependencies: blockers.length > 0 ? ['Client provides required assets/content'] : undefined,
    questions,
    risks: risks.length > 0 ? risks : undefined,
    sentiment,
    summary: `Client request received via ${source}. ${detectedTasks.length} task(s) detected. Focus areas: ${detectedTasks
      .slice(0, 3)
      .map((t) => t.title)
      .join(', ')}.`,
    clientRequest: detectedTasks.length > 0 ? detectedTasks[0].title : 'General inquiry',
    blockers: blockers.length > 0 ? blockers : undefined,
  });
}

export async function detectScopeCreep(
  originalScope: string[],
  newRequest: string,
  currentBudget: number
): Promise<ScopeCreepDetection> {
  const lowerRequest = newRequest.toLowerCase();

  const keywords: Record<string, number> = {
    dashboard: 20,
    analytics: 18,
    admin: 22,
    payment: 15,
    auth: 12,
    multi: 16,
    language: 8,
    translation: 8,
    api: 14,
    integration: 14,
    notification: 10,
    email: 8,
    realtime: 16,
    chat: 18,
    mobile: 25,
    app: 20,
    export: 10,
    report: 12,
    search: 10,
    filter: 8,
  };

  let additionalHours = 0;
  Object.entries(keywords).forEach(([key, hours]) => {
    if (lowerRequest.includes(key)) {
      additionalHours += hours;
    }
  });

  if (additionalHours === 0) {
    additionalHours = Math.floor(Math.random() * 15) + 8;
  }

  const hoursMin = Math.round(additionalHours * 0.8);
  const hoursMax = Math.round(additionalHours * 1.2);

  const costMin = hoursMin * RATE_PER_HOUR;
  const costMax = hoursMax * RATE_PER_HOUR;

  const ratio = (hoursMax * RATE_PER_HOUR) / Math.max(currentBudget, 1);
  const risk: ScopeCreepDetection['risk'] =
    ratio > 0.4 ? 'high' : ratio > 0.2 ? 'medium' : 'low';

  return simulateAIResponse(
    {
      originalScope,
      newRequest,
      additionalHoursMin: hoursMin,
      additionalHoursMax: hoursMax,
      additionalCostMin: costMin,
      additionalCostMax: costMax,
      risk,
    },
    1000
  );
}

export async function generateQuote(params: {
  projectName: string;
  pages: number;
  features: string[];
  extras?: string[];
}): Promise<QuoteLineItem[]> {
  const { pages, features, extras = [] } = params;

  const lineItems: QuoteLineItem[] = [];

  const devHours = pages * 6 + features.length * 12;
  lineItems.push({
    name: 'Development',
    description: `${pages} pages + ${features.length} features implementation`,
    hours: devHours,
    amount: devHours * RATE_PER_HOUR,
  });

  const uiHours = pages * 2 + features.length * 2;
  lineItems.push({
    name: 'UI/UX Design',
    description: 'Wireframes, prototypes, and visual design',
    hours: uiHours,
    amount: uiHours * (RATE_PER_HOUR * 0.9),
  });

  const testingHours = Math.round(devHours * 0.2);
  lineItems.push({
    name: 'Testing & QA',
    description: 'Cross-browser, device testing, bug fixes',
    hours: testingHours,
    amount: testingHours * RATE_PER_HOUR,
  });

  lineItems.push({
    name: 'Deployment & Setup',
    description: 'Server setup, domain config, deployment pipeline',
    hours: 6,
    amount: 6 * RATE_PER_HOUR,
  });

  extras.forEach((extra) => {
    const extraHours = 10;
    lineItems.push({
      name: extra,
      hours: extraHours,
      amount: extraHours * RATE_PER_HOUR,
    });
  });

  return simulateAIResponse(lineItems, 900);
}

export async function generateClientReply(
  context: string,
  tone: 'professional' | 'friendly' | 'firm' | 'short',
  situation?: 'scope-creep' | 'follow-up' | 'deadline' | 'update' | 'general'
): Promise<string> {
  const templates = {
    'scope-creep': {
      professional:
        'Thank you for sharing the additional requirements. I have reviewed the requested changes and would be glad to incorporate them. Since these features were not part of the original project scope, I have prepared a change request outlining the additional timeline and costs involved for your review and approval. Please let me know if you have any questions.',
      friendly:
        'Hey! Thanks for sending over the new ideas — the analytics dashboard sounds great! Quick heads up: since this wasn\'t part of our original scope, I\'ve put together a quick change request with how long it\'ll take and the extra cost. Let me know what you think and we can get started right away! 😊',
      firm:
        'I have reviewed your request. As previously agreed, the functionality described falls outside the original project scope defined in our contract. A formal change request has been prepared including the additional effort (hours, cost, and timeline impact). Work on this item will commence only after written approval is received.',
      short:
        'New request received. This is outside the original scope. I\'ve shared a change request — please approve to proceed.',
    },
    'follow-up': {
      professional:
        'I hope this message finds you well. I wanted to follow up on the previous communication regarding the outstanding items. Your inputs are essential for us to keep the project on track. Could you please share the required details at your earliest convenience?',
      friendly:
        'Hey! Just checking in about the items we discussed earlier. No rush at all, but whenever you get a chance to share those, it will help us keep things moving smoothly. Let me know if you need anything from my end!',
      firm:
        'This is a follow-up on the pending inputs required. As these items are currently blocking progress, please share them at the earliest to avoid delays in the project timeline.',
      short: 'Gentle follow-up — still awaiting your inputs. Thanks!',
    },
    deadline: {
      professional:
        'I wanted to provide a quick update on the project timeline. Given the current progress and pending inputs, we may need to adjust the delivery date by a few days. I will share a revised timeline shortly and appreciate your understanding.',
      friendly:
        'Hi! Quick timeline update: we\'re doing great but a couple of things took a little longer than expected. We\'re looking at a small delay of ~2-3 days, will keep you posted every step of the way!',
      firm:
        'Due to dependencies that are outside of our control, the project deadline will be impacted. A revised schedule along with the justification is being shared. Please review and acknowledge.',
      short: 'Timeline update: slight delay. Revised schedule shared shortly.',
    },
    update: {
      professional:
        'Please find attached the latest project update. We have completed the planned milestones for this phase and are progressing well. The next steps and any outstanding items are summarized for your review.',
      friendly:
        'Hey! Here\'s a quick progress update — we shipped the hero section and made the buttons blue ✅. Testimonials are next. Everything is on track, will share another update soon!',
      firm:
        'Project update: Current phase completed as per plan. Next phase commences immediately. Outstanding action items, if any, are listed separately.',
      short: 'Progress update: Milestones delivered. Proceeding to next phase.',
    },
    general: {
      professional:
        'Thank you for reaching out. I have noted your message and will review the details thoroughly. I shall revert with the next steps shortly.',
      friendly:
        'Hey! Got your message — thanks for sharing. I\'ll go through this today and get back to you with the plan. Talk soon!',
      firm: 'Message received. Reviewing and will respond with action items.',
      short: 'Noted. Will revert shortly.',
    },
  };

  const situationKey = situation || 'general';
  return simulateAIResponse(templates[situationKey][tone], 600);
}

export async function detectProjectRisks(params: {
  recentChanges: number;
  scopeIncreasePercent: number;
  daysToDeadline: number;
  pendingApprovals: number;
  sentimentTrend: 'improving' | 'stable' | 'declining';
}): Promise<ProjectRisk[]> {
  const {
    recentChanges,
    scopeIncreasePercent,
    daysToDeadline,
    pendingApprovals,
    sentimentTrend,
  } = params;

  const risks: ProjectRisk[] = [];

  if (recentChanges >= 5 && daysToDeadline < 14) {
    risks.push({
      type: 'scope',
      severity: 'high',
      message: `Client has requested ${recentChanges} changes in the last few days with ${daysToDeadline} days remaining.`,
      recommendedAction:
        'Create a consolidated change request for the latest requirements and pause acceptance of new requests until current ones are finalized.',
    });
  } else if (recentChanges >= 3) {
    risks.push({
      type: 'scope',
      severity: 'medium',
      message: `Multiple recent change requests (${recentChanges}) detected.`,
      recommendedAction: 'Consider consolidating changes into a change request.',
    });
  }

  if (scopeIncreasePercent >= 25) {
    risks.push({
      type: 'budget',
      severity: 'high',
      message: `Current project scope has increased by approximately ${scopeIncreasePercent}%.`,
      recommendedAction:
        'Review budget vs. actual effort. Issue a change request for out-of-scope work or revisit the original quote.',
    });
  } else if (scopeIncreasePercent >= 15) {
    risks.push({
      type: 'budget',
      severity: 'medium',
      message: `Project scope has grown by ~${scopeIncreasePercent}%.`,
      recommendedAction: 'Track additional effort against scope to avoid budget leakage.',
    });
  }

  if (daysToDeadline < 5 && pendingApprovals > 0) {
    risks.push({
      type: 'deadline',
      severity: 'high',
      message: `Deadline is in ${daysToDeadline} days with ${pendingApprovals} pending client approval(s).`,
      recommendedAction:
        'Send an immediate follow-up to the client requesting approvals with a clear note on timeline impact.',
    });
  } else if (daysToDeadline < 7) {
    risks.push({
      type: 'deadline',
      severity: daysToDeadline < 3 ? 'high' : 'medium',
      message: `Approaching project deadline (${daysToDeadline} days left).`,
      recommendedAction: 'Finalize remaining tasks, send a progress summary to the client.',
    });
  }

  if (sentimentTrend === 'declining') {
    risks.push({
      type: 'other',
      severity: 'medium',
      message: 'Client communication sentiment appears to be declining.',
      recommendedAction:
        'Schedule a short check-in call to realign expectations and address concerns proactively.',
    });
  }

  if (risks.length === 0) {
    risks.push({
      type: 'other',
      severity: 'low',
      message: 'No significant risks detected. Continue monitoring progress.',
    });
  }

  return simulateAIResponse(risks, 700);
}

export async function calculateClientHealthScore(params: {
  paymentsOnTime: number;
  totalPayments: number;
  avgResponseTimeHours: number;
  totalRevisions: number;
  scopeChangeCount: number;
  missedApprovals: number;
  avgSentiment: number;
}): Promise<{
  overall: number;
  paymentReliability: number;
  communication: number;
  scopeStability: number;
  approvalSpeed: number;
}> {
  const {
    paymentsOnTime,
    totalPayments,
    avgResponseTimeHours,
    totalRevisions,
    scopeChangeCount,
    missedApprovals,
    avgSentiment,
  } = params;

  const paymentReliability =
    totalPayments === 0 ? 85 : Math.round((paymentsOnTime / totalPayments) * 100);

  const communication = Math.max(
    40,
    Math.min(100, Math.round(100 - (avgResponseTimeHours / 48) * 60 + avgSentiment * 10))
  );

  const scopeStability = Math.max(
    30,
    Math.min(100, 100 - scopeChangeCount * 8 - totalRevisions * 3)
  );

  const approvalSpeed = Math.max(40, Math.min(100, 100 - missedApprovals * 12));

  const overall = Math.round(
    paymentReliability * 0.35 +
      communication * 0.25 +
      scopeStability * 0.25 +
      approvalSpeed * 0.15
  );

  return simulateAIResponse(
    {
      overall,
      paymentReliability,
      communication,
      scopeStability,
      approvalSpeed,
    },
    500
  );
}
