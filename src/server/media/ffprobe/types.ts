export interface FFprobeDisposition {
    default?: number;
    dub?: number;
    original?: number;
    comment?: number;
    lyrics?: number;
    karaoke?: number;
    forced?: number;
    hearing_impaired?: number;
    visual_impaired?: number;
    clean_effects?: number;
    attached_pic?: number;
    timed_thumbnails?: number;
    captions?: number;
    descriptions?: number;
    metadata?: number;
    dependent?: number;
    still_image?: number;
    [key: string]: number | undefined;
}

export interface FFprobeStream {
    index: number;
    codec_name?: string;
    codec_long_name?: string;
    codec_type: 'audio' | 'video' | 'subtitle' | 'data' | 'attachment';
    codec_tag_string?: string;
    codec_tag?: string;
    sample_fmt?: string;
    sample_rate?: string | number;
    channels?: number;
    channel_layout?: string;
    bits_per_sample?: number;
    bits_per_raw_sample?: string | number;
    r_frame_rate?: string;
    avg_frame_rate?: string;
    time_base?: string;
    duration_ts?: number;
    duration?: string | number;
    bit_rate?: string | number;
    disposition?: FFprobeDisposition;
    tags?: Record<string, string>;
    [key: string]: unknown;
}

export interface FFprobeFormat {
    filename?: string;
    nb_streams?: number;
    nb_programs?: number;
    format_name?: string;
    format_long_name?: string;
    duration?: string | number;
    size?: string | number;
    bit_rate?: string | number;
    probe_score?: number;
    tags?: Record<string, string>;
    [key: string]: unknown;
}

export interface FFprobeRawOutput {
    streams?: FFprobeStream[];
    format?: FFprobeFormat;
    error?: {
        code?: number;
        string?: string;
    };
}

export interface AudioProberOptions {
    /** Custom path to FFprobe. Defaults to server configuration or `ffprobe`. */
    binaryPath?: string;

    /** Maximum time allowed for one probe. Defaults to 15000ms. */
    timeoutMs?: number;
}
