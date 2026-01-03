import * as React from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { trpc } from '@/utils/trpc';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';
import { useMythlingIcon } from '@/hooks/useMythlingIcon';

export const Route = createFileRoute('/admin/mythlings/$mythlingsId')({
  component: MythlingForm,
});

function MythlingIconDisplay({
  iconPreview,
  uploadedIcon,
  existingIcon,
}: {
  iconPreview: string | null;
  uploadedIcon: string | null;
  existingIcon: string;
}) {
  const { iconUrl, isLoading } = useMythlingIcon(existingIcon);

  const displayIcon = iconPreview || uploadedIcon || iconUrl;

  if (isLoading && !iconPreview && !uploadedIcon) {
    return (
      <div className='h-20 w-20 rounded-lg bg-muted animate-pulse border border-border' />
    );
  }

  return (
    <img
      src={displayIcon || ''}
      alt='Mythling icon'
      className='h-20 w-20 rounded-lg object-cover border border-border'
    />
  );
}

function MythlingForm() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { mythlingsId: id } = Route.useParams();
  const isNew = id === 'new';
  const [uploadedIcon, setUploadedIcon] = useState<string | null>(null);
  const [iconPreview, setIconPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const { data: mythling, isLoading } = useQuery({
    ...trpc.game.mythlings.getById.queryOptions({ id }),
    enabled: !isNew,
  });

  const { data: abilities } = useQuery(
    trpc.game.abilities.getAll.queryOptions(),
  );

  const createMutation = useMutation({
    ...trpc.game.mythlings.create.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['game.mythlings.getAll'] });
      toast.success('Mythling created successfully');
      navigate({ to: '/admin/mythlings' });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create mythling');
    },
  });

  const updateMutation = useMutation({
    ...trpc.game.mythlings.update.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['game.mythlings.getAll'] });
      toast.success('Mythling updated successfully');
      navigate({ to: '/admin/mythlings' });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update mythling');
    },
  });

  const uploadIconMutation = useMutation({
    ...trpc.game.mythlings.uploadIcon.mutationOptions(),
    onSuccess: (data) => {
      if (data.url) {
        setUploadedIcon(data.url);
        toast.success('Icon uploaded successfully');
      }
      setIsUploading(false);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to upload icon');
      setIsUploading(false);
    },
  });

  const handleIconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    // Convert file to base64 for immediate preview
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      // Set preview immediately from client
      setIconPreview(base64);

      // Also upload to server for when mythling is created
      uploadIconMutation.mutate({
        fileBase64: base64,
        fileName: file.name,
        mimeType: file.type,
      });
    };
    reader.readAsDataURL(file);
  };

  if (!isNew && isLoading) {
    return <div className='p-8'>Loading mythling...</div>;
  }

  const currentMythling = isNew
    ? {
        name: '',
        type: 'fire' as const,
        description: '',
        icon: '',
        basePower: 10,
        baseHealth: 100,
        rarity: 'common' as const,
        abilities: [],
      }
    : mythling || {
        name: '',
        type: 'fire' as const,
        description: '',
        icon: '',
        basePower: 10,
        baseHealth: 100,
        rarity: 'common' as const,
        abilities: [],
      };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const type = formData.get('type') as 'fire' | 'water' | 'earth';
    const description = formData.get('description') as string;
    // Use uploadedIcon (server URL) if available, otherwise use iconPreview (base64) or existing icon
    const icon =
      uploadedIcon || iconPreview || (formData.get('icon') as string);
    const basePower = parseInt(formData.get('basePower') as string);
    const baseHealth = parseInt(formData.get('baseHealth') as string);
    const rarity = formData.get('rarity') as
      | 'common'
      | 'rare'
      | 'epic'
      | 'legendary';

    const abilityIds = formData.getAll('abilityIds') as string[];

    const data = {
      name,
      type,
      description,
      icon,
      basePower,
      baseHealth,
      rarity,
      abilityIds,
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
          onClick={() => navigate({ to: '/admin/mythlings' })}
          className='mb-4'>
          <ArrowLeft className='mr-2 h-4 w-4' />
          Back to Mythlings
        </Button>
        <h1 className='text-3xl font-bold text-foreground'>
          {isNew ? 'Create New Mythling' : 'Edit Mythling'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className='space-y-6'>
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div>
              <Label htmlFor='name'>Name</Label>
              <Input
                id='name'
                name='name'
                defaultValue={currentMythling.name}
                required
              />
            </div>
            <div>
              <Label htmlFor='type'>Type</Label>
              <select
                id='type'
                name='type'
                defaultValue={currentMythling.type}
                className='flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm'
                required>
                <option value='fire'>Fire</option>
                <option value='water'>Water</option>
                <option value='earth'>Earth</option>
              </select>
            </div>
            <div>
              <Label htmlFor='description'>Description</Label>
              <textarea
                id='description'
                name='description'
                defaultValue={currentMythling.description || ''}
                className='flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm'
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Icon</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='flex items-center gap-4'>
              {(iconPreview || uploadedIcon || currentMythling.icon) && (
                <MythlingIconDisplay
                  iconPreview={iconPreview}
                  uploadedIcon={uploadedIcon}
                  existingIcon={currentMythling.icon}
                />
              )}
              {!iconPreview && (
                <div className='flex-1'>
                  <Label htmlFor='iconUpload' className='cursor-pointer'>
                    <div className='flex items-center gap-2 rounded-lg border-2 border-dashed border-border p-4 hover:border-primary transition-colors'>
                      <Upload className='h-5 w-5 text-muted-foreground' />
                      <span className='text-sm text-muted-foreground'>
                        {uploadIconMutation.isPending
                          ? 'Uploading...'
                          : 'Click to upload icon'}
                      </span>
                    </div>
                    <input
                      id='iconUpload'
                      type='file'
                      accept='image/png,image/jpeg,image/webp'
                      onChange={handleIconUpload}
                      className='hidden'
                    />
                  </Label>
                </div>
              )}
            </div>
            <Input
              name='icon'
              type='hidden'
              value={uploadedIcon || iconPreview || currentMythling.icon}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Stats</CardTitle>
          </CardHeader>
          <CardContent className='grid gap-4 md:grid-cols-2'>
            <div>
              <Label htmlFor='basePower'>Base Power</Label>
              <Input
                id='basePower'
                name='basePower'
                type='number'
                min='1'
                defaultValue={currentMythling.basePower}
                required
              />
            </div>
            <div>
              <Label htmlFor='baseHealth'>Base Health</Label>
              <Input
                id='baseHealth'
                name='baseHealth'
                type='number'
                min='1'
                defaultValue={currentMythling.baseHealth}
                required
              />
            </div>
            <div>
              <Label htmlFor='rarity'>Rarity</Label>
              <select
                id='rarity'
                name='rarity'
                defaultValue={currentMythling.rarity}
                className='flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm'
                required>
                <option value='common'>Common</option>
                <option value='rare'>Rare</option>
                <option value='epic'>Epic</option>
                <option value='legendary'>Legendary</option>
              </select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Abilities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-2'>
              {abilities?.map((ability) => {
                const isSelected = currentMythling.abilities.some(
                  (a) => a.abilityId === ability.id,
                );
                return (
                  <label
                    key={ability.id}
                    className='flex items-center gap-3 rounded-lg border border-border p-3 hover:bg-accent cursor-pointer transition-colors'>
                    <input
                      type='checkbox'
                      name='abilityIds'
                      value={ability.id}
                      defaultChecked={isSelected}
                      className='h-4 w-4'
                    />
                    <span className='text-2xl'>{ability.icon}</span>
                    <div className='flex-1'>
                      <p className='font-medium'>{ability.name}</p>
                      <p className='text-sm text-muted-foreground'>
                        {ability.description}
                      </p>
                    </div>
                    <div className='text-right text-sm text-muted-foreground'>
                      <p>Damage: {ability.damage}</p>
                      <p>Cooldown: {ability.cooldown}</p>
                    </div>
                  </label>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <div className='flex gap-4'>
          <Button
            type='button'
            variant='outline'
            onClick={() => navigate({ to: '/admin/mythlings' })}>
            Cancel
          </Button>
          <Button
            type='submit'
            disabled={
              createMutation.isPending ||
              updateMutation.isPending ||
              uploadIconMutation.isPending
            }>
            {isNew ? 'Create Mythling' : 'Update Mythling'}
          </Button>
        </div>
      </form>
    </div>
  );
}
