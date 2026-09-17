'use client';

import React, { useEffect, useRef, useState } from 'react';

import Icon from '@/components/ui/Icon';
import { Icon as IconName } from '@/constants/icons.constants';
import useTheme, { TransitionShape } from '@/hooks/useTheme';
import cn from '@/lib/utils/cn';

const SHAPE_ICONS: Record<TransitionShape, IconName> = {
    circle: 'shapeCircle',
    diamond: 'shapeDiamond',
    square: 'shapeSquare',
    star: 'shapeStar',
    hexagon: 'shapeHexagon',
    'wipe-down': 'shapeWipeDown',
    'wipe-up': 'shapeWipeUp',
    'wipe-right': 'shapeWipeRight',
    'wipe-left': 'shapeWipeLeft',
};

type ThemeTogglerProps = React.HTMLAttributes<HTMLDivElement>;

const ThemeToggler = ({ className, ...props }: ThemeTogglerProps) => {
    const { theme, nextTheme, shape, setShape, availableShapes, animateToggleTheme } = useTheme();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        };

        if (isMenuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isMenuOpen]);

    const handleToggleClick: React.MouseEventHandler<HTMLButtonElement> = (event) => {
        animateToggleTheme(event.clientX, event.clientY);
    };

    const handleSelectShape = (e: React.MouseEvent, selectedShape: TransitionShape) => {
        setShape(selectedShape);
        setIsMenuOpen(false);
        // Instant preview
        animateToggleTheme(e.clientX, e.clientY, selectedShape);
    };

    const themeIcon = theme === 'light' ? 'sun' : theme === 'dark' ? 'moon' : 'desktop';
    const themeText = theme === 'system' ? 'System' : theme[0].toUpperCase() + theme.slice(1);

    const currentShapeOption = availableShapes.find((s) => s.id === shape) ?? availableShapes[0];

    return (
        <div ref={menuRef} className={cn('relative inline-flex items-center', className)} {...props}>
            <div className="bg-card text-card-foreground border-border inline-flex h-10 items-center rounded-full border shadow-sm transition-colors">
                {/* Main Theme Toggle Button */}
                <button
                    type="button"
                    onClick={handleToggleClick}
                    aria-label={`Theme: ${themeText}. Switch to ${nextTheme} with ${shape} shape.`}
                    title={`Theme: ${themeText}. Click to switch to ${nextTheme} (${shape} transition).`}
                    className="hover:bg-accent hover:text-accent-foreground inline-flex h-full cursor-pointer items-center gap-2 rounded-l-full px-3.5 text-xs font-semibold tracking-[0.08em] uppercase transition-colors focus-visible:outline-none">
                    <Icon icon={themeIcon} className="size-4" />
                    <span>{themeText}</span>
                </button>

                <div className="bg-border h-4 w-px" />

                {/* Shape Selector Menu Trigger */}
                <button
                    type="button"
                    onClick={() => setIsMenuOpen((prev) => !prev)}
                    aria-label={`Current shape: ${currentShapeOption.label}. Click to choose transition shape.`}
                    title={`Transition shape: ${currentShapeOption.label}. Click to customize.`}
                    aria-expanded={isMenuOpen}
                    className="hover:bg-accent hover:text-accent-foreground text-muted-foreground inline-flex h-full cursor-pointer items-center gap-1 rounded-r-full px-2.5 transition-colors focus-visible:outline-none">
                    <Icon icon={SHAPE_ICONS[currentShapeOption.id]} className="size-4" />
                    <span className="text-[10px] font-bold">▾</span>
                </button>
            </div>

            {/* Dropdown Popover */}
            {isMenuOpen && (
                <div className="bg-card text-card-foreground border-border absolute top-full right-0 z-50 mt-2 w-64 rounded-2xl border p-2.5 shadow-xl backdrop-blur-lg">
                    <div className="mb-2 flex items-center justify-between px-2 pt-1">
                        <span className="text-muted-foreground text-[11px] font-semibold tracking-wider uppercase">Transition Shape</span>
                        <span className="text-primary text-[11px] font-medium">Click to test</span>
                    </div>

                    <div className="flex flex-col gap-1">
                        {availableShapes.map((item) => {
                            const isSelected = shape === item.id;

                            return (
                                <button
                                    key={item.id}
                                    type="button"
                                    onClick={(e) => handleSelectShape(e, item.id)}
                                    className={cn(
                                        'flex w-full cursor-pointer items-center justify-between rounded-xl px-2.5 py-1.5 text-left text-xs transition-colors',
                                        isSelected ? 'bg-primary/10 text-primary font-semibold' : 'hover:bg-accent text-card-foreground'
                                    )}>
                                    <div className="flex items-center gap-2">
                                        <Icon icon={SHAPE_ICONS[item.id]} className="size-4" />
                                        <span>{item.label}</span>
                                        {item.id === 'circle' && <span className="text-muted-foreground text-[10px]">(Default)</span>}
                                    </div>
                                    {isSelected && <Icon icon="check" className="text-primary size-3.5" />}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ThemeToggler;
