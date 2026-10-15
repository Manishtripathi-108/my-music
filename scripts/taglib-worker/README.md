# Native TagLib Worker Sidecar

- **Pinned Version:** TagLib `2.0.2` (Released 2024, C++17)
- **Strategy:** Subprocess worker sidecar via isolated stdio/CLI invocation.
- **Engine Selector:** `METADATA_ENGINE=native` (requires `TAGLIB_WORKER_PATH` to point to the built worker binary).

## Building the Native Worker
Requires CMake 3.16+ and a C++17 compiler (MSVC on Windows, GCC/Clang on Linux/macOS).

### On Windows
```cmd
build.bat
```
Generates `scripts/taglib-worker/taglib-worker.exe`.

### On Linux / macOS
```bash
chmod +x build.sh
./build.sh
```
Generates `scripts/taglib-worker/taglib-worker`.

## Configuring Next.js
In `.env`:
```env
METADATA_ENGINE=native
TAGLIB_WORKER_PATH=scripts/taglib-worker/taglib-worker.exe
```
If `METADATA_ENGINE=wasm`, `taglib-wasm` is used in-process without spawning the subprocess.
