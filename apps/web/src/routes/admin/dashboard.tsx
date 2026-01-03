import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query';
import { trpc } from '@/utils/trpc';
import { Building2, Globe, Zap, TrendingUp } from 'lucide-react';

export const Route = createFileRoute('/admin/dashboard')({
  component: Dashboard,
});

function Dashboard() {
  const { data: floors } = useQuery(trpc.game.floors.getAll.queryOptions());
  const { data: mythlings } = useQuery(
    trpc.game.mythlings.getAll.queryOptions(),
  );
  const { data: abilities } = useQuery(
    trpc.game.abilities.getAll.queryOptions(),
  );

  const stats = [
    {
      label: 'Total Floors',
      value: floors?.length || 0,
      icon: Building2,
      color: 'text-blue-500',
    },
    {
      label: 'Total Mythlings',
      value: mythlings?.length || 0,
      icon: Globe,
      color: 'text-green-500',
    },
    {
      label: 'Total Abilities',
      value: abilities?.length || 0,
      icon: Zap,
      color: 'text-orange-500',
    },
  ];

  return (
    <div className='p-8'>
      <div className='mb-8'>
        <h1 className='text-3xl font-bold text-foreground'>Dashboard</h1>
        <p className='text-muted-foreground mt-2'>
          Welcome to Mythlings Admin Panel
        </p>
      </div>

      <div className='grid gap-6 md:grid-cols-3 mb-8'>
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className='rounded-lg border border-border bg-card p-6 shadow-sm'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm font-medium text-muted-foreground'>
                    {stat.label}
                  </p>
                  <p className='text-3xl font-bold mt-2'>{stat.value}</p>
                </div>
                <Icon className={`h-12 w-12 ${stat.color}`} />
              </div>
            </div>
          );
        })}
      </div>

      <div className='rounded-lg border border-border bg-card p-6 shadow-sm'>
        <div className='flex items-center gap-2 mb-4'>
          <TrendingUp className='h-5 w-5 text-primary' />
          <h2 className='text-xl font-semibold'>Quick Actions</h2>
        </div>
        <div className='grid gap-4 md:grid-cols-3'>
          <a
            href='/admin/floors/new'
            className='flex items-center gap-3 rounded-lg border border-border bg-accent p-4 hover:bg-accent/80 transition-colors'>
            <Building2 className='h-6 w-6 text-primary' />
            <div>
              <p className='font-medium'>Create Floor</p>
              <p className='text-sm text-muted-foreground'>
                Add a new floor with monsters and rewards
              </p>
            </div>
          </a>
          <a
            href='/admin/mythlings/new'
            className='flex items-center gap-3 rounded-lg border border-border bg-accent p-4 hover:bg-accent/80 transition-colors'>
            <Globe className='h-6 w-6 text-primary' />
            <div>
              <p className='font-medium'>Create Mythling</p>
              <p className='text-sm text-muted-foreground'>
                Add a new mythling with abilities
              </p>
            </div>
          </a>
          <a
            href='/admin/abilities/new'
            className='flex items-center gap-3 rounded-lg border border-border bg-accent p-4 hover:bg-accent/80 transition-colors'>
            <Zap className='h-6 w-6 text-primary' />
            <div>
              <p className='font-medium'>Create Ability</p>
              <p className='text-sm text-muted-foreground'>
                Add a new ability for mythlings
              </p>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}
