import { create } from 'zustand';

interface NetState {
  selectedNetId: string | null;
  selectedNetFrequency: string | null;
  setSelectedNet: (id: string | null, frequency: string | null) => void;
}

export const useNetStore = create<NetState>((set) => ({
  selectedNetId: null,
  selectedNetFrequency: null,
  setSelectedNet: (id, frequency) => set({ selectedNetId: id, selectedNetFrequency: frequency }),
}));