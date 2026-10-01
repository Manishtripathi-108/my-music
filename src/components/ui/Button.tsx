import * as React from 'react';

import { type VariantProps, cva } from 'class-variance-authority';

import cn from '@/lib/cn';

const buttonVariants = cva(
    [
        'inline-flex shrink-0 items-center justify-center gap-1 whitespace-nowrap cursor-pointer',
        'rounded-[18px] border text-sm font-medium leading-none',
        'outline-none transition-[border-radius,transform,background-color,color,border-color]',
        'duration-300 ease-out',
        'select-none',
        'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        'disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
        'hover:scale-[1.02] active:scale-[0.98]',
        'hover:rounded-none active:rounded-none focus-visible:rounded-none',
    ],
    {
        variants: {
            variant: {
                primary: ['border-primary bg-primary text-primary-foreground', 'hover:bg-primary/90', 'active:bg-primary/80'],

                secondary: ['border-secondary bg-secondary text-secondary-foreground', 'hover:bg-secondary/80', 'active:bg-secondary/70'],

                outline: ['border-input bg-background text-foreground', 'hover:bg-accent hover:text-accent-foreground', 'active:bg-accent/80'],

                ghost: ['border-transparent bg-transparent text-foreground', 'hover:bg-accent hover:text-accent-foreground', 'active:bg-accent/80'],

                destructive: ['border-destructive bg-destructive text-destructive-foreground', 'hover:bg-destructive/90', 'active:bg-destructive/80'],

                success: ['border-success bg-success text-success-foreground', 'hover:bg-success/90', 'active:bg-success/80'],

                warning: ['border-warning bg-warning text-warning-foreground', 'hover:bg-warning/90', 'active:bg-warning/80'],

                link: [
                    'h-auto rounded-sm border-transparent bg-transparent p-0',
                    'text-primary underline-offset-4',
                    'hover:underline',
                    'active:text-primary/80',
                    'focus-visible:ring-2',
                ],
            },

            size: {
                xs: ['h-7 px-2', 'text-xs', 'rounded-[14px]'],

                sm: ['h-8 px-3', 'text-xs', 'rounded-[16px]'],

                md: ['h-9 px-4', 'text-sm', 'rounded-[18px]'],

                lg: ['h-10 px-5', 'text-sm', 'rounded-[20px]'],

                xl: ['h-11 px-6', 'text-base', 'rounded-[22px]'],
            },
        },

        defaultVariants: {
            variant: 'primary',
            size: 'md',
        },
    }
);

type ButtonProps = React.ComponentProps<'button'> & VariantProps<typeof buttonVariants>;

export function Button({ className, variant, size, type = 'button', ...props }: ButtonProps) {
    return <button type={type} className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}

export { buttonVariants };

export default Button;
