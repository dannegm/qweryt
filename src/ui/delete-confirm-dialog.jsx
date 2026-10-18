import { useState } from 'react';
import { Trash2, Copy, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useCopyToClipboard } from '@uidotdev/usehooks';
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from '@/ui/drawer';
import { Button } from '@/ui/button';
import { Input } from '@/ui/input';
import { cn } from '@/helpers/utils';

// Generic type-to-confirm delete drawer — `confirmWord` is usually the
// item's own name, so the person has to read it before the button unlocks.
// `children` is for entity-specific context (affected records, warnings)
// rendered between the base warning and the confirm input.
export const DeleteConfirmDialog = ({
    title,
    confirmWord,
    onConfirm,
    label,
    className,
    children,
    trigger = true,
    open: openProp,
    onOpenChange: onOpenChangeProp,
}) => {
    const { t } = useTranslation();
    const [openState, setOpenState] = useState(false);
    const [typed, setTyped] = useState('');
    const [copied, setCopied] = useState(false);
    const [, copy] = useCopyToClipboard();
    const isControlled = openProp !== undefined;
    const open = isControlled ? openProp : openState;
    const canConfirm = typed.trim() === confirmWord;

    const handleOpenChange = next => {
        if (isControlled) onOpenChangeProp?.(next);
        else setOpenState(next);
        if (!next) {
            setTyped('');
            setCopied(false);
        }
    };

    const handleConfirm = () => {
        onConfirm();
        handleOpenChange(false);
    };

    const handleCopyConfirmWord = () => {
        copy(confirmWord);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    };

    return (
        <Drawer open={open} onOpenChange={handleOpenChange}>
            {trigger && (
                <DrawerTrigger
                    render={
                        label ? (
                            <Button type='button' variant='destructive' aria-label={t('delete.confirm')} className={className} />
                        ) : (
                            <button
                                type='button'
                                aria-label={t('delete.confirm')}
                                className={cn(
                                    'flex-center size-8 shrink-0 rounded-md text-destructive transition-colors hover:bg-destructive/10 [&>svg]:size-4',
                                    className,
                                )}
                            />
                        )
                    }
                >
                    <Trash2 />
                    {label}
                </DrawerTrigger>
            )}
            <DrawerContent initialFocus={false}>
                <DrawerHeader>
                    <DrawerTitle>{title}</DrawerTitle>
                    <DrawerDescription>{t('delete.irreversible')}</DrawerDescription>
                </DrawerHeader>

                <div className='flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-4 pb-2'>
                    {children}

                    <div className='flex flex-col gap-1.5'>
                        <p className='text-sm text-foreground/70'>
                            {t('delete.type')}{' '}
                            {/* A `span`, not a `button` — a button is an atomic inline-block
                                box that can't break internally, so a long name would overflow
                                instead of wrapping like the rest of this sentence does. */}
                            <span
                                role='button'
                                tabIndex={0}
                                onClick={handleCopyConfirmWord}
                                onKeyDown={event => {
                                    if (event.key === 'Enter' || event.key === ' ') {
                                        event.preventDefault();
                                        handleCopyConfirmWord();
                                    }
                                }}
                                className='cursor-pointer font-semibold text-foreground underline decoration-dotted underline-offset-2 select-text hover:text-primary'
                            >
                                {confirmWord}
                                {copied ? (
                                    <Check className='ml-1 inline size-3.5 align-middle text-primary' />
                                ) : (
                                    <Copy className='ml-1 inline size-3.5 align-middle' />
                                )}
                            </span>{' '}
                            {t('delete.toConfirm')}
                        </p>
                        <Input
                            id='delete-confirm-input'
                            aria-label={t('delete.inputLabel', { word: confirmWord })}
                            value={typed}
                            onChange={e => setTyped(e.target.value)}
                            onKeyDown={e => {
                                if (e.key === 'Enter' && canConfirm) handleConfirm();
                            }}
                            autoComplete='off'
                            className='h-11'
                        />
                    </div>
                </div>

                <DrawerFooter className='pb-[calc(1rem+env(safe-area-inset-bottom))]'>
                    <Button variant='destructive' className='h-11' disabled={!canConfirm} onClick={handleConfirm}>
                        {t('delete.confirm')}
                    </Button>
                    <DrawerClose render={<Button variant='outline' className='h-11' />}>{t('delete.cancel')}</DrawerClose>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    );
};
