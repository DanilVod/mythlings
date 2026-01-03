import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { trpc } from '@/utils/trpc';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export const Route = createFileRoute('/admin/floors/')({
  component: FloorsList,
});

function FloorsList() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: floors, isLoading } = useQuery(
    trpc.game.floors.getAll.queryOptions(),
  );

  const deleteMutation = useMutation({
    ...trpc.game.floors.delete.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['game.floors.getAll'] });
      toast.success('Floor deleted successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete floor');
    },
  });

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this floor?')) {
      deleteMutation.mutate({ id });
    }
  };

  if (isLoading) {
    return (
      <div className='p-8'>
        <div className='text-center'>Loading floors...</div>
      </div>
    );
  }

  return (
    <div className='p-8'>
      <div className='mb-8 flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold text-foreground'>Floors</h1>
          <p className='text-muted-foreground mt-2'>
            Manage game floors, monsters, and rewards
          </p>
        </div>
        <Link to='/admin/floors/$id' params={{ id: 'new' }}>
          <Button>
            <Plus className='mr-2 h-4 w-4' />
            Create Floor
          </Button>
        </Link>
      </div>

      <div className='rounded-lg border border-border bg-card shadow-sm'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Floor Number</TableHead>
              <TableHead>Difficulty</TableHead>
              <TableHead>Monsters</TableHead>
              <TableHead>Rewards</TableHead>
              <TableHead className='text-right'>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {floors?.map((floor) => (
              <TableRow key={floor.id}>
                <TableCell className='font-medium'>
                  {floor.floorNumber}
                </TableCell>
                <TableCell>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      floor.difficulty <= 3
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
                        : floor.difficulty <= 6
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
                    }`}>
                    {floor.difficulty}
                  </span>
                </TableCell>
                <TableCell>{floor.monsters.length} monsters</TableCell>
                <TableCell>{floor.rewards.length} rewards</TableCell>
                <TableCell className='text-right'>
                  <div className='flex justify-end gap-2'>
                    <Link to='/admin/floors/$id' params={{ id: floor.id }}>
                      <Button variant='ghost' size='icon'>
                        <Pencil className='h-4 w-4' />
                      </Button>
                    </Link>
                    <Button
                      variant='ghost'
                      size='icon'
                      onClick={() => handleDelete(floor.id)}>
                      <Trash2 className='h-4 w-4 text-destructive' />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {floors?.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className='p-2 text-center text-muted-foreground'>
                  No floors found. Create your first floor to get started.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
