'use client';

import { GooeyToaster } from 'goey-toast';

import useTheme from '@/hooks/useTheme';

export function ToastProvider() {
    const { activeMode } = useTheme();

    return <GooeyToaster position="bottom-right" theme={activeMode} />;
}

export default ToastProvider;
