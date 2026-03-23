import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { SignedIn, SignedOut, UserButton } from '@clerk/clerk-react';
import { motion } from 'framer-motion';

// Landing Sections
import HeroSection from '@/components/landing/HeroSection';
import FeatureSection from '@/components/landing/FeatureSection';
import HowItWorksSection from '@/components/landing/HowItWorksSection';
import PricingSection from '@/components/landing/PricingSection';
import CTASection from '@/components/landing/CTASection';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background font-sans selection:bg-primary/20">
      {/* Marketing Navbar */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold shadow-md">
              H
            </div>
            <span className="text-xl font-bold tracking-tight">HR SaaS</span>
          </div>

          <nav className="hidden md:flex gap-8 text-sm font-medium text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-foreground transition-colors">How it Works</a>
            <a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a>
          </nav>

          <div className="flex items-center gap-4">
            <SignedIn>
              <Link to="/dashboard">
                <Button variant="ghost" className="font-semibold hidden sm:flex">Go to Dashboard</Button>
              </Link>
              <UserButton appearance={{ elements: { userButtonAvatarBox: "h-9 w-9" } }} />
            </SignedIn>
            <SignedOut>
              <Link to="/sign-in" className="hidden sm:block">
                <Button variant="ghost" className="font-semibold text-muted-foreground hover:text-foreground">Log in</Button>
              </Link>
              <Link to="/sign-up">
                <Button className="font-semibold shadow-sm hover:-translate-y-0.5 transition-transform">Get Started</Button>
              </Link>
            </SignedOut>
          </div>
        </div>
      </header>

      {/* Main Content Assembly */}
      <main>
        <HeroSection />
        <FeatureSection />
        <HowItWorksSection />
        <PricingSection />
        <CTASection />
      </main>

      {/* Simple Footer */}
      <footer className="border-t bg-muted/20 py-12">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 grayscale opacity-50">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-foreground text-background font-bold text-xs">
              H
            </div>
            <span className="font-semibold tracking-tight text-foreground">HR SaaS</span>
          </div>
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Modern HR Inc. All rights reserved. Built for growing startups.
          </p>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <Link to="/refund-policy" className="hover:text-foreground transition-colors">Refund Policy</Link>
            <Link to="/terms" className="hover:text-foreground transition-colors">Terms & Conditions</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
