@echo off
setlocal enabledelayedexpansion

echo ===================================================
echo Building Native TagLib Worker Sidecar (TagLib 2.0.2)
echo ===================================================

where cmake >nul 2>&1
if %ERRORLEVEL% neq 0 (
    if exist "C:\Program Files\CMake\bin\cmake.exe" (
        set "PATH=C:\Program Files\CMake\bin;!PATH!"
    ) else (
        echo [ERROR] CMake is not found on PATH. Please install CMake 3.16+ to build the native worker.
        exit /b 1
    )
)

mkdir build 2>nul
cd build
cmake .. -DCMAKE_BUILD_TYPE=Release
if %ERRORLEVEL% neq 0 (
    echo.
    echo [ERROR] CMake configuration failed.
    echo No C++ compiler was found on your system.
    echo Please install Visual Studio Build Tools with the Desktop development with C++ workload.
    cd ..
    exit /b 1
)
cmake --build . --config Release

if exist Release\taglib-worker.exe (
    copy /Y Release\taglib-worker.exe ..\taglib-worker.exe
    echo [SUCCESS] taglib-worker.exe built successfully.
) else if exist taglib-worker.exe (
    copy /Y taglib-worker.exe ..\taglib-worker.exe
    echo [SUCCESS] taglib-worker.exe built successfully.
) else (
    echo [ERROR] Build completed but taglib-worker.exe not found.
    exit /b 1
)

cd ..
echo Worker is ready at %CD%\taglib-worker.exe
