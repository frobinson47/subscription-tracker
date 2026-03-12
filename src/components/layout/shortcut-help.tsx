'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';

interface ShortcutHelpProps {
  open: boolean;
  onClose: () => void;
}

const NAVIGATION_SHORTCUTS = [
  { keys: ['G', 'D'], label: 'Dashboard' },
  { keys: ['G', 'S'], label: 'Subscriptions' },
  { keys: ['G', 'C'], label: 'Calendar' },
  { keys: ['G', 'H'], label: 'Household' },
  { keys: ['G', 'I'], label: 'Insights' },
  { keys: ['G', 'X'], label: 'Settings' },
  { keys: ['D'], label: 'Go to Dashboard' },
  { keys: ['/'], label: 'Go to Subscriptions' },
];

const ACTION_SHORTCUTS = [
  { keys: ['N'], label: 'New Subscription' },
  { keys: ['Ctrl', 'K'], label: 'Command Palette' },
  { keys: ['?'], label: 'Shortcut Help' },
  { keys: ['Esc'], label: 'Close Dialog' },
];

export function ShortcutHelp({ open, onClose }: ShortcutHelpProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 4 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-popover border border-border rounded-xl shadow-xl p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">Keyboard Shortcuts</h2>
              <button onClick={onClose} className="p-1 rounded-md hover:bg-accent transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Navigation</h3>
                <div className="space-y-2">
                  {NAVIGATION_SHORTCUTS.map((s) => (
                    <div key={s.label} className="flex items-center justify-between text-sm">
                      <span>{s.label}</span>
                      <div className="flex gap-1">
                        {s.keys.map((k) => (
                          <kbd key={k} className="px-2 py-0.5 bg-muted rounded text-xs font-mono">
                            {k}
                          </kbd>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Actions</h3>
                <div className="space-y-2">
                  {ACTION_SHORTCUTS.map((s) => (
                    <div key={s.label} className="flex items-center justify-between text-sm">
                      <span>{s.label}</span>
                      <div className="flex gap-1">
                        {s.keys.map((k) => (
                          <kbd key={k} className="px-2 py-0.5 bg-muted rounded text-xs font-mono">
                            {k}
                          </kbd>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
