import type {
    AudioTags,
    BatchTagWriteFailure,
    BatchTagWriteResult,
    CombinedAudioMetadata,
    ExtractedArtwork,
    TagWriteResult,
    TechnicalAudioInfo,
} from '@/server/media';

import type {
    ArtworkExtractRequest,
    ArtworkQuery,
    BatchMetadataRequest,
    BatchWriteTagsRequest,
    SingleMetadataQuery,
    TagsQuery,
    TechnicalQuery,
    WriteTagsRequest,
} from './schemas';

export type {
    AudioTags,
    CombinedAudioMetadata,
    ExtractedArtwork,
    TechnicalAudioInfo,
    TagWriteResult,
    BatchTagWriteFailure,
    BatchTagWriteResult,
    SingleMetadataQuery,
    TagsQuery,
    BatchMetadataRequest,
    WriteTagsRequest,
    BatchWriteTagsRequest,
    ArtworkExtractRequest,
    ArtworkQuery,
    TechnicalQuery,
};

export type BatchMetadataResponse = {
    total: number;
    results: Record<string, CombinedAudioMetadata>;
};
