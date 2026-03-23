import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Home, LayoutDashboard } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useAuthUser } from '@/hooks/useAuthUser';

export default function NotFound() {
  const { isAuthenticated, workspaceInitialized } = useAuthUser();
  const primaryHref = isAuthenticated
    ? (workspaceInitialized ? '/dashboard' : '/onboarding')
    : '/';
  const primaryLabel = isAuthenticated
    ? (workspaceInitialized ? 'Go to Dashboard' : 'Continue Setup')
    : 'Back to Home';
  const PrimaryIcon = isAuthenticated && workspaceInitialized ? LayoutDashboard : Home;
  const secondaryHref = isAuthenticated ? '/attendance' : '/sign-in';
  const secondaryLabel = isAuthenticated ? 'Open Attendance' : 'Sign In';
  const SecondaryIcon = isAuthenticated ? LayoutDashboard : Home;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background px-6 py-16">
      <div className="mx-auto flex min-h-[70vh] max-w-4xl items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="w-full rounded-3xl border bg-card/90 p-8 text-center shadow-xl backdrop-blur md:p-12"
        >
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Compass className="h-8 w-8" />
          </div>

          <div className="text-sm font-semibold uppercase tracking-[0.3em] text-primary/80">
            Error 404
          </div>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-foreground md:text-5xl">
            This page wandered off
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm text-muted-foreground md:text-base">
            The link may be outdated, the page may have moved, or the address might be mistyped.
            Your workspace is safe, and you can head back using one of the options below.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button asChild size="lg" className="min-w-[180px]">
              <Link to={primaryHref}>
                <PrimaryIcon className="mr-2 h-4 w-4" />
                {primaryLabel}
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="min-w-[180px]">
              <Link to={secondaryHref}>
                <SecondaryIcon className="mr-2 h-4 w-4" />
                {secondaryLabel}
              </Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
