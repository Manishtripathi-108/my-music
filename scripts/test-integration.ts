import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { metadataCoordinator, mediaConverter } from '../src/features/media/server';
import { FFprobeAdapter } from '../src/server/media/adapters/ffprobe.adapter';
import { MediaInfoAdapter } from '../src/server/media/adapters/mediainfo.adapter';
import { NotFoundError } from '../src/server/api/errors';

async function run() {
    console.log('--- STARTING REAL MEDIA INTEGRATION TESTS ---');

    const sourceFlac = path.resolve('music-files/Ava - Famy.flac');
    const sourceM4a = path.resolve('music-files/Psycho! - Masn.m4a');
    const sourceArt = path.resolve('music-files/artwork.png');

    assert(fs.existsSync(sourceFlac), 'Source FLAC file must exist');
    assert(fs.existsSync(sourceM4a), 'Source M4A file must exist');
    assert(fs.existsSync(sourceArt), 'Source Artwork must exist');

    const testDir = path.resolve('music-files/test-sandbox');
    await fs.promises.rm(testDir, { recursive: true, force: true }).catch(() => {});
    await fs.promises.mkdir(testDir, { recursive: true });

    const testFlac = path.join(testDir, 'test-ava.flac');
    const testM4a = path.join(testDir, 'test-masn.m4a');

    await fs.promises.copyFile(sourceFlac, testFlac);
    await fs.promises.copyFile(sourceM4a, testM4a);

    console.log('✓ Test fixtures initialized in test-sandbox');

    // 1. TagLib Read
    console.log('Testing: TagLib readMetadata on FLAC...');
    const flacMeta = await metadataCoordinator.read(testFlac);
    assert.equal(typeof flacMeta.tags.title, 'string');
    assert(Array.isArray(flacMeta.tags.artists), 'artists must be an array');
    console.log(`✓ Read FLAC: title="${flacMeta.tags.title}", artists=${JSON.stringify(flacMeta.tags.artists)}`);

    // 2. TagLib Write: undefined = unchanged
    console.log('Testing: TagLib write with undefined = unchanged...');
    const originalArtists = [...flacMeta.tags.artists];
    const writeResult1 = await metadataCoordinator.writeTags(testFlac, {
        title: 'New Integration Title',
        // artists is undefined: must remain unchanged
    });
    assert.equal(writeResult1.filePath, testFlac);
    assert.equal('success' in writeResult1, false, 'TagWriteResult must not contain redundant success field');
    assert.equal('updatedTags' in writeResult1, false, 'TagWriteResult must not contain redundant updatedTags field');

    const flacMetaAfter1 = await metadataCoordinator.read(testFlac);
    assert.equal(flacMetaAfter1.tags.title, 'New Integration Title');
    assert.deepEqual(flacMetaAfter1.tags.artists, originalArtists, 'Artists must remain unchanged when undefined');
    console.log('✓ Verified: undefined = unchanged');

    // 3. TagLib Write: null = clear
    console.log('Testing: TagLib write with null = clear...');
    await metadataCoordinator.writeTags(testFlac, {
        title: null,
    });
    const flacMetaAfter2 = await metadataCoordinator.read(testFlac);
    assert.equal(flacMetaAfter2.tags.title, undefined, 'Title must be cleared when null is passed');
    console.log('✓ Verified: null = clear');

    // 4. Timestamp Preservation & Atomic Replacement
    console.log('Testing: Timestamp preservation & Atomic replacement...');
    const preWriteStat = await fs.promises.stat(testFlac);
    // Write a new title
    await metadataCoordinator.writeTags(testFlac, {
        title: 'Timestamp Test',
    });
    const postWriteStat = await fs.promises.stat(testFlac);
    const mtimeDiff = Math.abs(postWriteStat.mtimeMs - preWriteStat.mtimeMs);
    assert(mtimeDiff < 2000, `Timestamp difference should be within 2000ms, got ${mtimeDiff}ms`);

    // Verify no temporary files left in testDir
    const dirFiles = await fs.promises.readdir(testDir);
    const tempFiles = dirFiles.filter((f) => f.includes('.tmp_'));
    assert.equal(tempFiles.length, 0, 'No temporary files should linger after write');
    console.log('✓ Verified: Timestamp preservation and atomic replacement');

    // 5. Backup Creation
    console.log('Testing: Backup creation (preserveOriginal: true)...');
    const backupTarget = path.join(testDir, 'backup-test.flac');
    await fs.promises.copyFile(sourceFlac, backupTarget);
    const writeBackupRes = await metadataCoordinator.writeTags(backupTarget, {
        title: 'Backup Verify',
    }, { preserveOriginal: true });
    assert(writeBackupRes.backupPath, 'backupPath must be returned');
    assert(fs.existsSync(writeBackupRes.backupPath), 'Backup file must exist on disk');
    console.log(`✓ Verified: Backup creation at ${writeBackupRes.backupPath}`);

    // 6. Artwork: Embed, Extract, Remove
    console.log('Testing: Artwork Embed, Extract, and Remove...');
    const artBuffer = await fs.promises.readFile(sourceArt);
    await metadataCoordinator.embedArtwork(testFlac, artBuffer);

    const extractedArt = await metadataCoordinator.extractArtwork(testFlac, true);
    assert(extractedArt !== null, 'Extracted artwork must not be null');
    assert.equal(extractedArt.mimeType, 'image/png');
    assert((extractedArt.width ?? 0) > 0, 'Width must be > 0');
    assert((extractedArt.height ?? 0) > 0, 'Height must be > 0');
    console.log(`✓ Verified: Artwork embedded and extracted (${extractedArt.width}x${extractedArt.height}, ${extractedArt.mimeType})`);

    // Remove artwork
    await metadataCoordinator.removeArtwork(testFlac);
    const extractedAfterRemove = await metadataCoordinator.extractArtwork(testFlac, true);
    assert.equal(extractedAfterRemove, null, 'Artwork must be null after removal');
    console.log('✓ Verified: Artwork removal');

    // 7. Missing & Corrupt Files
    console.log('Testing: Missing and corrupt files error handling...');
    const nonexistentFile = path.join(testDir, 'does-not-exist.flac');
    await assert.rejects(
        async () => metadataCoordinator.read(nonexistentFile),
        (err: unknown) => err instanceof NotFoundError || (err as { name?: string }).name === 'NotFoundError',
        'Should reject with NotFoundError for missing file'
    );

    const corruptFile = path.join(testDir, 'corrupt.flac');
    await fs.promises.writeFile(corruptFile, Buffer.from([0x00, 0x01, 0x02, 0x03]));
    // Corrupt file reading should throw or reject
    await assert.rejects(
        async () => metadataCoordinator.read(corruptFile),
        'Reading corrupt file should reject'
    );
    console.log('✓ Verified: Missing and corrupt files throw proper errors');

    // 8. Batch Partial Failures
    console.log('Testing: Batch partial failures...');
    const batchRes = await metadataCoordinator.writeTagsBatch([
        { path: testFlac, tags: { title: 'Batch Success Title' } },
        { path: nonexistentFile, tags: { title: 'Should Fail' } },
    ]);
    assert.equal(batchRes.total, 2);
    assert.equal(batchRes.succeeded.length, 1);
    assert.equal(batchRes.failed.length, 1);
    assert.equal(batchRes.failed[0].filePath, nonexistentFile);
    assert.equal(typeof batchRes.failed[0].error, 'string');
    console.log(`✓ Verified: Batch partial failures (1 succeeded, 1 failed)`);

    // 9. FFprobe Probing
    console.log('Testing: FFprobe inspection...');
    const ffprobe = new FFprobeAdapter();
    const probeRes = await ffprobe.inspect(sourceFlac);
    assert.equal(probeRes.codec, 'flac');
    assert.equal(probeRes.channels, 2);
    assert(probeRes.duration > 0);
    assert.equal(probeRes.isLossless, true);
    console.log(`✓ Verified: FFprobe codec=${probeRes.codec}, channels=${probeRes.channels}, duration=${probeRes.duration.toFixed(2)}s`);

    // 10. MediaInfo Forensic QC
    console.log('Testing: MediaInfo forensic inspection...');
    const mediaInfo = new MediaInfoAdapter();
    const qcRes = await mediaInfo.inspect(sourceFlac);
    assert(qcRes !== null, 'MediaInfo should return QC data');
    console.log(`✓ Verified: MediaInfo format=${qcRes?.format}, bitDepth=${qcRes?.bitDepth}`);

    // 11. FFmpeg Conversion (M4A to MP3 with SoX resampler and dithering)
    console.log('Testing: FFmpeg conversion with SoX & triangular dither...');
    const convertedMp3 = path.join(testDir, 'test-output.mp3');
    const convResult = await mediaConverter.convert(testM4a, {
        outputPath: convertedMp3,
        targetFormat: 'mp3',
        resampler: 'soxr',
        ditherMethod: 'triangular',
    });
    assert.equal(convResult.outputPath, convertedMp3);
    assert(fs.existsSync(convertedMp3), 'Converted MP3 must exist on disk');
    const mp3Stats = await fs.promises.stat(convertedMp3);
    assert(mp3Stats.size > 10000, 'Converted MP3 size must be reasonable');
    console.log(`✓ Verified: FFmpeg converted to MP3 (size=${mp3Stats.size} bytes)`);

    // 12. FFmpeg Conversion Cancellation
    console.log('Testing: FFmpeg conversion cancellation...');
    const cancelOutput = path.join(testDir, 'test-cancel.mp3');
    await fs.promises.unlink(cancelOutput).catch(() => {});
    const abortController = new AbortController();
    const cancelPromise = mediaConverter.convert(testFlac, {
        outputPath: cancelOutput,
        targetFormat: 'mp3',
    }, undefined, abortController.signal);

    // Trigger abort shortly after launch
    setTimeout(() => {
        abortController.abort();
    }, 100);

    await assert.rejects(
        cancelPromise,
        (err: unknown) => err instanceof Error && err.message.includes('cancelled'),
        'Conversion should reject with cancellation message'
    );
    assert(!fs.existsSync(cancelOutput), 'Cancelled conversion output should not exist');
    console.log('✓ Verified: Conversion cancellation and temp cleanup');

    // Cleanup sandbox
    await fs.promises.rm(testDir, { recursive: true, force: true }).catch(() => {});
    console.log('✓ Cleaned up test sandbox');

    console.log('\n========================================');
    console.log('ALL REAL MEDIA INTEGRATION TESTS PASSED!');
    console.log('========================================');
}

run().catch((err) => {
    console.error('INTEGRATION TEST FAILURE:', err);
    process.exit(1);
});
