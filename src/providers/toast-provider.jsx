import { Toaster } from '@/ui/sonner';

export const ToastProvider = ({ children }) => (
    <>
        <Toaster />
        {children}
    </>
);
