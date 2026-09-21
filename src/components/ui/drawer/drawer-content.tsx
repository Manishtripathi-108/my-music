'use client';

import { Drawer as ArkDrawer } from '@ark-ui/react/drawer';

import cn from '@/lib/utils/cn';

export type DrawerContentProps = ArkDrawer.ContentProps;

export function DrawerContent({ className, ...props }: DrawerContentProps) {
    return (
        <ArkDrawer.Content
            className={cn(
                '[--bleed:3rem]',
                'bg-card',
                'relative flex h-full w-full flex-col',
                'max-h-[96svh] px-5',
                'outline-none',

                'after:pointer-events-none',
                'after:absolute',
                'after:inset-x-0',
                'after:top-full',
                'after:h-(--bleed)',
                'after:bg-inherit',

                'ark-swipe-down:border-t ark-swipe-down:rounded-t-2xl',
                'ark-swipe-down:ark-open:motion-preset-slide-up ark-swipe-down:ark-closed:motion-preset-slide-down',

                'ark-swipe-up:rounded-b-3xl ark-swipe-up:border-b',
                'ark-swipe-up:after:top-auto ark-swipe-up:after:bottom-full',
                'ark-swipe-up:ark-open:motion-preset-slide-down ark-swipe-up:ark-closed:motion-preset-slide-up',

                'ark-swipe-right:max-h-none ark-swipe-right:max-w-md',
                'ark-swipe-right:rounded-l-2xl ark-swipe-right:border-l',
                'ark-swipe-right:ark-open:motion-preset-slide-left ark-swipe-right:ark-closed:motion-preset-slide-right',
                'ark-swipe-right:after:top-0 ark-swipe-right:after:left-full ark-swipe-right:after:h-auto ark-swipe-right:after:w-(--bleed)',

                'ark-swipe-left:max-h-none ark-swipe-left:max-w-md',
                'ark-swipe-left:rounded-r-2xl ark-swipe-left:border-r',
                'ark-swipe-left:ark-open:motion-preset-slide-right ark-swipe-left:ark-closed:motion-preset-slide-left',
                'ark-swipe-left:after:top-0 ark-swipe-left:after:right-full ark-swipe-left:after:h-auto ark-swipe-left:after:w-(--bleed)',

                className
            )}
            {...props}
        />
    );
}
