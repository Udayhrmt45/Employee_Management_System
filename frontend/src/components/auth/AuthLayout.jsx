import React from 'react';

/**
 * Shared layout wrapper for Auth pages to keep design consistent
 * and avoid repeating the generic header details.
 */
export default function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center justify-center space-y-2 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold shadow-sm">
            H
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>
        
        {children}
      </div>
    </div>
  );
}

/**
 * Shared appearance object for Clerk components to maintain UI uniformity.
 */
export const clerkAppearance = {
  elements: {
    rootBox: "mx-auto w-full",
    card: "shadow-xl border bg-card rounded-xl",
    headerTitle: "hidden",
    headerSubtitle: "hidden",
    formButtonPrimary: "bg-primary text-primary-foreground hover:bg-primary/90 rounded-md",
  },
};
