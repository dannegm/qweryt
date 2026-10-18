import { cn } from '@/helpers/utils';
import { getAvatarUrl } from '@/helpers/avatar';

export const UserAvatar = ({ profile, className }) => (
    <div
        className={cn('size-8 shrink-0 overflow-hidden rounded-full bg-muted', className)}
    >
        {profile?.id && (
            <img src={getAvatarUrl(profile.id, profile.color)} alt='' className='size-full' />
        )}
    </div>
);
