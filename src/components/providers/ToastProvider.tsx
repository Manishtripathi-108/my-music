'use client';

import { GooeyToaster } from 'goey-toast';

import useTheme from '@/hooks/useTheme';

export function ToastProvider() {
    const { activeTheme } = useTheme();

    return <GooeyToaster position="bottom-right" theme={activeTheme} />;
}

export default ToastProvider;
