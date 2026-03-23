import React from 'react';
import { UserButton, SignedIn, SignedOut } from '@clerk/clerk-react';
import { Bell, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Navbar({ toggleSidebar }) {
  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between border-b bg-background/95 backdrop-blur px-4 supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="h-9 w-9 text-muted-foreground hover:bg-secondary"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <h2 className="text-sm font-medium text-muted-foreground hidden sm:block">
          Admin Workspace
        </h2>
      </div>

      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="relative h-9 w-9 hover:bg-secondary">
          <Bell className="h-4 w-4" />
          <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-destructive"></span>
        </Button>
        
        <SignedIn>
          <UserButton
            appearance={{
              elements: { userButtonAvatarBox: "h-8 w-8" },
            }}
            afterSignOutUrl="/"
          />
        </SignedIn>
        <SignedOut>
          <div className="h-8 w-8 rounded-full bg-secondary animate-pulse" /> {/* Placeholder while auth loads */}
        </SignedOut>
      </div>
    </header>
  );
}
