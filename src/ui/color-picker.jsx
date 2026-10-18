import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/ui/button';
import { ColorSelector } from '@/ui/color-selector';
import { DrawerFooter, DrawerHeader, DrawerTitle } from '@/ui/drawer';
import {
    ResponsivePopover,
    ResponsivePopoverContent,
    ResponsivePopoverTrigger,
    useResponsivePopoverMobile,
} from '@/ui/responsive-popover';

const ColorPickerBody = ({ value, onChange, onDone, title }) => {
    const { t } = useTranslation();
    const isMobile = useResponsivePopoverMobile();

    if (isMobile) {
        return (
            <>
                <DrawerHeader>
                    <DrawerTitle>{title}</DrawerTitle>
                </DrawerHeader>
                <div className='mx-auto w-full max-w-72 px-4 pb-2'>
                    <ColorSelector value={value} onChange={onChange} />
                </div>
                <DrawerFooter className='pb-[calc(1rem+env(safe-area-inset-bottom))]'>
                    <Button className='h-11' onClick={onDone}>
                        {t('colorPicker.done')}
                    </Button>
                </DrawerFooter>
            </>
        );
    }

    return <ColorSelector value={value} onChange={onChange} />;
};

// `onChange` fires live while dragging (for previews); `onCommit` fires once with
// the final color when the picker closes (for persisting).
export const ColorPicker = ({ value, onChange, onCommit, title, children }) => {
    const { t } = useTranslation();
    const [open, setOpen] = useState(false);
    const [localColor, setLocalColor] = useState(value || '#6366f1');

    useEffect(() => {
        if (value) setLocalColor(value);
    }, [value]);

    const handleChange = hex => {
        setLocalColor(hex);
        onChange?.(hex);
    };

    const handleOpenChange = next => {
        setOpen(next);
        if (!next) onCommit?.(localColor);
    };

    return (
        <ResponsivePopover open={open} onOpenChange={handleOpenChange}>
            <ResponsivePopoverTrigger render={children} />
            <ResponsivePopoverContent initialFocus={false} disableContentDrag align='start'>
                <ColorPickerBody
                    value={localColor}
                    onChange={handleChange}
                    onDone={() => handleOpenChange(false)}
                    title={title ?? t('colorPicker.title')}
                />
            </ResponsivePopoverContent>
        </ResponsivePopover>
    );
};
