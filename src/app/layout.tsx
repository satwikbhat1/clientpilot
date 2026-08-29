import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ClientPilot - AI-Powered SaaS for Freelancers',
  description:
    'Turn client communication into actionable project work. Extract tasks, deadlines, detect scope creep, generate quotes, and more.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
