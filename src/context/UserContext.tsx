import { createContext, useContext, type ReactNode } from 'react';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  role: 'coordinator' | 'clinician' | 'admin';
  email: string;
}

interface UserContextValue {
  user: User;
}

const mockUser: User = {
  id: 'u-001',
  firstName: 'Sarah',
  lastName: 'Miller',
  role: 'coordinator',
  email: 'sarah.miller@transplantcenter.org',
};

const UserContext = createContext<UserContextValue | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  return (
    <UserContext.Provider value={{ user: mockUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser(): UserContextValue {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
