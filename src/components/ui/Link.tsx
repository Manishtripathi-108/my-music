import * as React from 'react';

import NextLink, { type LinkProps as NextLinkProps } from 'next/link';

import { type VariantProps, cva } from 'class-variance-authority';

import cn from '@/lib/cn';

/* -------------------------------- Variants -------------------------------- */

/**
 * Class-variance-authority styling recipe for navigational and inline anchor links.
 */
export const linkVariants = cva(
    'inline-flex items-center gap-1 font-mono transition-all duration-150 outline-none select-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
    {
        variants: {
            variant: {
                default: 'text-primary underline underline-offset-4 hover:opacity-90 active:opacity-75',
                muted: 'text-muted-foreground underline underline-offset-4 hover:text-foreground active:opacity-75',
                subtle: 'text-foreground/80 hover:text-foreground hover:underline underline-offset-4 active:opacity-75',
                nav: 'text-muted-foreground font-semibold hover:text-foreground hover:bg-muted/50 px-3 py-1.5 rounded-full active:scale-95 transition-all',
                ghost: 'text-foreground hover:bg-accent hover:text-accent-foreground px-2.5 py-1 rounded-lg active:scale-95',
            },
            size: {
                xs: 'text-xs',
                sm: 'text-xs',
                md: 'text-sm',
                lg: 'text-base',
            },
        },
        defaultVariants: {
            variant: 'default',
            size: 'md',
        },
    }
);

/* ---------------------------------- Types --------------------------------- */

type BaseLinkProps = VariantProps<typeof linkVariants> & {
    className?: string;
    children?: React.ReactNode;
    isExternal?: boolean;
};

/**
 * Props for the custom Link component, extending Next.js LinkProps with styling variants.
 */
export type LinkProps = BaseLinkProps &
    Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof NextLinkProps | keyof BaseLinkProps> &
    NextLinkProps;

/* -------------------------------- Component ------------------------------- */

/**
 * Accessible design-system anchor primitive built on top of Next.js Link.
 * Automatically injects noopener noreferrer when `isExternal` is set to true.
 */
export const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(function Link(
    { className, variant, size, isExternal, target, rel, ...props },
    ref
) {
    const externalProps = isExternal ? { target: target ?? '_blank', rel: rel ?? 'noopener noreferrer' } : { target, rel };

    return <NextLink ref={ref} className={cn(linkVariants({ variant, size }), className)} {...externalProps} {...props} />;
});

Link.displayName = 'Link';

export default Link;
