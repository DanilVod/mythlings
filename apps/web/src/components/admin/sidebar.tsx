import { Link, useLocation } from '@tanstack/react-router';
import { cn } from '@/lib/utils';
import { LayoutDashboard, Building2, Globe, Zap } from 'lucide-react';

const navItems = [
  { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/floors', icon: Building2, label: 'Floors' },
  { to: '/admin/mythlings', icon: Globe, label: 'Mythlings' },
  { to: '/admin/abilities', icon: Zap, label: 'Abilities' },
];

export function Sidebar() {
  const location = useLocation();

  return (
    <aside className='w-64 border-r border-border bg-card'>
      <div className='p-6'>
        <h1 className='text-2xl font-bold bg-gradient-to-r from-orange-500 via-blue-500 to-green-500 bg-clip-text text-transparent'>
          Mythlings Admin
        </h1>
      </div>
      <nav className='px-4 py-2'>
        <ul className='space-y-1'>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.to;
            return (
              <li key={item.to}>
                <Link
                  to={item.to}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                  )}>
                  <Icon className='h-5 w-5' />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
