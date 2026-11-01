import * as React from 'react';

import Link from 'next/link';

import { type VariantProps, cva } from 'class-variance-authority';

import cn from '@/lib/cn';

/* -------------------------------- Variants -------------------------------- */

/**
 * Class-variance-authority recipe for physical tactile buttons.
 * Composes idle elevation, hover lift, focus indicators, and indented active feedback.
 */
export const buttonVariants = cva(
    [
        'inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap cursor-pointer',
        'font-mono font-medium leading-none select-none outline-none ',
        'shadow-sm transition-all duration-150 ease-[cubic-bezier(0.16,1,0.3,1)]',
        'hover:shadow-md hover:brightness-[1.03]',
        'active:scale-[0.985] active:shadow-inner active:inset-shadow-xs active:brightness-[0.97]',
        'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        'disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none',
    ],
    {
        variants: {
            variant: {
                primary: ['bg-primary text-primary-foreground', 'hover:bg-primary/90', 'active:bg-primary/80'],

                dark: [
                    'bg-neutral-900 text-white tracking-wider dark:bg-neutral-800 shadow-md',
                    'hover:bg-neutral-800 dark:hover:bg-neutral-700',
                    'active:bg-neutral-950 dark:active:bg-neutral-900',
                ],

                slate: [
                    'bg-neutral-600 text-white tracking-wider dark:bg-neutral-700 shadow-md',
                    'hover:bg-neutral-700 dark:hover:bg-neutral-600',
                    'active:bg-neutral-800 dark:active:bg-neutral-800',
                ],

                secondary: ['bg-secondary text-secondary-foreground', 'hover:bg-secondary/80', 'active:bg-secondary/70'],

                outline: ['bg-card text-foreground shadow-xs', 'hover:bg-accent hover:text-accent-foreground', 'active:bg-accent/80'],

                ghost: [
                    'bg-transparent text-foreground shadow-none',
                    'hover:bg-accent hover:text-accent-foreground hover:shadow-none',
                    'active:bg-accent/80',
                ],

                destructive: ['bg-destructive text-destructive-foreground', 'hover:bg-destructive/90', 'active:bg-destructive/80'],

                success: ['bg-success text-success-foreground', 'hover:bg-success/90', 'active:bg-success/80'],

                warning: ['bg-warning text-warning-foreground', 'hover:bg-warning/90', 'active:bg-warning/80'],

                link: [
                    'h-auto rounded-none bg-transparent p-0 shadow-none',
                    'text-primary underline-offset-4',
                    'hover:underline hover:shadow-none hover:brightness-100',
                    'active:text-primary/80 active:scale-100 active:shadow-none active:inset-shadow-none',
                    'focus-visible:ring-2',
                ],
            },

            size: {
                xs: ['h-7 px-2.5', 'text-xs', 'rounded-lg'],
                sm: ['h-8 px-3', 'text-xs', 'rounded-lg'],
                md: ['h-9.5 px-4', 'text-sm', 'rounded-xl'],
                lg: ['h-11 px-5', 'text-sm', 'rounded-xl'],
                xl: ['h-14 px-6', 'text-sm font-bold tracking-wider', 'rounded-2xl'],
            },
        },

        defaultVariants: {
            variant: 'primary',
            size: 'md',
        },
    }
);

/* ---------------------------------- Types --------------------------------- */

type BaseButtonProps = VariantProps<typeof buttonVariants> & {
    className?: string;
    children?: React.ReactNode;
};

/** Props accepted when rendered as a standard interactive HTML button */
export type ButtonAsButton = BaseButtonProps &
    Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof BaseButtonProps> & {
        href?: undefined;
    };

/** Props accepted when rendered polymorphically as a Next.js navigational Link */
export type ButtonAsLink = BaseButtonProps &
    Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof BaseButtonProps | 'href'> & {
        href: React.ComponentProps<typeof Link>['href'];
        replace?: boolean;
        scroll?: boolean;
        prefetch?: boolean;
    };

/** Polymorphic button props supporting either button attributes or Next.js Link props */
export type ButtonProps = ButtonAsButton | ButtonAsLink;

/* -------------------------------- Component ------------------------------- */

/**
 * Polymorphic tactile button component.
 * Renders an accessible HTML button by default or a Next.js Link when href is provided.
 */
export const Button = React.forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(function Button(props, ref) {
    const { className, variant, size, ...rest } = props;

    if ('href' in rest && rest.href != null) {
        const { href, replace, scroll, prefetch, ...linkProps } = rest as ButtonAsLink;
        return (
            <Link
                ref={ref as React.ForwardedRef<HTMLAnchorElement>}
                href={href}
                replace={replace}
                scroll={scroll}
                prefetch={prefetch}
                className={cn(buttonVariants({ variant, size }), className)}
                {...linkProps}
            />
        );
    }

    const { type = 'button', ...buttonProps } = rest as ButtonAsButton;
    return (
        <button
            ref={ref as React.ForwardedRef<HTMLButtonElement>}
            type={type}
            className={cn(buttonVariants({ variant, size }), className)}
            {...buttonProps}
        />
    );
});

Button.displayName = 'Button';

export default Button;
