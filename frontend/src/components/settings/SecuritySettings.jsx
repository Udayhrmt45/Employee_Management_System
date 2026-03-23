import React from 'react';
import { UserProfile } from '@clerk/clerk-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, KeyRound, Smartphone, MonitorSmartphone } from 'lucide-react';

const securityHighlights = [
  {
    title: 'Password',
    description: 'Update your sign-in password using Clerk\'s secure account flow.',
    icon: KeyRound,
  },
  {
    title: 'Two-factor authentication',
    description: 'Enable and manage MFA methods supported by your Clerk tenant.',
    icon: Smartphone,
  },
  {
    title: 'Active sessions',
    description: 'Review devices and sign out of sessions you no longer trust.',
    icon: MonitorSmartphone,
  },
];

export default function SecuritySettings() {
  return (
    <div className="space-y-6">
      <Card className="border-none shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Security Center
          </CardTitle>
          <CardDescription>
            Manage your account security settings, including password updates, two-factor authentication, and session access.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          {securityHighlights.map((item) => {
            const Icon = item.icon;

            return (
              <div key={item.title} className="rounded-xl border bg-muted/20 p-4">
                <div className="mb-3 inline-flex rounded-lg bg-primary/10 p-2 text-primary">
                  <Icon className="h-4 w-4" />
                </div>
                <h3 className="font-medium text-foreground">{item.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
        <UserProfile
          routing="virtual"
          appearance={{
            elements: {
              rootBox: 'w-full',
              cardBox: 'w-full shadow-none',
              card: 'w-full shadow-none border-0 rounded-none',
            },
          }}
        />
      </div>
    </div>
  );
}
