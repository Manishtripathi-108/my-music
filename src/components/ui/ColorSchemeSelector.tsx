'use client';

import * as React from 'react';

import { Menu as ArkMenu } from '@ark-ui/react/menu';

import Icon from '@/components/ui/Icon';
import useTheme from '@/hooks/useTheme';
import cn from '@/lib/cn';
import type { ColorScheme } from '@/lib/theme/types';

/* --------------------------------- Types ---------------------------------- */

/** Props for the ColorSchemeSelector component */
export interface ColorSchemeSelectorProps {
    /** Extra CSS classes applied to the root container */
    className?: string;
    /** Alignment placement for the menu dropdown */
    placement?: 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end';
}

/* ------------------------------- Component -------------------------------- */

/**
 * Topbar color scheme selector component.
 * Allows the user to select between calibrated color scheme palettes
 * via an accessible Ark UI tactile dropdown menu.
 */
export function ColorSchemeSelector({ className, placement = 'bottom-end' }: ColorSchemeSelectorProps) {
    const { colorScheme, setColorScheme, colorSchemes } = useTheme();

    const activeSchemeOption = React.useMemo(() => {
        return colorSchemes.find((s) => s.id === colorScheme) ?? colorSchemes[0];
    }, [colorScheme, colorSchemes]);

    return (
        <div className={cn('relative inline-flex items-center', className)}>
            <ArkMenu.Root positioning={{ placement, gutter: 8 }} lazyMount unmountOnExit>
                <ArkMenu.Trigger asChild>
                    <button
                        type="button"
                        aria-label={`Color scheme: ${activeSchemeOption?.label ?? 'Scheme'}. Click to switch scheme`}
                        title={`Color scheme: ${activeSchemeOption?.label ?? 'Scheme'}. Click to switch scheme`}
                        className={cn(
                            'relative inline-flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-lg',
                            'text-foreground bg-transparent outline-none select-none',
                            'ease-spring transition-all duration-150',
                            'hover:bg-accent hover:text-accent-foreground hover:brightness-[1.03]',
                            'active:scale-[0.985] active:brightness-[0.97]',
                            'focus-visible:ring-ring focus-visible:ring-offset-background focus-visible:ring-2 focus-visible:ring-offset-2'
                        )}>
                        <Icon icon="palette" className="size-4" />
                        {/* Live active scheme color swatch pip */}
                        <span
                            aria-hidden="true"
                            style={{ backgroundColor: activeSchemeOption?.swatch }}
                            className="ring-card absolute right-1 bottom-1 size-2 rounded-full shadow-xs ring-1 transition-colors duration-200"
                        />
                    </button>
                </ArkMenu.Trigger>

                <ArkMenu.Positioner className="z-50">
                    <ArkMenu.Content className="bg-card text-card-foreground min-w-56 rounded-2xl p-1.5 font-mono shadow-xl outline-none">
                        {/* Section Header */}
                        <div className="flex items-center justify-between px-2.5 py-1.5">
                            <span className="text-muted-foreground text-[10px] font-bold tracking-widest uppercase">COLOR SCHEME</span>
                            <span className="bg-muted text-muted-foreground rounded-full px-1.5 py-0.5 text-[9px] font-medium">palette</span>
                        </div>

                        <div className="bg-muted/60 my-1 h-px" />

                        {/* Scheme Radio Options */}
                        <ArkMenu.RadioItemGroup
                            value={colorScheme}
                            onValueChange={(details) => setColorScheme(details.value as ColorScheme)}
                            className="flex flex-col gap-0.5">
                            {colorSchemes.map((scheme) => {
                                const isSelected = scheme.id === colorScheme;
                                return (
                                    <ArkMenu.RadioItem
                                        key={scheme.id}
                                        value={scheme.id}
                                        className={cn(
                                            'group flex cursor-pointer items-center justify-between gap-3 rounded-xl px-2.5 py-2 text-xs outline-none select-none',
                                            'ease-spring transition-all duration-150',
                                            'ark-highlighted:bg-accent ark-highlighted:text-accent-foreground',
                                            isSelected ? 'bg-primary/10 text-primary font-semibold' : 'text-foreground hover:bg-accent/60'
                                        )}>
                                        <div className="flex items-center gap-2.5">
                                            {/* Preview Swatch */}
                                            <span
                                                aria-hidden="true"
                                                style={{ backgroundColor: scheme.swatch }}
                                                className={cn(
                                                    'size-3 shrink-0 rounded-full border border-white/20 shadow-xs transition-transform group-hover:scale-110',
                                                    isSelected && 'ring-primary/40 ring-offset-card ring-2 ring-offset-1'
                                                )}
                                            />
                                            <div className="flex flex-col text-left">
                                                <ArkMenu.ItemText className="leading-none font-medium">{scheme.label}</ArkMenu.ItemText>
                                                <span className="text-muted-foreground mt-0.5 text-[10px] leading-tight font-normal">
                                                    {scheme.description}
                                                </span>
                                            </div>
                                        </div>

                                        <ArkMenu.ItemIndicator className="text-primary shrink-0">
                                            <Icon icon="check" className="size-3.5" />
                                        </ArkMenu.ItemIndicator>
                                    </ArkMenu.RadioItem>
                                );
                            })}
                        </ArkMenu.RadioItemGroup>
                    </ArkMenu.Content>
                </ArkMenu.Positioner>
            </ArkMenu.Root>
        </div>
    );
}

export default ColorSchemeSelector;
