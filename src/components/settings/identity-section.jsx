import { useEffect, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Dices, Palette } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/ui/button';
import { ColorPicker } from '@/ui/color-picker';
import { Input } from '@/ui/input';
import { UserAvatar } from '@/ui/user-avatar';
import { useIdentity } from '@/hooks/use-identity';
import { updateProfileMutation } from '@/queries/profiles';

export const IdentitySection = () => {
    const { t } = useTranslation();
    const { user, update, regenerate } = useIdentity();
    const [name, setName] = useState(user.name);

    useEffect(() => {
        setName(user.name);
    }, [user.name]);

    const syncProfile = useMutation(updateProfileMutation({ onError: error => toast.error(error.message) }));

    const handleSave = next => {
        if (!next.name.trim()) return;
        syncProfile.mutate(next);
    };

    const handleBlur = () => {
        const trimmed = name.trim();
        if (!trimmed || trimmed === user.name) return;
        handleSave(update({ name: trimmed }));
    };

    const handleRegenerate = () => {
        const next = regenerate();
        setName(next.name);
        handleSave(next);
    };

    return (
        <section className='flex flex-col gap-3'>
            <h2 className='text-base font-semibold'>{t('settings.identity.title')}</h2>
            <p className='text-sm text-muted-foreground'>{t('settings.identity.description')}</p>
            <div className='flex items-center gap-3'>
                <ColorPicker
                    value={user.color}
                    onChange={color => update({ color })}
                    onCommit={color => handleSave({ ...user, color })}
                    title={t('settings.identity.color')}
                >
                    <button
                        type='button'
                        aria-label={t('settings.identity.changeColor')}
                        className='relative shrink-0 rounded-full'
                    >
                        <UserAvatar profile={user} className='size-11' />
                        <span className='flex-center absolute -right-1 -bottom-1 size-5 rounded-full border border-border bg-background text-foreground/70 [&>svg]:size-3'>
                            <Palette />
                        </span>
                    </button>
                </ColorPicker>
                <Input
                    value={name}
                    onChange={event => setName(event.target.value)}
                    onBlur={handleBlur}
                    aria-label={t('settings.identity.name')}
                    className='h-11 flex-1 bg-card'
                />
                <Button
                    variant='outline'
                    size='icon'
                    aria-label={t('settings.identity.regenerate')}
                    className='size-11 bg-card'
                    onClick={handleRegenerate}
                >
                    <Dices />
                </Button>
            </div>
        </section>
    );
};
