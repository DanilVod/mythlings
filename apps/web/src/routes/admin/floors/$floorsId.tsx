import * as React from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { trpc } from '@/utils/trpc';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface Monster {
  mythlingId: string;
  quantity: number;
  position: number;
}

interface Reward {
  rewardType: 'gold' | 'gems' | 'mythling' | 'equipment';
  quantity: number;
}

export const Route = createFileRoute('/admin/floors/$floorsId')({
  component: FloorForm,
});

function FloorForm() {
  const { floorsId: id } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isNew = id === 'new';

  const {
    data: floor,
    isLoading,
    error: floorError,
  } = useQuery({
    ...trpc.game.floors.getById.queryOptions({ id }),
    enabled: !isNew,
  });

  const { data: mythlings, isLoading: mythlingsLoading } = useQuery(
    trpc.game.mythlings.getAll.queryOptions(),
  );

  // Log for debugging
  React.useEffect(() => {
    console.log('FloorForm render:', { id, isNew, floor, mythlings });
  }, [id, isNew, floor, mythlings]);

  if (floorError) {
    console.error('Error loading floor:', floorError);
    return (
      <div className='p-8 text-destructive'>
        Error loading floor: {floorError.message}
      </div>
    );
  }

  // State for dynamic monsters and rewards
  const [monsters, setMonsters] = React.useState<Monster[]>([]);
  const [rewards, setRewards] = React.useState<Reward[]>([]);

  // Initialize state when floor data loads
  React.useEffect(() => {
    if (floor && !isNew) {
      setMonsters(
        floor.monsters.map((m) => ({
          mythlingId: m.mythlingId,
          quantity: m.quantity,
          position: m.position,
        })),
      );
      setRewards(
        floor.rewards.map((r) => ({
          rewardType: r.rewardType,
          quantity: r.quantity,
        })),
      );
    }
  }, [floor, isNew]);

  const createMutation = useMutation({
    ...trpc.game.floors.create.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['game.floors.getAll'] });
      toast.success('Floor created successfully');
      navigate({ to: '/admin/floors' });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create floor');
    },
  });

  const updateMutation = useMutation({
    ...trpc.game.floors.update.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['game.floors.getAll'] });
      toast.success('Floor updated successfully');
      navigate({ to: '/admin/floors' });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update floor');
    },
  });

  if (!isNew && isLoading) {
    return <div className='p-8'>Loading floor...</div>;
  }

  if (!isNew && !floor) {
    return <div className='p-8'>Floor not found</div>;
  }

  const currentFloor = isNew
    ? {
        floorNumber: 1,
        difficulty: 1,
        description: '',
      }
    : floor || {
        floorNumber: 1,
        difficulty: 1,
        description: '',
      };

  // Initialize state for new floor
  React.useEffect(() => {
    if (isNew && monsters.length === 0 && rewards.length === 0) {
      // Add one default monster slot for new floor
      setMonsters([{ mythlingId: '', quantity: 1, position: 0 }]);
      setRewards([{ rewardType: 'gold', quantity: 100 }]);
    }
  }, [isNew, monsters.length, rewards.length]);

  // Show loading state for mythlings but still render form
  if (mythlingsLoading) {
    return (
      <div className='p-8'>
        <div className='mb-8'>
          <Button
            variant='ghost'
            onClick={() => navigate({ to: '/admin/floors' })}
            className='mb-4'>
            <ArrowLeft className='mr-2 h-4 w-4' />
            Back to Floors
          </Button>
          <h1 className='text-3xl font-bold text-foreground'>
            {isNew ? 'Create New Floor' : 'Edit Floor'}
          </h1>
        </div>
        <div className='text-center py-8'>Loading mythlings...</div>
      </div>
    );
  }

  console.log(isNew);
  // Monster handlers
  const addMonster = () => {
    setMonsters([
      ...monsters,
      { mythlingId: '', quantity: 1, position: monsters.length },
    ]);
  };

  const removeMonster = (index: number) => {
    setMonsters(monsters.filter((_, i) => i !== index));
  };

  const updateMonster = (index: number, field: keyof Monster, value: any) => {
    const newMonsters = [...monsters];
    newMonsters[index] = { ...newMonsters[index], [field]: value };
    setMonsters(newMonsters);
  };

  // Reward handlers
  const addReward = () => {
    setRewards([...rewards, { rewardType: 'gold', quantity: 1 }]);
  };

  const removeReward = (index: number) => {
    setRewards(rewards.filter((_, i) => i !== index));
  };

  const updateReward = (index: number, field: keyof Reward, value: any) => {
    const newRewards = [...rewards];
    newRewards[index] = { ...newRewards[index], [field]: value };
    setRewards(newRewards);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const floorNumber = parseInt(formData.get('floorNumber') as string);
    const difficulty = parseInt(formData.get('difficulty') as string);
    const description = formData.get('description') as string;

    // Filter out monsters without mythlingId
    const validMonsters = monsters
      .filter((m) => m.mythlingId !== '')
      .map((m) => ({
        mythlingId: m.mythlingId,
        quantity: m.quantity,
        position: m.position,
      }));

    const data = {
      floorNumber,
      difficulty,
      description,
      monsters: validMonsters,
      rewards,
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
          onClick={() => navigate({ to: '/admin/floors' })}
          className='mb-4'>
          <ArrowLeft className='mr-2 h-4 w-4' />
          Back to Floors
        </Button>
        <h1 className='text-3xl font-bold text-foreground'>
          {isNew ? 'Create New Floor' : 'Edit Floor'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className='space-y-6'>
        <Card>
          <CardHeader>
            <CardTitle>Floor Details</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div>
              <Label htmlFor='floorNumber'>Floor Number</Label>
              <Input
                id='floorNumber'
                name='floorNumber'
                type='number'
                min='1'
                defaultValue={currentFloor.floorNumber}
                required
              />
            </div>
            <div>
              <Label htmlFor='difficulty'>Difficulty (1-10)</Label>
              <Input
                id='difficulty'
                name='difficulty'
                type='number'
                min='1'
                max='10'
                defaultValue={currentFloor.difficulty}
                required
              />
            </div>
            <div>
              <Label htmlFor='description'>Description</Label>
              <textarea
                id='description'
                name='description'
                defaultValue={currentFloor.description || ''}
                className='flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm'
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Monsters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-2'>
              {monsters.map((monster, index) => (
                <div key={index} className='flex gap-2 items-center'>
                  <select
                    value={monster.mythlingId}
                    onChange={(e) =>
                      updateMonster(index, 'mythlingId', e.target.value)
                    }
                    className='flex-1 h-10 rounded-md border border-input bg-background px-3 py-2 text-sm'>
                    <option value=''>Select Mythling</option>
                    {mythlings?.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.type})
                      </option>
                    ))}
                  </select>
                  <Input
                    type='number'
                    value={monster.quantity}
                    onChange={(e) =>
                      updateMonster(
                        index,
                        'quantity',
                        parseInt(e.target.value) || 1,
                      )
                    }
                    placeholder='Qty'
                    className='w-20'
                    min='1'
                  />
                  <Input
                    type='number'
                    value={monster.position}
                    onChange={(e) =>
                      updateMonster(
                        index,
                        'position',
                        parseInt(e.target.value) || 0,
                      )
                    }
                    placeholder='Pos'
                    className='w-20'
                    min='0'
                  />
                  <Button
                    type='button'
                    variant='ghost'
                    size='icon'
                    onClick={() => removeMonster(index)}>
                    <Trash2 className='h-4 w-4 text-destructive' />
                  </Button>
                </div>
              ))}
              <Button
                type='button'
                variant='outline'
                className='w-full'
                onClick={addMonster}>
                <Plus className='mr-2 h-4 w-4' />
                Add Monster
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Rewards</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-2'>
              {rewards.map((reward, index) => (
                <div key={index} className='flex gap-2 items-center'>
                  <select
                    value={reward.rewardType}
                    onChange={(e) =>
                      updateReward(index, 'rewardType', e.target.value)
                    }
                    className='flex-1 h-10 rounded-md border border-input bg-background px-3 py-2 text-sm'>
                    <option value='gold'>Gold</option>
                    <option value='gems'>Gems</option>
                    <option value='mythling'>Mythling</option>
                    <option value='equipment'>Equipment</option>
                  </select>
                  <Input
                    type='number'
                    value={reward.quantity}
                    onChange={(e) =>
                      updateReward(
                        index,
                        'quantity',
                        parseInt(e.target.value) || 1,
                      )
                    }
                    placeholder='Qty'
                    className='w-20'
                    min='1'
                  />
                  <Button
                    type='button'
                    variant='ghost'
                    size='icon'
                    onClick={() => removeReward(index)}>
                    <Trash2 className='h-4 w-4 text-destructive' />
                  </Button>
                </div>
              ))}
              <Button
                type='button'
                variant='outline'
                className='w-full'
                onClick={addReward}>
                <Plus className='mr-2 h-4 w-4' />
                Add Reward
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className='flex gap-4'>
          <Button
            type='button'
            variant='outline'
            onClick={() => navigate({ to: '/admin/floors' })}>
            Cancel
          </Button>
          <Button
            type='submit'
            disabled={createMutation.isPending || updateMutation.isPending}>
            {isNew ? 'Create Floor' : 'Update Floor'}
          </Button>
        </div>
      </form>
    </div>
  );
}
