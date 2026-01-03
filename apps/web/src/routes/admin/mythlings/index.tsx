import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { trpc } from '@/utils/trpc';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useMythlingIcon } from '@/hooks/useMythlingIcon';

export const Route = createFileRoute('/admin/mythlings/')({
  component: MythlingsList,
});

interface Mythling {
  id: string;
  name: string;
  type: 'fire' | 'water' | 'earth';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  basePower: number;
  baseHealth: number;
  abilities: Array<{ abilityId: string }>;
  icon: string;
}

function MythlingTableRow({
  mythling,
  onDelete,
}: {
  mythling: Mythling;
  onDelete: (id: string) => void;
}) {
  const { iconUrl, isLoading: iconLoading } = useMythlingIcon(mythling.icon);

  return (
    <tr className='border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted'>
      <td className='p-2 align-middle'>
        {iconLoading ? (
          <div className='h-10 w-10 rounded-md bg-muted animate-pulse' />
        ) : iconUrl ? (
          <img
            src={iconUrl}
            alt={mythling.name}
            className='h-10 w-10 rounded-md object-cover'
          />
        ) : (
          <div className='h-10 w-10 rounded-md bg-muted' />
        )}
      </td>
      <td className='p-2 align-middle font-medium'>{mythling.name}</td>
      <td className='p-2 align-middle'>
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
            mythling.type === 'fire'
              ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100'
              : mythling.type === 'water'
              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100'
              : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
          }`}>
          {mythling.type}
        </span>
      </td>
      <td className='p-2 align-middle'>
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
            mythling.rarity === 'legendary'
              ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100'
              : mythling.rarity === 'epic'
              ? 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-100'
              : mythling.rarity === 'rare'
              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100'
              : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100'
          }`}>
          {mythling.rarity}
        </span>
      </td>
      <td className='p-2 align-middle'>{mythling.basePower}</td>
      <td className='p-2 align-middle'>{mythling.baseHealth}</td>
      <td className='p-2 align-middle'>{mythling.abilities.length}</td>
      <td className='p-2 align-middle text-right'>
        <div className='flex justify-end gap-2'>
          <Link
            to='/admin/mythlings/$mythlingsId'
            params={{ mythlingsId: mythling.id }}>
            <Button variant='ghost' size='icon'>
              <Pencil className='h-4 w-4' />
            </Button>
          </Link>
          <Button
            variant='ghost'
            size='icon'
            onClick={() => {
              if (confirm('Are you sure you want to delete this mythling?')) {
                // This will be handled by the parent component
                console.log('Delete mythling:', mythling.id);
              }
            }}>
            <Trash2 className='h-4 w-4 text-destructive' />
          </Button>
        </div>
      </td>
    </tr>
  );
}

function MythlingsList() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: mythlings, isLoading } = useQuery(
    trpc.game.mythlings.getAll.queryOptions(),
  );

  const deleteMutation = useMutation({
    ...trpc.game.mythlings.delete.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['game.mythlings.getAll'] });
      toast.success('Mythling deleted successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete mythling');
    },
  });

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this mythling?')) {
      deleteMutation.mutate({ id });
    }
  };

  if (isLoading) {
    return (
      <div className='p-8'>
        <div className='text-center'>Loading mythlings...</div>
      </div>
    );
  }

  return (
    <div className='p-8'>
      <div className='mb-8 flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold text-foreground'>Mythlings</h1>
          <p className='text-muted-foreground mt-2'>
            Manage mythlings, their stats, and abilities
          </p>
        </div>
        <Link
          to='/admin/mythlings/$mythlingsId'
          params={{ mythlingsId: 'new' }}>
          <Button>
            <Plus className='mr-2 h-4 w-4' />
            Create Mythling
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
                Type
              </th>
              <th className='h-10 px-2 text-left align-middle font-medium text-muted-foreground'>
                Rarity
              </th>
              <th className='h-10 px-2 text-left align-middle font-medium text-muted-foreground'>
                Power
              </th>
              <th className='h-10 px-2 text-left align-middle font-medium text-muted-foreground'>
                Health
              </th>
              <th className='h-10 px-2 text-left align-middle font-medium text-muted-foreground'>
                Abilities
              </th>
              <th className='h-10 px-2 text-right align-middle font-medium text-muted-foreground'>
                Actions
              </th>
            </tr>
          </thead>
          <tbody className='[&_tr:last-child]:border-b'>
            {mythlings?.map((mythling) => (
              <MythlingTableRow
                key={mythling.id}
                mythling={mythling}
                onDelete={handleDelete}
              />
            ))}
            {mythlings?.length === 0 && (
              <tr>
                <td
                  colSpan={8}
                  className='p-2 text-center text-muted-foreground'>
                  No mythlings found. Create your first mythling to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
