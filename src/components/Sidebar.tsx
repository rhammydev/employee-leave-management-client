import { Users, CalendarDays, LayoutDashboard, BarChart3, UserCheck } from 'lucide-react';

export type Page = 'dashboard' | 'employees' | 'leaves' | 'statistics' | 'on-leave';

interface SidebarProps {
  current: Page;
  onChange: (p: Page) => void;
}

export const nav: { id: Page; label: string; icon: typeof Users; group?: string }[] = [
  { id: 'dashboard',  label: 'Dashboard',         icon: LayoutDashboard },
  { id: 'employees',  label: 'Employees',          icon: Users,        group: 'Manage' },
  { id: 'leaves',     label: 'Leave Requests',     icon: CalendarDays, group: 'Manage' },
  { id: 'on-leave',   label: 'Currently On Leave', icon: UserCheck,    group: 'Manage' },
  { id: 'statistics', label: 'Statistics',         icon: BarChart3,    group: 'Reports' },
];

// ─── Desktop / Tablet Sidebar ─────────────────────────────────────────────────
export function Sidebar({ current, onChange }: SidebarProps) {
  let lastGroup = '';

  return (
    <aside className="hidden md:flex shrink-0 flex-col bg-white border-r border-gray-100 min-h-screen w-16 lg:w-60 transition-all duration-200">
      {/* Logo */}
      <div className="px-4 lg:px-6 py-5 lg:py-6 border-b border-gray-100 flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center shrink-0">
          <CalendarDays size={16} className="text-white" />
        </div>
        <div className="hidden lg:block overflow-hidden">
          <p className="text-base font-semibold text-gray-900 font-display leading-tight">LeaveDesk</p>
          <p className="text-[11px] text-gray-400">HR Management</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 lg:px-3 py-4 space-y-0.5">
        {nav.map(({ id, label, icon: Icon, group }) => {
          const showGroup = group && group !== lastGroup;
          if (group) lastGroup = group;
          const active = current === id;
          return (
            <div key={id}>
              {showGroup && (
                <p className="hidden lg:block px-3 pt-4 pb-1.5 text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
                  {group}
                </p>
              )}
              {/* Tablet: icon-only with tooltip */}
              <button
                onClick={() => onChange(id)}
                title={label}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 text-left
                  ${active
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
              >
                <Icon size={16} className="shrink-0" />
                <span className="hidden lg:block">{label}</span>
              </button>
            </div>
          );
        })}
      </nav>

      <div className="hidden lg:block px-6 py-4 border-t border-gray-100">
        <p className="text-[11px] text-gray-300 font-semibold tracking-widest uppercase">ELM System v2</p>
      </div>
    </aside>
  );
}

// ─── Mobile Bottom Tab Bar ────────────────────────────────────────────────────
export function BottomNav({ current, onChange }: SidebarProps) {
  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white border-t border-gray-100 z-40 flex">
      {nav.map(({ id, label, icon: Icon }) => {
        const active = current === id;
        return (
          <button
            key={id}
            onClick={() => onChange(id)}
            className={`flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5 text-[10px] font-medium transition-colors
              ${active ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <Icon size={20} className={active ? 'text-blue-600' : 'text-gray-400'} />
            <span className="hidden xs:block leading-none">{label.split(' ')[0]}</span>
          </button>
        );
      })}
    </nav>
  );
}
