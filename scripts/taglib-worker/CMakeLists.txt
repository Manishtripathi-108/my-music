cmake_minimum_required(VERSION 3.16)
project(taglib_worker LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Pinned TagLib Version: 2.0.2 (Released 2024, C++17)
set(TAGLIB_PINNED_VERSION "2.0.2")

include(FetchContent)
FetchContent_Declare(
    taglib
    GIT_REPOSITORY https://github.com/taglib/taglib.git
    GIT_TAG        v2.0.2
    GIT_SHALLOW    TRUE
)

set(BUILD_SHARED_LIBS OFF CACHE BOOL "Build static TagLib" FORCE)
set(BUILD_TESTING OFF CACHE BOOL "Disable TagLib tests" FORCE)
set(BUILD_EXAMPLES OFF CACHE BOOL "Disable TagLib examples" FORCE)
set(BUILD_BINDINGS OFF CACHE BOOL "Disable TagLib bindings" FORCE)

FetchContent_MakeAvailable(taglib)

add_executable(taglib-worker taglib-worker.cpp)

target_include_directories(taglib-worker PRIVATE
    ${taglib_SOURCE_DIR}
    ${taglib_SOURCE_DIR}/taglib
    ${taglib_SOURCE_DIR}/taglib/toolkit
    ${taglib_BINARY_DIR}
)

if(NOT BUILD_SHARED_LIBS)
    target_compile_definitions(taglib-worker PRIVATE TAGLIB_STATIC)
endif()

target_compile_definitions(taglib-worker PRIVATE
    TAGLIB_WORKER_VERSION="${TAGLIB_PINNED_VERSION}"
)

target_link_libraries(taglib-worker PRIVATE tag)

