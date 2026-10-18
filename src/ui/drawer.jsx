import * as React from 'react';
import { Dialog as DialogPrimitive } from '@base-ui/react/dialog';

import { cn } from '@/helpers/utils';

// Lets DrawerHandle (rendered inside DrawerContent, below) trigger a close
// from its own drag gesture without every caller having to thread
// onOpenChange down through DrawerContent's props — Drawer already has it.
const DrawerCloseContext = React.createContext(() => {});

// Built directly on Base UI's plain Dialog (the same primitive dialog.jsx
// wraps for the desktop path) instead of a dedicated drawer library — this
// is what makes a Menu/Popover/Select opened from inside a drawer share the
// exact same portal/focus context as the drawer itself, so it's correctly
// recognized as "inside" rather than fighting it for clicks. Everything
// Dialog.Root already gives us for free (focus trap, escape-to-close, body
// scroll lock) stays free; the only genuinely custom part below is the
// bottom-sheet presentation and the handle's drag-to-dismiss gesture.
function Drawer({ onOpenChange, ...props }) {
    return (
        <DrawerCloseContext.Provider value={() => onOpenChange?.(false)}>
            <DialogPrimitive.Root data-slot='drawer' onOpenChange={onOpenChange} {...props} />
        </DrawerCloseContext.Provider>
    );
}

function DrawerTrigger({ ...props }) {
    return <DialogPrimitive.Trigger data-slot='drawer-trigger' {...props} />;
}

function DrawerPortal({ ...props }) {
    return <DialogPrimitive.Portal data-slot='drawer-portal' {...props} />;
}

function DrawerClose({ ...props }) {
    return <DialogPrimitive.Close data-slot='drawer-close' {...props} />;
}

function DrawerOverlay({ className, ...props }) {
    return (
        <DialogPrimitive.Backdrop
            data-slot='drawer-overlay'
            className={cn(
                'fixed inset-0 z-50 bg-black/10 supports-backdrop-filter:backdrop-blur-xs data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0',
                className,
            )}
            {...props}
        />
    );
}

// Distance/velocity past which a released drag counts as "dismiss" rather
// than "snap back". Distance is a fraction of the sheet's own height (not a
// fixed px value) so it scales with however tall a given sheet's content
// made it.
const DRAG_CLOSE_DISTANCE_RATIO = 0.35;
const DRAG_CLOSE_VELOCITY = 0.5; // px/ms

// Walks up from the pointerdown target looking for a vertically-scrollable
// ancestor within the sheet (stops at `boundary`, the Popup itself) — lets
// the content-level drag below tell "user is scrolling a list" apart from
// "user is dragging the sheet": while that ancestor still has room to
// scroll up (scrollTop > 0), a downward drag should scroll it, not dismiss.
const findScrollableAncestor = (node, boundary) => {
    let el = node;
    while (el && el !== boundary && el !== document.body) {
        if (el.scrollHeight > el.clientHeight) {
            const overflowY = getComputedStyle(el).overflowY;
            if (overflowY === 'auto' || overflowY === 'scroll') return el;
        }
        el = el.parentElement;
    }
    return null;
};

const settleDrag = (popup, deltaY, velocity, close) => {
    popup.style.transition = '';
    popup.style.setProperty('--drawer-drag-y', '0px');
    const height = popup.getBoundingClientRect().height;
    if (deltaY > height * DRAG_CLOSE_DISTANCE_RATIO || velocity > DRAG_CLOSE_VELOCITY) close();
};

const TOUCH_DRAG_START = 6;

// Touch version of the content drag. Pointer events can't do this on touch: the browser claims
// a vertical pan and fires `pointercancel`, so the sheet never gets the gesture (and iOS shows
// its rubber-band instead). Native, non-passive `touchmove` can `preventDefault()` that pan:
// when the scroll area is already at its top (or there is none) and the finger moves down, the
// scroll/bounce is cancelled and the sheet follows the finger instead. A gesture that begins
// while the list is still scrolled just scrolls it (`startY` keeps re-anchoring until the top).
const attachTouchDismiss = (popup, close) => {
    let drag = null;

    const handleStart = event => {
        if (event.touches.length !== 1 || event.target.closest('[data-slot=drawer-handle]')) {
            drag = null;
            return;
        }
        const y = event.touches[0].clientY;
        drag = {
            startY: y,
            lastY: y,
            lastT: event.timeStamp,
            velocity: 0,
            dragging: false,
            scrollable: findScrollableAncestor(event.target, popup),
        };
    };

    const handleMove = event => {
        if (!drag) return;
        const y = event.touches[0].clientY;

        if (!drag.dragging) {
            if ((drag.scrollable && drag.scrollable.scrollTop > 0) || y <= drag.startY) {
                drag.startY = y;
                return;
            }
            if (!event.cancelable) return;
            event.preventDefault();
            if (y - drag.startY < TOUCH_DRAG_START) return;
            drag.dragging = true;
            popup.style.transition = 'none';
        }

        event.preventDefault();
        const dt = event.timeStamp - drag.lastT;
        if (dt > 0) drag.velocity = (y - drag.lastY) / dt;
        drag.lastY = y;
        drag.lastT = event.timeStamp;
        popup.style.setProperty('--drawer-drag-y', `${Math.max(0, y - drag.startY)}px`);
    };

    const handleEnd = () => {
        const current = drag;
        drag = null;
        if (!current?.dragging) return;
        settleDrag(popup, Math.max(0, current.lastY - current.startY), current.velocity, close);
    };

    popup.addEventListener('touchstart', handleStart, { passive: true });
    popup.addEventListener('touchmove', handleMove, { passive: false });
    popup.addEventListener('touchend', handleEnd);
    popup.addEventListener('touchcancel', handleEnd);
    return () => {
        popup.removeEventListener('touchstart', handleStart);
        popup.removeEventListener('touchmove', handleMove);
        popup.removeEventListener('touchend', handleEnd);
        popup.removeEventListener('touchcancel', handleEnd);
    };
};

const useTouchDismiss = (close, enabled) => {
    const $popup = React.useRef(null);
    const $close = React.useRef(close);
    const $cleanup = React.useRef(null);
    $close.current = close;

    const popupRef = React.useCallback(
        node => {
            $cleanup.current?.();
            $cleanup.current = null;
            $popup.current = node;
            if (node && enabled) $cleanup.current = attachTouchDismiss(node, () => $close.current());
        },
        [enabled],
    );

    return [$popup, popupRef];
};

// Owns the drag-to-dismiss gesture. --drawer-drag-y is a CSS custom
// property (this project's convention for runtime values, e.g. photo-crop-
// dialog.jsx's --photo-flip-x/y) written imperatively during the drag so
// dragging never triggers a re-render — only the final open/close decision
// goes through React state.
//
// `threshold` is what lets the same mechanics serve both the handle and the
// content (see `disableContentDrag` below): 0 for the handle, which is
// dedicated to dragging so it can capture the pointer immediately; a few px
// for content, so a plain tap/click still reaches whatever was pressed
// (button clicks, etc.) and only a real downward drag hijacks the pointer —
// combined with the scrollable-ancestor check, so a list mid-scroll keeps
// scrolling instead of dragging the sheet, and only takes over once that
// list is already at its top and the user keeps pulling down.
const useDrawerDrag = ($popup, close, threshold = 0) => {
    const $drag = React.useRef(null);

    const handlePointerDown = event => {
        if (!$popup.current) return;
        if (threshold > 0 && event.pointerType === 'touch') return;
        $drag.current = {
            startY: event.clientY,
            lastY: event.clientY,
            lastT: event.timeStamp,
            velocity: 0,
            dragging: threshold === 0,
            scrollable:
                threshold === 0 ? null : findScrollableAncestor(event.target, $popup.current),
        };
        if (threshold === 0) {
            // Stops here — never bubbles up into a content-level Popup
            // listener, which would otherwise double-track the same drag.
            event.stopPropagation();
            event.currentTarget.setPointerCapture(event.pointerId);
            $popup.current.style.transition = 'none';
        }
    };

    const handlePointerMove = event => {
        const drag = $drag.current;
        if (!drag || !$popup.current) return;
        if (!drag.dragging && drag.scrollable && drag.scrollable.scrollTop > 0) return;

        const deltaY = event.clientY - drag.startY;

        if (!drag.dragging) {
            if (deltaY < threshold) return;
            drag.dragging = true;
            event.currentTarget.setPointerCapture(event.pointerId);
            $popup.current.style.transition = 'none';
        }

        event.preventDefault();
        $popup.current.style.setProperty('--drawer-drag-y', `${Math.max(0, deltaY)}px`);
        const dt = event.timeStamp - drag.lastT;
        if (dt > 0) drag.velocity = (event.clientY - drag.lastY) / dt;
        drag.lastY = event.clientY;
        drag.lastT = event.timeStamp;
    };

    const handlePointerUp = event => {
        const drag = $drag.current;
        if (!drag || !$popup.current) return;
        $drag.current = null;
        if (!drag.dragging) return;

        settleDrag($popup.current, Math.max(0, event.clientY - drag.startY), drag.velocity, close);
    };

    return {
        onPointerDown: handlePointerDown,
        onPointerMove: handlePointerMove,
        onPointerUp: handlePointerUp,
        onPointerCancel: handlePointerUp,
    };
};

function DrawerHandle({ $popup }) {
    const close = React.useContext(DrawerCloseContext);
    const dragHandlers = useDrawerDrag($popup, close, 0);

    return (
        <div
            role='presentation'
            data-slot='drawer-handle'
            {...dragHandlers}
            className='flex shrink-0 cursor-grab touch-none justify-center py-2 active:cursor-grabbing'
        >
            <div className='h-1 w-25 rounded-full bg-muted' />
        </div>
    );
}

// On by default for every Drawer's content, not just the handle — a
// downward drag starting anywhere (plain rows, a scrolled-to-top list) can
// dismiss the sheet; see useDrawerDrag's threshold/scrollable-ancestor
// handling above for how it stays out of the way of taps and active
// scrolling. `disableContentDrag` is the one escape hatch, for content with
// its own competing drag gesture that isn't a plain vertical scroll (e.g.
// PhotoCropDialog's react-easy-crop pan/zoom + zoom slider) — the handle
// still works to dismiss even when this is set.
function DrawerContent({ className, children, disableContentDrag = false, ...props }) {
    const close = React.useContext(DrawerCloseContext);
    const [$popup, popupRef] = useTouchDismiss(close, !disableContentDrag);
    const contentDragHandlers = useDrawerDrag($popup, close, 10);

    return (
        <DrawerPortal data-slot='drawer-portal'>
            <DrawerOverlay />
            <DialogPrimitive.Popup
                ref={popupRef}
                data-slot='drawer-content'
                style={{ '--drawer-drag-y': '0px' }}
                className={cn(
                    'fixed inset-x-0 bottom-0 z-50 flex h-auto max-h-[85dvh] min-h-0 flex-col overflow-hidden rounded-t-xl border-t bg-popover sm:inset-x-auto sm:bottom-4 sm:left-1/2 sm:w-full sm:max-w-lg sm:-translate-x-1/2 sm:rounded-xl sm:border text-sm text-popover-foreground outline-none translate-y-(--drawer-drag-y) data-open:animate-in data-open:fade-in-0 data-open:slide-in-from-bottom data-closed:animate-out data-closed:fade-out-0 data-closed:slide-out-to-bottom',
                    className,
                )}
                {...(disableContentDrag ? null : contentDragHandlers)}
                {...props}
            >
                <DrawerHandle $popup={$popup} />
                {children}
            </DialogPrimitive.Popup>
        </DrawerPortal>
    );
}

function DrawerHeader({ className, ...props }) {
    return (
        <div
            data-slot='drawer-header'
            className={cn('flex shrink-0 flex-col gap-0.5 p-4 text-left', className)}
            {...props}
        />
    );
}

function DrawerFooter({ className, ...props }) {
    return (
        <div
            data-slot='drawer-footer'
            className={cn('mt-auto flex shrink-0 flex-col gap-2 p-4', className)}
            {...props}
        />
    );
}

function DrawerTitle({ className, ...props }) {
    return (
        <DialogPrimitive.Title
            data-slot='drawer-title'
            className={cn('font-heading text-base font-medium text-foreground', className)}
            {...props}
        />
    );
}

function DrawerDescription({ className, ...props }) {
    return (
        <DialogPrimitive.Description
            data-slot='drawer-description'
            className={cn('text-sm text-muted-foreground', className)}
            {...props}
        />
    );
}

export {
    Drawer,
    DrawerPortal,
    DrawerOverlay,
    DrawerTrigger,
    DrawerClose,
    DrawerContent,
    DrawerHeader,
    DrawerFooter,
    DrawerTitle,
    DrawerDescription,
};
