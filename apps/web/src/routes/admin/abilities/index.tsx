import { createFileRoute, Link } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { trpc } from '@/utils/trpc';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export const Route = createFileRoute('/admin/abilities/')({
  component: AbilitiesList,
});

function AbilitiesList() {
  const queryClient = useQueryClient();
  const { data: abilities, isLoading } = useQuery(
    trpc.game.abilities.getAll.queryOptions(),
  );

  const deleteMutation = useMutation({
    ...trpc.game.abilities.delete.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['game.abilities.getAll'] });
      toast.success('Ability deleted successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete ability');
    },
  });

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this ability?')) {
      deleteMutation.mutate({ id });
    }
  };

  if (isLoading) {
    return (
      <div className='p-8'>
        <div className='text-center'>Loading abilities...</div>
      </div>
    );
  }

  return (
    <div className='p-8'>
      <div className='mb-8 flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold text-foreground'>Abilities</h1>
          <p className='text-muted-foreground mt-2'>
            Manage game abilities, damage, and cooldowns
          </p>
        </div>
        <Link to='/admin/abilities/$id' params={{ id: 'new' }}>
          <Button>
            <Plus className='mr-2 h-4 w-4' />
            Create Ability
          </Button>
        </Link>
      </div>

      <div className='rounded-lg border border-border bg-card shadow-sm'>
        <table className='w-full caption-bottom text-sm'>
          <thead className='[&_tr:last-child]:border-b'>
            <tr>
              <th className='h-10 px-2 text-left align-middle font-medium text-muted-foreground'>
                Icon
              </th>
              <th className='h-10 px-2 text-left align-middle font-medium text-muted-foreground'>
                Name
              </th>
              <th className='h-10 px-2 text-left align-middle font-medium text-muted-foreground'>
                Damage
              </th>
              <th className='h-10 px-2 text-left align-middle font-medium text-muted-foreground'>
                Cooldown
              </th>
              <th className='h-10 px-2 text-left align-middle font-medium text-muted-foreground'>
                Description
              </th>
              <th className='h-10 px-2 text-right align-middle font-medium text-muted-foreground'>
                Actions
              </th>
            </tr>
          </thead>
          <tbody className='[&_tr:last-child]:border-b'>
            {abilities?.map((ability) => (
              <tr
                key={ability.id}
                className='border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted'>
                <td className='p-2 align-middle text-2xl'>{ability.icon}</td>
                <td className='p-2 align-middle font-medium'>{ability.name}</td>
                <td className='p-2 align-middle'>{ability.damage}</td>
                <td className='p-2 align-middle'>{ability.cooldown} turns</td>
                <td className='p-2 align-middle max-w-xs truncate'>
                  {ability.description}
                </td>
                <td className='p-2 align-middle text-right'>
                  <div className='flex justify-end gap-2'>
                    <Link to='/admin/abilities/$id' params={{ id: ability.id }}>
                      <Button variant='ghost' size='icon'>
                        <Pencil className='h-4 w-4' />
                      </Button>
                    </Link>
                    <Button
                      variant='ghost'
                      size='icon'
                      onClick={() => handleDelete(ability.id)}>
                      <Trash2 className='h-4 w-4 text-destructive' />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {abilities?.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className='p-2 text-center text-muted-foreground'>
                  No abilities found. Create your first ability to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
