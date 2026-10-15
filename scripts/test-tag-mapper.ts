import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { TagMapper } from '../src/server/media/adapters/tag-mapper';
import { TagLibAdapter } from '../src/server/media/adapters/taglib.adapter';

console.log('--- STARTING COMPREHENSIVE TAGMAPPER & WRITE BOUNDARY TESTS ---');

// 1. Scalar write
console.log('Testing: scalar write...');
const scalarProps = TagMapper.toTagLibProperties({
    title: 'Song Title',
    album: 'Album Name',
    year: 2026,
    bpm: 128,
});
assert.deepEqual(scalarProps.TITLE, ['Song Title']);
assert.deepEqual(scalarProps.ALBUM, ['Album Name']);
assert.deepEqual(scalarProps.YEAR, ['2026']);
assert.deepEqual(scalarProps.BPM, ['128']);
console.log('✓ Scalar write verified');

// 2. Array write
console.log('Testing: array write...');
const arrayProps = TagMapper.toTagLibProperties({
    artists: ['Artist One', 'Artist Two'],
    genres: ['Electronic', 'Ambient'],
});
assert.deepEqual(arrayProps.ARTIST, ['Artist One', 'Artist Two']);
assert.deepEqual(arrayProps.GENRE, ['Electronic', 'Ambient']);
console.log('✓ Array write verified');

// 3. Null removes a property
console.log('Testing: null removes a property...');
const nullProps = TagMapper.toTagLibProperties({
    title: null,
    album: null,
    artists: null,
    year: null,
});
assert.deepEqual(nullProps.TITLE, [], 'null must map to empty list [] to signal deletion');
assert.deepEqual(nullProps.ALBUM, [], 'null must map to empty list [] to signal deletion');
assert.deepEqual(nullProps.ARTIST, [], 'null must map to empty list [] to signal deletion');
assert.deepEqual(nullProps.YEAR, [], 'null must map to empty list [] to signal deletion');
console.log('✓ Null removal semantics verified');

// 4. Undefined leaves a property out
console.log('Testing: undefined leaves a property out...');
const undefinedProps = TagMapper.toTagLibProperties({
    title: 'Preserved Title',
    album: undefined,
    artists: undefined,
});
assert.deepEqual(undefinedProps.TITLE, ['Preserved Title']);
assert.equal('ALBUM' in undefinedProps, false, 'undefined must be omitted from property map');
assert.equal('ARTIST' in undefinedProps, false, 'undefined must be omitted from property map');
console.log('✓ Undefined properties omitted');

// 5. Compilation true
console.log('Testing: compilation true...');
const compTrueProps = TagMapper.toTagLibProperties({ compilation: true });
assert.deepEqual(compTrueProps.COMPILATION, ['1']);
console.log('✓ Compilation true verified');

// 6. Compilation false
console.log('Testing: compilation false...');
const compFalseProps = TagMapper.toTagLibProperties({ compilation: false });
assert.deepEqual(compFalseProps.COMPILATION, ['0']);
console.log('✓ Compilation false verified');

// 7. Compilation undefined
console.log('Testing: compilation undefined...');
const compUndefProps = TagMapper.toTagLibProperties({ compilation: undefined });
assert.equal('COMPILATION' in compUndefProps, false, 'undefined compilation must be omitted');
const readCompUndef = TagMapper.fromTagLibProperties({});
assert.equal(readCompUndef.compilation, undefined, 'missing compilation must remain undefined');
console.log('✓ Compilation undefined verified');

// 8. Custom tags
console.log('Testing: custom tags write path...');
const customProps = TagMapper.toTagLibProperties({
    customTags: {
        musicbrainz_albumid: 'mb-uuid-1234',
        RECORD_LABEL: 'Independent Records',
    },
});
assert.deepEqual(customProps.MUSICBRAINZ_ALBUMID, ['mb-uuid-1234'], 'custom tag keys must be normalized to uppercase');
assert.deepEqual(customProps.RECORD_LABEL, ['Independent Records']);
console.log('✓ Custom tags write path verified');

// 9. Case normalization
console.log('Testing: case normalization...');
const caseRead = TagMapper.fromTagLibProperties({
    title: ['Lowercase Key Title'],
    Artist: ['Mixed Key Artist'],
    ALBUM: ['Uppercase Key Album'],
    bpm: ['125'],
});
assert.equal(caseRead.title, 'Lowercase Key Title');
assert.deepEqual(caseRead.artists, ['Mixed Key Artist']);
assert.equal(caseRead.album, 'Uppercase Key Album');
assert.equal(caseRead.bpm, 125);
console.log('✓ Case normalization verified');

// 10. Multiple property values
console.log('Testing: multiple property values...');
const multiRead = TagMapper.fromTagLibProperties({
    ARTIST: ['Artist A', 'Artist B', 'Artist C'],
    GENRE: ['Rock', 'Progressive Rock'],
});
assert.deepEqual(multiRead.artists, ['Artist A', 'Artist B', 'Artist C']);
assert.deepEqual(multiRead.genres, ['Rock', 'Progressive Rock']);
console.log('✓ Multiple property values verified');

// 11. Track 3/12
console.log('Testing: track 3/12 compound number...');
const trackCompound = TagMapper.fromTagLibProperties({
    TRACKNUMBER: ['3/12'],
});
assert.equal(trackCompound.trackNumber, 3);
assert.equal(trackCompound.trackTotal, 12);
console.log('✓ Track 3/12 parsed');

// 12. Disc 1/2
console.log('Testing: disc 1/2 compound number...');
const discCompound = TagMapper.fromTagLibProperties({
    DISCNUMBER: ['1/2'],
});
assert.equal(discCompound.discNumber, 1);
assert.equal(discCompound.discTotal, 2);
console.log('✓ Disc 1/2 parsed');

// 13. Separate track total precedence
console.log('Testing: separate track total precedence...');
const trackPrecedence = TagMapper.fromTagLibProperties({
    TRACKNUMBER: ['3/12'],
    TRACKTOTAL: ['24'],
});
assert.equal(trackPrecedence.trackNumber, 3);
assert.equal(trackPrecedence.trackTotal, 24, 'Explicit TRACKTOTAL must take precedence over compound total');
console.log('✓ Separate track total precedence verified');

// 14. Separate disc total precedence
console.log('Testing: separate disc total precedence...');
const discPrecedence = TagMapper.fromTagLibProperties({
    DISCNUMBER: ['1/2'],
    DISCTOTAL: ['4'],
});
assert.equal(discPrecedence.discNumber, 1);
assert.equal(discPrecedence.discTotal, 4, 'Explicit DISCTOTAL must take precedence over compound total');
console.log('✓ Separate disc total precedence verified');

// 15. Missing values
console.log('Testing: missing values...');
const emptyRead = TagMapper.fromTagLibProperties({});
assert.equal(emptyRead.title, undefined);
assert.equal(emptyRead.artists, undefined);
assert.equal(emptyRead.album, undefined);
assert.equal(emptyRead.trackNumber, undefined);
assert.equal(emptyRead.compilation, undefined);
console.log('✓ Missing values return undefined');

// 16. LYRICS precedence
console.log('Testing: LYRICS precedence...');
const lyricsPrecedence = TagMapper.fromTagLibProperties({
    LYRICS: ['Primary synced lyrics'],
    UNSYNCEDLYRICS: ['Secondary unsynced lyrics'],
});
assert.equal(lyricsPrecedence.lyrics, 'Primary synced lyrics');
console.log('✓ LYRICS precedence verified');

// 17. UNSYNCEDLYRICS fallback
console.log('Testing: UNSYNCEDLYRICS fallback...');
const lyricsFallback = TagMapper.fromTagLibProperties({
    UNSYNCEDLYRICS: ['Fallback unsynced lyrics'],
});
assert.equal(lyricsFallback.lyrics, 'Fallback unsynced lyrics');
console.log('✓ UNSYNCEDLYRICS fallback verified');

// 18. Integer parsing
console.log('Testing: integer parsing...');
const intRead = TagMapper.fromTagLibProperties({
    YEAR: ['1998'],
    RATING: ['95'],
    TRACK: ['5'], // Legacy fallback
    DISC: ['2'],  // Legacy fallback
});
assert.equal(intRead.year, 1998);
assert.equal(intRead.rating, 95);
assert.equal(intRead.trackNumber, 5);
assert.equal(intRead.discNumber, 2);
console.log('✓ Integer parsing verified');

// 19. Floating point parsing
console.log('Testing: floating point parsing...');
const floatRead = TagMapper.fromTagLibProperties({
    BPM: ['132.5'],
    REPLAYGAIN_TRACK_GAIN: ['-7.45 dB'],
    REPLAYGAIN_TRACK_PEAK: ['0.998123'],
    REPLAYGAIN_ALBUM_GAIN: ['-8.10 dB'],
    REPLAYGAIN_ALBUM_PEAK: ['1.000000'],
});
assert.equal(floatRead.bpm, 132.5);
assert.equal(floatRead.replayGainTrackGain, -7.45);
assert.equal(floatRead.replayGainTrackPeak, 0.998123);
assert.equal(floatRead.replayGainAlbumGain, -8.1);
assert.equal(floatRead.replayGainAlbumPeak, 1.0);
console.log('✓ Floating point parsing verified');

// 20. Unexpected raw object values (No [object Object])
console.log('Testing: unexpected raw object values...');
const objectRead = TagMapper.fromTagLibProperties({
    TITLE: [{ text: 'Legitimate Object Text' }],
    ALBUM: [{ unknownField: 'Invalid Structure' }],
    COMMENT: [{}],
    ARTIST: [{ text: 'Artist Name' }, { unsupported: true }],
});
assert.equal(objectRead.title, 'Legitimate Object Text', 'Objects with text property must be unwrapped');
assert.equal(objectRead.album, undefined, 'Unsupported objects must not become [object Object]');
assert.equal(objectRead.comment, undefined, 'Empty objects must not become [object Object]');
assert.deepEqual(objectRead.artists, ['Artist Name'], 'Unsupported items in array must be pruned');
console.log('✓ Unexpected raw object values handled without corruption');

// 21. TagLib Client write boundary: empty mapper value results in property removal
console.log('Testing: TagLib client write boundary (empty mapper value translates to property erasure)...');
async function testClientWriteBoundary() {
    const sandboxDir = path.resolve('music-files/test-sandbox');
    await fs.promises.mkdir(sandboxDir, { recursive: true });
    const targetFile = path.join(sandboxDir, 'test-write-boundary.flac');
    await fs.promises.copyFile(path.resolve('music-files/Ava - Famy.flac'), targetFile);

    const adapter = new TagLibAdapter();

    // 1. Set title and album
    await adapter.writeTags(targetFile, {
        title: 'Boundary Test Title',
        album: 'Boundary Test Album',
    });
    const afterSet = await adapter.readTags(targetFile);
    assert.equal(afterSet.tags.title, 'Boundary Test Title');
    assert.equal(afterSet.tags.album, 'Boundary Test Album');

    // 2. Remove album using null (mapper produces { ALBUM: [] })
    // TagLib client must erase ALBUM, preserving TITLE
    await adapter.writeTags(targetFile, {
        album: null,
    });

    const afterRemove = await adapter.readTags(targetFile);
    assert.equal(afterRemove.tags.title, 'Boundary Test Title', 'Unchanged property TITLE must persist');
    assert.equal(afterRemove.tags.album, undefined, 'Empty mapper value must translate to actual TagLib property removal');

    // Clean up
    await fs.promises.rm(targetFile, { force: true }).catch(() => {});
    console.log('✓ TagLib client write boundary successfully erases property on disk');
}

testClientWriteBoundary().then(() => {
    console.log('====================================================');
    console.log('ALL 21 TAGMAPPER & WRITE BOUNDARY TESTS PASSED!');
    console.log('====================================================');
}).catch((err) => {
    console.error('Test failed:', err);
    process.exit(1);
});
