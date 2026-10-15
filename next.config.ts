import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    reactCompiler: true,
    serverExternalPackages: [
        'taglib-wasm',
        'mediainfo.js',
        '@ffmpeg/ffmpeg',
        '@ffmpeg/core',
    ],
};

export default nextConfig;
