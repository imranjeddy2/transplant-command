import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { CommandPalette, ToastProvider } from '@/components/ui';

export function Layout() {
  return (
    <ToastProvider>
      <div className="min-h-screen bg-background">
        <Sidebar />
        <main className="ml-64 min-h-screen">
          <Outlet />
        </main>
        <CommandPalette />
      </div>
    </ToastProvider>
  );
}
