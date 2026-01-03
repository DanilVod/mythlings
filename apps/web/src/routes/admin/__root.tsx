import * as React from 'react';
import { createFileRoute, Outlet, useNavigate } from '@tanstack/react-router';
import { Sidebar } from '@/components/admin/sidebar';
import { authClient } from '@/lib/auth-client';
import { toast } from 'sonner';

export const Route = createFileRoute('/admin/__root')({
  component: AdminLayout,
});

function AdminLayout() {
  const navigate = useNavigate();
  const { isPending, data: session } = authClient.useSession();

  React.useEffect(() => {
    if (!isPending && !session) {
      toast.error('Please sign in to access the admin panel');
      navigate({ to: '/login' });
    }
  }, [isPending, session, navigate]);

  if (isPending) {
    return (
      <div className='flex h-screen items-center justify-center'>
        <div className='text-center'>
          <div className='text-lg'>Loading...</div>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className='flex h-screen items-center justify-center'>
        <div className='text-center text-muted-foreground'>
          Please sign in to access the admin panel
        </div>
      </div>
    );
  }

  return (
    <div className='flex h-screen bg-background'>
      <Sidebar />
      <main className='flex-1 overflow-auto'>
        <Outlet />
      </main>
    </div>
  );
}
