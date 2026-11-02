'use client';

import { GooeyToaster } from 'goey-toast';

import useTheme from '@/context/useTheme';

export function ToastProvider() {
    const { activeMode } = useTheme();

    return <GooeyToaster position="bottom-right" theme={activeMode} />;
}

export default ToastProvider;
