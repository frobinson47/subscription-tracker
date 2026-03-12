'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import {
  LayoutDashboard,
  CreditCard,
  Calendar,
  Users,
  Lightbulb,
  Settings,
  Plus,
  Download,
  Sun,
  Moon,
} from 'lucide-react';
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
} from '@/components/ui/command';
import { exportJSON, downloadFile } from '@/lib/export-import';
import { ShortcutHelp } from '@/components/layout/shortcut-help';

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const pendingGRef = useRef(false);
  const gTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const navigate = useCallback(
    (path: string) => {
      setOpen(false);
      router.push(path);
    },
    [router]
  );

  const handleExportJSON = useCallback(async () => {
    setOpen(false);
    const json = await exportJSON();
    const date = new Date().toISOString().split('T')[0];
    downloadFile(json, `subtracker-export-${date}.json`, 'application/json');
  }, []);

  const handleToggleTheme = useCallback(() => {
    setOpen(false);
    const cycle: Record<string, string> = {
      system: 'light',
      light: 'dark',
      dark: 'system',
    };
    setTheme(cycle[theme ?? 'system'] ?? 'light');
  }, [theme, setTheme]);

  // Ctrl+K / Cmd+K to open, plus vim-style g+key and n shortcuts
  useEffect(() => {
    function isInputFocused() {
      const el = document.activeElement;
      if (!el) return false;
      const tag = el.tagName.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select') return true;
      if ((el as HTMLElement).isContentEditable) return true;
      return false;
    }

    function handleKeyDown(e: KeyboardEvent) {
      // Ctrl+K / Cmd+K to toggle command palette
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((prev) => !prev);
        return;
      }

      // Don't handle other shortcuts when input is focused or dialog is open
      if (isInputFocused()) return;

      // Vim-style g + key navigation
      if (pendingGRef.current) {
        pendingGRef.current = false;
        if (gTimerRef.current) {
          clearTimeout(gTimerRef.current);
          gTimerRef.current = null;
        }

        const routes: Record<string, string> = {
          d: '/dashboard',
          s: '/subscriptions',
          c: '/calendar',
          h: '/household',
          i: '/insights',
          x: '/settings',
        };

        if (routes[e.key]) {
          e.preventDefault();
          router.push(routes[e.key]);
          return;
        }
      }

      if (e.key === 'g' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        pendingGRef.current = true;
        gTimerRef.current = setTimeout(() => {
          pendingGRef.current = false;
          gTimerRef.current = null;
        }, 500);
        return;
      }

      // n key to create new subscription
      if (e.key === 'n' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        router.push('/subscriptions/new');
        return;
      }

      // d key to go to dashboard
      if (e.key === 'd' && !e.metaKey && !e.ctrlKey && !e.altKey && !pendingGRef.current) {
        e.preventDefault();
        router.push('/dashboard');
        return;
      }

      // / key to go to subscriptions
      if (e.key === '/' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        router.push('/subscriptions');
        return;
      }

      // ? key to show shortcut help
      if (e.key === '?' && !open) {
        setHelpOpen((prev) => !prev);
        return;
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      if (gTimerRef.current) clearTimeout(gTimerRef.current);
    };
  }, [router, open]);

  return (
    <>
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        <CommandGroup heading="Navigation">
          <CommandItem onSelect={() => navigate('/dashboard')}>
            <LayoutDashboard className="mr-2 h-4 w-4" />
            Dashboard
            <CommandShortcut>G D</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => navigate('/subscriptions')}>
            <CreditCard className="mr-2 h-4 w-4" />
            Subscriptions
            <CommandShortcut>G S</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => navigate('/calendar')}>
            <Calendar className="mr-2 h-4 w-4" />
            Calendar
            <CommandShortcut>G C</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => navigate('/household')}>
            <Users className="mr-2 h-4 w-4" />
            Household
            <CommandShortcut>G H</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => navigate('/insights')}>
            <Lightbulb className="mr-2 h-4 w-4" />
            Insights
            <CommandShortcut>G I</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => navigate('/settings')}>
            <Settings className="mr-2 h-4 w-4" />
            Settings
            <CommandShortcut>G X</CommandShortcut>
          </CommandItem>
        </CommandGroup>

        <CommandGroup heading="Actions">
          <CommandItem onSelect={() => navigate('/subscriptions/new')}>
            <Plus className="mr-2 h-4 w-4" />
            New Subscription
          </CommandItem>
          <CommandItem onSelect={handleExportJSON}>
            <Download className="mr-2 h-4 w-4" />
            Export JSON
          </CommandItem>
          <CommandItem onSelect={handleToggleTheme}>
            {theme === 'dark' ? (
              <Sun className="mr-2 h-4 w-4" />
            ) : (
              <Moon className="mr-2 h-4 w-4" />
            )}
            Toggle Theme
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
    <ShortcutHelp open={helpOpen} onClose={() => setHelpOpen(false)} />
    </>
  );
}
