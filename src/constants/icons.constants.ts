enum IconSet {
    /* ------------------------------------ Theme ----------------------------------- */
    sun = 'meteocons:clear-day-fill',
    moon = 'meteocons:clear-night-fill',
    desktop = 'solar:monitor-bold',

    /* ------------------------------------ Shapes ---------------------------------- */
    shapeCircle = 'solar:record-circle-bold',
    shapeDiamond = 'solar:diamond-bold',
    shapeSquare = 'solar:stop-bold',
    shapeStar = 'solar:star-bold',
    shapeHexagon = 'solar:shield-star-bold',
    shapeWipeDown = 'solar:arrow-down-bold',
    shapeWipeRight = 'solar:arrow-right-bold',

    /* ------------------------------------ Music ----------------------------------- */
    audio = 'solar:headphones-round-bold-duotone',
    play = 'solar:play-bold',
    pause = 'solar:pause-bold',
    next = 'solar:skip-next-bold',
    previous = 'solar:skip-previous-bold',
    repeat = 'solar:repeat-bold',
    repeatOne = 'solar:repeat-one-bold',
    shuffle = 'fluent:arrow-shuffle-32-regular',
    playlist = 'solar:playlist-minimalistic-2-bold',
    musicQueue = 'mdi:queue-music',
    lyrics = 'solar:microphone-3-bold',
    volumeLoud = 'solar:volume-loud-bold',
    volumeSmall = 'solar:volume-small-bold',
    volumeOff = 'solar:volume-cross-bold',

    /* ------------------------------------ General UI ------------------------------ */
    close = 'iconamoon:close',
    check = 'line-md:confirm-circle-filled',
    search = 'line-md:search',
    settings = 'solar:settings-bold',
    heart = 'solar:heart-angle-bold',
    share = 'solar:share-bold-duotone',
    loading = 'line-md:loading-loop',
    download = 'solar:download-bold',
    filter = 'solar:filter-bold',
    menu = 'hugeicons:menu-02',
    moreDots = 'pepicons-pop:dots-y',
    refresh = 'solar:refresh-bold',
}

export type Icon = keyof typeof IconSet;

export default IconSet;
