package com.example.data.model

data class MediaDetails(
    val id: String,
    val platform: PlatformType,
    val title: String,
    val author: String,
    val duration: String,
    val thumbnailUrl: String,
    val originalUrl: String,
    val availableQualities: List<QualityOption> = listOf(
        QualityOption.UHD_4K,
        QualityOption.FHD_1080P,
        QualityOption.HD_720P,
        QualityOption.AUDIO_MP3
    ),
    val viewsFormatted: String = "1.4M",
    val likesFormatted: String = "284K",
    val noWatermarkAvailable: Boolean = true,
    val estimatedSizeMb: Double = 24.8
)
