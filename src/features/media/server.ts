import 'server-only';

export { metadataCoordinator, MetadataCoordinator } from '@/server/media/metadata-coordinator';
export { mediaConverter, MediaConverter } from '@/server/media/media-converter';
export { authorizeInputPath, authorizeOutputPath } from '@/server/media/path-security';
export type {
    MetadataAdapter,
    AudioProberAdapter,
    QualityControlAdapter,
    MediaConverterEngine,
} from '@/server/media/types';
