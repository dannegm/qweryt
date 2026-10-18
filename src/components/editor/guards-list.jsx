import { useTranslation } from 'react-i18next';
import { CircleAlert, Info, TriangleAlert } from 'lucide-react';
import { cn } from '@/helpers/utils';

const LEVELS = {
    error: { icon: CircleAlert, className: 'bg-destructive/10 text-destructive' },
    warn: { icon: TriangleAlert, className: 'bg-amber-500/15 text-amber-800' },
    info: { icon: Info, className: 'bg-muted text-muted-foreground' },
};

export const GuardsList = ({ guards, className }) => {
    const { t } = useTranslation();
    if (!guards?.length) return null;

    return (
        <ul className={cn('flex flex-col gap-2', className)}>
            {guards.map(guard => {
                const { icon: Icon, className: levelClass } = LEVELS[guard.level];
                return (
                    <li
                        key={guard.code}
                        className={cn('flex items-start gap-2 rounded-lg px-3 py-2 text-xs [&>svg]:mt-px [&>svg]:size-4 [&>svg]:shrink-0', levelClass)}
                    >
                        <Icon />
                        <span>{t(`guards.${guard.code}`, guard.params)}</span>
                    </li>
                );
            })}
        </ul>
    );
};
