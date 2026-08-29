'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sparkles, Rocket, Target, ShieldCheck } from 'lucide-react';

export default function Page() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const loginDemo = (tab: 'login' | 'signup') => {
    if (!email && tab === 'login') {
      setEmail('satwik@clientpilot.ai');
    }
    setLoading(true);
    setTimeout(() => {
      router.push('/dashboard');
    }, 700);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 dark:from-slate-950 dark:to-slate-900">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-200/40 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-violet-200/40 rounded-full blur-3xl" />
      </div>

      <div className="relative min-h-screen flex flex-col lg:flex-row">
        <div className="lg:w-1/2 flex flex-col justify-between p-8 lg:p-12">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="font-bold text-xl tracking-tight">ClientPilot</span>
          </div>

          <div className="hidden lg:block my-16 max-w-md">
            <h1 className="text-4xl font-bold tracking-tight mb-4">
              Turn client chats into <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">actionable work.</span>
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed">
              ClientPilot AI extracts tasks, deadlines, and risks from emails, WhatsApp,
              and meetings. Detect scope creep automatically, generate quotes, and keep
              every project on track.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-10">
              {[
                { icon: Rocket, label: '2x Faster kickoffs' },
                { icon: Target, label: 'Catch scope creep' },
                { icon: ShieldCheck, label: 'Get paid on time' },
              ].map((f) => (
                <div
                  key={f.label}
                  className="flex flex-col gap-2 p-4 rounded-xl bg-white/70 dark:bg-slate-900/50 backdrop-blur border border-slate-200/70 dark:border-slate-800"
                >
                  <div className="w-9 h-9 rounded-md bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 flex items-center justify-center">
                    <f.icon className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-medium">{f.label}</span>
                </div>
              ))}
            </div>
          </div>

          <p className="text-xs text-muted-foreground hidden lg:block">
            © {new Date().getFullYear()} ClientPilot. Built for freelancers & small agencies.
          </p>
        </div>

        <div className="lg:w-1/2 flex items-center justify-center p-6 lg:p-12">
          <Card className="w-full max-w-md shadow-xl">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl">Welcome back</CardTitle>
              <CardDescription>
                Sign in to your account to continue. Use demo mode to explore instantly.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-4">
                  <TabsTrigger value="login">Login</TabsTrigger>
                  <TabsTrigger value="signup">Sign up</TabsTrigger>
                </TabsList>
                <TabsContent value="login" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email-login">Email</Label>
                    <Input
                      id="email-login"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="password-login">Password</Label>
                      <button className="text-xs text-indigo-600 hover:underline">
                        Forgot?
                      </button>
                    </div>
                    <Input
                      id="password-login"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  <Button
                    className="w-full"
                    onClick={() => loginDemo('login')}
                    disabled={loading}
                  >
                    {loading ? 'Signing in...' : 'Continue to dashboard'}
                  </Button>
                </TabsContent>
                <TabsContent value="signup" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full name</Label>
                    <Input
                      id="name"
                      placeholder="Satwik"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email-signup">Email</Label>
                    <Input
                      id="email-signup"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password-signup">Password</Label>
                    <Input
                      id="password-signup"
                      type="password"
                      placeholder="At least 8 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  <Button
                    className="w-full"
                    onClick={() => loginDemo('signup')}
                    disabled={loading}
                  >
                    {loading ? 'Creating account...' : 'Create account'}
                  </Button>
                </TabsContent>
              </Tabs>
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or</span>
                </div>
              </div>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => loginDemo('login')}
                disabled={loading}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Launch demo instantly (no setup)
              </Button>
            </CardContent>
            <CardFooter className="text-xs text-muted-foreground justify-center">
              By continuing you agree to the Terms & Privacy Policy.
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
