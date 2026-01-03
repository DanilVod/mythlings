import * as React from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { trpc } from '@/utils/trpc';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

export const Route = createFileRoute('/admin/abilities/$abilitiesId')({
  component: AbilityForm,
});

function AbilityForm() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { abilitiesId: id } = Route.useParams();
  const isNew = id === 'new';

  const { data: ability, isLoading } = useQuery({
    ...trpc.game.abilities.getById.queryOptions({ id }),
    enabled: !isNew,
  });

  const createMutation = useMutation({
    ...trpc.game.abilities.create.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['game.abilities.getAll'] });
      toast.success('Ability created successfully');
      navigate({ to: '/admin/abilities' });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create ability');
    },
  });

  const updateMutation = useMutation({
    ...trpc.game.abilities.update.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['game.abilities.getAll'] });
      toast.success('Ability updated successfully');
      navigate({ to: '/admin/abilities' });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update ability');
    },
  });

  if (!isNew && isLoading) {
    return <div className='p-8'>Loading ability...</div>;
  }

  const currentAbility = isNew
    ? { name: '', damage: 0, cooldown: 1, description: '', icon: '⚡' }
    : ability || {
        name: '',
        damage: 0,
        cooldown: 1,
        description: '',
        icon: '⚡',
      };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const damage = parseInt(formData.get('damage') as string);
    const cooldown = parseInt(formData.get('cooldown') as string);
    const description = formData.get('description') as string;
    const icon = formData.get('icon') as string;

    const data = {
      name,
      damage,
      cooldown,
      description,
      icon,
    };

    if (isNew) {
      createMutation.mutate(data);
    } else {
      updateMutation.mutate({ id, ...data });
    }
  };

  return (
    <div className='p-8'>
      <div className='mb-8'>
        <Button
          variant='ghost'
          onClick={() => navigate({ to: '/admin/abilities' })}
          className='mb-4'>
          <ArrowLeft className='mr-2 h-4 w-4' />
          Back to Abilities
        </Button>
        <h1 className='text-3xl font-bold text-foreground'>
          {isNew ? 'Create New Ability' : 'Edit Ability'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className='space-y-6'>
        <Card>
          <CardHeader>
            <CardTitle>Ability Details</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div>
              <Label htmlFor='name'>Name</Label>
              <Input
                id='name'
                name='name'
                defaultValue={currentAbility.name}
                required
              />
            </div>
            <div>
              <Label htmlFor='icon'>Icon (Emoji)</Label>
              <Input
                id='icon'
                name='icon'
                defaultValue={currentAbility.icon}
                placeholder='⚡'
                maxLength={10}
                required
              />
              <p className='text-xs text-muted-foreground'>
                Enter a single emoji character (e.g., 🔥, 💧, 🌍, ⚡)
              </p>
            </div>
            <div>
              <Label htmlFor='damage'>Damage</Label>
              <Input
                id='damage'
                name='damage'
                type='number'
                min='0'
                defaultValue={currentAbility.damage}
                required
              />
            </div>
            <div>
              <Label htmlFor='cooldown'>Cooldown (turns)</Label>
              <Input
                id='cooldown'
                name='cooldown'
                type='number'
                min='0'
                defaultValue={currentAbility.cooldown}
                required
              />
            </div>
            <div>
              <Label htmlFor='description'>Description</Label>
              <textarea
                id='description'
                name='description'
                defaultValue={currentAbility.description || ''}
                className='flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm'
                placeholder='Describe what this ability does...'
              />
            </div>
          </CardContent>
        </Card>

        <div className='flex gap-4'>
          <Button
            type='button'
            variant='outline'
            onClick={() => navigate({ to: '/admin/abilities' })}>
            Cancel
          </Button>
          <Button
            type='submit'
            disabled={createMutation.isPending || updateMutation.isPending}>
            {isNew ? 'Create Ability' : 'Update Ability'}
          </Button>
        </div>
      </form>
    </div>
  );
}
