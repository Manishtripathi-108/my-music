import assert from 'node:assert/strict';
import { GET as getLiveness } from '../src/app/api/health/route';
import { GET as getReadiness } from '../src/app/api/health/ready/route';
import { GET as getMediaDiagnostics } from '../src/app/api/health/media/route';

async function run() {
    console.log('--- TESTING HEALTH ROUTES ---');

    // 1. /api/health (Basic liveness)
    console.log('Testing GET /api/health (Basic Liveness)...');
    const liveRes = await getLiveness();
    assert.equal(liveRes.status, 200);
    const liveBody = await liveRes.json();
    assert.equal(liveBody.success, true);
    assert.equal(liveBody.data.status, 'ok');
    assert.equal(typeof liveBody.data.uptime, 'number');
    assert(liveBody.data.timestamp);
    console.log('✓ /api/health response:', JSON.stringify(liveBody.data, null, 2));

    // 2. /api/health/ready (Core readiness)
    console.log('Testing GET /api/health/ready (Core Readiness)...');
    const readyRes = await getReadiness();
    assert.equal(readyRes.status, 200);
    const readyBody = await readyRes.json();
    assert.equal(readyBody.success, true);
    assert.equal(readyBody.data.status, 'ready');
    assert.equal(readyBody.data.checks.configuration, 'ready');
    assert.equal(readyBody.data.checks.storage, 'ready');
    assert(readyBody.data.timestamp);
    console.log('✓ /api/health/ready response:', JSON.stringify(readyBody.data, null, 2));

    // 3. /api/health/media (Media engine diagnostics)
    console.log('Testing GET /api/health/media (Media Diagnostics)...');
    const mediaRes = await getMediaDiagnostics();
    assert.equal(mediaRes.status, 200);
    const mediaBody = await mediaRes.json();
    assert.equal(mediaBody.success, true);
    assert.equal(mediaBody.data.status, 'healthy');

    // Metadata engine
    const meta = mediaBody.data.engines.metadata;
    assert.equal(meta.status, 'healthy');
    assert.equal(meta.tools.taglib.configured, 'native');
    assert.equal(meta.tools.taglib.active, 'native');
    assert.equal(meta.tools.taglib.implementations.native.path, 'scripts/taglib-worker/taglib-worker.exe');
    assert.equal(meta.tools.taglib.implementations.native.available, true);
    assert.equal(meta.tools.taglib.implementations.native.version, '2.0.2');
    assert.equal(meta.tools.taglib.implementations.wasm.available, true);
    assert.equal(meta.tools.taglib.implementations.wasm.path, null);
    assert.equal('version' in meta.tools.taglib.implementations.wasm, false, 'wasm must not have version in response');

    // Probing engine
    const probe = mediaBody.data.engines.probing;
    assert.equal(probe.status, 'healthy');
    assert.equal(probe.tools.ffprobe.configured, 'native');
    assert.equal(probe.tools.ffprobe.active, 'native');
    assert.equal(probe.tools.ffprobe.implementations.native.path, 'ffprobe');
    assert.equal(probe.tools.ffprobe.implementations.native.available, true);
    assert(probe.tools.ffprobe.implementations.native.version, 'ffprobe version must be present');
    assert.equal(probe.tools.ffprobe.implementations.wasm.available, true);
    assert.equal(probe.tools.ffprobe.implementations.wasm.path, null);
    assert.equal('version' in probe.tools.ffprobe.implementations.wasm, false, 'wasm must not have version in response');

    assert.equal(probe.tools.mediaInfo.configured, 'native');
    assert.equal(probe.tools.mediaInfo.active, 'native');
    assert.equal(probe.tools.mediaInfo.implementations.native.path, 'MediaInfo');
    assert.equal(probe.tools.mediaInfo.implementations.native.available, true);
    assert(probe.tools.mediaInfo.implementations.native.version, 'MediaInfo version must be present');
    assert.equal(probe.tools.mediaInfo.implementations.wasm.available, true);
    assert.equal(probe.tools.mediaInfo.implementations.wasm.path, null);
    assert.equal('version' in probe.tools.mediaInfo.implementations.wasm, false, 'wasm must not have version in response');

    // Conversion engine
    const conv = mediaBody.data.engines.conversion;
    assert.equal(conv.status, 'healthy');
    assert.equal(conv.tools.ffmpeg.configured, 'native');
    assert.equal(conv.tools.ffmpeg.active, 'native');
    assert.equal(conv.tools.ffmpeg.implementations.native.path, 'ffmpeg');
    assert.equal(conv.tools.ffmpeg.implementations.native.available, true);
    assert(conv.tools.ffmpeg.implementations.native.version, 'FFmpeg version must be present');
    assert.equal(conv.tools.ffmpeg.implementations.wasm.available, true);
    assert.equal(conv.tools.ffmpeg.implementations.wasm.path, null);
    assert.equal('version' in conv.tools.ffmpeg.implementations.wasm, false, 'wasm must not have version in response');

    console.log('✓ /api/health/media response:', JSON.stringify(mediaBody, null, 2));

    console.log('========================================');
    console.log('ALL HEALTH ROUTES VERIFIED SUCCESSFULLY!');
    console.log('========================================');
}

run().catch((err) => {
    console.error('Test failed:', err);
    process.exit(1);
});
