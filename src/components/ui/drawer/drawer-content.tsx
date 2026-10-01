'use client';

import { Drawer as ArkDrawer } from '@ark-ui/react/drawer';

import cn from '@/lib/cn';

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

                'motion-duration-250 motion-ease-spring-smooth',
                'ark-open:motion-translate-y-in-100 ark-closed:motion-translate-y-out-100',
                'ark-swipe-down:ark-open:motion-translate-y-in-100 ark-swipe-down:ark-closed:motion-translate-y-out-100 ark-swipe-down:border-t ark-swipe-down:rounded-t-2xl',
                'ark-swipe-up:ark-open:motion-translate-y-in-[-100%] ark-swipe-up:ark-closed:motion-translate-y-out-[-100%] ark-swipe-up:rounded-b-3xl ark-swipe-up:border-b ark-swipe-up:after:top-auto ark-swipe-up:after:bottom-full',
                'ark-swipe-right:ark-open:motion-translate-x-in-100 ark-swipe-right:ark-closed:motion-translate-x-out-100 ark-swipe-right:max-h-none ark-swipe-right:max-w-md ark-swipe-right:rounded-l-2xl ark-swipe-right:border-l ark-swipe-right:after:top-0 ark-swipe-right:after:left-full ark-swipe-right:after:h-auto ark-swipe-right:after:w-(--bleed)',
                'ark-swipe-left:ark-open:motion-translate-x-in-[-100%] ark-swipe-left:ark-closed:motion-translate-x-out-[-100%] ark-swipe-left:max-h-none ark-swipe-left:max-w-md ark-swipe-left:rounded-r-2xl ark-swipe-left:border-r ark-swipe-left:after:top-0 ark-swipe-left:after:right-full ark-swipe-left:after:h-auto ark-swipe-left:after:w-(--bleed)',
                className
            )}
            {...props}
        />
    );
}
