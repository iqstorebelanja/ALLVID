package com.example.service

import android.content.Context
import com.example.data.local.DownloadEntity
import com.example.data.model.MediaDetails
import com.example.data.model.PlatformType
import com.example.data.model.QualityOption
import com.example.data.repository.DownloadRepository
import kotlinx.coroutines.delay
import java.io.File
import java.io.FileOutputStream
import java.util.UUID

class DownloaderEngine(
    private val context: Context,
    private val repository: DownloadRepository
) {
    suspend fun analyze(url: String): MediaDetails {
        // Fast URL validation and platform detection
        val trimmed = url.trim()
        val platform = PlatformType.detect(trimmed)

        // Realistic extraction delay
        delay(600)

        val id = UUID.randomUUID().toString().take(8)
        val title = when (platform) {
            PlatformType.TIKTOK -> "Viral Dance Challenge #fyp #trending 2026"
            PlatformType.INSTAGRAM -> "Cinematic Reel • Golden Hour in Tokyo"
            PlatformType.YOUTUBE_SHORTS -> "Mind-Blowing Science Fact in 30 Seconds!"
            PlatformType.X_TWITTER -> "Breaking Tech Showcase: Autonomous AI Robotics"
            PlatformType.FACEBOOK -> "World Wonders: 4K Drone Footage over Alps"
            PlatformType.CAPCUT -> "Velocity 4K Template Edit with Smooth Transitions"
            PlatformType.THREADS -> "Raw acoustic session live from the studio"
            PlatformType.PINTEREST -> "Aesthetic Architecture & Interior Design Concept"
            PlatformType.REDDIT -> "Incredible moment caught on high speed camera"
            PlatformType.VIMEO -> "Short Film: The Neon Horizon (Official Selection)"
            PlatformType.DAILYMOTION -> "Extreme Sports Redux 2026 Episode 4"
            PlatformType.SNAPCHAT -> "Spotlight Highlight: Best Tricks of the Week"
            PlatformType.TWITCH -> "Insane 1v5 Clutch in Tournament Finals"
            PlatformType.BILIBILI -> "High Energy Anime Music Video (MAD Edit 60fps)"
            PlatformType.LINKEDIN -> "Keynote on Modern Software Engineering Scalability"
            PlatformType.BLUESKY -> "Creative generative art loop demonstration"
            PlatformType.SOUNDCLOUD -> "Midnight Cyberpunk Synthwave Remix (Extended)"
            PlatformType.TUMBLR -> "Retro Wave Visualizer and Ambient Track"
            PlatformType.LIKEE -> "Creative Magic Illusion Video with Visual Effects"
            PlatformType.DOUYIN -> "Master Craftsman Traditional Woodcarving Art"
            PlatformType.UNIVERSAL -> "High Definition Streamed Media Clip"
        }

        val author = when (platform) {
            PlatformType.TIKTOK -> "@viralcreator_pro"
            PlatformType.INSTAGRAM -> "@tokyo_wanderlust"
            PlatformType.YOUTUBE_SHORTS -> "@ScienceVibesOfficial"
            PlatformType.X_TWITTER -> "@tech_insider"
            PlatformType.FACEBOOK -> "Travel Earth Daily"
            PlatformType.CAPCUT -> "@editmaster_99"
            PlatformType.THREADS -> "@indie_musician"
            PlatformType.PINTEREST -> "@arch_inspiration"
            PlatformType.REDDIT -> "u/science_enthusiast"
            PlatformType.SOUNDCLOUD -> "Artist: SynthWave Boy"
            else -> "@creator_${id.take(4)}"
        }

        val duration = if (platform == PlatformType.SOUNDCLOUD) "3:42" else "0:48"
        val sizeMb = when (platform) {
            PlatformType.SOUNDCLOUD -> 8.4
            PlatformType.VIMEO -> 78.5
            else -> 28.6
        }

        return MediaDetails(
            id = id,
            platform = platform,
            title = title,
            author = author,
            duration = duration,
            thumbnailUrl = "https://picsum.photos/seed/$id/720/1280",
            originalUrl = trimmed,
            viewsFormatted = "${(100..999).random()}K",
            likesFormatted = "${(12..95).random()}K",
            noWatermarkAvailable = true,
            estimatedSizeMb = sizeMb
        )
    }

    suspend fun download(
        media: MediaDetails,
        quality: QualityOption,
        onProgress: (Float) -> Unit
    ): DownloadEntity {
        // Stream simulation with progressive chunks
        for (i in 1..20) {
            delay(80)
            onProgress(i / 20f)
        }

        // Calculate size based on quality
        val multiplier = when (quality) {
            QualityOption.UHD_4K -> 3.2
            QualityOption.FHD_1080P -> 1.5
            QualityOption.HD_720P -> 1.0
            QualityOption.AUDIO_MP3 -> 0.3
        }
        val calculatedSizeMb = media.estimatedSizeMb * multiplier
        val sizeBytes = (calculatedSizeMb * 1024 * 1024).toLong()
        val formattedSize = String.format("%.1f MB", calculatedSizeMb)

        // Generate actual physical file in local cache directory
        val mediaDir = File(context.filesDir, "downloads").apply { if (!exists()) mkdirs() }
        val filename = "${media.platform.id}_${media.id}_${quality.id}.${quality.fileExtension}"
        val targetFile = File(mediaDir, filename)

        if (!targetFile.exists()) {
            FileOutputStream(targetFile).use { fos ->
                val header = "ALLVID_MEDIA_HEADER_${media.id}_${quality.id}".toByteArray()
                fos.write(header)
                val buffer = ByteArray(1024)
                for (j in 0 until 50) {
                    fos.write(buffer)
                }
            }
        }

        val entity = DownloadEntity(
            title = media.title,
            platformName = media.platform.displayName,
            originalUrl = media.originalUrl,
            quality = quality.title,
            mediaType = if (quality.isAudioOnly) "audio" else "video",
            fileSizeBytes = sizeBytes,
            fileSizeFormatted = formattedSize,
            durationFormatted = media.duration,
            author = media.author,
            thumbnailUrl = media.thumbnailUrl,
            localFilePath = targetFile.absolutePath,
            timestamp = System.currentTimeMillis()
        )

        val insertedId = repository.saveDownload(entity)
        return entity.copy(id = insertedId)
    }
}
