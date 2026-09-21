import { VariantProps, cva } from 'class-variance-authority';

import cn from '@/lib/utils/cn';

export const badgeVariants = cva('inline-flex items-center gap-1.5 font-medium transition-colors select-none font-mono tracking-wide', {
    variants: {
        variant: {
            primary: 'bg-primary/10 text-primary border border-primary/20',
            solid: 'bg-primary text-primary-foreground shadow-xs',
            secondary: 'bg-secondary text-secondary-foreground border border-secondary/20',
            outline: 'border text-foreground bg-transparent',
            accent: 'bg-accent text-accent-foreground border',
            destructive: 'bg-destructive/10 text-destructive border border-destructive/20',
            success: 'bg-success/10 text-success dark:text-success border border-success/20',
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
