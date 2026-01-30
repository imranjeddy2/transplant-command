import { NavLink } from 'react-router-dom';
import { Home, ClipboardList, Users, BarChart3, Search, PhoneCall } from 'lucide-react';

const navItems = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/tasks', icon: ClipboardList, label: 'Tasks' },
  { to: '/patients', icon: Users, label: 'Patients' },
  { to: '/pre-evaluations', icon: PhoneCall, label: 'Pre-Evaluations' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics' },
];

export function Sidebar() {
  return (
    <aside className="w-64 bg-sidebar text-sidebar-foreground flex flex-col h-screen fixed left-0 top-0">
      {/* Logo */}
      <div className="p-6 border-b border-sidebar-border">
        <h1 className="text-xl font-semibold tracking-tight">
          Transplant<span className="text-primary">AI</span>
        </h1>
      </div>

      {/* Search (Visual only) */}
      <div className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <div className="w-full pl-9 pr-12 py-2 bg-sidebar-accent rounded-lg text-sm text-muted-foreground cursor-not-allowed">
            Search...
          </div>
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground bg-sidebar-border px-1.5 py-0.5 rounded">
            ⌘K
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-sidebar-accent text-sidebar-foreground'
                      : 'text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                  }`
                }
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border">
        <p className="text-xs text-muted-foreground">Demo v1.0</p>
      </div>
    </aside>
  );
}
