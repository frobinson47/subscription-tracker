import { create } from 'zustand';

interface UIState {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;

  // Encryption key held in memory for current session (never persisted)
  encryptionKey: CryptoKey | null;
  setEncryptionKey: (key: CryptoKey | null) => void;

  // Dismissed alert IDs for current session
  dismissedAlertIds: Set<string>;
  dismissAlert: (id: string) => void;
}

export const useStore = create<UIState>((set) => ({
  sidebarOpen: false,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

  encryptionKey: null,
  setEncryptionKey: (key) => set({ encryptionKey: key }),

  dismissedAlertIds: new Set(),
  dismissAlert: (id) =>
    set((state) => {
      const next = new Set(state.dismissedAlertIds);
      next.add(id);
      return { dismissedAlertIds: next };
    }),
}));
