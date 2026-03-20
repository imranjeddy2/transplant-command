import { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Home, ClipboardList, Users, BarChart3, Search, PhoneCall, Activity, Shield, ChevronDown } from 'lucide-react';
import { useApp, type AppId } from '@/context/AppContext';

const transplantNav = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/tasks', icon: ClipboardList, label: 'Tasks' },
  { to: '/patients', icon: Users, label: 'Patients' },
  { to: '/pre-evaluations', icon: PhoneCall, label: 'Pre-Evaluations' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics' },
];

const complianceNav = [
  { to: '/compliance', icon: Shield, label: 'UDAAP Analysis' },
];

const APP_CONFIG: Record<AppId, { label: string; icon: typeof Activity; nav: typeof transplantNav }> = {
  transplant: { label: 'Transplant Bridge', icon: Activity, nav: transplantNav },
  compliance: { label: 'Compliance Bridge', icon: Shield, nav: complianceNav },
};

export function Sidebar() {
  const { activeApp, setActiveApp } = useApp();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const config = APP_CONFIG[activeApp];
  const navItems = config.nav;
  const AppIcon = config.icon;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const switchApp = (app: AppId) => {
    setActiveApp(app);
    setDropdownOpen(false);
    navigate(app === 'compliance' ? '/compliance' : '/');
  };

  const openCommandPalette = () => {
    const event = new KeyboardEvent('keydown', {
      key: 'k',
      metaKey: true,
      bubbles: true,
    });
    document.dispatchEvent(event);
  };

  return (
    <aside className="w-64 bg-sidebar text-sidebar-foreground flex flex-col h-screen fixed left-0 top-0">
      {/* App Selector */}
      <div className="p-6 border-b border-sidebar-border" ref={dropdownRef}>
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center gap-2.5 w-full group"
        >
          <div className="w-8 h-8 bg-sidebar-primary rounded flex items-center justify-center flex-shrink-0">
            <AppIcon className="h-4 w-4 text-white" />
          </div>
          <h1 className="text-base font-semibold tracking-tight text-sidebar-foreground flex-1 text-left">
            {config.label}
          </h1>
          <ChevronDown className={`h-4 w-4 text-sidebar-foreground/40 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
        </button>

        {dropdownOpen && (
          <div className="mt-2 bg-sidebar-accent border border-sidebar-border rounded-md overflow-hidden">
            {(Object.keys(APP_CONFIG) as AppId[]).map((appId) => {
              const appCfg = APP_CONFIG[appId];
              const Icon = appCfg.icon;
              return (
                <button
                  key={appId}
                  onClick={() => switchApp(appId)}
                  className={`flex items-center gap-2.5 w-full px-3 py-2.5 text-sm transition-colors ${
                    activeApp === appId
                      ? 'bg-sidebar-primary/20 text-sidebar-foreground'
                      : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/80 hover:text-sidebar-foreground'
                  }`}
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  <span>{appCfg.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Search */}
      <div className="p-4">
        <button
          onClick={openCommandPalette}
          className="w-full relative group"
        >
          <div className="flex items-center w-full pl-9 pr-12 py-2 bg-sidebar-accent hover:bg-sidebar-accent/80 rounded text-sm text-sidebar-foreground/60 transition-colors border border-sidebar-border">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-sidebar-foreground/40" />
            <span>Search...</span>
          </div>
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-sidebar-foreground/40 bg-sidebar-border/60 px-1.5 py-0.5 rounded font-mono">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2">
        <ul className="space-y-0.5">
          {navItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-sidebar-primary text-white'
                      : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <item.icon className="h-4 w-4 flex-shrink-0" />
                    <span className={isActive ? 'text-white' : ''}>{item.label}</span>
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center justify-between">
          <p className="text-xs text-sidebar-foreground/40">{config.label}</p>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-green-400 rounded-full" />
            <span className="text-xs text-sidebar-foreground/40">Online</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
