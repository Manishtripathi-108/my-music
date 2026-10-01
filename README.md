# My Music

A modern, high-performance web audio library and music metadata manager built with Next.js 16 (App Router), TypeScript, Ark UI, Tailwind CSS v4, ExifTool, FFmpeg, and FFprobe.

---

## Architecture & System Overview

- **Persistent ExifTool Subsystem**: Executes a persistent ExifTool process using `-stay_open True -@ -` to eliminate Perl startup overhead, cutting command latency from ~250ms to ~15ms with full queue serialization, process crash recovery, and batch processing.
- **FFprobe Audio Engine**: Extracts deep audio technical specifications (codec, container, exact duration, sample rate, channels, bit rate, bits per sample, and mathematical lossless detection).
- **Artwork Extraction & Stream Cache**: Uses FFmpeg direct stream extraction with automatic fallback to ExifTool binary tags, deterministically caching album covers under `cache/art` and serving them via HTTP binary streaming with aggressive caching headers.
- **Strict Server/Client Boundary**: Server infrastructure is strictly guarded with `server-only`. Environment configuration is validated at startup via Zod in `src/config/env.server.ts`.
- **Unified API Standard**: All API endpoints return a typed `ApiResponse<T>` envelope with standardized HTTP status codes and machine-readable error codes.

---

## Prerequisites & Installation

### 1. System Requirements

Ensure the following tools are installed and accessible in your system `PATH` (or configure their absolute paths in `.env`):

- **Node.js**: v20 or newer
- **ExifTool**: [exiftool.org](https://exiftool.org/) (e.g., `exiftool` on PATH or `C:\ExifTool\exiftool.exe`)
- **FFmpeg & FFprobe**: [ffmpeg.org](https://ffmpeg.org/) (e.g., `ffmpeg` and `ffprobe` on PATH or `C:\ffmpeg\bin\*.exe`)

### 2. Install Project Dependencies

```bash
npm install
```

### 3. Environment Configuration

Copy the example environment file and customize your configuration if needed:

```bash
cp .env.example .env
```

| Variable | Default | Description |
| :--- | :--- | :--- |
| `NODE_ENV` | `development` | Runtime environment (`development`, `production`, `test`) |
| `PORT` | `3000` | Port for the Next.js HTTP server |
| `EXIFTOOL_PATH` | `exiftool` | Path or binary name for ExifTool CLI |
| `FFMPEG_PATH` | `ffmpeg` | Path or binary name for FFmpeg CLI |
| `FFPROBE_PATH` | `ffprobe` | Path or binary name for FFprobe CLI |
| `ART_CACHE_DIR` | `cache/art` | Directory for caching extracted album artwork |

---

## API Reference

All JSON endpoints adhere to the project `ApiResponse<T>` envelope standard:

```ts
// Success Response
{
  "success": true,
  "data": T,
  "message": "Optional human-readable confirmation",
  "meta": { "timestamp": "ISO-8601" }
}

// Error Response
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR" | "BAD_REQUEST" | "NOT_FOUND" | "INTERNAL_SERVER_ERROR",
    "message": "Human-readable description",
    "details": [...] // Structured validation issues or debug context
  }
}
```

---

### 1. Audio Metadata APIs

#### `GET /api/media/metadata`
Inspects unified metadata for a single audio file (merging ExifTool tags, FFprobe technical specs, and artwork presence).

- **Query Parameters**:
  - `path` (string, required): Full filesystem path to the target audio file.

- **Example Request**:
  ```http
  GET /api/media/metadata?path=E:/Music/Artist/Album/01-Track.flac HTTP/1.1
  ```

- **Example Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "filePath": "E:/Music/Artist/Album/01-Track.flac",
      "fileSizeBytes": 45129384,
      "lastModified": "2026-03-15T14:30:00.000Z",
      "tags": {
        "title": "Song Title",
        "artist": "Artist Name",
        "album": "Album Title",
        "genre": ["Alternative", "Rock"],
        "year": 2024,
        "trackNumber": 1,
        "trackTotal": 12
      },
      "technical": {
        "codec": "flac",
        "codecLongName": "FLAC (Free Lossless Audio Codec)",
        "containerFormat": "flac",
        "duration": 245.8,
        "bitrate": 1411200,
        "sampleRate": 44100,
        "channels": 2,
        "channelLayout": "stereo",
        "bitsPerSample": 24,
        "isLossless": true
      },
      "artwork": {
        "cachedPath": "E:/Code/Next/my-music/cache/art/a1b2c3d4e5f6.jpg",
        "filename": "a1b2c3d4e5f6.jpg",
        "mimeType": "image/jpeg",
        "sizeBytes": 124580,
        "source": "ffmpeg"
      }
    }
  }
  ```

---

#### `POST /api/media/metadata/batch` (or `POST /api/media/metadata`)
Performs concurrent batch metadata extraction across multiple audio files.

- **Request Body**:
  ```json
  {
    "paths": [
      "E:/Music/Album/01.mp3",
      "E:/Music/Album/02.mp3"
    ]
  }
  ```

- **Example Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "total": 2,
      "results": {
        "E:/Music/Album/01.mp3": { /* CombinedAudioMetadata */ },
        "E:/Music/Album/02.mp3": { /* CombinedAudioMetadata */ }
      }
    },
    "message": "Processed metadata inspection for 2 files"
  }
  ```

---

### 2. Technical Audio Specifications API

#### `GET /api/media/technical`
Retrieves in-depth stream and container format metrics via FFprobe.

- **Query Parameters**:
  - `path` (string, required): Full filesystem path to the audio file.

- **Example Request**:
  ```http
  GET /api/media/technical?path=E:/Music/Track.flac HTTP/1.1
  ```

- **Example Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "codec": "flac",
      "codecLongName": "FLAC (Free Lossless Audio Codec)",
      "containerFormat": "flac",
      "containerLongName": "raw FLAC",
      "duration": 218.44,
      "bitrate": 984000,
      "sampleRate": 48000,
      "channels": 2,
      "channelLayout": "stereo",
      "bitsPerSample": 24,
      "isLossless": true,
      "streamCount": 1
    }
  }
  ```

---

### 3. Metadata Tag Writing APIs

#### `POST /api/media/tags`
Writes or modifies metadata tags in a single audio file using persistent ExifTool. Setting a tag to `null` or `""` deletes it.

- **Request Body**:
  ```json
  {
    "path": "E:/Music/Track.mp3",
    "tags": {
      "Title": "Updated Title",
      "Artist": "New Artist",
      "Album": "Special Edition",
      "Year": 2026,
      "Genre": ["Electronic", "Ambient"],
      "Comment": null
    },
    "preserveOriginal": false
  }
  ```

- **Parameters**:
  - `path` (string, required): Audio file path.
  - `tags` (object, required): Key-value pairs of tag names and values (`string`, `number`, `string[]`, or `null`).
  - `preserveOriginal` (boolean, optional, default: `false`): If `true`, saves the pre-modified file as `filename.ext_original`.

- **Example Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "success": true,
      "filePath": "E:/Music/Track.mp3",
      "updatedTags": {
        "Title": "Updated Title",
        "Artist": "New Artist",
        "Album": "Special Edition",
        "Year": 2026,
        "Genre": ["Electronic", "Ambient"],
        "Comment": null
      },
      "preserveOriginal": false
    },
    "message": "Tags written successfully for \"E:/Music/Track.mp3\""
  }
  ```

---

#### `POST /api/media/tags/batch`
Writes tags to multiple files in a single batch operation.

- **Request Body**:
  ```json
  {
    "targets": [
      {
        "path": "E:/Music/01.mp3",
        "tags": { "Artist": "Band Name", "Album": "Album Title" }
      },
      {
        "path": "E:/Music/02.mp3",
        "tags": { "Artist": "Band Name", "Album": "Album Title" }
      }
    ],
    "preserveOriginal": false
  }
  ```

- **Example Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "total": 2,
      "succeeded": [ /* TagWriteResult[] */ ],
      "failed": []
    },
    "message": "Batch tag write complete: 2 succeeded, 0 failed"
  }
  ```

---

### 4. Album Artwork APIs

#### `GET /api/media/artwork`
Direct binary stream of album artwork for embedding in UI `<img src="/api/media/artwork?file=..." />` elements.

- **Query Parameters** (at least one required):
  - `file` (string): Cached artwork filename (e.g. `a1b2c3d4e5f6.jpg`). Path traversal is strictly prevented.
  - `path` (string): Full audio file path. Artwork is extracted on-the-fly and cached if not already present.

- **Response Headers**:
  - `Content-Type`: `image/jpeg` / `image/png` / `image/webp`
  - `Cache-Control`: `public, max-age=31536000, immutable`
  - `Content-Disposition`: `inline; filename="<filename>"`

- **Status Codes**:
  - `200 OK`: Binary image data.
  - `404 Not Found`: No embedded art available.

---

#### `POST /api/media/artwork`
Extracts embedded artwork from an audio file, persists it into `cache/art`, and returns JSON metadata.

- **Request Body**:
  ```json
  {
    "path": "E:/Music/Song.flac",
    "forceRefresh": false
  }
  ```

- **Example Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "cachedPath": "E:/Code/Next/my-music/cache/art/9c8b7a6f5e4d.jpg",
      "filename": "9c8b7a6f5e4d.jpg",
      "mimeType": "image/jpeg",
      "sizeBytes": 204890,
      "source": "ffmpeg"
    },
    "message": "Artwork extracted successfully"
  }
  ```

---

### 5. Library Scanner API

#### `POST /api/scan`
Initiates a background audio library scan of a directory.

- **Request Body**:
  ```json
  {
    "directory": "E:/Music",
    "scanMode": "addNew",
    "recursive": true
  }
  ```

- **Parameters**:
  - `directory` (string, required): Target folder to scan.
  - `scanMode` (`"addNew"` | `"forceAll"` | `"rescanErrors"`, default: `"addNew"`).
  - `recursive` (boolean, default: `true`).

- **Example Response (202 Accepted)**:
  ```json
  {
    "success": true,
    "data": {
      "scanId": "scan_1727625000000_abc123",
      "directory": "E:/Music",
      "scanMode": "addNew",
      "recursive": true,
      "timestamp": "2026-09-29T15:50:00.000Z"
    },
    "message": "Library scan initiated successfully for \"E:/Music\""
  }
  ```

---

## Bruno API Collection

The repository includes a complete [Bruno](https://www.usebruno.com/) API collection located under [`bruno/`](file:///e:/Code/Next/my-music/bruno/) containing 29 requests covering every endpoint with happy paths, validation errors, and assertions.

### Opening the Collection in Bruno:
1. Open the **Bruno** desktop application.
2. Click **Open Collection** and select the [`bruno/`](file:///e:/Code/Next/my-music/bruno/) folder in this repository.
3. Select the **Local** environment (`{{baseUrl}} = http://localhost:3000`).
4. Execute individual requests or run the entire test suite.

---

## Development Scripts

```bash
# Run Next.js local development server (with Turbopack)
npm run dev

# Run production build and verify TypeScript types
npm run build

# Run ESLint validation
npm run lint

# Format codebase via Prettier
npm run format
```

---

## License

MIT
