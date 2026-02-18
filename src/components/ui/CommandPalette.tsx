import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Home,
  Users,
  CheckSquare,
  BarChart3,
  Phone,
  User,
  FileText,
  ArrowRight,
} from 'lucide-react';
import { patients } from '@/data/mockData';

interface CommandItem {
  id: string;
  title: string;
  subtitle?: string;
  icon: typeof Home;
  action: () => void;
  category: 'navigation' | 'patients' | 'actions';
}

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();

  // Build command list
  const commands: CommandItem[] = useMemo(() => {
    const nav: CommandItem[] = [
      {
        id: 'nav-home',
        title: 'Home',
        subtitle: 'Go to dashboard',
        icon: Home,
        action: () => navigate('/'),
        category: 'navigation',
      },
      {
        id: 'nav-patients',
        title: 'Patients',
        subtitle: 'View all patients',
        icon: Users,
        action: () => navigate('/patients'),
        category: 'navigation',
      },
      {
        id: 'nav-tasks',
        title: 'Tasks',
        subtitle: 'View all tasks',
        icon: CheckSquare,
        action: () => navigate('/tasks'),
        category: 'navigation',
      },
      {
        id: 'nav-pre-eval',
        title: 'Pre-Evaluations',
        subtitle: 'Manage pre-evaluation calls',
        icon: Phone,
        action: () => navigate('/pre-evaluations'),
        category: 'navigation',
      },
      {
        id: 'nav-analytics',
        title: 'Analytics',
        subtitle: 'View analytics dashboard',
        icon: BarChart3,
        action: () => navigate('/analytics'),
        category: 'navigation',
      },
    ];

    const patientCommands: CommandItem[] = patients.slice(0, 10).map((patient) => ({
      id: `patient-${patient.id}`,
      title: `${patient.firstName} ${patient.lastName}`,
      subtitle: `MRN: ${patient.mrn}`,
      icon: User,
      action: () => navigate(`/patients/${patient.id}`),
      category: 'patients',
    }));

    const actions: CommandItem[] = [
      {
        id: 'action-new-doc',
        title: 'Upload Document',
        subtitle: 'Upload a new patient document',
        icon: FileText,
        action: () => {
          // Would open upload modal
          setIsOpen(false);
        },
        category: 'actions',
      },
    ];

    return [...nav, ...patientCommands, ...actions];
  }, [navigate]);

  // Filter commands based on query
  const filteredCommands = useMemo(() => {
    if (!query) return commands;
    const lower = query.toLowerCase();
    return commands.filter(
      (cmd) =>
        cmd.title.toLowerCase().includes(lower) ||
        cmd.subtitle?.toLowerCase().includes(lower)
    );
  }, [commands, query]);

  // Group filtered commands by category
  const groupedCommands = useMemo(() => {
    const groups: Record<string, CommandItem[]> = {
      navigation: [],
      patients: [],
      actions: [],
    };
    filteredCommands.forEach((cmd) => {
      groups[cmd.category].push(cmd);
    });
    return groups;
  }, [filteredCommands]);

  // Handle keyboard shortcut to open
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
        setQuery('');
        setSelectedIndex(0);
      }

      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handle arrow navigation and enter
  const handleKeyNavigation = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, filteredCommands.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter' && filteredCommands[selectedIndex]) {
        e.preventDefault();
        filteredCommands[selectedIndex].action();
        setIsOpen(false);
      }
    },
    [filteredCommands, selectedIndex]
  );

  // Reset selection when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const categoryLabels: Record<string, string> = {
    navigation: 'Navigation',
    patients: 'Patients',
    actions: 'Actions',
  };

  let flatIndex = -1;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={() => setIsOpen(false)}
          />

          {/* Command Palette */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="fixed top-[20%] left-1/2 -translate-x-1/2 w-full max-w-xl z-50"
          >
            <div className="bg-card rounded-2xl border border-border shadow-2xl overflow-hidden">
              {/* Search Input */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
                <Search className="h-5 w-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search for patients, pages, actions..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyNavigation}
                  className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none"
                  autoFocus
                />
                <kbd className="hidden sm:flex items-center gap-1 px-2 py-1 bg-muted rounded text-xs text-muted-foreground">
                  esc
                </kbd>
              </div>

              {/* Results */}
              <div className="max-h-[60vh] overflow-y-auto p-2">
                {filteredCommands.length === 0 ? (
                  <div className="py-8 text-center text-muted-foreground">
                    No results found for "{query}"
                  </div>
                ) : (
                  Object.entries(groupedCommands).map(([category, items]) => {
                    if (items.length === 0) return null;

                    return (
                      <div key={category} className="mb-2">
                        <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          {categoryLabels[category]}
                        </div>
                        {items.map((item) => {
                          flatIndex++;
                          const isSelected = flatIndex === selectedIndex;
                          const Icon = item.icon;

                          return (
                            <button
                              key={item.id}
                              onClick={() => {
                                item.action();
                                setIsOpen(false);
                              }}
                              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                                isSelected
                                  ? 'bg-primary/10 text-primary'
                                  : 'hover:bg-muted text-foreground'
                              }`}
                            >
                              <div
                                className={`p-1.5 rounded-md ${
                                  isSelected ? 'bg-primary/20' : 'bg-muted'
                                }`}
                              >
                                <Icon className="h-4 w-4" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium truncate">{item.title}</p>
                                {item.subtitle && (
                                  <p className="text-sm text-muted-foreground truncate">
                                    {item.subtitle}
                                  </p>
                                )}
                              </div>
                              {isSelected && <ArrowRight className="h-4 w-4 flex-shrink-0" />}
                            </button>
                          );
                        })}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Footer */}
              <div className="px-4 py-2 bg-muted/30 border-t border-border flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-muted rounded">↑</kbd>
                  <kbd className="px-1.5 py-0.5 bg-muted rounded">↓</kbd>
                  navigate
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-muted rounded">↵</kbd>
                  select
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-muted rounded">esc</kbd>
                  close
                </span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
