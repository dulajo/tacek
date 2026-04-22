import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from 'sonner';
import { IDataRepository } from '../repositories/IDataRepository';
import { SupabaseRepository } from '../repositories/SupabaseRepository';
import { Member, MenuItem, Event, MemberConsumption } from '../types/models';
import { LoadingBar } from '../components/LoadingBar';

interface AppContextType {
  // Repository
  repository: IDataRepository;
  
  // State
  members: Member[];
  menuItems: MenuItem[];
  events: Event[];
  
  // Loading states
  isLoading: boolean;
  
  // Refresh methods
  refreshMembers: () => Promise<void>;
  refreshMenuItems: () => Promise<void>;
  refreshEvents: () => Promise<void>;
  refreshAll: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  const [repository] = useState<IDataRepository>(() => new SupabaseRepository());
  const [members, setMembers] = useState<Member[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refreshMembers = async () => {
    try {
      const data = await repository.getMembers();
      setMembers(data);
    } catch (error) {
      console.error('Failed to load members:', error);
      toast.error('Nepodařilo se načíst členy');
    }
  };

  const refreshMenuItems = async () => {
    try {
      const data = await repository.getMenuItems();
      setMenuItems(data);
    } catch (error) {
      console.error('Failed to load menu items:', error);
      toast.error('Nepodařilo se načíst menu');
    }
  };

  const refreshEvents = async () => {
    try {
      const data = await repository.getEvents();
      // Sort by date descending (newest first)
      data.sort((a, b) => b.date.getTime() - a.date.getTime());
      setEvents(data);
    } catch (error) {
      console.error('Failed to load events:', error);
      toast.error('Nepodařilo se načíst události');
    }
  };

  const refreshAll = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        refreshMembers(),
        refreshMenuItems(),
        refreshEvents(),
      ]);
    } catch (error) {
      console.error('Failed to load data:', error);
      toast.error('Nepodařilo se načíst data');
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    refreshAll();
  }, []);

  const value: AppContextType = {
    repository,
    members,
    menuItems,
    events,
    isLoading,
    refreshMembers,
    refreshMenuItems,
    refreshEvents,
    refreshAll,
  };

  return (
    <AppContext.Provider value={value}>
      {isLoading && <LoadingBar />}
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
