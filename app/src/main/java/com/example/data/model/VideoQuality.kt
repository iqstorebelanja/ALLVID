package com.example.data.model

enum class QualityOption(
    val id: String,
    val title: String,
    val resolutionTag: String,
    val badgeText: String,
    val isLockedByDefault: Boolean,
    val isAudioOnly: Boolean = false,
    val fileExtension: String = "mp4"
) {
    UHD_4K(
        id = "4k",
        title = "4K Ultra HD",
        resolutionTag = "3840×2160 • 60fps",
        badgeText = "VIP / AD UNLOCK",
        isLockedByDefault = true,
        fileExtension = "mp4"
    ),
    FHD_1080P(
        id = "1080p",
        title = "1080p Full HD",
        resolutionTag = "1920×1080 • Crisp",
        badgeText = "RECOMMENDED",
        isLockedByDefault = false,
        fileExtension = "mp4"
    ),
    HD_720P(
        id = "720p",
        title = "720p HD",
        resolutionTag = "1280×720 • Fast",
        badgeText = "STANDARD",
        isLockedByDefault = false,
        fileExtension = "mp4"
    ),
    AUDIO_MP3(
        id = "mp3",
        title = "MP3 High-Res Audio",
        resolutionTag = "320 kbps • Studio HQ",
        badgeText = "AUDIO ONLY",
        isLockedByDefault = false,
        isAudioOnly = true,
        fileExtension = "mp3"
    )
}
