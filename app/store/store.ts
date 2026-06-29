import { create } from "zustand";

interface Hostel {
    name: string;
}

interface HostelStore {
    hostels: Hostel[];
    addHostel: (name: string) => void;
}

export const useStore = create<HostelStore>((set) => ({
    hostels: [],
    addHostel: (name: string) => set((state) => ({ hostels: [...state.hostels, { name }] }))
}))