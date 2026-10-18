import { useTranslation } from 'react-i18next';
import { GuardsList } from '@/components/editor/guards-list';
import { StyleControl } from '@/components/editor/style-control';
import { STYLE_GROUPS, STYLE_OPTIONS } from '@/style-options';

export const CustomizeTab = ({ style, guards, onStyleChange }) => {
    const { t } = useTranslation();

    return (
        <div className='flex flex-col gap-8'>
            <GuardsList guards={guards} className='lg:hidden' />
            {STYLE_GROUPS.map(group => {
                const options = STYLE_OPTIONS.filter(
                    option => option.group === group && (option.visible?.(style) ?? true),
                );
                return (
                    <section key={group} className='flex flex-col gap-4'>
                        <h3 className='text-sm font-semibold tracking-wide text-muted-foreground uppercase'>
                            {t(`style.groups.${group}`)}
                        </h3>
                        {options.map(option => (
                            <StyleControl key={option.key} option={option} style={style} onChange={onStyleChange} />
                        ))}
                    </section>
                );
            })}
        </div>
    );
};
