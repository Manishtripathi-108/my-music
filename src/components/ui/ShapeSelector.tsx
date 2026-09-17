'use client';

import React from 'react';

import Icon from '@/components/ui/Icon';
import useTheme, { TransitionShape } from '@/hooks/useTheme';
import cn from '@/lib/utils/cn';

interface ShapeSelectorProps {
    className?: string;
    showPreviewButton?: boolean;
}

export const ShapeSelector: React.FC<ShapeSelectorProps> = ({ className, showPreviewButton = true }) => {
    const { shape, setShape, availableShapes, animateToggleTheme } = useTheme();

    const handleShapeClick = (e: React.MouseEvent<HTMLButtonElement>, targetShape: TransitionShape) => {
        setShape(targetShape);
        if (showPreviewButton) {
            // Trigger animation immediately with clicked shape & cursor coordinates
            animateToggleTheme(e.clientX, e.clientY, targetShape);
        }
    };

    return (
        <div className={cn('flex flex-col gap-3', className)}>
            <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">Transition Shape</span>
                <span className="bg-primary/10 text-primary rounded-full px-2.5 py-0.5 text-xs font-semibold">{shape.toUpperCase()}</span>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
                {availableShapes.map((item) => {
                    const isSelected = shape === item.id;

                    return (
                        <button
                            key={item.id}
                            type="button"
                            onClick={(e) => handleShapeClick(e, item.id)}
                            title={`${item.label}: ${item.description}`}
                            className={cn(
                                'flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border p-2.5 text-center transition-all',
                                isSelected
                                    ? 'border-primary bg-primary/10 text-primary ring-primary/30 font-semibold shadow-xs ring-2'
                                    : 'border-border bg-card text-card-foreground hover:border-primary/50 hover:bg-accent/50'
                            )}>
                            <Icon icon={item.icon} className="size-5" />
                            <span className="text-xs">{item.label}</span>
                            {item.id === 'circle' && <span className="text-muted-foreground text-[10px]">(Default)</span>}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default ShapeSelector;
