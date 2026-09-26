package com.example.data.model

import androidx.compose.ui.graphics.Color

enum class PlatformType(
    val id: String,
    val displayName: String,
    val brandColor: Color,
    val sampleUrl: String,
    val domainPatterns: List<String>,
    val maxQuality: String = "4K 60fps"
) {
    TIKTOK(
        id = "tiktok",
        displayName = "TikTok",
        brandColor = Color(0xFFFE2C55),
        sampleUrl = "https://www.tiktok.com/@creator/video/7234567890123456789",
        domainPatterns = listOf("tiktok.com", "vt.tiktok.com", "vm.tiktok.com")
    ),
    INSTAGRAM(
        id = "instagram",
        displayName = "Instagram",
        brandColor = Color(0xFFE1306C),
        sampleUrl = "https://www.instagram.com/reel/C7qXyZ8pABC/",
        domainPatterns = listOf("instagram.com", "instagr.am")
    ),
    YOUTUBE_SHORTS(
        id = "yt_shorts",
        displayName = "YT Shorts",
        brandColor = Color(0xFFFF0000),
        sampleUrl = "https://youtube.com/shorts/dQw4w9WgXcQ",
        domainPatterns = listOf("youtube.com/shorts", "youtu.be")
    ),
    X_TWITTER(
        id = "x_twitter",
        displayName = "X (Twitter)",
        brandColor = Color(0xFF1DA1F2),
        sampleUrl = "https://x.com/techinsider/status/1798765432109876543",
        domainPatterns = listOf("twitter.com", "x.com")
    ),
    FACEBOOK(
        id = "facebook",
        displayName = "Facebook",
        brandColor = Color(0xFF1877F2),
        sampleUrl = "https://www.facebook.com/watch/?v=9876543210",
        domainPatterns = listOf("facebook.com", "fb.watch", "fb.com")
    ),
    CAPCUT(
        id = "capcut",
        displayName = "CapCut",
        brandColor = Color(0xFF00D1FF),
        sampleUrl = "https://www.capcut.com/t/Zs8rXYZ12/",
        domainPatterns = listOf("capcut.com", "capcut.net")
    ),
    THREADS(
        id = "threads",
        displayName = "Threads",
        brandColor = Color(0xFFFFFFFF),
        sampleUrl = "https://www.threads.net/@user/post/C9x8y7Z6w5v",
        domainPatterns = listOf("threads.net")
    ),
    PINTEREST(
        id = "pinterest",
        displayName = "Pinterest",
        brandColor = Color(0xFFBD081C),
        sampleUrl = "https://www.pinterest.com/pin/123456789012345678/",
        domainPatterns = listOf("pinterest.com", "pin.it")
    ),
    REDDIT(
        id = "reddit",
        displayName = "Reddit",
        brandColor = Color(0xFFFF4500),
        sampleUrl = "https://www.reddit.com/r/videos/comments/abc123/great_moment/",
        domainPatterns = listOf("reddit.com", "v.redd.it")
    ),
    VIMEO(
        id = "vimeo",
        displayName = "Vimeo",
        brandColor = Color(0xFF1AB7EA),
        sampleUrl = "https://vimeo.com/76979871",
        domainPatterns = listOf("vimeo.com")
    ),
    DAILYMOTION(
        id = "dailymotion",
        displayName = "Dailymotion",
        brandColor = Color(0xFF0066DC),
        sampleUrl = "https://www.dailymotion.com/video/x8abcdef",
        domainPatterns = listOf("dailymotion.com", "dai.ly")
    ),
    SNAPCHAT(
        id = "snapchat",
        displayName = "Snapchat",
        brandColor = Color(0xFFFFFC00),
        sampleUrl = "https://www.snapchat.com/spotlight/W7qDkABC",
        domainPatterns = listOf("snapchat.com")
    ),
    TWITCH(
        id = "twitch",
        displayName = "Twitch",
        brandColor = Color(0xFF9146FF),
        sampleUrl = "https://clips.twitch.tv/GloriousAwesomeClip123",
        domainPatterns = listOf("twitch.tv")
    ),
    BILIBILI(
        id = "bilibili",
        displayName = "Bilibili",
        brandColor = Color(0xFF00A1D6),
        sampleUrl = "https://www.bilibili.com/video/BV1xx411c7mD",
        domainPatterns = listOf("bilibili.com")
    ),
    LINKEDIN(
        id = "linkedin",
        displayName = "LinkedIn",
        brandColor = Color(0xFF0A66C2),
        sampleUrl = "https://www.linkedin.com/posts/activity-720123456789",
        domainPatterns = listOf("linkedin.com")
    ),
    BLUESKY(
        id = "bluesky",
        displayName = "Bluesky",
        brandColor = Color(0xFF0085FF),
        sampleUrl = "https://bsky.app/profile/user.bsky.social/post/3km4abc123",
        domainPatterns = listOf("bsky.app")
    ),
    SOUNDCLOUD(
        id = "soundcloud",
        displayName = "SoundCloud",
        brandColor = Color(0xFFFF5500),
        sampleUrl = "https://soundcloud.com/artist/hit-track-2026",
        domainPatterns = listOf("soundcloud.com")
    ),
    TUMBLR(
        id = "tumblr",
        displayName = "Tumblr",
        brandColor = Color(0xFF35465C),
        sampleUrl = "https://staff.tumblr.com/post/720123456789/video",
        domainPatterns = listOf("tumblr.com")
    ),
    LIKEE(
        id = "likee",
        displayName = "Likee",
        brandColor = Color(0xFFFF3366),
        sampleUrl = "https://likee.video/@user/video/7123456789",
        domainPatterns = listOf("likee.video", "like-video.com")
    ),
    DOUYIN(
        id = "douyin",
        displayName = "Douyin",
        brandColor = Color(0xFF161823),
        sampleUrl = "https://www.douyin.com/video/7234567890123456789",
        domainPatterns = listOf("douyin.com", "iesdouyin.com")
    ),
    UNIVERSAL(
        id = "universal",
        displayName = "Universal URL",
        brandColor = Color(0xFF00D1FF),
        sampleUrl = "https://example.com/video.mp4",
        domainPatterns = emptyList()
    );

    companion object {
        fun detect(url: String): PlatformType {
            val cleanUrl = url.trim().lowercase()
            if (cleanUrl.isEmpty()) return UNIVERSAL

            for (platform in values()) {
                if (platform == UNIVERSAL) continue
                for (pattern in platform.domainPatterns) {
                    if (cleanUrl.contains(pattern)) {
                        return platform
                    }
                }
            }
            return UNIVERSAL
        }
    }
}
