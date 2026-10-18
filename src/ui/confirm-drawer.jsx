import { useTranslation } from 'react-i18next';
import { Button } from '@/ui/button';
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
} from '@/ui/drawer';

export const ConfirmDrawer = ({ open, onOpenChange, title, description, confirmLabel, onConfirm, pending }) => {
    const { t } = useTranslation();

    return (
        <Drawer open={open} onOpenChange={onOpenChange}>
            <DrawerContent initialFocus={false}>
                <DrawerHeader>
                    <DrawerTitle>{title}</DrawerTitle>
                    <DrawerDescription>{description}</DrawerDescription>
                </DrawerHeader>
                <DrawerFooter className='pb-[calc(1rem+env(safe-area-inset-bottom))]'>
                    <Button variant='destructive' className='h-11' disabled={pending} onClick={onConfirm}>
                        {confirmLabel ?? t('common.delete')}
                    </Button>
                    <DrawerClose render={<Button variant='outline' className='h-11' />}>
                        {t('common.cancel')}
                    </DrawerClose>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    );
};
