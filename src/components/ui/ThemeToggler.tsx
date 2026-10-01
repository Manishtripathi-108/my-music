'use client';

import Icon from '@/components/ui/Icon';
import useTheme from '@/hooks/useTheme';
import cn from '@/lib/cn';

import { Button } from './Button';

export function ThemeToggler({ className, ...props }: React.ComponentProps<'div'>) {
    const { mode, nextMode, cycleModeAnimated } = useTheme();

    const handleToggleClick: React.MouseEventHandler<HTMLButtonElement> = (event) => {
        cycleModeAnimated(event.clientX, event.clientY);
    };

    const themeIcon = mode === 'light' ? 'sun' : mode === 'dark' ? 'moon' : 'desktop';
    const themeText = mode === 'system' ? 'System' : mode[0].toUpperCase() + mode.slice(1);

    return (
        <div className={cn('relative inline-flex items-center', className)} {...props}>
            <Button
                variant="ghost"
                size="sm"
                onClick={handleToggleClick}
                aria-label={`Theme: ${themeText}. Switch to ${nextMode}`}
                title={`Theme: ${themeText}. Click to switch to ${nextMode}`}
                className="size-8 p-0">
                <Icon icon={themeIcon} className="size-4" />
            </Button>
        </div>
    );
}

export default ThemeToggler;
