import { createContext, useContext } from 'react';
import { useMediaQuery } from '@/hooks/use-media-query';
import { Popover, PopoverContent, PopoverTrigger } from '@/ui/popover';
import { Drawer, DrawerContent, DrawerTrigger } from '@/ui/drawer';
import { cn } from '@/helpers/utils';

const ResponsivePopoverMobileContext = createContext(false);

export const useResponsivePopoverMobile = () => useContext(ResponsivePopoverMobileContext);

export const ResponsivePopover = ({ children, ...props }) => {
    const isMobile = !useMediaQuery('(min-width: 640px)');
    const Root = isMobile ? Drawer : Popover;

    return (
        <ResponsivePopoverMobileContext.Provider value={isMobile}>
            <Root data-slot='responsive-popover' {...props}>
                {children}
            </Root>
        </ResponsivePopoverMobileContext.Provider>
    );
};

export const ResponsivePopoverTrigger = ({ render, children, ...props }) => {
    const isMobile = useResponsivePopoverMobile();
    const Trigger = isMobile ? DrawerTrigger : PopoverTrigger;

    return (
        <Trigger data-slot='responsive-popover-trigger' render={render} {...props}>
            {children}
        </Trigger>
    );
};

export const ResponsivePopoverContent = ({
    className,
    align,
    alignOffset,
    side,
    sideOffset,
    disableContentDrag,
    ...props
}) => {
    const isMobile = useResponsivePopoverMobile();

    if (isMobile) {
        return (
            <DrawerContent
                data-slot='responsive-popover-content'
                disableContentDrag={disableContentDrag}
                className={cn('w-full', className)}
                {...props}
            />
        );
    }

    return (
        <PopoverContent
            data-slot='responsive-popover-content'
            className={className}
            align={align}
            alignOffset={alignOffset}
            side={side}
            sideOffset={sideOffset}
            {...props}
        />
    );
};
