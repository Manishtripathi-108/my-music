#!/usr/bin/env bash
set -euo pipefail

echo "==================================================="
echo "Building Native TagLib Worker Sidecar (TagLib 2.0.2)"
echo "==================================================="

command -v cmake >/dev/null 2>&1 || { echo "[ERROR] CMake 3.16+ is required."; exit 1; }

mkdir -p build
cd build
cmake .. -DCMAKE_BUILD_TYPE=Release
cmake --build . --config Release -j$(nproc || sysctl -n hw.ncpu || echo 2)

if [ -f "taglib-worker" ]; then
    cp taglib-worker ..
    echo "[SUCCESS] taglib-worker built successfully."
elif [ -f "Release/taglib-worker" ]; then
    cp Release/taglib-worker ..
    echo "[SUCCESS] taglib-worker built successfully."
fi

cd ..
echo "Worker ready at $(pwd)/taglib-worker"
