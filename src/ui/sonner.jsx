import { CircleCheck, Info, LoaderCircle, OctagonX, TriangleAlert } from 'lucide-react';
import { Toaster as Sonner } from 'sonner';

const TOAST_OFFSET = 'calc(4.75rem + env(safe-area-inset-bottom))';

const ICONS = {
    success: <CircleCheck />,
    info: <Info />,
    warning: <TriangleAlert />,
    error: <OctagonX />,
    loading: <LoaderCircle className='animate-spin' />,
};

const CLASS_NAMES = {
    toast: 'flex w-full items-center gap-3 rounded-xl border border-border bg-popover p-3.5 font-sans text-sm text-popover-foreground shadow-lg shadow-black/10',
    icon: 'flex size-5 shrink-0 items-center justify-center text-primary [&>svg]:size-5',
    content: 'flex min-w-0 flex-1 flex-col gap-0.5',
    title: 'text-sm font-semibold',
    description: 'text-xs text-muted-foreground',
    actionButton:
        'h-8 shrink-0 rounded-lg bg-primary px-3 text-xs font-semibold text-primary-foreground active:opacity-80',
    cancelButton: 'h-8 shrink-0 rounded-lg bg-muted px-3 text-xs font-semibold text-foreground active:opacity-80',
    success: '[&_[data-icon]]:text-emerald-600',
    error: '[&_[data-icon]]:text-destructive',
    warning: '[&_[data-icon]]:text-amber-600',
};

export const Toaster = props => (
    <Sonner
        theme='light'
        position='bottom-center'
        gap={8}
        offset={{ bottom: TOAST_OFFSET, left: 16, right: 16 }}
        mobileOffset={{ bottom: TOAST_OFFSET, left: 16, right: 16 }}
        icons={ICONS}
        toastOptions={{ unstyled: true, classNames: CLASS_NAMES }}
        {...props}
    />
);
