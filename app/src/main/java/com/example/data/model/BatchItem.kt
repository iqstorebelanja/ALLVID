package com.example.data.model

data class BatchItem(
    val id: String,
    val url: String,
    val detectedPlatform: PlatformType,
    val status: BatchStatus = BatchStatus.PENDING,
    val progress: Float = 0f,
    val error: String? = null,
    val downloadedTitle: String? = null
)

enum class BatchStatus {
    PENDING,
    ANALYZING,
    DOWNLOADING,
    COMPLETED,
    FAILED
}
