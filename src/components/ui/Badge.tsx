import { VariantProps, cva } from 'class-variance-authority';

import cn from '@/lib/cn';

export const badgeVariants = cva('inline-flex items-center gap-1.5 font-medium transition-colors select-none font-mono tracking-wide ', {
    variants: {
        variant: {
            primary: 'bg-primary/10 text-primary shadow-2xs',
            solid: 'bg-primary text-primary-foreground shadow-xs',
            secondary: 'bg-secondary text-secondary-foreground shadow-2xs',
            outline: 'text-foreground bg-muted/60 shadow-2xs',
            accent: 'bg-accent text-accent-foreground shadow-2xs',
            destructive: 'bg-destructive/15 text-destructive shadow-2xs',
            success: 'bg-success/15 text-success dark:text-success shadow-2xs',
            warning: 'bg-warning/20 text-warning-foreground dark:text-warning shadow-2xs',
        },
        size: {
            xs: 'px-1.5 py-0.5 text-[9px] rounded-md',
            sm: 'px-2 py-0.5 text-[11px] rounded-md',
            md: 'px-2.5 py-1 text-xs rounded-lg',
            lg: 'px-3 py-1.5 text-sm rounded-xl',
        },
    },
    defaultVariants: {
        variant: 'primary',
        size: 'md',
    },
});

export interface BadgeProps extends React.ComponentProps<'span'>, VariantProps<typeof badgeVariants> {}

export function Badge({ size, children, className, variant, ...props }: BadgeProps) {
    return (
        <span className={cn(badgeVariants({ variant, size, className }))} {...props}>
            {children}
        </span>
    );
}

export default Badge;
