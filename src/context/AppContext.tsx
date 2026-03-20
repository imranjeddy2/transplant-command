import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';

export type AppId = 'transplant' | 'compliance';

interface AppContextValue {
  activeApp: AppId;
  setActiveApp: (app: AppId) => void;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const location = useLocation();

  const [activeApp, setActiveApp] = useState<AppId>(() => {
    if (location.pathname.startsWith('/compliance')) return 'compliance';
    const stored = localStorage.getItem('activeApp') as AppId | null;
    return stored === 'compliance' ? 'compliance' : 'transplant';
  });

  useEffect(() => {
    localStorage.setItem('activeApp', activeApp);
  }, [activeApp]);

  // Sync with URL on navigation
  useEffect(() => {
    if (location.pathname.startsWith('/compliance')) {
      setActiveApp('compliance');
    }
  }, [location.pathname]);

  return (
    <AppContext.Provider value={{ activeApp, setActiveApp }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppContextValue {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
